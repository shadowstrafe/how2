#!/usr/bin/env node
var chokidar = require('chokidar');

var build = require('./build/build.js');
var config = require('./config.js');
var server = require('./server/server.js');

build.buildAll();
var watcher = chokidar.watch('**/*.md', {
  persistent: true,
  ignoreInitial: true,
  cwd: config.source.sourcepath
});
watcher
  .on('add', filePath => {
    console.log('file added ' + filePath);
    build.build(filePath);
  })
  .on('change', filePath => {
    console.log('file changed ' + filePath);
    build.build(filePath);
  })
  .on('unlink', filePath => {
    console.log('file deleted ' + filePath);
    build.remove(filePath);
  })
  .on('error', error => console.error(error));

console.log('Currently watching ' + config.source.sourcepath + ' for changes');

server.start();
