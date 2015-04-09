
var AudioSource = (function () {

    /**
     * The audio source component.
     * @class AudioSource
     * @extends Component
     * @constructor
     */
    var AudioSource = Fire.Class({
        //
        name: "Fire.AudioSource",
        //
        extends: Fire.Component,
        //
        constructor: function () {
            // 声源暂停或者停止时候为false
            this._playing = false;
            // 来区分声源是暂停还是停止
            this._paused = false;

            this._startTime = 0;
            this._lastPlay = 0;

            this._buffSource = null;
            this._volumeGain = null;

            /**
             * The callback function which will be invoked when the audio stops
             * @property onEnd
             * @type {function}
             * @default null
             */
            this.onEnd = null;
        },
        properties: {
            /**
             * Is the audio source playing (Read Only)？
             * @property isPlaying
             * @type {boolean}
             * @readOnly
             * @default false
             */
            isPlaying: {
                get: function () {
                    return this._playing && !this._paused;
                },
                visible: false
            },
            /**
             * Is the audio source paused (Read Only)?
             * @property isPaused
             * @type {boolean}
             * @readOnly
             * @default false
             */
            isPaused:{
                get: function () {
                    return this._paused;
                },
                visible: false
            },
            /**
             * Playback position in seconds.
             * @property time
             * @type {number}
             * @default 0
             */
            time: {
                get: function () {
                    return Fire.AudioContext.getCurrentTime(this);
                },
                set: function (value) {
                    Fire.AudioContext.updateTime(this, value);
                },
                visible: false
            },
            _clip: {
                default: null,
                type: Fire.AudioClip
            },
            /**
             * The audio clip to play.
             * @property clip
             * @type {AudioClip}
             * @default null
             */
            clip:{
                get: function () {
                    return this._clip;
                },
                set: function (value) {
                    if (this._clip !== value) {
                        this._clip = value;
                        Fire.AudioContext.updateAudioClip(this);
                    }
                }
            },
            //
            _loop: false,
            /**
             * Is the audio source looping?
             * @property loop
             * @type {boolean}
             * @default false
             */
            loop: {
                get: function () {
                    return this._loop;
                },
                set: function (value) {
                    if (this._loop !== value) {
                        this._loop = value;
                        Fire.AudioContext.updateLoop(this);
                    }
                }
            },
            //
            _mute: false,
            /**
             * Is the audio source mute?
             * @property mute
             * @type {boolean}
             * @default false
             */
            mute: {
                get: function () {
                    return this._mute;
                },
                set: function (value) {
                    if (this._mute !== value) {
                        this._mute = value;
                        Fire.AudioContext.updateMute(this);
                    }
                }
            },
            //
            _volume: 1,
            /**
             * The volume of the audio source.
             * @property volume
             * @type {number}
             * @default 1
             */
            volume: {
                get: function () {
                    return this._volume;
                },
                set: function (value) {
                    if (this._volume !== value) {
                        this._volume = Math.clamp01(value);
                        Fire.AudioContext.updateVolume(this);
                    }
                },
                range: [0, 1]
            },
            //
            _playbackRate: 1.0,
            /**
             * The playback rate of the audio source.
             * @property playbackRate
             * @type {number}
             * @default 1
             */
            playbackRate: {
                get: function () {
                    return this._playbackRate;
                },
                set: function (value) {
                    if (this._playbackRate !== value) {
                        this._playbackRate = value;
                        if(this._playing) {
                            Fire.AudioContext.updatePlaybackRate(this);
                        }
                    }
                }
            },
            /**
             * If set to true, the audio source will automatically start playing on onLoad.
             * @property playOnLoad
             * @type {boolean}
             * @default true
             */
            playOnLoad: true
        },
        _onPlayEnd: function () {
            if ( this.onEnd ) {
                this.onEnd();
            }

            this._playing = false;
            this._paused = false;
        },
        /**
         * Pauses the clip.
         * @method pause
         */
        pause: function () {
            if ( this._paused )
                return;

            Fire.AudioContext.pause(this);
            this._paused = true;
        },
        /**
         * Plays the clip.
         * @method play
         */
        play: function () {
            if ( this._playing && !this._paused )
                return;

            if ( this._paused )
                Fire.AudioContext.play(this, this._startTime);
            else
                Fire.AudioContext.play(this, 0);

            this._playing = true;
            this._paused = false;
        },
        /**
         * Stops the clip
         * @method stop
         */
        stop: function () {
            if ( !this._playing ) {
                return;
            }

            Fire.AudioContext.stop(this);
            this._playing = false;
            this._paused = false;
        },
        //
        onLoad: function () {
            if (this._playing ) {
                this.stop();
            }
        },
        //
        onEnable: function () {
            if (this.playOnLoad) {
                this.play();
            }
        },
        //
        onDisable: function () {
            this.stop();
        }
    });

    //
    Fire.addComponentMenu(AudioSource, 'AudioSource');

    return AudioSource;
})();

Fire.AudioSource = AudioSource;
