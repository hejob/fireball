var SpriteAnimationClip = require('sprite-animation-clip');

var SpriteAnimationState = function (animClip) {
    if (!animClip) {
// @if DEV
        Fire.error('Unspecified sprite animation clip');
// @endif
        return;
    }
    // the name of the sprite animation state
    this.name = animClip.name;
    // the referenced sprite sprite animation clip
    this.clip = animClip;
    // the wrap mode
    this.wrapMode = animClip.wrapMode;
    // the stop action
    this.stopAction = animClip.stopAction;
    // the speed to play the sprite animation clip
    this.speed = animClip.speed;
    // the array of the end frame of each frame info in the sprite animation clip
    this._frameInfoFrames = animClip.getFrameInfoFrames();
    // the total frame count of the sprite animation clip
    this.totalFrames = this._frameInfoFrames.length > 0 ? this._frameInfoFrames[this._frameInfoFrames.length - 1] : 0;
    // the length of the sprite animation in seconds with speed = 1.0f
    this.length = this.totalFrames / animClip.frameRate;
    // The current index of frame. The value can be larger than totalFrames.
    // If the frame is larger than totalFrames it will be wrapped according to wrapMode. 
    this.frame = -1;
    // the current time in seoncds
    this.time = 0;
    // cache result of GetCurrentIndex
    this._cachedIndex = -1;
};

/**
 * @returns {number} - the current frame info index.
 */
SpriteAnimationState.prototype.getCurrentIndex = function () {
    if (this.totalFrames > 1) {
        //int oldFrame = frame;
        this.frame = Math.floor(this.time * this.clip.frameRate);
        if (this.frame < 0) {
            this.frame = -this.frame;
        }

        var wrappedIndex;
        if (this.wrapMode !== SpriteAnimationClip.WrapMode.PingPong) {
            wrappedIndex = _wrap(this.frame, this.totalFrames - 1, this.wrapMode);
        }
        else {
            wrappedIndex = this.frame;
            var cnt = Math.floor(wrappedIndex / this.totalFrames);
            wrappedIndex %= this.totalFrames;
            if ((cnt & 0x1) === 1) {
                wrappedIndex = this.totalFrames - 1 - wrappedIndex;
            }
        }

        // try to use cached frame info index
        if (this._cachedIndex - 1 >= 0 &&
            wrappedIndex >= this._frameInfoFrames[this._cachedIndex - 1] &&
            wrappedIndex < this._frameInfoFrames[this._cachedIndex]) {
            return this._cachedIndex;
        }

        // search frame info
        var frameInfoIndex = _binarySearch(this._frameInfoFrames, wrappedIndex + 1);
        if (frameInfoIndex < 0) {
            frameInfoIndex = ~frameInfoIndex;
        }
        this._cachedIndex = frameInfoIndex;
        return frameInfoIndex;
    }
    else if (this.totalFrames === 1) {
        return 0;
    }
    else {
        return -1;
    }
};

// ------------------------------------------------------------------ 
/// C# Array.BinarySearch
// ------------------------------------------------------------------ 
function _binarySearch (array, value) {
    var l = 0, h = array.length - 1;
    while (l <= h) {
        var m = ((l + h) >> 1);
        if (array[m] === value) {
            return m;
        }
        if (array[m] > value) {
            h = m - 1;
        }
        else {
            l = m + 1;
        }
    }
    return ~l;
}

function _wrap (_value, _maxValue, _wrapMode) {
    if (_maxValue === 0) {
        return 0;
    }
    if (_value < 0) {
        _value = -_value;
    }
    if (_wrapMode === SpriteAnimationClip.WrapMode.Loop) {
        return _value % (_maxValue + 1);
    }
    else if (_wrapMode === SpriteAnimationClip.WrapMode.PingPong) {
        var cnt = Math.floor(_value / _maxValue);
        _value %= _maxValue;
        if (cnt % 2 === 1) {
            return _maxValue - _value;
        }
    }
    else {
        if (_value < 0) {
            return 0;
        }
        if (_value > _maxValue) {
            return _maxValue;
        }
    }
    return _value;
}

Fire.SpriteAnimationState = SpriteAnimationState;

module.exports = SpriteAnimationState;
