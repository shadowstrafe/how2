var express = require('express');

var config = require('./config');
var htmlify = require('./build/htmlify');
var db = require('./build/how2db');
var path = require('path');

const PORT = config.server.port;
const STATIC_ROOT = config.assetDirpath;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(STATIC_ROOT));

app.get('/how2/*.html', function (req, res) {
  try {
    var howto = db.Get(req.params[0]);
    var templateData = howto.attributes;
    templateData.content = htmlify(howto.body);
    res.render('how2', templateData);
  } catch (err) {
    res.send(err);
  }
});

app.get('/search', function (req, res) {
  var q = req.query.q;
  let results;
  if (q) {
    results = db.GetAllWithMatchingTags(q.split(' '));
  } else {
    results = db.GetAll();
  }
  results = results.map(function (val) {
    return {
      path: './how2/' + val.id + '.html',
      text: val.attributes.category + ' | ' + val.attributes.title
    };
  });
  res.render('search', {
    title: 'How 2',
    search: q,
    results: results
  });
});

function start () {
  app.listen(PORT, function () {
    console.log('Documentation express server listening on port ' + PORT);
  });
}

module.exports = {
  start: start
};
