var data = require('gulp-data');
var del = require('rimraf');
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

const SRC_PATH = config.source.sourcepath;
const TEMPLATE_PATH = config.source.templatepath;
const DIST_PATH = config.build.outputpath;

const shouldBuildHtml = config.build.buildhtml;

const mdConfig = {
  options: {
    html: true,
    linkify: false,
    typographer: false,
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

function getTemplate () {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  return handlebars.compile(template);
}

gulp.task('build', ['build:md', 'build:assets']);

gulp.task('build:md', ['clean'], function () {
  var template = getTemplate();
  var output = shouldBuildHtml ? gulp.dest(DIST_PATH) : () => {};

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

      var date = null;
      if (file.data.date) {
        date = moment(file.data.date).format('Do MMMM YYYY');
      }

      return {
        rootdir: '../'.repeat(n - 1),
        relativepath: normalizedFilePath,
        category: normalizedFilePathSegments.slice(0, -1).join('/'),
        date: date
      };
    }))
    .pipe(markdown(mdConfig))
    .pipe(useTemplate(template))
    .pipe(insertDb())
    .pipe(output);
});

gulp.task('build:assets', ['clean'], function () {
  if (shouldBuildHtml) {
    return gulp.src(slash(SRC_PATH) + '/*.@(css|ico)')
      .pipe(gulp.dest(DIST_PATH));
  }
});

gulp.task('clean', function () {
  db.Clear();
  return del(DIST_PATH + '/**/*', (err) => {
    console.error(err);
  });
});

gulp.task('watch', ['build'], function () {
  var output = shouldBuildHtml ? gulp.dest(DIST_PATH) : () => {};
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
      try {
        del.sync(destFilePath);
      } catch (err) {
        console.error(err);
      }
    }
    if (event === 'add' || event === 'change') {
      console.log(now + ':Building file ' + file.path);

      var template = getTemplate();
      gulp.src(file.path, { base: SRC_PATH })
        .pipe(frontMatter({
          property: 'data',
          remove: true
        }))
        .pipe(data(function (file) {
          let normalizedFilePathSegments = normalizedFilePath.split('/');
          let n = normalizedFilePathSegments.length;
          var date = null;
          if (file.data.date) {
            date = moment(file.data.date).format('Do MMMM YYYY');
          }

          return {
            rootdir: '../'.repeat(n - 1),
            relativepath: normalizedFilePath,
            category: normalizedFilePathSegments.slice(0, -1).join('/'),
            date: date
          };
        }))
        .pipe(markdown(mdConfig))
        .pipe(useTemplate(template))
        .pipe(insertDb())
        .pipe(output);
    }
  });
});
