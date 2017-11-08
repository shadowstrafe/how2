var through = require('through2');
var db = require('./how2db');

module.exports = function () {
    return through.obj(function (file, encoding, callback) {
        let data = file.data;
        db.Insert(data.category, data.title, data.distpath, data.tags);
        callback(null, file);
    });
};