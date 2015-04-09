Fire.AudioClip = (function () {

    /**
     * The audio clip is an audio source data.
     * @class AudioClip
     * @extends Asset
     */
    var AudioClip = Fire.Class({
        //
        name: "Fire.AudioClip",
        //
        extends: Fire.Asset,
        //
        properties: {
            //
            rawData: {
                default: null,
                rawType: 'audio',
                visible: false
            },
            //
            buffer:{
                get: function() {
                    return Fire.AudioContext.getClipBuffer(this);
                },
                visible: false,
            },
            /**
             * The length of the audio clip in seconds (Read Only).
             * @property length
             * @type {number}
             * @readOnly
             */
            length: {
                get: function() {
                    return Fire.AudioContext.getClipLength(this);
                }
            },
            /**
             * The length of the audio clip in samples (Read Only).
             * @property samples
             * @type {number}
             * @readOnly
             */
            samples: {
                get: function() {
                    return Fire.AudioContext.getClipSamples(this);
                }
            },
            /**
             * Channels in audio clip (Read Only).
             * @property channels
             * @type {number}
             * @readOnly
             */
            channels: {
                get: function() {
                    return Fire.AudioContext.getClipChannels(this);
                }
            },
            /**
             * Sample frequency (Read Only).
             * @property frequency
             * @type {number}
             * @readOnly
             */
            frequency: {
                get: function() {
                    return Fire.AudioContext.getClipFrequency(this);
                }
            }
        }
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
