var cookieParser = require('cookie-parser');
var express = require('express');
var moment = require('moment');
var path = require('path');

var config = require('./config');
var htmlify = require('./htmlify');
var db = require('./how2db');
var logger = require('./logger');

const PORT = config.server.port;
const SOURCE_DIRPATH = config.sourceDirpath;

const THEMES = {
  'theme-light': {
    cls: 'theme-light',
    hljs: 'solarized-light.css'
  },
  'theme-dark': {
    cls: 'theme-dark',
    hljs: 'solarized-dark.css'
  }
};

var app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// Logging
app.use(function (req, res, next) {
  logger.verbose('server.js: ' + req.method + ' ' + req.originalUrl);
  next();
});

// Static Sources
app.use('/how2', express.static(SOURCE_DIRPATH));
app.use(express.static(path.resolve(__dirname, 'public')));

// Setup cookie middleware
app.use(cookieParser());

app.get('/', function (req, res) {
  res.render('index', {
    title: 'How 2',
    search: '',
    searchAutofocus: true,
    theme: getTheme(req)
  });
});

app.get('/how2/*.html', function (req, res) {
  try {
    var howto = db.Get(req.params[0]);
    if (!howto) {
      logger.debug('server.js: GET how2 id=' + req.params[0] + ' Not Found');
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
      searchAutofocus: false,
      theme: getTheme(req)
    };

    res.render('how2', templateData);
  } catch (err) {
    res.send(err);
  }
});

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
    results: results,
    theme: getTheme(req)
  });
});

app.post('/theme/:theme', function (req, res) {
  var wantedTheme = 'theme-' + req.params['theme'];
  logger.debug('Post wanted theme ' + wantedTheme);
  if (wantedTheme && wantedTheme in THEMES) {
    logger.debug('Setting cookie ' + wantedTheme);
    res.cookie('theme', wantedTheme);
  }
  res.redirect('/');
});

function getTheme (req) {
  var wantedTheme = req.cookies.theme;
  if (wantedTheme && wantedTheme in THEMES) {
    return THEMES[wantedTheme];
  } else {
    return THEMES['theme-light'];
  }
}

function start () {
  app.listen(PORT, function () {
    logger.info('Documentation express server listening on port ' + PORT);
  });
}

module.exports = {
  start: start
};
