
module.exports = {
    load: function (context) {
        context.on('asset-db:debugger:open', function () {
            context.openWindow('asset-db:debugger');
        });

        context.on ( 'asset-db:debugger:query-url-uuid', function () {
            var results = [];
            for ( var p in Fire.AssetDB._pathToUuid ) {
                var url = Fire.AssetDB._url(p);
                results.push({ url: url, uuid: Fire.AssetDB._pathToUuid[p] });
            }
            results.sort( function ( a, b ) {
                return a.url.localeCompare(b.url);
            });
            Fire.sendToPages( 'asset-db:debugger:url-uuid-results', results );
        } );
        context.on ( 'asset-db:debugger:query-uuid-url', function () {
            var results = [];
            for ( var p in Fire.AssetDB._uuidToPath ) {
                var url = Fire.AssetDB._url(Fire.AssetDB._uuidToPath[p]);
                results.push({ url: url, uuid: p });
            }
            results.sort( function ( a, b ) {
                return a.url.localeCompare(b.url);
            });
            Fire.sendToPlugin( 'asset-db:debugger:uuid-url-results', results );
        } );
        context.on ( 'asset-db:debugger:query-url-subuuids', function () {
            var results = [];
            for ( var p in Fire.AssetDB._pathToSubUuids ) {
                var url = Fire.AssetDB._url(p);
                results.push({ url: url, uuids: Fire.AssetDB._pathToSubUuids[p] });
            }
            results.sort( function ( a, b ) {
                return a.url.localeCompare(b.url);
            });
            Fire.sendToPlugin( 'asset-db:debugger:url-subuuids-results', results );
        } );
    },
    //unload: function (context) {
    //},
};
