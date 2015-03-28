var Url = require('fire-url');

module.exports = {
    load: function (context) {
        context.on('asset:open', function (detail) {
            var uuid = detail.uuid;
            var url = detail.url;
            var ext = Url.extname(url);

            if ( ['.js', '.json', '.xml', '.html', '.css','.styl','.htm'].indexOf(ext.toLowerCase()) !== -1 ) {
                context.openPanel('code-editor', {
                    uuid: uuid,
                });
            }
        });
    },
    unload: function (context) {
    },
};
