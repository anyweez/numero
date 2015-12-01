/* jslint node: true */
'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('default', ['js']);

gulp.task('js', function () {
    return browserify({
            entries: './numpat.js',
            debug: true,
            transform: [],
            standalone: 'numpat',
        })
        .bundle()
        .pipe(source('numpat.js'))
        .pipe(gulp.dest('static'));
});