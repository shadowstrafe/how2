#!/usr/bin/env node
var chokidar = require('chokidar');

var build = require('./build/build.js');
var config = require('./config.js');
var server = require('./server.js');
var moment = require('moment');

build.buildAll();
var watcher = chokidar.watch('**/*.md', {
  persistent: true,
  ignoreInitial: true,
  cwd: config.sourceDirpath
});
watcher
  .on('add', filePath => {
    var nowF = moment().format('hh:mm');
    console.log(nowF + ' File added ' + filePath);
    build.build(filePath);
  })
  .on('change', filePath => {
    var nowF = moment().format('hh:mm');
    console.log(nowF + ' File changed ' + filePath);
    build.build(filePath);
  })
  .on('unlink', filePath => {
    var nowF = moment().format('hh:mm');
    console.log(nowF + ' File deleted ' + filePath);
    build.remove(filePath);
  })
  .on('ready', () => console.log('Currently watching ' + config.sourceDirpath + ' for changes'))
  .on('error', error => console.error(error));

server.start();
