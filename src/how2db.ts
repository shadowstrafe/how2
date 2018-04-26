// import elasticlunr from 'elasticlunr';
var elasticlunr = require('elasticlunr');

import * as logger from './logger';
import { How2Article } from './How2Article';

var index = elasticlunr(function () {
  this.setRef('id');
  this.addField('tags');
  this.addField('title');
  this.addField('body');
});

export function insert (howto: How2Article) {
  index.addDoc(howto);
  logger.debug('how2db.js: Adding ' + howto.id);
}

export function update (howto: How2Article): void {
  logger.debug('how2db.js: Updating ' + howto.id);
  index.updateDoc(howto);
}

export function upsert (howto: How2Article): void {
  var existing = index.documentStore.hasDoc(howto.id);

  if (existing) {
    update(howto);
  } else {
    insert(howto);
  }
}

export function remove (id: string): void {
  logger.debug('how2db.js: Deleting ' + id);
  index.removeDocByRef(id);
}

export function get (id: string): How2Article {
  return index.documentStore.getDoc(id);
}

export function getAll (): How2Article[] {
  var docs = index.documentStore.docs;
  return Object.keys(docs).map((key) => docs[key])
    .sort(function (a: any, b: any) {
      if (a.category < b.category) {
        return -1;
      } else if (a.category > b.category) {
        return 1;
      } else if (a.title < b.title) {
        return -1;
      } else if (a.title > b.title) {
        return 1;
      } else {
        return 0;
      }
    });
}

export function search (query: string): How2Article[] {
  var searchResults = index.search(query, {
    fields: {
      tags: {boost: 10},
      title: {boost: 2},
      body: {boost: 1}
    },
    bool: 'AND'
  });
  return searchResults.map((val: any) => {
    return get(val.ref);
  });
}
