// tslint:disable-next-line:no-var-requires
const elasticlunr = require('elasticlunr');

import { IHow2Article } from './How2Article';
import * as logger from './logger';

// tslint:disable-next-line:only-arrow-functions
const index = elasticlunr(function() {
  this.setRef('id');
  this.addField('tags');
  this.addField('title');
  this.addField('body');
});

export function insert(howto: IHow2Article) {
  index.addDoc(howto);
  logger.debug('how2db.js: Adding ' + howto.id);
}

export function update(howto: IHow2Article): void {
  logger.debug('how2db.js: Updating ' + howto.id);
  index.updateDoc(howto);
}

export function upsert(howto: IHow2Article): void {
  if (index.documentStore.hasDoc(howto.id)) {
    update(howto);
  } else {
    insert(howto);
  }
}

export function remove(id: string): void {
  logger.debug('how2db.js: Deleting ' + id);
  index.removeDocByRef(id);
}

export function get(id: string): IHow2Article {
  return index.documentStore.getDoc(id);
}

export function getAll(): IHow2Article[] {
  const docs = index.documentStore.docs;
  return Object.keys(docs).map((key) => docs[key])
    .sort((a: IHow2Article, b: IHow2Article) => {
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

export function search(query: string): IHow2Article[] {
  const searchResults = index.search(query, {
    fields: {
      tags: {boost: 10},
      title: {boost: 2},
      body: {boost: 1},
    },
    bool: 'AND',
  });
  return searchResults.map((val: any) => {
    return get(val.ref);
  });
}
