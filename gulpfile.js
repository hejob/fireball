/**
 * Created by nantas on 15/2/11.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var exec = require('child_process').exec;

var shellVersion = require('./package.json')['fire-shell-version'];
var nativeModules = require('./package.json')['native-modules'];
console.log(shellVersion);
console.log(nativeModules);

gulp.task('install-downloader', function(cb) {
    try {
        if (require('gulp-download-fire-shell')) {
            cb();
        }
    } catch(e) {
        var child = exec('npm install gulp-download-fire-shell');
        child.stdout.on('data', function(data) {
            gutil.log(data.toString());
        });
        child.stderr.on('data', function(data) {
            gutil.log(data.toString());
        });
        child.on('exit', function() {
            gutil.log('Fire-shell downloader installed successfully! \n Please run "gulp get" to download fire-shell binary and native modules.');
            cb();
        });
    }
});

gulp.task('get-fire-shell', ['install-downloader'], function(cb) {
    var updateFireShell = require('gulp-download-fire-shell');
    updateFireShell.downloadFireShell({
        version: shellVersion,
        outputDir: 'fire-shell',
        chinaMirror: true
    }, cb);
});

gulp.task('get-native-module', ['install-downloader'], function(cb) {
    var updateFireShell = require('gulp-download-fire-shell');
    updateFireShell.downloadNativeModules({
        version: shellVersion,
        outputDir: 'node_modules',
        nativeModules: nativeModules,
        isFireShell: true,
        chinaMirror: true
    }, cb);
});

gulp.task('get', ['get-fire-shell', 'get-native-module']);

gulp.task('run', function() {
    var cmd;
    if (process.platform === "win32") {
        cmd = 'call fire-shell\\fireball.exe %cd%';
    } else {
        cmd = './fire-shell/Fireball.app/Contents/MacOS/Fireball ./ --dev';
    }
    var child = exec(cmd);
    child.stdout.on('data', function(data) {
        gutil.log(data.toString());
    });
    child.stderr.on('data', function(data) {
        gutil.log(data.toString());
    });
});
