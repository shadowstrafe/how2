var frontMatter = require('front-matter');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var slash = require('slash');

var config = require('../config.js');
var db = require('./how2db.js');

function buildAll () {
  glob('**/*.md', {
    cwd: slash(config.source.sourcepath)
  }, function (err, matches) {
    if (err) throw err;

    db.Clear();
    for (let i = 0; i < matches.length; i++) {
      buildMarkdown(matches[i]);
    }
  });
}

function buildMarkdown (filePath) {
  const relativePath = slash(filePath).replace(/.md$/, '');
  const absPath = path.resolve(config.source.sourcepath, filePath);
  const pathSegments = relativePath.split('/');
  const category = pathSegments.slice(0, -1).join('/');
  fs.stat(absPath, function (err, stats) {
    if (err) {
      console.error(err);
      return;
    }
    const lastModifiedOn = stats.mtime;
    fs.readFile(absPath, 'utf8', function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      const content = frontMatter(data);
      let metadata = content.attributes;
      metadata.date = lastModifiedOn;
      metadata.tags = metadata.tags || [];
      metadata.category = category;

      db.Insert({
        category: category,
        title: metadata.title,
        tags: metadata.tags,
        path: relativePath,
        date: metadata.date
      });
    });
  });
}

function change (filePath) {
  var relativePath = slash(filePath).replace(/.md$/, '');
  db.Delete(relativePath);
  buildMarkdown(filePath);
}

function remove (filePath) {
  var relativePath = slash(filePath).replace(/.md$/, '');
  db.Delete(relativePath);
}

module.exports = {
  buildAll,
  buildMarkdown,
  change,
  remove
};
