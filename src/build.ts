import frontMatter from 'front-matter';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import slash from 'slash';
import moment from 'moment';

import * as logger from './logger';
import config from './config';
import * as db from './how2db';
import { How2Article } from './How2Article';

export function buildAll () {
  glob('**/*.md', {
    cwd: slash(config.sourceDirpath)
  }, function (err, matches) {
    if (err) throw err;

    var fileIds = matches.map(function (val) {
      return slash(val).replace(/.md$/, '');
    });

    var dbIds = db.getAll().map(function (howto) {
      return howto.id;
    });

    // Remove those in dbIds but not in fileIds
    var toRemoveIds = dbIds.filter(function (dbId) {
      return fileIds.some((fileId) =>fileId == dbId);
    });

    toRemoveIds.forEach(function (idToRemove) {
      db.remove(idToRemove);
    });

    for (let i = 0; i < matches.length; i++) {
      build(matches[i]);
    }
  });
}

export function build (filePath: string) {
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

    var existing = db.get(relativePath);
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
        let metadata = <any> content.attributes;

        var article = <How2Article>{};
        article.id = relativePath;
        article.tags = pathSegments.slice(0, -1).concat((metadata.tags || [])).join(', ');
        article.body = content.body;

        if (metadata.title === undefined) {
          logger.warn('"' + absPath + '" is missing a title and will be ignored');
          return;
        } 
        article.title = metadata.title;

        article.version = metadata.version;
        article.date = lastModifiedMoment.toISOString();
        article.category = category;

        db.upsert(article);
      });
    }
  });
}

export function remove (filePath: string) {
  var id = slash(filePath).replace(/.md$/, '');
  db.remove(id);
}
