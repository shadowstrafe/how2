//var sqlite = require('sqlite3').verbose();
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var path = require('path');

const DB_PATH = path.join(__dirname, '../dist/how2db.json');

var db = low(new FileSync(DB_PATH));
db.defaults({
    'howtos': []
}).write();

module.exports = {
    Insert: function (category, title, distpath, sourcepath, tags) {
        var howto = {
            category: category,
            title: title,
            distpath: distpath,
            sourcepath: sourcepath,
            tags: tags
        };

        db.get('howtos')
            .push(howto)
            .write();
    },
    Delete: function (sourcepath) {
        db.get('howtos')
            .remove(function (howto) { return howto.sourcepath === sourcepath; })
            .write();
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
            }).value();
    }
};