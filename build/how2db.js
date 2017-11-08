var sqlite = require('sqlite3').verbose();

const DB_PATH = './dist/how2.db';

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
        db.run('CREATE TABLE IF NOT EXISTS howtos (id INTEGER NOT NULL PRIMARY KEY, category TEXT, title TEXT, distpath TEXT);');
        db.run('CREATE TABLE IF NOT EXISTS tags (name TEXT, howto_id, CONSTRAINT fk_tags FOREIGN KEY (howto_id) REFERENCES howtos(id) ON DELETE CASCADE);');
    },
    Insert: function (category, title, distpath, tags) {
        db.run('INSERT INTO howtos (category,title,dispath) VALUES (?,?,?);', [category, title, distpath], function () {
            var lastId = this.lastID;
            var stmt = db.prepare('INSERT INTO tags (name,howto_id) VALUES (?,?);');
            tags.forEach(function (tag) {
                stmt.run([tag, lastId]);
            });
            stmt.finalize();
        });
    }
};