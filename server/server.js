var express = require('express');
var serveIndex = require('serve-index');

var config = require('../config');

const PORT = config.server.port;
const STATIC_ROOT = config.paths.distpath;

var app = express();

function start () {
  app.use(express.static(STATIC_ROOT));
  app.use(serveIndex(STATIC_ROOT, { 'icons': true }));

  console.log('Documentation express server started on port ' + PORT);
  console.log('Ctrl-C to kill the server');

  app.listen(PORT);
}

function stop () {

}

module.exports = {
  start: start,
  stop: stop
};
