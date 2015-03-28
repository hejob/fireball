;window.onload = function () {

    function loadProjectSettings (callback) {
        Fire._JsonLoader('settings.json', function (error, json) {
            if (error) {
                Fire.error(error);
            }
            else {
                callback(json);
            }
        });
    }
    loadProjectSettings(function (settings) {
        // init engine
        var canvas = document.getElementById('GameCanvas');
        Fire.Engine.init(canvas.width, canvas.height, canvas, settings);

        // makes the container's size equals to the frame's size
        Fire.Screen.ContainerStrategy.EqualToFrame.apply();

        // init assets
        Fire.AssetLibrary.init('resource/library');

        // load scene
        var launchUuid = settings.scenes[settings.launchScene];
        Fire.Engine._loadSceneByUuid(launchUuid, null,
            function () {
                // show canvas
                canvas.style.visibility = '';
                var div = document.getElementById('GameDiv');
                if (div) {
                    div.style.backgroundImage = '';
                }
                // play game
                Fire.Engine.play();
            }
        );
    });
};
