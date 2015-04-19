(function () {
module.exports = {
    load: function (plugin) {
        plugin.on('fire-inspector:open', function () {
            plugin.openPanel('default');
        });
    },
    unload: function (plugin) {
    },
};
})();
