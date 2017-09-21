var markdown = require("gulp-markdownit");
var gulp = require("gulp");

gulp.task("default", function () {
    gulp.src("src/**/*.md").pipe(markdown())
        .pipe(gulp.dest("dist"));
});
