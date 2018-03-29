var config = require('home-config').load('.how2.config');
var path = require('path');

config.source = config.source || {};
config.server = config.server || {};
config.build = config.build || {};

config.source.sourcepath = config.source.sourcepath || path.resolve(__dirname, './src/');
config.source.assetdirpath = config.source.assetdirpath || path.resolve(__dirname, './assets/');
config.source.templatepath = config.source.templatepath || path.resolve(config.source.assetpath, './how2.handlebars');

config.server.port = config.server.port || '5500';
config.server.launch = config.server.launch === undefined ? false : config.server.launch;

// Temporarily use a hardcoded dist path for now
config.build.manifestdir = config.build.manifestdir || path.resolve(__dirname, './dist');
config.build.outputpath = config.build.outputpath || path.resolve(__dirname, './dist');
config.build.buildhtml = config.build.buildhtml === undefined ? false : config.build.buildhtml;

module.exports = config;
