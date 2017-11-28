var config = require('home-config').load('.how2.config');
var path = require('path');

config.paths = config.paths || {};
config.server = config.server || {};

config.paths.distpath = path.resolve(__dirname, './dist');

config.paths.templatepath = config.paths.templatepath || path.join(config.paths.sourcepath, '/how2.template');

config.server.port = config.server.port || '5500';

module.exports = config;
