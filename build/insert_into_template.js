// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-use-template';

module.exports = function (compiledTemplate) {
    // Creating a stream through which each file will pass
    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            // return empty file
            return callback(null, file);
        }
        if (file.isBuffer()) {
            let data = file.data;
            data.content = file.contents.toString();
            file.contents = new Buffer(compiledTemplate(data));
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
        }

        callback(null, file);
    });
};