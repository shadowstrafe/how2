var data = require('gulp-data');
var del = require('del');
var frontMatter = require('gulp-front-matter');
var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('handlebars');
var hljs = require('highlight.js');
var markdown = require('gulp-markdownit');
var path = require('path');
var slash = require('slash');
var watch = require('gulp-watch');

var useTemplate = require('./build/gulp-use-template.js');
var insertDb = require('./build/gulp-insert-into-db.js');
var config = require('./build/config.js');
var db = require('./build/how2db');

const SRC_PATH = config.paths.sourcepath;
const DIST_PATH = './dist';

const mdConfig = {
  options: {
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {
          return '';
        }
      }

      return ''; // use external default escaping
    }
  }
};

const template = fs.readFileSync('./build/how2.template');
var compiled = handlebars.compile(template.toString());

gulp.task('default', ['build']);

gulp.task('build', function () {
  return gulp.src(SRC_PATH + '/**/*.md')
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
        csspath: '../'.repeat(n - 1) + 'how2.css',
        relativepath: normalizedFilePath,
        category: normalizedFilePathSegments.slice(0, -1).join('/')
      };
    }))
    .pipe(markdown(mdConfig))
    .pipe(useTemplate(compiled))
    .pipe(insertDb())
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('css', function () {
  return gulp.src('./build/**.css')
    .pipe(gulp.dest(DIST_PATH));
});

gulp.task('clean', function () {
  return del(DIST_PATH + '/**/*');
});

gulp.task('watch', function () {
  var watchglob = slash(SRC_PATH + '/**/*.md');
  console.log('Watching ' + watchglob);
  return watch(watchglob, { base: SRC_PATH }, function (file) {
    var event = file.event;
    // Normalize to unix-like/url-like relative path without extension
    var normalizedFilePath = slash(file.relative).replace(/.md$/, '');
    var destFilePath = path.join(DIST_PATH, normalizedFilePath + '.html');

    console.log(event + ' triggered');

    if (event === 'unlink' || event === 'change') {
      console.log('Removing db entry with ' + normalizedFilePath);
      console.log('Deleting file at ' + destFilePath);
      db.Delete(normalizedFilePath);
      del.sync(destFilePath);
    }
    if (event === 'add' || event === 'change') {
      console.log('Building from source file ' + file.path);
      console.log('Inserting db entry with ' + normalizedFilePath);

      gulp.src(file.path, { base: SRC_PATH })
        .pipe(frontMatter({
          property: 'data',
          remove: true
        }))
        .pipe(data(function (file) {
          let normalizedFilePathSegments = normalizedFilePath.split('/');
          let n = normalizedFilePathSegments.length;
          return {
            csspath: '../'.repeat(n - 1) + 'how2.css',
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
