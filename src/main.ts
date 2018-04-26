#!/usr/bin/env node
import * as chokidar from 'chokidar';

import { build, buildAll, remove } from './build';
import config from './config';
import * as logger from './logger';
import { start as startServer } from './server';

buildAll();

const watcher = chokidar.watch('**/*.md', {
  cwd: config.sourceDirpath,
  ignoreInitial: true,
  interval: 1000,
  persistent: true,
  usePolling: true,
});
watcher
  .on('add', (filePath) => {
    logger.info('File added ' + filePath);
    build(filePath);
  })
  .on('change', (filePath) => {
    logger.info('File changed ' + filePath);
    build(filePath);
  })
  .on('unlink', (filePath) => {
    logger.info('File deleted ' + filePath);
    remove(filePath);
  })
  .on('ready', () => logger.info('Currently watching ' + config.sourceDirpath + ' for changes'))
  .on('error', (error) => logger.error(error));

startServer();
