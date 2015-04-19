(function () {
module.exports = {
    load: function (plugin) {
        plugin.on('fire-game:open', function () {
            plugin.openPanel('default');
        });
    },
    unload: function (plugin) {
    },
};
})();
