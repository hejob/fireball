var Url = require('fire-url');

module.exports = {
    load: function (plugin) {
        plugin.on('build-settings:open', function () {
            plugin.openPanel('default');
        });

        plugin.on('build-settings:query-scenes', function () {
            var results = [];
            for ( var p in Fire.AssetDB._pathToUuid ) {
                var url = Fire.AssetDB._url(p);
                if (Url.extname(url) === ".fire") {
                    results.push({ url: url, uuid: Fire.AssetDB._pathToUuid[p] });
                }
            }
            plugin.sendToPanel( 'default', 'build-settings:query-scenes-results', {
                results: results
            });
        });
    },
    unload: function (plugin) {
    },
};
