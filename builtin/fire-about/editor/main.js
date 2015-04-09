module.exports = {
    load: function (plugin) {
        plugin.on('fire-about:open', function () {
            plugin.openPanel('default');
        });
    },
    unload: function (plugin) {
    },
};
