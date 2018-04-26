var path = require('path');

var env = process.env;
var config = {};

if (env.HOW2_SOURCE_DIRPATH) {
  config.sourceDirpath = path.resolve(env.HOW2_SOURCE_DIRPATH);
} else {
  config.sourceDirpath = path.resolve(__dirname, './public/how2/');
}

if (env.HOW2_MANIFEST_FILEPATH) {
  config.manifestFilepath = path.resolve(env.HOW2_MANIFEST_FILEPATH);
} else {
  config.manifestFilepath = path.resolve(__dirname, './how2db.json');
}

if (env.HOW2_LOG_LEVEL) {
  config.logLevel = env.HOW2_LOG_LEVEL.toLowerCase();
} else {
  if (process.env.NODE_ENV === 'development') {
    config.logLevel = 'debug';
  } else {
    config.logLevel = 'info';
  }
}

config.server = {};
config.server.port = env.HOW2_PORT || '80';

module.exports = config;
