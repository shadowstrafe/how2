var express = require('express');
var serveIndex = require('serve-index');

var config = require('../config');

const PORT = config.server.port;
const STATIC_ROOT = config.build.buildhtml ? config.build.outputpath : config.source.sourcepath;

var app = express();

function start () {
  app.use(express.static(STATIC_ROOT));
  app.use(serveIndex(STATIC_ROOT, { 'icons': true }));

  app.listen(PORT, function () {
    console.log('Documentation express server started on port ' + PORT);
    console.log('Ctrl-C to kill the server');
  }).on('error', function (err) {
    if (err.errno !== 'EADDRINUSE') {
      throw err;
    }
  });
}

module.exports = {
  start: start
};
