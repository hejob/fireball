var Url = require('fire-url');

module.exports = {
    load: function (context) {
        context.on('build-settings:open', function () {
            context.openWindow('build-settings');
        });

        context.on('build-settings:query-scenes', function () {
            var results = [];
            for ( var p in Fire.AssetDB._pathToUuid ) {
                var url = Fire.AssetDB._url(p);
                if (Url.extname(url) === ".fire") {
                    results.push({ url: url, uuid: Fire.AssetDB._pathToUuid[p] });
                }
            }
            Fire.sendToPlugin( 'build-settings:query-scenes-results', results );
        });
    },
    unload: function (context) {
    },
};
