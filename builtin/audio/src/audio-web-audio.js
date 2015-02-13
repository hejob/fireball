(function () {
    var NativeAudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
    var nativeAC = null;

    if ( !NativeAudioContext ) {
        return;
    }

    function loader (url, callback, onProgress) {
        var cb = callback && function (xhr, error) {
            if (xhr) {
                if (!nativeAC) {
                    nativeAC = new NativeAudioContext();
                }
                nativeAC.decodeAudioData(xhr.response, function (buffer) {
                    callback(buffer);
                },function (e) {
                    callback(null, 'LoadAudioClip: "' + url +
                    '" seems to be unreachable or the file is empty. InnerMessage: ' + e);
                });
            }
            else {
                callback(null, 'LoadAudioClip: "' + url +
               '" seems to be unreachable or the file is empty. InnerMessage: ' + error);
            }
        };
        Fire.LoadManager._loadFromXHR(url, cb, onProgress, 'arraybuffer');
    }

    Fire.LoadManager.registerRawTypes('audio', loader);

    var AudioContext = {};

    AudioContext.getCurrentTime = function (target) {
        if ( target._paused ) {
            return target._startTime;
        }

        if ( target._playing ) {
            return target._startTime + this.getPlayedTime(target);
        }

        return 0;
    };

    AudioContext.getPlayedTime = function (target) {
        return (nativeAC.currentTime - target._lastPlay) * target._playbackRate;
    };

    //
    AudioContext.updateTime = function (target, time) {
        target._lastPlay = nativeAC.currentTime;
        target._startTime = time;

        if ( target.isPlaying ) {
            this.pause(target);
            this.play(target);
        }
    };

    //
    AudioContext.updateMute = function (target) {
        if (!target._volumeGain) { return; }
        target._volumeGain.gain.value = target.mute ? -1 : (target.volume - 1);
    };

    // range [0,1]
    AudioContext.updateVolume = function (target) {
        if (!target._volumeGain) { return; }
        target._volumeGain.gain.value = target.volume - 1;
    };

    //
    AudioContext.updateLoop = function (target) {
        if (!target._buffSource) { return; }
        target._buffSource.loop = target.loop;
    };

    // bind buffer source
    AudioContext.updateAudioClip = function (target) {
        if ( target.isPlaying ) {
            this.stop(target,false);
            this.play(target);
        }
    };

    //
    AudioContext.updatePlaybackRate = function (target) {
        if ( !this.isPaused ) {
            this.pause(target);
            this.play(target);
        }
    };

    //
    AudioContext.pause = function (target) {
        if (!target._buffSource) { return; }

        target._startTime += this.getPlayedTime(target);
        target._buffSource.onended = null;
        target._buffSource.stop();
    };

    //
    AudioContext.stop = function ( target, ended ) {
        if (!target._buffSource) { return; }

        if ( !ended ) {
            target._buffSource.onended = null;
        }
        target._buffSource.stop();
    };

    //
    AudioContext.play = function ( target, at ) {
        if (!target.clip || !target.clip.rawData) { return; }

        // create buffer source
        var bufferSource = nativeAC.createBufferSource();

        // create volume control
        var gain = nativeAC.createGain();

        // connect
        bufferSource.connect(gain);
        gain.connect(nativeAC.destination);
        bufferSource.connect(nativeAC.destination);

        // init parameters
        bufferSource.buffer = target.clip.rawData;
        bufferSource.loop = target.loop;
        bufferSource.playbackRate.value = target.playbackRate;
        bufferSource.onended = target.onPlayEnd.bind(target);
        gain.gain.value = target.mute ? -1 : (target.volume - 1);

        //
        target._buffSource = bufferSource;
        target._volumeGain = gain;
        target._startTime = at || 0;
        target._lastPlay = nativeAC.currentTime;

        // play
        bufferSource.start( 0, this.getCurrentTime(target) );
    };

    // ===================

    //
    AudioContext.getClipBuffer = function (clip) {
        return clip.rawData;
    };

    //
    AudioContext.getClipLength = function (clip) {
        return clip.rawData.duration;
    };

    //
    AudioContext.getClipSamples = function (clip) {
        return clip.rawData.length;
    };

    //
    AudioContext.getClipChannels = function (clip) {
        return clip.rawData.numberOfChannels;
    };

    //
    AudioContext.getClipFrequency = function (clip) {
        return clip.rawData.sampleRate;
    };


    Fire.AudioContext = AudioContext;
})();
