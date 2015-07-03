(function () {
  'use strict';

  var gulp = require('gulp'),
    args = require('yargs').argv,
    taskListing = require('gulp-task-listing'),
    fs = require('fs'),
    nodemon = require('gulp-nodemon'),
// linting
    jshint = require('gulp-jshint'),
// Test API
    mocha = require('gulp-mocha'),
// Test Unit
    exec = require('child_process').exec,
// Documentation
    docco = require('gulp-docco');

  var nodemonConfig = JSON.parse(fs.readFileSync('./nodemon.json'));

  var jsLintFiles = [
    // config
    'gulpfile.js',
    'config/**/*.js',
    '!config/statsd*.js',

    // node
    'httpd/**/*.js',

    // tests
    'test/**/*.js',
    '!test/coverage/**/*.js'
  ];

  gulp.task('default', taskListing);
  gulp.task('help', taskListing);

  gulp.task('init', function () {
    gulp.src('./config/env/example/*')
      .pipe(gulp.dest('./config/env'));
  });

  gulp.task('watch-lint', function () {
    gulp.watch(jsLintFiles, ['lint']);
  });

  gulp.task('watch-test', function () {
    gulp.watch('httpd/**/*.js', ['test']);
  });

  gulp.task('lint', function () {
    gulp.src(jsLintFiles)
      .pipe(jshint('.jshintrc', {fail: true}))
      .pipe(jshint.reporter()); // Console output
  });

  gulp.task('serve', function () {

    // If --devdelay arg add environment variable for koa.js
    if (args.devdelay) {
      nodemonConfig.env.DEV_DELAY = true;
    }

    nodemon(nodemonConfig)
      .on('restart', function () {
        console.log('restarted!');
      });
  });

  gulp.task('test-api', function () {

    return gulp.src('test/api/*spec.js', {read: false})
      .pipe(mocha({reporter: 'spec'}));
  });

  gulp.task('test', function (cb) {

    var tests = '\'httpd/**/*.js\'';

    // TODO: use command line options library here.
    if (process.argv[3] === '--suite' && process.argv[4]) {
      tests = process.argv[4];
    }

    exec('NODE_ENV=test node ./node_modules/istanbul-harmony/lib/cli.js cover node_modules/mocha/bin/_mocha ' +
      '-x \'*spec.js\' --root httpd/ --dir test/coverage  -- -R spec --recursive ' + tests, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });

  gulp.task('test-ci', function (cb) {

    exec('NODE_ENV=test-ci node ./node_modules/istanbul-harmony/lib/cli.js cover node_modules/mocha/bin/_mocha ' +
      '-x \'*spec.js\' --root httpd/ --dir test/coverage  -- -R spec --recursive \'httpd/**/*.js\'', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });

  gulp.task('docs', function () {

    gulp.src('./httpd/**/*.js')
      .pipe(docco())
      .pipe(gulp.dest('./docs'));

  });

})();
