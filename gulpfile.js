var gulp = require('gulp');
var gconcat = require('gulp-concat');
var guglify = require('gulp-uglify');

var paths = {
    scripts: [
        'src/js/jquery-1.11.3.js',
        'src/js/lodash-4.5.0.js',
        'src/js/mapbox-2.3.0.js',
        'src/js/L.Control.Locate-0.43.0.min.js',
        'src/js/bootstrap-3.3.6.js',
        'src/js/list.js',
        'src/js/script.js'
    ]
};

gulp.task('compile-scripts', function() {
  gulp.src(paths.scripts)
      .pipe(gconcat('application.js'))
      .pipe(guglify())
      .pipe(gulp.dest('public/js'))
});