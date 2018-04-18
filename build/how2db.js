var elasticlunr = require('elasticlunr');
var logger = require('../logger');

var db = elasticlunr(function () {
  this.setRef('id');
  this.addField('tags');
  this.addField('title');
  this.addField('body');
});

function insert (howto) {
  howto.tags = howto.tags.join(', ');
  db.addDoc(howto);
  logger.debug('how2db.js: Adding ' + howto.id);
}

function update (howto) {
  logger.debug('how2db.js: Updating ' + howto.id);
  db.updateDoc(howto);
}

function remove (id) {
  logger.debug('how2db.js: Deleting ' + id);
  db.removeDocByRef(id);
}

function get (id) {
  return db.documentStore.getDoc(id);
}

function getAll () {
  return Object.values(db.documentStore.docs)
    .sort(function (a, b) {
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

function search (query) {
  var searchResults = db.search(query, {
    fields: {
      tags: {boost: 10},
      title: {boost: 2},
      body: {boost: 1}
    },
    bool: 'AND'
  });
  return searchResults.map(function (val) {
    return get(val.ref);
  });
}

function getAllWithMatchingTags (tags) {
  return db.get('howtos')
    .filter(function (howto) {
      if (tags.length > 0) {
        return tags.every(function (tag) {
          return howto.tags.includes(tag);
        });
      }
    })
    .value()
    .sort(function (a, b) {
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

module.exports = {
  Insert: insert,
  Update: update,
  Delete: remove,
  Upsert: function (howto) {
    var existing = get(howto.id);

    if (existing) {
      update(howto);
    } else {
      insert(howto);
    }
  },
  Get: get,
  GetAll: getAll,
  GetAllWithMatchingTags: getAllWithMatchingTags,
  Search: search
};
