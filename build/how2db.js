var sqlite = require('sqlite3').verbose();
var path = require('path');

const DB_PATH = path.join(__dirname, '../dist/how2.db');

var db = null;

module.exports = {
    Open: function () {
        db = new sqlite.Database(DB_PATH);
        db.serialize(function () {
            db.run('PRAGMA foreign_keys=on;');
        });
    },
    Close: function () {
        db.close();
    },
    CreateTables: function () {
        db.serialize(function () {
            db.run('CREATE TABLE IF NOT EXISTS howtos (id INTEGER NOT NULL PRIMARY KEY, category TEXT, title TEXT, distpath TEXT, sourcepath TEXT);');
            db.run('CREATE TABLE IF NOT EXISTS tags (name TEXT, howto_id, CONSTRAINT fk_tags FOREIGN KEY (howto_id) REFERENCES howtos(id) ON DELETE CASCADE);');
        });
    },
    Insert: function (category, title, distpath, sourcepath, tags) {
        db.run('INSERT INTO howtos (category,title,distpath,sourcepath) VALUES (?,?,?,?);', [category, title, distpath, sourcepath], function (err) {
            if (err) {
                throw new Error(err);
            }
            var lastId = this.lastID;
            var stmt = db.prepare('INSERT INTO tags (name,howto_id) VALUES (?,?);');
            tags.forEach(function (tag) {
                stmt.run([tag, lastId]);
            });
            stmt.finalize();
        });
    },
    Delete: function (sourcepath) {
        db.run('DELETE FROM howtos WHERE sourcepath=?;', sourcepath);
    },
    Get: function (category, tags, callback) {
        // Returns rows that contain ALL provided tags and in the given category if supplied
        // Calls the callback function with the results in the second parameter
        var sql = 'SELECT category,title,distpath FROM howtos';

        var conditionsSql = [];
        var args = [];

        if (tags.length > 0) {
            var inMarks = [];
            inMarks[tags.length - 1] = '?';
            inMarks.fill('?');
            conditionsSql.push(`id IN (SELECT howto_id FROM tags WHERE name IN (${inMarks.join(',')}) GROUP BY howto_id HAVING COUNT(howto_id) = ?)`);
            args = tags.slice();
            args.push(tags.length);
        }

        if (category) {
            conditionsSql.push('category = ?');
            args.append(category);
        }

        if (conditionsSql.length > 0) {
            sql = sql + ' WHERE ' + conditionsSql.join(' AND ');
        }

        db.all(sql + ';', args, callback);
    }
};