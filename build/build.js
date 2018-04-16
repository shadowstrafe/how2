var frontMatter = require('front-matter');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var slash = require('slash');

var config = require('../config.js');
var db = require('./how2db.js');

function buildAll () {
  glob('**/*.md', {
    cwd: slash(config.sourceDirpath)
  }, function (err, matches) {
    if (err) throw err;

    var fileIds = matches.map(function (val) {
      return slash(val).replace(/.md$/, '');
    });

    var dbIds = db.GetAll().map(function (howto) {
      return howto.id;
    });

    // Remove those in dbIds but not in fileIds
    var toRemoveIds = dbIds.filter(function (dbId) {
      return !fileIds.includes(dbId);
    });

    toRemoveIds.forEach(function (idToRemove) {
      db.Delete(idToRemove);
    });

    for (let i = 0; i < matches.length; i++) {
      build(matches[i]);
    }
  });
}

function build (filePath) {
  const relativePath = slash(filePath).replace(/.md$/, '');
  const absPath = path.resolve(config.sourceDirpath, filePath);
  const pathSegments = relativePath.split('/');
  const category = pathSegments.slice(0, -1).join('/');
  fs.stat(absPath, function (err, stats) {
    if (err) {
      console.error(err);
      return;
    }
    const lastModifiedOn = stats.mtime;
    var existing = db.Get(relativePath);
    if (!existing || new Date(existing.attributes.date) < lastModifiedOn) {
      fs.readFile(absPath, 'utf8', function (err, data) {
        if (err) {
          console.error(err);
          return;
        }
        let content = frontMatter(data);
        content.id = relativePath;
        let metadata = content.attributes;
        if (metadata.title === undefined) {
          console.warn('WARNING: file "' + absPath + '" is missing a title.');
          return;
        }
        metadata.date = lastModifiedOn;
        metadata.tags = metadata.tags || [];
        metadata.tags = metadata.tags.concat(pathSegments.slice(0, -1));
        metadata.category = category;

        db.Upsert(content);
      });
    }
  });
}

function remove (filePath) {
  var id = slash(filePath).replace(/.md$/, '');
  db.Delete(id);
}

module.exports = {
  buildAll,
  build,
  remove
};
