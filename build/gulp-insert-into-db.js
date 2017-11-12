var through = require('through2');
var db = require('./how2db');

module.exports = function () {
  return through.obj(function (file, encoding, callback) {
    let data = file.data;
    db.Insert({
      category: data.category,
      title: data.title,
      tags: data.tags || [],
      path: data.relativepath
    });
    callback(null, file);
  });
};
