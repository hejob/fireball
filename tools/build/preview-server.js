/**
 * Simple express app to run user build app
 * Created by nantas on 15/3/13.
 */
var express = require('express');
var app = express();
var os = require('os');
var Path = require('path');

function start() {
    var del = require('del');
    var buildPath = Path.join(os.tmpdir(),'fireball-game-builds');
    del(Path.join(buildPath + '**/*'), {force: true}, function() {
        app.use(express.static(Path.join(os.tmpdir(), 'fireball-game-builds')));

        app.get('/', function (req, res) {
            res.send('Please build your game project and play it here!');
        });

// ============================
// error handling
// ============================

        app.use(function (err, req, res, next) {
            console.error(err.stack);
            next(err);
        });

        app.use(function (err, req, res, next) {
            if (req.xhr) {
                res.status(err.status || 500).send({error: err.message});
            }
            else {
                next(err);
            }
        });

        app.use(function (req, res) {
            res.status(404).send({error: "404 Error."});
        });

        var server = app.listen(7456, function () {
            console.log('preview server running at http://localhost:7456');
        });
    });
}

module.exports.start = start;

