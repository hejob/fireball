var SpriteAnimationClip = require('sprite-animation-clip');
var SpriteAnimationState = require('sprite-animation-state');

// 定义一个名叫Sprite Animation 组件
var SpriteAnimation = Fire.extend('Fire.SpriteAnimation', Fire.Component, function () {
    this.animations = [];
    this._nameToState = null;
    this._curAnimation = null;
    this._spriteRenderer = null;
    this._defaultSprite = null;
    this._lastFrameIndex = -1;
    this._curIndex = -1;
    this._playStartFrame = 0;// 在调用Play的当帧的LateUpdate不进行step
});

Fire.addComponentMenu(SpriteAnimation, 'Sprite Animation');

SpriteAnimation.prop('defaultAnimation', null, Fire.ObjectType(SpriteAnimationClip));

SpriteAnimation.prop('animations', [], Fire.ObjectType(SpriteAnimationClip));

SpriteAnimation.prop('_playAutomatically', true, Fire.HideInInspector);
SpriteAnimation.getset('playAutomatically',
    function () {
        return this._playAutomatically;
    },
    function (value) {
        this._playAutomatically = value;
    }
);

SpriteAnimation.prototype.init = function () {
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
};

SpriteAnimation.prototype.getAnimState = function (name) {
    return this._nameToState && this._nameToState[name];
};

/**
 * indicates whether the animation is playing
 * @param {string} [animName] - The name of the animation
 */
SpriteAnimation.prototype.isPlaying = function (name) {
    var playingAnim = this.enabled && this._curAnimation;
    return !!playingAnim && ( !name || playingAnim.name === name );
};

/**
 * play Animation
 * @param {SpriteAnimationState} [animState|animName] - The animState of the SpriteAnimationState
 * @param {SpriteAnimationState} [animState] - The time of the animation time
 */
SpriteAnimation.prototype.play = function (animState, time) {
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
        this.sample();
    }
};

SpriteAnimation.prototype.onLoad = function () {
    this.init();
    if (this.enabled) {
        if (this._playAutomatically && this.defaultAnimation) {
            var animState = this.getAnimState(this.defaultAnimation.name);
            this.play(animState, 0);
        }
    }
};

SpriteAnimation.prototype.lateUpdate = function () {
    if (this._curAnimation !== null && Fire.Time.frameCount > this._playStartFrame) {
        var delta = Fire.Time.deltaTime * this._curAnimation.speed;
        this.step(delta);
    }
};

SpriteAnimation.prototype.step = function (deltaTime) {
    if (this._curAnimation !== null) {
        this._curAnimation.time += deltaTime;
        this.sample();
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
};

SpriteAnimation.prototype.sample = function () {
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
};

SpriteAnimation.prototype.stop = function (animState) {
    if (animState !== null) {
        if (animState === this._curAnimation) {
            this._curAnimation = null;
        }
        animState.time = 0;

        var stopAction = animState.stopAction;
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
};

Fire.SpriteAnimation = SpriteAnimation;

module.exports = SpriteAnimation;
