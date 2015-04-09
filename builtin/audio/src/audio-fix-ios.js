require('audio-legacy');
require('audio-web-audio');

if (Fire.isIOS) {
    Fire.LoadManager.load('empty','audio', 'mp3', function (err, data) {
        var isPlayed = false;
        window.addEventListener('touchstart', function listener () {
            if (isPlayed) {
                return;
            }
            isPlayed = true;
            var defaultSource = new Fire.AudioSource();
            var defaultClip = new Fire.AudioClip();
            defaultClip.rawData = data;
            defaultSource.clip = defaultClip;
            Fire.AudioContext.play(defaultSource);
            window.removeEventListener('touchstart', listener);
        });
    });
}
