import frontMatter from 'front-matter';
import fs from 'fs';
import glob from 'glob';
import moment from 'moment';
import path from 'path';
import slash from 'slash';

import config from './config';
import { IHow2Article } from './How2Article';
import * as db from './how2db';
import * as logger from './logger';

export function buildAll() {
  glob('**/*.md', {
    cwd: slash(config.sourceDirpath),
  }, (err, matches) => {
    if (err) { throw err; }

    const fileIds = matches.map((val) => {
      return slash(val).replace(/.md$/, '');
    });

    const dbIds = db.getAll().map((howto) => {
      return howto.id;
    });

    // Remove those in dbIds but not in fileIds
    const toRemoveIds = dbIds.filter((dbId) => {
      return fileIds.some((fileId) => fileId === dbId);
    });

    toRemoveIds.forEach((idToRemove) => {
      db.remove(idToRemove);
    });

    for (const match of matches) {
      build(match);
    }
  });
}

export function build(filePath: string) {
  const relativePath = slash(filePath).replace(/.md$/, '');
  const absPath = path.resolve(config.sourceDirpath, filePath);
  const pathSegments = relativePath.split('/');
  const category = pathSegments.slice(0, -1).join('/');
  fs.stat(absPath, (err, stats) => {
    if (err) {
      logger.error(err);
      return;
    }
    const lastModifiedMoment = moment(stats.mtime).utc();
    logger.debug('build.js:' + absPath + ' last modified on ' + lastModifiedMoment.toISOString());

    const existing = db.get(relativePath);
    if (existing) {
      logger.debug('build.js: existing found with id ' + relativePath + ' with date value of ' + existing.date);
    }

    if (!existing || moment(existing.date).utc().isBefore(lastModifiedMoment)) {
      fs.readFile(absPath, 'utf8', (err2, data) => {
        if (err2) {
          logger.error(err2);
          return;
        }
        const content = frontMatter(data);
        const metadata = content.attributes as any;

        const article = {} as IHow2Article;
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

export function remove(filePath: string) {
  const id = slash(filePath).replace(/.md$/, '');
  db.remove(id);
}
