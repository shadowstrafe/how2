var express = require('express');

var config = require('../config');
var htmlify = require('../build/htmlify');
var db = require('../build/how2db');

const PORT = config.server.port;
const STATIC_ROOT = config.assetDirpath;

var app = express();

function start () {
  app.use(express.static(STATIC_ROOT));

  app.get('/how2/*', function (req, res) {
    try {
      var howto = db.Get(req.params[0]);
      res.send(htmlify(howto));
    } catch (err) {
      res.send(err);
    }
  });

  app.get('/search', function (req, res) {
    var q = req.query.q;
    if (q) {
      let results = db.GetAllWithMatchingTags(q.split(' '));
      res.send(results.map(function (val) { return val.id; }));
    } else {
      let results = db.GetAll();
      res.send(results.map(function (val) { return val.id; }));
    }
  });

  app.listen(PORT, function () {
    console.log('Documentation express server listening on port ' + PORT);
  });
}

module.exports = {
  start: start
};
