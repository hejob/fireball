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
    var process = 2;

    Fire.AssetDB.saveAssetToLibrary(file.meta.uuid, file.asset, function (err) {
        if (err) {
            Fire.error(err.message);
            return;
        }

        --process;
        if (process === 0) this.done();
    }.bind(this));

    Fire.AssetDB.copyToLibrary(file.meta.uuid, Path.extname(file.path), file.path, function (err) {
        if (err) {
            Fire.error(err.message);
        }

        --process;
        if (process === 0) this.done();
    }.bind(this));
};

Fire.AudioClipMeta = AudioClipMeta;

module.exports = AudioClipMeta;
