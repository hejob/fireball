(function () {
module.exports = {
    load: function (plugin) {
        plugin.on('fire-assets:open', function () {
            plugin.openPanel('default');
        });
    },
    unload: function (plugin) {
    },
};
})();
