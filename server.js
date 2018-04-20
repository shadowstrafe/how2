var express = require('express');
var path = require('path');
var moment = require('moment');

var config = require('./config');
var htmlify = require('./build/htmlify');
var db = require('./build/how2db');
var logger = require('./logger');

const PORT = config.server.port;
const STATIC_ROOT = config.assetDirpath;
const SOURCE_DIRPATH = config.sourceDirpath;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(STATIC_ROOT));

app.get('/how2/*.html', function (req, res) {
  logger.verbose('server.js: GET ' + req.originalUrl);
  try {
    logger.debug('server.js: id=' + req.params[0]);
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
      title: howto.title,
      category: howto.category,
      search: howto.category.replace('/', ' '),
      searchAutofocus: false
    };

    res.render('how2', templateData);
  } catch (err) {
    res.send(err);
  }
});

app.use('/how2', express.static(SOURCE_DIRPATH));

app.get('/search', function (req, res) {
  var q = req.query.q;
  let howtos;
  if (q) {
    howtos = db.Search(q);
  } else {
    howtos = db.GetAll();
  }
  var results = howtos.map(function (val) {
    return {
      path: '/how2/' + val.id + '.html',
      text: val.category + ' | ' + val.title
    };
  });
  res.render('list', {
    title: 'How 2',
    search: q,
    searchAutofocus: true,
    results: results
  });
});

app.get('/', function (req, res) {
  res.render('index', {
    title: 'How 2',
    search: '',
    searchAutofocus: true
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
