var Path = require('fire-path');

// AudioClipMeta

var AudioClipMeta = Fire.extend('Fire.AudioClipMeta', Fire.AssetMeta);

AudioClipMeta.prototype.createAsset = function ( path, cb ) {
    // load Fire.AudioClip
    var asset = new Fire.AudioClip();
    asset._setRawExtname(Path.extname(path));
    cb ( null, asset );
};

AudioClipMeta.prototype.import = function (file) {
    var scope = this;
    var Async = require('async');

    Async.parallel([
        function ( next ) {
            Fire.AssetDB.saveAssetToLibrary( file.meta.uuid, file.asset, next );
        },

        function ( next ) {
            Fire.AssetDB.copyToLibrary( file.meta.uuid, Path.extname(file.path), file.path, next );
        },
    ], function ( err ) {
        if ( err ) {
            scope.error(err);
            return;
        }
        scope.done();
    });
};

Fire.AudioClipMeta = AudioClipMeta;

module.exports = AudioClipMeta;
