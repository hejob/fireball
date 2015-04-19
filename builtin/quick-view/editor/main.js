(function () {
module.exports = {
    load: function (plugin) {
        plugin.on('quick-view:open', function (detail) {
            plugin.openPanel('default', detail);
        });
    },

    unload: function (plugin) {
    },
};
})();
