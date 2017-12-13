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

const
	pug = require('gulp-pug'),
	plumber = require('gulp-plumber');


var sourcemaps = require('gulp-sourcemaps');

var imageminJpegRecompress = require('imagemin-jpeg-recompress');


var browserSync = require('browser-sync').create();


gulp.task('sass', function () {
	
	var processors = [
		autoprefixer({browsers: ['last 4 version']}),
		require('postcss-inline-svg')
	];

	return gulp.src('app/sass/**/*.sass')
	.pipe(sourcemaps.init())
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	.pipe(postcss(processors))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream());

});

//pug
gulp.task('pug', function buildHTML() {
  return gulp.src('app/pug/*.pug')
  .pipe(plumber())
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('app'));
});

//pug-watch
gulp.task('pug-watch', ['pug'], () => browserSync.reload());


gulp.task('fonts', ['clean'],
	() => gulp.src('app/fonts/**/*')
						.pipe(gulp.dest('dist/fonts'))
);

gulp.task('images', ['clean'],
	() => gulp.src('app/img/**/*')
						.pipe(plumber())
						.pipe(imagemin([
							imagemin.gifsicle(), imageminJpegRecompress({min: 60, max: 80}), imagemin.optipng(), imagemin.svgo()
							]))
						.pipe(gulp.dest('dist/img'))
);

//copy-files
gulp.task('copy-files', ['fonts', 'images']);

//clean
gulp.task('clean', function () {
	return gulp.src('dist', {read: false})
	.pipe(clean());
})

//distribute
gulp.task('dist', ['copy-files', 'sass', 'pug'], function (cb) {

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
gulp.task('default', ['pug', 'sass'], () => {
	browserSync.init({
		server: {
			baseDir: "./app"
		}
	});

	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/pug/**/*.pug', ['pug-watch']);
});