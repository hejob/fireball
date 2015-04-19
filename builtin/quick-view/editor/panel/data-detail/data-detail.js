(function () {
var Url = require('fire-url');

Polymer(EditorUI.mixin({

    ready: function () {
        this._initResizable();
    },

}, EditorUI.resizable));
})();
