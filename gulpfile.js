//gulpfile.js
let gulp = require('gulp');
let pug = require('gulp-pug');
let stylus = require('gulp-stylus');
let del = require('del');
let jest = require('gulp-jest').default;
let filter = require('gulp-filter');

// Get one .styl file and render
gulp.task('styles', function () {
    return gulp.src('./src/*.styl')
        .pipe(stylus())
        .pipe(gulp.dest('./dist'));
});

gulp.task('pug', function () {
    return gulp.src('./src/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('script', function () {
    return gulp.src('./src/*.js')
        .pipe(filter(['**', '!./src/*.test.js']))
        .pipe(gulp.dest('dist/'));
});

gulp.task('audio', function () {
    return gulp.src('./assets/**/*.mp3')
        .pipe(gulp.dest('dist'));
});

gulp.task('mediapipe', function () {
    return gulp.src('./node_modules/@mediapipe/**/*')
        .pipe(gulp.dest('dist/static/mediapipe/'))
});

gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['dist'], cb);
});

gulp.task('jest', function () {
    return gulp.src('./src/*.test.js').pipe(jest());
});

gulp.task('build', gulp.series("clean",gulp.parallel("jest","styles", "pug", "audio", "script", "mediapipe")));

gulp.task('default', gulp.series('build'))