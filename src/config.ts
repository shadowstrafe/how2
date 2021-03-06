import path from 'path';

interface IAppConfiguration {
  sourceDirpath: string;
  manifestFilepath: string;
  expressPort: string;
  logLevel: string;
}

const env = process.env;
const config = {} as IAppConfiguration;

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

config.expressPort = env.HOW2_PORT || '80';

export = config;
