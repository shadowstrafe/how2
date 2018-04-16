var isDebug = process.env.NODE_ENV === 'development';

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

function insert (howto) {
  if (isDebug) {
    console.log('how2db.js:Adding ' + howto.id);
  }
  db.get('howtos')
    .push(howto)
    .write();
}

function update (howto) {
  if (isDebug) {
    console.log('how2db.js:Updating ' + howto.id);
  }
  db.get('howtos')
    .find({ id: howto.id })
    .assign(howto)
    .write();
}

function remove (id) {
  if (isDebug) {
    console.log('how2db.js:Deleting ' + id);
  }
  db.get('howtos')
    .remove({ id: id })
    .write();
}

function get (id) {
  return db.get('howtos')
    .find({ id: id })
    .value();
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
  GetAll: function () {
    return db.get('howtos')
      .value()
      .sort(function (a, b) {
        if (a.attributes.category < b.attributes.category) {
          return -1;
        } else if (a.attributes.category > b.attributes.category) {
          return 1;
        } else if (a.attributes.title < b.attributes.title) {
          return -1;
        } else if (a.attributes.title > b.attributes.title) {
          return 1;
        } else {
          return 0;
        }
      });
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
      .value()
      .sort(function (a, b) {
        if (a.attributes.category < b.attributes.category) {
          return -1;
        } else if (a.attributes.category > b.attributes.category) {
          return 1;
        } else if (a.attributes.title < b.attributes.title) {
          return -1;
        } else if (a.attributes.title > b.attributes.title) {
          return 1;
        } else {
          return 0;
        }
      });
  },
  GetAllWithCategory: function (category) {
    return db.get('howtos')
      .filter(function (howto) {
        return howto.attributes.category === category;
      })
      .value()
      .sort(function (a, b) {
        if (a.attributes.category < b.attributes.category) {
          return -1;
        } else if (a.attributes.category > b.attributes.category) {
          return 1;
        } else if (a.attributes.title < b.attributes.title) {
          return -1;
        } else if (a.attributes.title > b.attributes.title) {
          return 1;
        } else {
          return 0;
        }
      });
  }
};
