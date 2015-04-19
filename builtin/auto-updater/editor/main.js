(function () {
var Url = require('fire-url');
var App = require('app');
var AutoUpdater = require('auto-updater');

var status = 'normal';
var ignoreDialog = false;

module.exports = {
    load: function (plugin) {
        if ( Editor.isDev ) {
            plugin.on('auto-updater:open', function () {
                Fire.warn('auto-updater only works in release version.');
            });
            return;
        }

        AutoUpdater.on('checking-for-update', function() {
            status = 'checking';
            Fire.log("Checking for update, current version: " + App.getVersion());
            plugin.sendToPanel('default', 'auto-updater:status-changed', {
                status: status
            });
        });

        AutoUpdater.on('update-available', function(notes) {
            status = 'downloading';
            Fire.log('Downloading...');
            plugin.sendToPanel('default', 'auto-updater:status-changed', {
                status: status
            });
        });

        AutoUpdater.on('update-not-available', function() {
            status = 'not-available';
            plugin.sendToPanel('default', 'auto-updater:status-changed', {
                status: status
            });
            Fire.info('You are in latest version.');
        });

        AutoUpdater.on('update-downloaded', function() {
            status = 'downloaded';
            Fire.info('Download success, ready to install');

            var dialog = require('dialog');
            var result = dialog.showMessageBox({
                type: "warning",
                buttons: ["Quite and install now","later"],
                title: "Install Update",
                message: "install update now?",
                detail: "If you choose \"later\", Fireball will update itself after you quit the app."
            });

            if (result === 0) {
                AutoUpdater.quitAndInstall();
            }
            else if (result === 1) {
                //TODO: 发IPC给MainWindow,让MainWindow在关闭的时候调用AutoUpdater.quitAndInstall();
            }
            ignoreDialog = true;

            plugin.sendToPanel('default', 'auto-updater:status-changed', {
                status: status,
                ignoreDialog: ignoreDialog
            });
        });

        AutoUpdater.on('error', function () {
            Fire.error(arguments[1]);
            status = "error";
            plugin.openPanel('default', {
                status: status
            });
            plugin.sendToPanel('default', 'auto-updater:status-changed', {
                status: status,
            });
        });
        AutoUpdater.setFeedUrl('http://fireball-x.com/api/checkupdate?version=v' + App.getVersion());

        plugin.on('auto-updater:open', function () {
            ignoreDialog = false;
            plugin.openPanel('default', {
                status: status,
                ignoreDialog: ignoreDialog
            });
        });

        plugin.on('auto-updater:start', function () {
            AutoUpdater.checkForUpdates();
        });

        plugin.on('auto-updater:ignore-dialog', function () {
            ignoreDialog = true;
        });
    },

    unload: function (plugin) {
        AutoUpdater.removeAllListeners();
    },
};
})();
