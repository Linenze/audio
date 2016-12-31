const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass        = require('gulp-sass');
var uglify = require('gulp-uglify');

gulp.task('uglify',function(){
    return gulp.src('./app/js/audio.js')
        .pipe(uglify())
        .pipe(gulp.dest('./app/dest'))
})

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("js/js/*.js").on('change', browserSync.reload);
    gulp.watch("app/*.html").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("app/scss/player.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});