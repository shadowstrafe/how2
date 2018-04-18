var express = require('express');
var path = require('path');
var moment = require('moment');

var config = require('./config');
var htmlify = require('./build/htmlify');
var db = require('./build/how2db');
var logger = require('./logger');

const PORT = config.server.port;
const STATIC_ROOT = config.assetDirpath;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(STATIC_ROOT));

app.get('/how2/*.html', function (req, res) {
  try {
    var howto = db.Get(req.params[0]);
    if (!howto) {
      res.sendStatus(404);
      return;
    }

    var templateData = {
      content: htmlify(howto.body),
      date: moment(howto.date).local().format('D MMM YYYY, hh:mm a'),
      version: howto.version,
      tags: howto.tags,
      category: howto.category,
      categoryPath: '/search?q=' + howto.category.replace('/', '%20')
    };

    res.render('how2', templateData);
  } catch (err) {
    res.send(err);
  }
});

app.get('/search', function (req, res) {
  var q = req.query.q;
  let results;
  if (q) {
    results = db.Search(q);
  } else {
    results = db.GetAll();
  }
  results = results.map(function (val) {
    return {
      path: '/how2/' + val.id + '.html',
      text: val.category + ' | ' + val.title
    };
  });
  res.render('list', {
    title: 'How 2',
    search: q,
    results: results
  });
});

app.get('/', function (req, res) {
  res.render('index', {
    title: 'How 2',
    search: ''
  });
});

function start () {
  app.listen(PORT, function () {
    logger.info('Documentation express server listening on port ' + PORT);
  });
}

module.exports = {
  start: start
};
