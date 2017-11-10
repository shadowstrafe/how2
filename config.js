var config = require('home-config').load('.how2.config');
var path = require('path');

config.paths.distpath = path.resolve(__dirname, '../dist');

module.exports = config;
