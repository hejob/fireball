(function () {
module.exports = {
    load: function (plugin) {
        plugin.on('fire-scene:open', function () {
            plugin.openPanel('default');
        });
    },
    unload: function (plugin) {
    },
};
})();
