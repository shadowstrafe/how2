var frontMatter = require('front-matter');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var slash = require('slash');
var moment = require('moment');

var logger = require('../logger');
var config = require('../config');
var db = require('./how2db');

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
      logger.error(err);
      return;
    }
    var lastModifiedMoment = moment(stats.mtime).utc();
    logger.debug('build.js:' + absPath + ' last modified on ' + lastModifiedMoment.toISOString());

    var existing = db.Get(relativePath);
    if (existing) {
      logger.debug('build.js: existing found with id ' + relativePath + ' with date value of ' + existing.date);
    }

    if (!existing || moment(existing.date).utc().isBefore(lastModifiedMoment)) {
      fs.readFile(absPath, 'utf8', function (err, data) {
        if (err) {
          logger.error(err);
          return;
        }
        let content = frontMatter(data);
        let howto = content.attributes;
        howto.id = relativePath;
        howto.body = content.body;
        if (howto.title === undefined) {
          logger.warn('"' + absPath + '" is missing a title and will be ignored');
          return;
        }
        howto.date = lastModifiedMoment.toISOString();
        howto.tags = pathSegments.slice(0, -1).concat((howto.tags || []));
        howto.category = category;

        db.Upsert(howto);
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
