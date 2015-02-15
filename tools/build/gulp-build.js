var Path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var gutil = require('gulp-util');
//var del = require('del');
var es = require('event-stream');

var Nomnom = require('nomnom');

var ToolsRunner = require(Path.resolve('./tools/tools-runner'));

// 有且只有平台所属的 task 以 build-platform_ 开头
var BUILD_ = 'build-platform_';

/////////////////////////////////////////////////////////////////////////////
// parse args
/////////////////////////////////////////////////////////////////////////////

Nomnom.script('gulp --gulpfile gulp-build.js');
Nomnom.option('project', {
    string: '-p PROJECT, --project=PROJECT',
    help: 'the project to build',
    required: true,
});
Nomnom.option('platform', {
    string: '--platform=PLATFORM',
    help: 'the target platform to build',
    required: true,
});
Nomnom.option('dest', {
    string: '--dest=DEST',
    help: 'the path for the output files',
    required: true,
});
Nomnom.option('debug', {
    string: '-d, --debug',
    help: 'development build',
    flag: true,
});
// 这是一个临时参数，之后会从 project settings 读取
Nomnom.option('scene', {
    string: '--launch-scene=UUID',
});

var opts = Nomnom.parse();
var proj = opts.project;
var platform = opts.platform;
var dest = opts.dest;
var debug = opts.debug;

proj = Path.resolve(proj);
console.log('Building ' + proj);

dest = Path.resolve(dest);
console.log('Destination ' + dest);

/////////////////////////////////////////////////////////////////////////////
// configs
/////////////////////////////////////////////////////////////////////////////

var tmpl_base = './tools/build/platforms/';
var paths = {
    template_web_desktop: tmpl_base + (debug ? 'web-desktop/template-dev/**/*' : 'web-desktop/template/**/*'),
    template_web_mobile: tmpl_base + (debug ? 'web-mobile/template-dev/**/*' : 'web-mobile/template/**/*'),
    script: debug ? 'project.dev.js' : 'project.js',
    deps: [
        debug ? 'ext/pixi/bin/pixi.dev.js' : 'ext/pixi/bin/pixi.js',
    ],
    res: Path.join(dest, 'resource'),
    settings: Path.join(dest, 'settings.json'),
};

/////////////////////////////////////////////////////////////////////////////
// tasks
/////////////////////////////////////////////////////////////////////////////

// copy-deps
gulp.task('copy-deps', function () {
    return gulp.src(paths.deps)
        .pipe(gulp.dest(dest));
});

// compile for current platform
gulp.task('compile', function (done) {
    var script = Path.join(dest, paths.script);
    var args = [
        '--project=' + proj,
        '--platform=' + platform,
        '--dest=' + script,
    ];
    if (debug) {
        args.push('--debug');
    }

    // run!
    ToolsRunner.gulp('tools/gulp-compile.js', args, function (succeeded) {
        if (succeeded) {
            done();
        }
        else {
            console.error('Failed to build');
            process.exit(1);
        }
    });
});

// build resources
gulp.task('build-resources', function () {
    return gulp.src(Path.join(proj, 'library/**/*'), { base: proj })
        .pipe(gulp.dest(paths.res));
});

// build project settings
gulp.task('build-settings', [
    'copy-deps',    // wait until dest folder created
],
function (done) {
    var settings = {
        scenes: [opts.scene],
    }
    fs.writeFile(paths.settings, JSON.stringify(settings), done);
});

// build html
function buildAndCopyWeb(src, callback) {
    return gulp.src(src)
        .pipe(es.through(function write(file) {
            if (Path.extname(file.path) === '.html') {
                console.log('generating html from ' + file.path);
                var data = {
                    file: file,
                    project: Path.basename(proj),
                    width: 800,
                    height: 600,
                };
                file.contents = new Buffer(gutil.template(file.contents, data))
            }
            this.emit('data', file);
        }))
        .pipe(gulp.dest(dest))
        .on('end', callback);
}

// web-desktop
gulp.task(BUILD_ + 'web-desktop',[
    'compile',
    'copy-deps',
    'build-resources',
    'build-settings'
], function (done) {
    buildAndCopyWeb(paths.template_web_desktop, done);
    //var path = Path.join(dest, Path.basename(paths.web_template_desktop));
    //new gutil.File({
    //    contents: _generateRunnerContents(template, lib_dev.concat(fileList), dest, title),
    //    base: file.base,
    //    path: Path.join(file.base, filename)
    //})
});

// web-mobile
gulp.task(BUILD_ + 'web-mobile',[
    'compile',
    'copy-deps',
    'build-resources',
    'build-settings'
], function (done) {
    buildAndCopyWeb(paths.template_web_mobile, done);
});

// default
gulp.task('default', ['build']);

/////////////////////////////////////////////////////////////////////////////
// check platform
/////////////////////////////////////////////////////////////////////////////

var buildTask = BUILD_ + platform;
if (buildTask in gulp.tasks) {
    // redirect your platform
    gulp.task('build', [buildTask]);
}
else {
    var availables = [];
    for (var key in gulp.tasks) {
        if (key.indexOf(BUILD_) === 0) {
            availables.push(key.substring(BUILD_.length));
        }
    }
    console.error('Not support %s platform, available platform currently: %s', platform, availables);
    process.exit(1);
}
