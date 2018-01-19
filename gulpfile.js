"use strict";
var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var imageInliner = require('postcss-image-inliner');
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var run = require("run-sequence");
var del = require("del");
var uncss = require('gulp-uncss');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var beautify = require('gulp-beautify');
var babel = require('gulp-babel');
import browserify from "browserify";
import source from "vinyl-source-stream";
var vueify = require('gulp-vueify');
import Vue from 'vue';
import VueRouter from 'vue-router';
// import app from 'js/app.vue';

Vue.use(VueRouter);

gulp.task('browserify', function () {
    return gulp.src('js/total-mat.js')
      .pipe(plumber())
      .pipe(browserify({
            debug: !env.p,
            transform: ['vueify']
       }))
      .pipe(babel({presets: ['es2015']}))
      // .pipe(gulpif(env.p, uglify()))
      .pipe(gulpif(env.p, uglify(), beautify()))
      // .pipe(gulpif(condition, uglify(), beautify()))
        .pipe(gulp.dest('build/js'));
});

var envify = require('envify/custom');

browserify(browserifyOptions)
  .transform(vueify)
  .transform(
    // Порядок необходим для обработки файлов node_modules
    { global: true },
    envify({ NODE_ENV: 'production' })
  )
  .bundle();

// gulp.task('vueify', function () {
//   return gulp.src('js/*.vue')
//     .pipe(vueify())
//     .pipe(gulp.dest('build/js'));
// });

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2,ttf}",
      "img/**",
      "js/**",
      "*.html"
    ], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

gulp.task("html", function() {
  gulp.src("*.html")
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});
gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("build/img/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});
gulp.task("style", function() {
  gulp.src("sass/blog.style.sass")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 3 versions"
      ]}),
      mqpacker ({
        sort: true
      })
    ]))
    // .pipe(gulp.dest("build/css/"))
    .pipe(minify())
    // .pipe(rename("index.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
  gulp.src("sass/index.style.sass")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 3 versions"
      ]}),
      mqpacker ({
        sort: true
      }),
      // imageInliner({
      //   assetPaths: [
      //     'img/**.*svg',
      //   ],
      //   maxFileSize: 5120
      // })
    ]))
    .pipe(minify())
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
  gulp.src("sass/material.style.sass")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 3 versions"
      ]}),
      mqpacker ({
        sort: true
      })
    ]))
    .pipe(minify())
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});
gulp.task("js", function() {
  gulp.src("js/*.js")
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});
gulp.task("watch", function() {
  gulp.watch("js/*.js", ["js"]);
  gulp.watch("sass/**/*.sass", ["style"]);
  gulp.watch("*.html", ["html"]);
});
gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    // "images",
    // "symbols",
    fn
  );
});
gulp.task("serve", function() {
  server.init({
    server: "build"
  });
  server.watch('build/**/*.*').on('change', server.reload);
});

gulp.task('deploy', function() {
  var ghPages = require('gulp-gh-pages');
  console.log('---------- Публикация содержимого ./build/ на GH pages');
  return gulp.src('build/**/*')
    .pipe(ghPages({
      // remoteUrl: 'git@github.com:novikovvitaliy2014/novikovvitaliy2014.github.io.git',
      // branch: 'master'
    }));
});

gulp.task('update', ["serve", "watch"]);
