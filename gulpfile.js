var data = require('gulp-data');
var del = require('del');
var frontMatter = require('gulp-front-matter');
var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('handlebars');
var hljs = require('highlight.js');
var markdown = require('gulp-markdownit');
var slash = require('slash');

var useTemplate = require('./build/gulp-use-template.js');
var insertDb = require('./build/gulp-insert-into-db.js');

gulp.task('default', function () {
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

  return gulp.src('src/**/*.md')
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
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
  return gulp.src('./build/**.css')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return del('dist/**/*');
});
