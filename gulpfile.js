// gulp dependecies
const gulp = require('gulp')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const imagemin = require('gulp-imagemin')
const webpack = require('webpack-stream')
const del = require('del')
const browserSync = require('browser-sync')
const server = browserSync.create()

// paths
let paths = {
  views: {
    watch: 'src/**/*.pug',
    dest: 'build/'
  },
  styles: {
    src: 'src/styles/main.scss',
    watch: 'src/styles/**/*.scss',
    dest: 'build/'
  },
  scripts: {
    src: 'src/scripts/main.js',
    watch: 'src/scripts/**/*.js',
    dest: 'build/'
  },
  images: {
    src: 'src/images/**/*.{jpg,jpeg,png,svg}',
    watch: 'src/images/**/*',
    dest: 'build/images/'
  }
}

function clean () {
  return del(['build'])
}

function views () {
  return gulp.src(paths.views.watch)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(paths.views.dest))
}

function styles () {
  return gulp.src(paths.styles.src)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(concat('build.css'))
    .pipe(gulp.dest(paths.styles.dest))
}

function scripts () {
  return gulp.src(paths.scripts.src)
    .pipe(webpack({
      output: {
        filename: 'build.js'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      devtool: 'source-map',
      mode: 'production'
    }))
    .pipe(gulp.dest(paths.styles.dest))
}

function images () {
  return gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest))
}

function reload (done) {
  server.reload()
  done()
}

function serve (done) {
  server.init({
    server: {
      baseDir: 'build/'
    }
  })
  done()
}

function watch () {
  gulp.watch(paths.views.watch, gulp.series(views, reload))
  gulp.watch(paths.scripts.watch, gulp.series(scripts, reload))
  gulp.watch(paths.styles.watch, gulp.series(styles, reload))
  gulp.watch(paths.images.watch, gulp.series(images, reload))
}

let build = gulp.series(clean, gulp.parallel(views, styles, scripts, images, serve, watch))

gulp.task('build', build)
gulp.task('default', build)
