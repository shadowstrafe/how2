var path = require('path');

var env = process.env;
var config = {};

config.sourceDirpath = env.HOW2_SOURCE_DIRPATH || path.resolve(__dirname, './src/');
config.assetDirpath = env.HOW2_ASSET_DIRPATH || path.resolve(__dirname, './public/');
config.templateDirpath = env.HOW2_TEMPLATE_DIRPATH || path.resolve(__dirname, './templates');
config.manifestFilepath = env.HOW2_MANIFEST_FILEPATH || path.resolve(__dirname, './dist/how2db.json');

config.server = {};
config.server.port = env.HOW2_PORT || '5500';

module.exports = config;
