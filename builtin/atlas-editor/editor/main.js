var Url = require('fire-url');

module.exports = {
    load: function (plugin) {
        plugin.on('asset:open', function (detail) {
            var uuid = detail.uuid;
            var url = detail.url;
            var ext = Url.extname(url);

            if ( ['.atlas'].indexOf(ext.toLowerCase()) !== -1 ) {
                plugin.openPanel('default', {
                    uuid: uuid,
                });
            }
        });
    },

    unload: function (plugin) {
    },
};
