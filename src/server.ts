import cookieParser from 'cookie-parser';
import express from 'express';
import moment from 'moment';
import path from 'path';

import config from './config';
import { IHow2Article } from './How2Article';
import * as db from './how2db';
import { htmlify } from './htmlify';
import * as logger from './logger';
import { getTheme, hasTheme } from './themes';

const PORT = config.expressPort;
const SOURCE_DIRPATH = config.sourceDirpath;

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// Logging
app.use((req, res, next) => {
  logger.verbose('server.js: ' + req.method + ' ' + req.originalUrl);
  next();
});

// Static Sources
app.use('/how2', express.static(SOURCE_DIRPATH));
app.use(express.static(path.resolve(__dirname, 'public')));

// Setup cookie middleware
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('index', {
    title: 'How 2',
    search: '',
    searchAutofocus: true,
    theme: getTheme(req.cookies.theme),
  });
});

app.get('/how2/*.html', (req, res) => {
  try {
    const howto = db.get(req.params[0]);
    if (!howto) {
      logger.debug('server.js: GET how2 id=' + req.params[0] + ' Not Found');
      res.sendStatus(404);
      return;
    }

    res.render('how2', {
      content: htmlify(howto.body),
      date: moment(howto.date).local().format('D MMM YYYY, hh:mm a'),
      version: howto.version,
      tags: howto.tags,
      title: howto.title,
      category: howto.category,
      search: howto.category.replace('/', ' '),
      searchAutofocus: false,
      theme: getTheme(req.cookies.theme),
    });
  } catch (err) {
    res.send(err);
  }
});

app.get('/search', (req, res) => {
  const q = req.query.q;
  let howtos: IHow2Article[];
  if (q) {
    howtos = db.search(q);
  } else {
    howtos = db.getAll();
  }
  const results = howtos.map((val: IHow2Article) => {
    return {
      path: '/how2/' + val.id + '.html',
      text: val.category + ' | ' + val.title,
    };
  });
  res.render('list', {
    title: 'How 2',
    search: q,
    searchAutofocus: true,
    results,
    theme: getTheme(req.cookies.theme),
  });
});

app.post('/theme/:theme', (req, res) => {
  const wantedTheme = req.params.theme;
  logger.debug('Post wanted theme ' + wantedTheme);
  if (hasTheme(wantedTheme)) {
    logger.debug('Setting cookie ' + wantedTheme);
    res.cookie('theme', wantedTheme);
  }
  res.redirect('/');
});

export function start() {
  app.listen(PORT, () => {
    logger.info('Documentation express server listening on port ' + PORT);
  });
}
