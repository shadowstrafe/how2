var through = require('through2');    // npm install --save through2

module.exports = function () {
    return through.obj(function (file, encoding, callback) {
        insertIntoDb(file.frontMatter.tags, file.frontMatter.title, '/' + file.relative.replace('\\', '/'));
        callback(null, file);
    });
};

function insertIntoDb(tags, title, distDir) {
    console.log(distDir);
}
