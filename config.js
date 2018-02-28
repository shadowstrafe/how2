var config = require('home-config').load('.how2.config');
var path = require('path');

config.source = config.source || {};
config.server = config.server || {};
config.build = config.build || {};

config.source.templatepath = config.source.templatepath || path.join(config.source.sourcepath, '/how2.template');

config.server.port = config.server.port || '5500';

// Temporarily use a hardcoded dist path for now
config.build.outputpath = config.build.outputpath || path.resolve(__dirname, './dist');
config.build.manifestdir = config.build.manifestdir || path.resolve(__dirname, './dist');

module.exports = config;
