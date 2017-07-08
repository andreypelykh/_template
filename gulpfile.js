var gulp = require('gulp'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
// connect = require('gulp-connect'),
// minifyCss = require('gulp-minify-css'),
sass = require('gulp-sass'),
useref = require('gulp-useref'),
gulpif = require('gulp-if'),
uglify = require('gulp-uglify'),
clean = require('gulp-clean'),
imagemin = require('gulp-imagemin');

var csso = require('gulp-csso');
var pump = require('pump');


var sourcemaps = require('gulp-sourcemaps');

var imageminJpegRecompress = require('imagemin-jpeg-recompress');


var browserSync = require('browser-sync').create();

//connect
gulp.task('connect', function() {
	connect.server({
		root: 'app',
		livereload: true
	});
});


// Static server
gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: "./app"
		}
	});
});


gulp.task('sass', function () {
	
	var processors = [
		autoprefixer({browsers: ['last 4 version']}),
		require('postcss-inline-svg')
	];

	gulp.src('app/sass/**/*.sass')
	.pipe(sourcemaps.init())
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	.pipe(postcss(processors))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream());

});


//html
gulp.task('html', function () {
	gulp.src('app/*.html')
	.pipe(browserSync.stream());
})


//watch
gulp.task('watch', function () {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/*.html', ['html'])
})

//copy-files
gulp.task('copy-files', ['clean'], function(){
	gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	gulp.src('app/img/**/*')
	.pipe(imagemin([
		imagemin.gifsicle(), imageminJpegRecompress({min: 60, max: 80}), imagemin.optipng(), imagemin.svgo()
		]))
	.pipe(gulp.dest('dist/img'));



	
});

//clean
gulp.task('clean', function () {
	return gulp.src('dist', {read: false})
	.pipe(clean());
})

//distribute
gulp.task('dist', ['copy-files'], function (cb) {

   pump([
      gulp.src('app/*.html'),
      useref(),
      gulpif('*.js', uglify()),
      gulpif('*.css', csso({
      	sourceMap: false
      })),
      gulp.dest('dist')
    ],
    cb
  );
})

//default
gulp.task('default', ['browser-sync', 'html', 'sass', 'watch']);