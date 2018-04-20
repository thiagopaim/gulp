// gulp dependecies
const gulp            = require('gulp');
const plumber         = require('gulp-plumber');
const pug             = require('gulp-pug');
const sass            = require('gulp-sass');
const uglify          = require('gulp-uglify');
const sourcemaps      = require('gulp-sourcemaps');
const autoprefixer    = require('gulp-autoprefixer');
const concat          = require('gulp-concat');
const browserify      = require('browserify');
const babelify        = require('babelify');
const source          = require('vinyl-source-stream');
const buffer          = require('vinyl-buffer');
const version         = require('gulp-version-number');
const browserSync     = require('browser-sync').create();

// paths
const srcStyles       = 'src/styles/main.scss';
const srcScripts      = 'src/scripts/main.js';
const jsFiles         = [srcScripts]

// paths watch
const stylesWatch     = 'src/styles/**/*.scss';
const scriptsWatch    = 'src/scripts/**/*.js';
const viewsWatch      = 'src/**/*.pug';

// version
const versionConfig = {
  'value': '%TS%',
  'append': {
    'key': 'v',
    'to': ['css', 'js']
  }
}

// pug, html, php... views
gulp.task('views', () => {
  gulp.src(viewsWatch)
      .pipe(plumber())
      .pipe(pug({ pretty: false }))
      .pipe(version(versionConfig))
      .pipe(gulp.dest('./build/'))
});

// styles
gulp.task('styles', () => {
  gulp.src(srcStyles)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass({ 
        errorLogToConsole: true,
        outputStyle: 'compressed'
      }))
      .on('error', console.error.bind( console ))
      .pipe(autoprefixer({ 
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(concat('build.css'))
      .pipe(sourcemaps.write('./'))
      .pipe(version(versionConfig))
      .pipe(gulp.dest('./build/'))
      .pipe(browserSync.stream())
});

// scripts
gulp.task('scripts', () => {
  jsFiles.map((entry) => {
      return browserify({
        entries: [entry]
      })
      .transform(babelify, {
        presets: ['env']
      })
      .bundle()
      .pipe(source(entry))
      .pipe(buffer())
      .pipe(plumber())
      .pipe(sourcemaps.init({ 
        loadMaps: true 
      }))
      .pipe(uglify())
      .pipe(concat('build.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build/'))
      .pipe(browserSync.stream())
  })
});

// browser sync
gulp.task('browser-sync', () => {
  browserSync.init({
    open: false,
    injectChanges: true,
    // proxy: 'http://something.localhost'
    server: {
      baseDir: './build/'
    }
  })
});

// get shit done
gulp.task('default', ['styles', 'scripts', 'views']);
gulp.task('watch', ['default', 'browser-sync'], () => {
  gulp.watch(stylesWatch, ['styles']);
  gulp.watch(scriptsWatch, ['scripts', browserSync.reload]);
  gulp.watch(viewsWatch, ['views', browserSync.reload]);
});