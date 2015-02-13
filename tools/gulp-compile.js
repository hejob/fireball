var Path = require('fire-path');
var Fs = require('fs');
var Readable = require('stream').Readable;
var Format = require('util').format;

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var es = require('event-stream');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var Nomnom = require('nomnom');

//var bufferify = require('vinyl-buffer');

//var rename = require('gulp-rename');
//var concat = require('gulp-concat');
//var jshint = require('gulp-jshint');
//var stylish = require('jshint-stylish');
//var uglify = require('gulp-uglify');
//var fb = require('gulp-fb');


/////////////////////////////////////////////////////////////////////////////
// parse args
/////////////////////////////////////////////////////////////////////////////

Nomnom.script('gulp --gulpfile gulp-compile.js');
Nomnom.option('project', {
    string: '-p PROJECT, --project=PROJECT',
    help: 'the project to compile',
    required: true,
});
Nomnom.option('platform', {
    string: '--platform=PLATFORM',
    help: 'the target platform to compile',
    'default': 'editor',
});
Nomnom.option('dest', {
    string: '--dest=DEST',
    help: 'the path for the output files',
    'default': 'library/bundle.js',
});
Nomnom.option('debug', {
    string: '-d, --debug',
    help: 'script debugging',
    flag: true,
});

var opts = Nomnom.parse();
var debug = opts.debug;
var platform = opts.platform;
var isEditor = platform === 'editor';

/////////////////////////////////////////////////////////////////////////////
// configs
/////////////////////////////////////////////////////////////////////////////

function getScriptGlob(dir) {
    return [
        Path.join(dir, '**/*.js'),
        '!' + Path.join(dir, '**/{Editor,editor}/**'),   // 手工支持大小写，详见下面注释
    ];
}

var paths = {
    src: getScriptGlob('assets'),
    pluginSettings: 'settings/plugin-settings.json',
    tmpdir: 'temp',

    dest: opts.dest,
    proj: Path.resolve(opts.project),
};

paths.pluginSettings = Path.join(paths.proj, paths.pluginSettings);
paths.tmpdir = Path.join(paths.proj, paths.tmpdir);
//paths.tmpdir = Path.join(require('os').tmpdir(), 'fireball')
paths.dest = Path.resolve(paths.proj, paths.dest);

if (paths.proj === process.cwd()) {
    console.error('Compile error: Invalid project path: %s', opts.project);
    process.exit(1);
}
else {
    console.log('Compiling ' + paths.proj);
}

console.log('Output ' + paths.dest);

