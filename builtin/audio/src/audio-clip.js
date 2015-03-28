Fire.AudioClip = (function () {
    var AudioClip = Fire.extend("Fire.AudioClip", Fire.Asset);

    AudioClip.prop('rawData', null, Fire.RawType('audio'), Fire.HideInInspector);

    AudioClip.get('buffer', function () {
        return Fire.AudioContext.getClipBuffer(this);
    }, Fire.HideInInspector);

    AudioClip.get("length", function () {
        return Fire.AudioContext.getClipLength(this);
    });

    AudioClip.get("samples", function () {
        return Fire.AudioContext.getClipSamples(this);
    });

    AudioClip.get("channels", function () {
        return Fire.AudioContext.getClipChannels(this);
    });

    AudioClip.get("frequency", function () {
        return Fire.AudioContext.getClipFrequency(this);
    });

    return AudioClip;
})();

// create entity action
// @if EDITOR
Fire.AudioClip.prototype.createEntity = function ( cb ) {
    var ent = new Fire.Entity(this.name);

    var audioSource = ent.addComponent(Fire.AudioSource);

    audioSource.clip = this;

    if ( cb )
        cb (ent);
};
// @endif

module.exports = Fire.AudioClip;
