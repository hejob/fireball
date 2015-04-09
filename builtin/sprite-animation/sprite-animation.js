var SpriteAnimationClip = require('sprite-animation-clip');
var SpriteAnimationState = require('sprite-animation-state');

/**
 * The sprite animation Component.
 * @class SpriteAnimation
 * @extends Component
 * @constructor
 */
var SpriteAnimation = Fire.Class({
    //
    name: "Fire.SpriteAnimation",
    //
    extends: Fire.Component,
    //
    constructor: function() {
        this._nameToState = null;
        this._curAnimation = null;
        this._spriteRenderer = null;
        this._defaultSprite = null;
        this._lastFrameIndex = -1;
        this._curIndex = -1;
        this._playStartFrame = 0;// 在调用Play的当帧的LateUpdate不进行step
    },
    //
    properties:{
        /**
         * The default animation.
         * @property defaultAnimation
         * @type {SpriteAnimationClip}
         * @default null
         */
        defaultAnimation: {
            default: null,
            type: Fire.SpriteAnimationClip
        },
        /**
         * The Animated clip list.
         * @property animations
         * @type {SpriteAnimationClip[]}
         * @default []
         */
        animations: {
            default: [],
            type: Fire.SpriteAnimationClip
        },
        //
        _playAutomatically: true,
        /**
         * Should the default animation clip (Animation.clip) automatically start playing on startup.
         * @property playAutomatically
         * @type {boolean}
         * @default true
         */
        playAutomatically: {
            get: function() {
                return this._playAutomatically;
            },
            set: function (value) {
                this._playAutomatically = value;
            }
        }
    },
    //
    _init: function() {
        var initialized = (this._nameToState !== null);
        if (initialized === false) {
            this._spriteRenderer = this.entity.getComponent(Fire.SpriteRenderer);
            this._defaultSprite = this._spriteRenderer.sprite;

            this._nameToState = {};
            var state = null;
            for (var i = 0; i < this.animations.length; ++i) {
                var clip = this.animations[i];
                if (clip !== null) {
                    state = new SpriteAnimationState(clip);
                    this._nameToState[state.name] = state;
                }
            }

            if (!this.getAnimState(this.defaultAnimation.name)) {
                state = new SpriteAnimationState(this.defaultAnimation);
                this._nameToState[state.name] = state;
            }
        }
    },
    /**
     * Get Animation State.
     * @method getAnimState
     * @param {string} animName - The name of the animation
     * @return {SpriteAnimationState}
     */
    getAnimState: function (name) {
        return this._nameToState && this._nameToState[name];
    },
    /**
     * Indicates whether the animation is playing
     * @method isPlaying
     * @param {string} [name] - The name of the animation
     * @return {boolean}
     */
    isPlaying: function(name) {
        var playingAnim = this.enabled && this._curAnimation;
        return !!playingAnim && ( !name || playingAnim.name === name );
    },
    /**
     * Play Animation
     * @method play
     * @param {SpriteAnimationState} [animState] - The animState of the sprite Animation state or animation name
     * @param {number} [time] - The time of the animation time
     */
    play: function (animState, time) {
        if (typeof animState === 'string') {
            this._curAnimation = this.getAnimState(animState);
        }
        else {
            this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
        }

        if (this._curAnimation !== null) {
            this._curIndex = -1;
            this._curAnimation.time = time || 0;
            this._playStartFrame = Fire.Time.frameCount;
            this._sample();
        }
    },
    /**
     * Stop Animation
     * @method stop
     * @param {SpriteAnimationState} [animState] - The animState of the sprite animation state or animation name
     */
    stop: function (animState) {
        if (typeof animState === 'string') {
            this._curAnimation = this.getAnimState(animState);
        }
        else {
            this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
        }

        if (this._curAnimation !== null) {

            this._curAnimation.time = 0;

            var stopAction = this._curAnimation.stopAction;

            switch (stopAction) {
                case SpriteAnimationClip.StopAction.DoNothing:
                    break;
                case SpriteAnimationClip.StopAction.DefaultSprite:
                    this._spriteRenderer.sprite = this._defaultSprite;
                    break;
                case SpriteAnimationClip.StopAction.Hide:
                    this._spriteRenderer.enabled = false;
                    break;
                case SpriteAnimationClip.StopAction.Destroy:
                    this.entity.destroy();
                    break;
                default:
                    break;
            }

            this._curAnimation = null;
        }
    },
    onLoad: function() {
        this._init();
        if (this.enabled) {
            if (this._playAutomatically && this.defaultAnimation) {
                var animState = this.getAnimState(this.defaultAnimation.name);
                this.play(animState, 0);
            }
        }
    },
    lateUpdate: function() {
        if (this._curAnimation !== null && Fire.Time.frameCount > this._playStartFrame) {
            var delta = Fire.Time.deltaTime * this._curAnimation.speed;
            this._step(delta);
        }
    },
    _step: function (deltaTime) {
        if (this._curAnimation !== null) {
            this._curAnimation.time += deltaTime;
            this._sample();
            var stop = false;
            if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Once ||
                this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Default ||
                this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                if (this._curAnimation.speed > 0 && this._curAnimation.frame >= this._curAnimation.totalFrames) {
                    if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                        stop = false;
                        this._curAnimation.frame = this._curAnimation.totalFrames;
                        this._curAnimation.time = this._curAnimation.frame / this._curAnimation.clip.frameRate;
                    }
                    else {
                        stop = true;
                        this._curAnimation.frame = this._curAnimation.totalFrames;
                    }
                }
                else if (this._curAnimation.speed < 0 && this._curAnimation.frame < 0) {
                    if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                        stop = false;
                        this._curAnimation.time = 0;
                        this._curAnimation.frame = 0;
                    }
                    else {
                        stop = true;
                        this._curAnimation.frame = 0;
                    }
                }
            }

            // do stop
            if (stop) {
                this.stop(this._curAnimation);
            }
        }
        else {
            this._curIndex = -1;
        }
    },
    _sample: function () {
        if (this._curAnimation !== null) {
            var newIndex = this._curAnimation.getCurrentIndex();
            if (newIndex >= 0 && newIndex != this._curIndex) {
                this._spriteRenderer.sprite = this._curAnimation.clip.frameInfos[newIndex].sprite;
            }
            this._curIndex = newIndex;
        }
        else {
            this._curIndex = -1;
        }
    }
});

Fire.SpriteAnimation = SpriteAnimation;

Fire.addComponentMenu(SpriteAnimation, 'Sprite Animation');
