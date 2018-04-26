#!/usr/bin/env node
import * as chokidar from 'chokidar';

import * as logger from './logger';
import config from './config';
import { start as startServer } from './server';
import { buildAll, build, remove } from './build';

buildAll();

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
    build(filePath);
  })
  .on('change', filePath => {
    logger.info('File changed ' + filePath);
    build(filePath);
  })
  .on('unlink', filePath => {
    logger.info('File deleted ' + filePath);
    remove(filePath);
  })
  .on('ready', () => logger.info('Currently watching ' + config.sourceDirpath + ' for changes'))
  .on('error', error => logger.error(error));

startServer();
