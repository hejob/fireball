(function () {
module.exports = {
    load: function (plugin) {
        plugin.on('fire-hierarchy:open', function () {
            plugin.openPanel('default');
        });
    },
    unload: function (plugin) {
    },
};
})();
