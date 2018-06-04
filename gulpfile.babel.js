const gulp = require("gulp"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  sass = require("gulp-sass"),
  clean = require("gulp-clean"),
  imagemin = require("gulp-imagemin"),
  csso = require("gulp-csso"),
  pug = require("gulp-pug"),
  plumber = require("gulp-plumber"),
  sourcemaps = require("gulp-sourcemaps"),
  imageminJpegRecompress = require("imagemin-jpeg-recompress"),
  browserSync = require("browser-sync").create(),
  webpack = require("webpack-stream"),
  gulpIf = require("gulp-if"),
  runSequence = require("run-sequence"),
  watch = require("gulp-watch"),
  batch = require("gulp-batch");

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == "development";

gulp.task("webpack", () =>
  gulp
    .src("app/js/main.js")
    .pipe(
      webpack(
        isDevelopment
          ? require("./webpack.dev.js")
          : require("./webpack.prod.js")
      )
    )
    .on("error", function handleError() {
      this.emit("end"); // Recover from errors
    })
    .pipe(gulp.dest("dist/js/"))
);

gulp.task("webpack-watch", ["webpack"], () => browserSync.reload());

gulp.task("styles", () => {
  const processors = [
    autoprefixer({ browsers: ["last 4 version"] }),
    require("postcss-inline-svg")
  ];

  return gulp
    .src("app/sass/**/*.sass")
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(postcss(processors))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulpIf(!isDevelopment, csso({ sourceMap: false })))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task("pug", () =>
  gulp
    .src("app/pug/*.pug")
    .pipe(plumber())
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest("dist"))
);

gulp.task("pug-watch", ["pug"], () => browserSync.reload());

gulp.task("copy-fonts", () =>
  gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"))
);

gulp.task("copy-images", () =>
  gulp
    .src("app/img/**/*")
    .pipe(plumber())
    .pipe(
      gulpIf(
        !isDevelopment,
        imagemin([
          imagemin.gifsicle(),
          imageminJpegRecompress({ min: 60, max: 80 }),
          imagemin.optipng(),
          imagemin.svgo({
            plugins: [{ cleanupIDs: false }]
          })
        ])
      )
    )
    .pipe(gulp.dest("dist/img"))
);

gulp.task("images-watch", ["copy-images"], () => browserSync.reload());
gulp.task("fonts-watch", ["copy-fonts"], () => browserSync.reload());

gulp.task("copy-static-files", ["copy-fonts", "copy-images"]);

gulp.task("clean", () => gulp.src("dist", { read: false }).pipe(clean()));

//default
gulp.task("default", ["dist"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    open: false
  });

  gulp.watch("app/sass/**/*.sass", ["styles"]);
  gulp.watch("app/pug/**/*.pug", ["pug-watch"]);
  gulp.watch("app/js/**/*.js", ["webpack-watch"]);

  watch(
    "app/img/**",
    batch(function(events, done) {
      gulp.start("images-watch", done);
    })
  );

  watch(
    "app/fonts/**",
    batch(function(events, done) {
      gulp.start("fonts-watch", done);
    })
  );
});

//dist
gulp.task("dist", ["clean"], cb => {
  runSequence(["pug", "styles", "webpack", "copy-static-files"], cb);
});
