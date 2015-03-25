var gulp = require('gulp');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
gulp.task('uglify', function () {
    gulp.src(['./public/js/*.js', '!./public/js/*.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'));
    gulp.run('less');
});

gulp.task('less', function () {
    gulp.src(['./public/stylesheets/*.less'])
        .pipe(less({
            compress: true
        }))
        .pipe(gulp.dest('./public/css'));
});
gulp.task('lessWithOutCompress', function () {
    gulp.src(['./public/stylesheets/*.less'])
        .pipe(less({
            compress: false
        }))
        .on('error', function (error) {
            console.log(error);
        })
        .pipe(gulp.dest('./public/css'));
});
gulp.task('default', ['lessWithOutCompress'], function () {
    gulp.watch('./public/stylesheets/*.less', ['lessWithOutCompress']);
});
gulp.task('release', ['uglify', 'less']);
