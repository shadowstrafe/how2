#!/usr/bin/env node
var chokidar = require('chokidar');

var build = require('./build/build');
var config = require('./config');
var server = require('./server');
var logger = require('./logger');

build.buildAll();
var watcher = chokidar.watch('**/*.md', {
  persistent: true,
  ignoreInitial: true,
  cwd: config.sourceDirpath,
  usePolling: true,
  interval: 1000
});
watcher
  .on('add', filePath => {
    logger.info('File added ' + filePath);
    build.build(filePath);
  })
  .on('change', filePath => {
    logger.info('File changed ' + filePath);
    build.build(filePath);
  })
  .on('unlink', filePath => {
    logger.info('File deleted ' + filePath);
    build.remove(filePath);
  })
  .on('ready', () => logger.info('Currently watching ' + config.sourceDirpath + ' for changes'))
  .on('error', error => logger.error(error));

server.start();
