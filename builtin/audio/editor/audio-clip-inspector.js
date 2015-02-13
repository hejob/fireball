// AudioClipInspector

var AudioClipInspector = Fire.define('Fire.AudioClipInspector', Fire.AssetInspector, null);

AudioClipInspector.prop('length', 0, Fire.ReadOnly);
AudioClipInspector.prop('samples', 0, Fire.Integer, Fire.ReadOnly);
AudioClipInspector.prop('channels', 0, Fire.Integer, Fire.ReadOnly);
AudioClipInspector.prop('frequency', 0, Fire.Integer, Fire.ReadOnly);

AudioClipInspector.prototype.init = function (asset, meta) {
    this.length = asset.length;
    this.samples = asset.samples;
    this.channels = asset.channels;
    this.frequency = asset.frequency;
};

module.exports = AudioClipInspector;
