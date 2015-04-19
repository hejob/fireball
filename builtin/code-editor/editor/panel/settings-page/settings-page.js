(function () {
var FontManager = require('font-manager');

var keymaps = [
    "sublime",
    "vim",
    "emacs",
];

var themes = [
    "3024-day"                ,
    "3024-night"              ,
    "ambiance"                ,
    "ambiance-mobile"         ,
    "base16-dark"             ,
    "base16-light"            ,
    "blackboard"              ,
    "cobalt"                  ,
    "eclipse"                 ,
    "elegant"                 ,
    "erlang-dark"             ,
    "lesser-dark"             ,
    "mbo"                     ,
    "mdn-like"                ,
    "midnight"                ,
    "monokai"                 ,
    "neat"                    ,
    "neo"                     ,
    "night"                   ,
    "paraiso-dark"            ,
    "pastel-on-dark"          ,
    "rubyblue"                ,
    "solarized dark"          ,
    "solarized light"         ,
    "the-matrix"              ,
    "tomorrow-night-bright"   ,
    "tomorrow-night-righties" ,
    "twilight"                ,
    "vibrant-ink"             ,
    "xq-dark"                 ,
    "xq-light"                ,
    "zenburn"                 ,
];

var cssFont = {
    name: "DejaVu Sans Mono",value:"DejaVu Sans Mono"
};

Polymer({
    publish: {
        hide: true,
        config: null,
        fonts: null,
        settings: null,
    },

    domReady: function () {
        this.settings = {
            theme: this.config.theme,
            tabSize: this.config.tabSize,
            keyMap: this.config.keyMap,
            fontSize: this.config.fontSize,
            fontFamily: this.config.fontFamily,
            autoComplete: this.config.autoComplete,
        };
        document.addEventListener('keydown',function (event) {
            if (event.keyCode === 27) {
                this.hide = true;
            }
        }.bind(this));
    },

    ready: function () {
        this.span = document.createElement('div');
        this.span.style.width = '100%';
        this.span.style.height = '100%';
        this.span.style.position = 'absolute';
        this.span.style.opacity = 0.5;
        this.span.style.zIndex = 998;
        this.span.style.background = 'black';

        this.span.onclick = function () {
            this.config.theme = this.settings.theme;
            this.config.tabSize = this.settings.tabSize;
            this.config.keyMap = this.settings.keyMap;
            this.config.fontSize = this.settings.fontSize;
            this.config.fontFamily = this.settings.fontFamily;
            this.config.autoComplete = this.settings.autoComplete;
            this.hide = true;
        }.bind(this);

        document.body.appendChild(this.span);

        this.$.keymapSelect.options = keymaps.map(function ( item ) {
            return { name: item, value: item };
        });

        this.$.themeSelect.options = themes.map(function ( item ) {
            return { name: item, value: item };
        });


        this.fonts = this.getFonts();
        this.$.fontSelect.options = this.fonts.map(function ( item ) {
            return {
                name: item.family + ", " + item.style,
                value: item.postscriptName };
        });

        this.$.fontSelect.options.push(cssFont);
    },

    hideChanged: function () {
        if (this.hide) {
            this.animate([
                { marginTop: (this.config.getBoundingClientRect().height/2-100)+"px",width: "600px",opacity: 1/*,left: "-300px",height: "auto"*/},
                { marginTop: (this.config.getBoundingClientRect().height/2-100)+"px",width: "600px",opacity: 0/*,left: "0px",height: "0px"*/},
                ], {
                    duration: 200
                });
            this.style.marginTop = "-400px";
            this.span.style.display = "none";
        }
        else {
            this.span.style.display = "block";
            this.animate([
                { marginTop: (this.config.getBoundingClientRect().height/2-100)+"px", width: "600px",opacity: 0/*,left: "0px",height: "0px" */},
                { marginTop: (this.config.getBoundingClientRect().height/2-100)+"px",width: "600px",opacity: 1/*,left: "-300px",height: "auto"*/},
                ], {
                    duration: 200
                });
            this.style.marginTop = (this.config.getBoundingClientRect().height/2-100)+"px";
        }
    },

    focusedAction: function (e) {
        for (var i=0; i<e.target.parentNode.children.length; i++) {
            e.target.parentNode.children[i].setAttribute("focused","");
        }
    },

    blurAction: function (e) {
        for (var i=0; i<e.target.parentNode.children.length; i++) {
            e.target.parentNode.children[i].removeAttribute("focused");
        }
    },

    doneAction: function () {
        this.hide = true;
    },

    cancelAction: function () {
        this.config.theme = this.settings.theme;
        this.config.tabSize = this.settings.tabSize;
        this.config.keyMap = this.settings.keyMap;
        this.config.fontSize = this.settings.fontSize;
        this.config.fontFamily = this.settings.fontFamily;
        this.config.autoComplete = this.settings.autoComplete;
        this.hide = true;

    },

    getFonts: function () {
        return FontManager.getAvailableFontsSync();
    },

});
})();
