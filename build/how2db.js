var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var path = require('path');
var fs = require('fs');

var config = require('../config.js');

const DB_PATH = path.join(config.paths.distpath, 'how2db.json');

if (!fs.existsSync(config.paths.distpath)) {
  fs.mkdirSync(config.paths.distpath);
}

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
  Delete: function (path) {
    db.get('howtos')
      .remove(function (howto) { return howto.path === path; })
      .write();
  },
  Clear: function () {
    try {
      db.set('howtos', [])
        .write();
    } catch (__) { }
  },
  Get: function (category, tags) {
    return db.get('howtos')
      .filter(function (howto) {
        var pass = true;
        if (category) {
          pass = pass && category === howto.category;
        }
        if (tags.length > 0) {
          pass = pass && tags.every(function (tag) {
            return howto.tags.includes(tag);
          });
        }

        return pass;
      }).value()
      .sort(function (a, b) {
        if (a.category === b.category) {
          if (a.title < b.title) {
            return -1;
          } else if (a.title > b.title) {
            return 1;
          } else {
            return 0;
          }
        } else if (a.category < b.category) {
          return -1;
        } else {
          return 1;
        }
      });
  },
  GetCategories: function () {
    return db.get('howtos')
      .map(function (howto) { return howto.category; })
      .uniq()
      .sort()
      .value();
  }
};
