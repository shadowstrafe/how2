var data = require('gulp-data');
var del = require('del');
var frontMatter = require('gulp-front-matter');
var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('handlebars');
var hljs = require('highlight.js');
var markdown = require('gulp-markdownit');

var useTemplate = require('./build/insert_into_template.js');

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

    const template = fs.readFileSync('./how2.template');
    var compiled = handlebars.compile(template.toString());

    return gulp.src('src/**/*.md')
        .pipe(frontMatter())
        .pipe(data(function (file) {
            let n = file.relative.split(/\/|\\/).length;
            return {
                csspath: '../'.repeat(n - 1) + 'how2.css'
            };
        }))
        .pipe(markdown(mdConfig))
        .pipe(useTemplate(compiled))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
    return gulp.src('./build/**.css')
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return del('dist/**/*');
});
