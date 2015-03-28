
module.exports = {
    load: function (plugin) {
        plugin.on('asset-db:debugger:open', function () {
            plugin.openPanel('default');
        });

        plugin.on ( 'asset-db:debugger:query-url-uuid', function () {
            var results = [];
            for ( var p in Fire.AssetDB._pathToUuid ) {
                var url = Fire.AssetDB._url(p);
                results.push({ url: url, uuid: Fire.AssetDB._pathToUuid[p] });
            }
            results.sort( function ( a, b ) {
                return a.url.localeCompare(b.url);
            });
            plugin.sendToPanel( 'default', 'asset-db:debugger:url-uuid-results', {
                results: results
            });
        } );

        plugin.on ( 'asset-db:debugger:query-uuid-url', function () {
            var results = [];
            for ( var p in Fire.AssetDB._uuidToPath ) {
                var url = Fire.AssetDB._url(Fire.AssetDB._uuidToPath[p]);
                results.push({ url: url, uuid: p });
            }
            results.sort( function ( a, b ) {
                return a.url.localeCompare(b.url);
            });
            plugin.sendToPanel( 'default', 'asset-db:debugger:uuid-url-results', {
                results: results
            });
        } );

        plugin.on ( 'asset-db:debugger:query-url-subuuids', function () {
            var results = [];
            for ( var p in Fire.AssetDB._pathToSubUuids ) {
                var url = Fire.AssetDB._url(p);
                results.push({ url: url, uuids: Fire.AssetDB._pathToSubUuids[p] });
            }
            results.sort( function ( a, b ) {
                return a.url.localeCompare(b.url);
            });
            plugin.sendToPanel( 'default', 'asset-db:debugger:url-subuuids-results', {
                results: results
            });
        } );
    },

    // unload: function (plugin) {
    // },
};
