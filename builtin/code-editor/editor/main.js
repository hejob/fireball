var Url = require('fire-url');

module.exports = {
    load: function (context) {
        context.on('asset:open', function (uuid) {
            var url = Fire.AssetDB.uuidToUrl(uuid);
            var ext = Url.extname(url);

            if ( ['.js', '.json', '.xml', '.html', '.css','.styl','.htm'].indexOf(ext.toLowerCase()) !== -1 ) {
                if ( context.openedWindows.length > 0 ) {
                    var firstWindow = context.openedWindows[0];
                    firstWindow.sendToPage( 'asset:edit', uuid );
                    firstWindow.focus();
                }
                else {
                    context.openWindow('code-editor', {
                        query: {uuid: uuid},
                    });
                }
            }
        });
    },
    unload: function (context) {
    },
};
