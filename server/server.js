var express = require('express');
var fs = require('fs');
var path = require('path');
var frontMatter = require('front-matter');

var config = require('../config');
var htmlify = require('../build/htmlify');

const PORT = config.server.port;
const STATIC_ROOT = config.build.buildhtml ? config.build.outputpath : config.source.assetdirpath;

var app = express();

function start () {
  console.log(STATIC_ROOT);
  app.use(express.static(STATIC_ROOT));

  app.get('/how2/*.html', function (req, res) {
    try {
      var p = req.params[0];
      var sourceFilePath = path.resolve(config.source.sourcepath, p) + '.md';
      outputHtml(sourceFilePath, res);
    } catch (err) {
      res.send(err);
    }
  });

  app.listen(PORT, function () {
    console.log('Documentation express server started on port ' + PORT);
    console.log('Ctrl-C to kill the server');
  }).on('error', function (err) {
    if (err.errno !== 'EADDRINUSE') {
      throw err;
    }
  });
}

function outputHtml (filePath, res) {
  fs.stat(filePath, function (err, stats) {
    if (err) {
      throw err;
    }
    const lastModifiedOn = stats.mtime;
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        throw err;
      }
      const content = frontMatter(data);
      let metadata = content.attributes;
      metadata.date = lastModifiedOn;
      metadata.tags = metadata.tags || [];
      metadata.category = ''; // TODO

      var result = htmlify(content);
      res.send(result);
    });
  });
}

module.exports = {
  start: start
};