function getUserHome () {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

paths.globalPluginDir = Path.join(getUserHome(), '.fireball-x');
paths.builtinPluginDir = Path.resolve('builtin');

opts.compileGlobalPlugin = false;

var bundleInfos = {
    // the all-in-one bundle for distributing
    "all_in_one": {
        suffix: '',
        scriptGlobs: [],
        scripts: [],
    },
    // builtin plugin runtime
    "builtin": {
        suffix: '.builtin',     // 编辑器下，插件编译出来的脚本会带上相应的后缀
        scriptGlobs: [],
        scripts: [],
    },
    // global plugin runtime
    "global": {
        suffix: '.global',
        scriptGlobs: [],
        scripts: [],
    },
    // project runtime scripts (plugin included)
    "project": {
        suffix: '.project',
        scriptGlobs: [],
        scripts: [],
    },
};

/////////////////////////////////////////////////////////////////////////////
// tasks
/////////////////////////////////////////////////////////////////////////////

// config
var tempScriptDir = paths.tmpdir + '/scripts';

// clean
gulp.task('clean', function (done) {
    var patternToDel = tempScriptDir + '/**/*'; // IMPORTANT
    del(patternToDel, { force: true }, function (err) {
        if (err) {
            done(err);
            return;
        }
        var destFilePrefix = Path.join(Path.dirname(paths.dest), Path.basenameNoExt(paths.dest));
        var destFileExt = Path.extname(paths.dest);
        for (var taskname in bundleInfos) {
            var info = bundleInfos[taskname];
            destFile = destFilePrefix + info.suffix + destFileExt;
            del(destFile, { force: true });
        }
        done();
    });
});

gulp.task('parseProjectPlugins', function () {
    bundleInfos.project.scriptGlobs = [];
    return gulp.src('assets/**/package.json.meta', { cwd: paths.proj })
        .pipe(es.through(function write (file) {
            var data = JSON.parse(file.contents);
            if ( !data.enable ) {
                bundleInfos.project.scriptGlobs.push('!assets/' + Path.dirname(file.relative) + '/**');
            }
        }));
});

gulp.task('getExternScripts', function (callback) {

    function getExternScripts (setting) {
        function getGlob (entries, pluginDir) {
            var res = [];
            for (var name in entries) {
                var entry = entries[name];
                if (entry.enable) {
                    var dir = Path.join(pluginDir, name);
                    res = res.concat(getScriptGlob(dir));
                }
            }
            return res;
        }
        bundleInfos.builtin.scriptGlobs = getGlob(setting.builtins, paths.builtinPluginDir);
        bundleInfos.global.scriptGlobs = getGlob(setting.globals, paths.globalPluginDir);
        if ( !opts.compileGlobalPlugin ) {
            // PROHIBIT runtime scripts of global plugins
            gulp.src(bundleInfos.global.scriptGlobs, { read: false, nodir: true })
                .on('data', function (file) {
                    console.warn('Not allowed to include runtime script in global plugin:', file.path,
                                    '\nMove the plugin to assets please.');
                });
            bundleInfos.global.scriptGlobs = [];
        }
        callback();
    }

    function updatePluginSetting (setting, callback) {
        var defaultSetting = {
            enable: true,
        };
        function doUpdatePluginSetting (entries, pluginDir, cb) {
            // get available plugins
            gulp.src('*/package.json', { cwd: pluginDir, read: false, nodir: true })
                .on('data', function (file) {
                    var dir = Path.dirname(file.path);
                    var name = Path.basename(dir);
                    if (!(name in entries)) {
                        console.log('Generate plugin settings for', dir);
                        entries[name] = defaultSetting;
                        dirty = true;
                    }
                })
                .on('end', function () {
                    cb();
                });
        }
        var dirty = false;
        setting.builtins = setting.builtins || {};
        setting.globals = setting.globals || {};
        doUpdatePluginSetting(setting.builtins, paths.builtinPluginDir, function () {
            doUpdatePluginSetting(setting.globals, paths.globalPluginDir, function () {
                callback(setting);
                if (dirty) {
                    Fs.writeFile(paths.pluginSettings, JSON.stringify(setting, null, 4));
                }
            });
        });
    }

    // read plugin settings
    Fs.readFile(paths.pluginSettings, function (err, data) {
        if (err) {
            updatePluginSetting({}, getExternScripts);
        }
        else {
            var setting = {};
            var content = data.toString();
            if (content.trim()) {
                setting = JSON.parse(content);
            }
            updatePluginSetting(setting, getExternScripts);
        }
    })
});

gulp.task('getScriptGlobs', ['parseProjectPlugins', 'getExternScripts'], function () {
    bundleInfos.project.scriptGlobs = paths.src.concat(bundleInfos.project.scriptGlobs);
    if ( opts.compileGlobalPlugin ) {
        bundleInfos["all_in_one"].scriptGlobs = [].concat(bundleInfos.builtin.scriptGlobs,
                                                          bundleInfos.global.scriptGlobs,
                                                          bundleInfos.project.scriptGlobs);
    }
    else {
        bundleInfos["all_in_one"].scriptGlobs = [].concat(bundleInfos.builtin.scriptGlobs,
                                                          bundleInfos.project.scriptGlobs);
    }
});

function addMetaData () {
    var footer = "\nFire._RFpop();";
    var newLineFooter = '\n' + footer;
    return es.map(function (file, callback) {
        if (file.isStream()) {
            callback(new gutil.PluginError('addMetaData', 'Streaming not supported'));
            return;
        }
        if (file.isNull()) {
            callback();
            return;
        }
        //console.log('JS >>> ', file.path);

        // read uuid
        Fs.readFile(file.path + '.meta', function (err, data) {
            var uuid = '';
            if (err) {
                if (Path.contains(paths.proj, file.path)) {
                    // project script
                    console.error('Failed to read meta file.');
                    callback(err);
                }
                else {
                    // external plugin script, no uuid
                }
            }
            else {
                try {
                    uuid = JSON.parse(data).uuid;
                }
                catch (e) {
                }
                if (!uuid) {
                    callback(new gutil.PluginError('addMetaData', 'Failed to read uuid from meta.'));
                    return;
                }
                uuid = uuid.replace(/-/g, '');
            }

            var contents = file.contents.toString();
            var header;
            if (isEditor) {
                var script = Path.basename(file.path, Path.extname(file.path));
                if (uuid) {
                    header = Format("Fire._RFpush('%s', '%s');\n// %s\n", uuid, script, file.relative);
                }
                else {
                    header = Format("Fire._RFpush('%s');\n// %s\n", script, file.relative);
                }
            }
            else {
                if (uuid) {
                    header = Format("Fire._RFpush('%s');\n// %s\n", uuid, file.relative);
                }
                else {
                    header = Format("Fire._RFpush();\n// %s\n", file.relative);
                }
            }
            var startsWithNewLine = (contents[0] === '\n' || contents[0] === '\r');
            if ( !startsWithNewLine ) {
                header += '\n'; // nicify
            }
            var endsWithNewLine = (contents[contents.length - 1] === '\n' || contents[contents.length - 1] === '\r');
            file.contents = new Buffer(header + contents + (endsWithNewLine ? footer : newLineFooter));
            callback(null, file);
        });
    });
}

/**
 * 以单文件为单位，将文件进行预编译，将编译后的文件存放到 destDir，将文件列表存到 outputFiles
 * @param {string[]} srcGlobs
 * @param {string} destDir
 * @param {string[]} outputFiles
 */
function precompile (info, destDir) {
    // https://github.com/gulpjs/gulp/blob/master/docs/API.md#options
    // https://github.com/isaacs/node-glob#options
    var GlobOptions = {
        cwd: paths.proj,
        //nodir: true,  // not worked
        //nocase = true;  // Windows 上用不了nocase，会有bug: https://github.com/isaacs/node-glob/issues/123
        //nonull: true,
    };
    info.scripts.length = 0;
    var stream = gulp.src(info.scriptGlobs, GlobOptions)
        .pipe(addMetaData())
        .pipe(gulp.dest(tempScriptDir))
        .pipe(es.through(function write(file) {
            // TODO: 检查 utf-8 bom 文件头否则会不支持require中文路径
            var encodingValid = true;
            if (!encodingValid) {
                this.emit('error', new gutil.PluginError('precompile', 'Sorry, encoding must be utf-8 (BOM): ' + file.relative, { showStack: false }));
                return;
            }
            info.scripts.push(file.relative);
        }));
    return stream;
}

function browserifyTask (srcPaths, destDir, destFile) {
    var opts = {
        debug: debug,
        basedir: tempScriptDir,
    };

    // https://github.com/substack/node-browserify#methods
    var b = browserify(opts);
    for (var i = 0; i < srcPaths.length; ++i) {
        var file = srcPaths[i];
        b.add('./' + file);
        // expose the filename so as to avoid specifying relative path in require()
        opts.expose = Path.basename(file, Path.extname(file));
        b.require('./' + file, opts);
    }
    var bundle = b.bundle();
    return bundle.on('error', function (error) {
            console.error(gutil.colors.red('Compile error:'), error.message);
            process.exit(1);
        })
        .pipe(source(destFile))
        .pipe(gulp.dest(destDir))
        ;
}

function createTask(taskname, info) {
    gulp.task('pre-compile-' + taskname, ['clean', 'getScriptGlobs'], function () {
        return precompile(info, tempScriptDir);
    });
    gulp.task('browserify-' + taskname, ['pre-compile-' + taskname], function () {
        var destDir = Path.dirname(paths.dest);
        var destFile = Path.basename(paths.dest);
        if (info.suffix) {
            destFile = Path.basenameNoExt(destFile) + info.suffix + Path.extname(destFile);
        }
        return browserifyTask(info.scripts, destDir, destFile);
    });
}

// create tasks
for (var taskname in bundleInfos) {
    var info = bundleInfos[taskname];
    createTask(taskname, info);
}

if (isEditor) {
    if ( opts.compileGlobalPlugin ) {
        gulp.task('browserify', ['browserify-builtin', 'browserify-global', 'browserify-project']);
    }
    else {
        gulp.task('browserify', ['browserify-builtin', 'browserify-project']);
    }
}
else {
    gulp.task('browserify', ['browserify-all_in_one']);
}

// default
gulp.task('default', ['browserify']);
