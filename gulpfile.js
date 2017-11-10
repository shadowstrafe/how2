var data = require('gulp-data');
var del = require('del');
var frontMatter = require('gulp-front-matter');
var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('handlebars');
var hljs = require('highlight.js');
var markdown = require('gulp-markdownit');
var escape = require('markdown-it')().utils.escapeHtml;
var path = require('path');
var slash = require('slash');
var watch = require('gulp-watch');
var moment = require('moment');

var useTemplate = require('./build/gulp-use-template.js');
var insertDb = require('./build/gulp-insert-into-db.js');
var config = require('./config.js');
var db = require('./build/how2db');

const SRC_PATH = config.paths.sourcepath;
const DIST_PATH = config.paths.distpath;

const mdConfig = {
  options: {
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' +
            hljs.highlight(lang, str, true).value +
            '</code></pre>';
        } catch (_) { }
      }

      return '<pre class="hljs"><code>' +
        escape(str) +
        '</code></pre>';
    }
  }
};

const template = fs.readFileSync(SRC_PATH + '/how2.template');
var compiled = handlebars.compile(template.toString());

gulp.task('default', ['build', 'assets']);

gulp.task('build', ['clean'], function () {
  return gulp.src(slash(SRC_PATH) + '/**/*.md')
    .pipe(frontMatter({
      property: 'data',
      remove: true
    }))
    .pipe(data(function (file) {
      // Normalize to unix-like/url-like relative path without extension
      let normalizedFilePath = slash(file.relative).replace(/.md$/, '');
      let normalizedFilePathSegments = normalizedFilePath.split('/');
      let n = normalizedFilePathSegments.length;
      return {
        rootdir: '../'.repeat(n - 1),
        relativepath: normalizedFilePath,
        category: normalizedFilePathSegments.slice(0, -1).join('/')
      };
    }))
    .pipe(markdown(mdConfig))
    .pipe(useTemplate(compiled))
    .pipe(insertDb())
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('assets', ['clean'], function () {
  return gulp.src(slash(SRC_PATH) + '/*.css')
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('clean', function () {
  db.Clear();
  return del.sync(DIST_PATH + '/**/*');
});

gulp.task('watch', function () {
  var watchglob = slash(SRC_PATH) + '/**/*.md';
  console.log('Watching ' + watchglob);
  return watch(watchglob, function (file) {
    var event = file.event;
    // Normalize to unix-like/url-like relative path without extension
    var normalizedFilePath = slash(file.relative).replace(/.md$/, '');
    var destFilePath = path.join(DIST_PATH, normalizedFilePath + '.html');

    var now = '[' + moment().format('HH:mm:ss') + ']';
    if (event === 'unlink' || event === 'change') {
      console.log(now + ':Deleting file ' + destFilePath);
      db.Delete(normalizedFilePath);
      del.sync(destFilePath);
    }
    if (event === 'add' || event === 'change') {
      console.log(now + ':Building file ' + file.path);

      gulp.src(file.path, { base: SRC_PATH })
        .pipe(frontMatter({
          property: 'data',
          remove: true
        }))
        .pipe(data(function (file) {
          let normalizedFilePathSegments = normalizedFilePath.split('/');
          let n = normalizedFilePathSegments.length;
          return {
            rootdir: '../'.repeat(n - 1),
            relativepath: normalizedFilePath,
            category: normalizedFilePathSegments.slice(0, -1).join('/')
          };
        }))
        .pipe(markdown(mdConfig))
        .pipe(useTemplate(compiled))
        .pipe(insertDb())
        .pipe(gulp.dest(DIST_PATH));
    }
  });
});
