var config = require('home-config').load('.how2.config');
var path = require('path');

config.paths.distpath = path.resolve(__dirname, './dist');

config.server.port = config.server.port || '5500';

module.exports = config;
