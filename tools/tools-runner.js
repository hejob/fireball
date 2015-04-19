var Spawn = require('child_process').spawn;
var Path = require('path');

var WinCMDTools = ['gulp'];

var cwd;
var EditorCwd;
var standalone = typeof Fire === 'undefined';
if (standalone) {
    Fire = require('../src/core/core');
    EditorCwd = Path.dirname(__dirname);
    cwd = process.cwd();
}
else {
    cwd = EditorCwd;
}

var ToolsRunner = {

    /**
     * @param {function} [callback]
     */
    spawn: function (command, args, callback) {
        if (!standalone) {
            Fire.log('Running: %s>%s %s', cwd, command, args.join(' '));
        }

        // spawn process

        if (Fire.isWin32 && WinCMDTools.indexOf(command) !== -1) {
            command += '.cmd';
        }
        var childProcess = Spawn(command, args, {
            cwd: cwd
        });
        childProcess.stderr.on('data', function (buf) {
            // error
            Fire.error(buf.toString().trimRight());
        });
        childProcess.stdout.on('data', function (buf) {
            // log
            var info = buf.toString().trimRight();
            if (info.indexOf('Error:') !== -1) {
                Fire.error(info);
            }
            else {
                console.log(info);
            }
        });
        childProcess.on('close', function (code) {
            // close
            console.log('%s exited with code %s', command, code);
            var succeeded = (code === 0);
            if (callback) {
                callback(succeeded);
            }
        });
        return childProcess;
    },
    //gulp: function (gulpfile, args, callback) {
    //    args.unshift('--gulpfile', gulpfile);
    //    args.unshift('--cwd', cwd);   // to prevent cwd changed by --gulpfile
    //    return this.spawn('gulp', args, callback);
    //}

    gulp: function (gulpfile, args, callback) {
        args.unshift('--gulpfile', gulpfile);
        args.unshift('--cwd', cwd);   // to prevent cwd changed by --gulpfile
        //return this.spawn('gulp', args, callback);
        args.unshift(Path.join('node_modules', 'gulp', 'bin', 'gulp.js'));
        return this.spawn(Path.join('node_modules', 'node', 'node'), args, callback);
    }
};

module.exports = ToolsRunner;
