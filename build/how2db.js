var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var path = require('path');
var fs = require('fs');

var config = require('../config.js');

const DB_PATH = path.resolve(config.manifestFilepath);
const DB_DIRPATH = path.dirname(DB_PATH);

!fs.existsSync(DB_DIRPATH) && fs.mkdirSync(DB_DIRPATH);

var db = low(new FileSync(DB_PATH));
db.defaults({
  'howtos': []
}).write();

module.exports = {
  Insert: function (howto) {
    db.get('howtos')
      .push(howto)
      .write();
  },
  Delete: function (id) {
    db.get('howtos')
      .remove({ id: id })
      .write();
  },
  Clear: function () {
    try {
      db.set('howtos', [])
        .write();
    } catch (__) { }
  },
  Upsert: function (howto) {
    var existing = db.get('howtos')
      .find({ id: howto.id })
      .value();

    if (existing) {
      db.get('howtos')
        .find({ id: howto.id })
        .assign(howto)
        .write();
    } else {
      db.get('howtos')
        .push(howto)
        .write();
    }
  },
  Get: function (id) {
    return db.get('howtos')
      .find({ id: id })
      .value();
  },
  GetAll: function () {
    return db.get('howtos')
      .value();
  },
  GetAllWithMatchingTags: function (tags) {
    return db.get('howtos')
      .filter(function (howto) {
        if (tags.length > 0) {
          return tags.every(function (tag) {
            return howto.attributes.tags.includes(tag);
          });
        }
      })
      .sortBy(['attributes.category', 'attributes.title'])
      .value();
  },
  GetCategories: function () {
    return db.get('howtos')
      .map(function (howto) { return howto.attributes.category; })
      .uniq()
      .sort()
      .value();
  }
};
