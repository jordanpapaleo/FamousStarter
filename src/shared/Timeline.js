import Easing from 'famous-transitions/src/Easing';
import Famous from 'famous-core/src/Famous';
import Size from 'famous-components/src/Size';
import Transitionable from 'famous-transitions/src/Transitionable';

var easingCurveLinear = Easing.getCurve('linear');

export class Timeline {
    constructor(options) {
        this.componentSet = [];
        this.timescale = options.timescale || 1;
        this.currentTime = new Transitionable(0);
        //for now update on all ticks until clock gets fixed
        Famous.getClock().update(this);
    }

    registerComponent(animationData) {
        this.componentSet.push(animationData);
    }

    /**
     * Adds an array of {@link KeyframeObjs} to a {@link Timeline} instance.
     * @method  addKeyframes
     * @param   {KeyframeObjs}  keyframeObjs  An array of {@link KeyframeObjs}.
     */
    /*eslint no-underscore-dangle:0*/
    addKeyframes(keyframeObjs) {
        var layers = [];
        var keyframe;
        var nodeProperty;
        var id;
        var i;
        var j;
        for (i = 0; i < keyframeObjs.length; i++) {
            var keyframes = keyframeObjs[i].keyframes;
            for(j = 0; j < keyframes.length; j++) {
                keyframe = keyframes[j];
                nodeProperty = keyframe.shift();
                id = nodeProperty._dispatch._renderProxy._id;
                keyframe.unshift(keyframeObjs[i].time);
                if (!layers[id]) {
                    layers[id] = {
                        component: nodeProperty,
                        path: []
                    };
                }
                layers[id].path.push(keyframe);
            }
        }
        for (id in layers) {
            this.registerComponent(layers[id]);
        }
    }

    set(time, transition, callback) {
        //comment out no longer updates and stuff for now, race condition in clock.
        if (transition) {
            // Famous.getClock().update(this);
            this.inTransition = true;
            this.currentTime.set(time, transition, function() {
                // Famous.getClock().noLongerUpdate(this);
                this.update();
                this.inTransition = false;
                if (callback) {
                    callback();
                }
            }.bind(this));
        } else {
            this.currentTime.set(time);
            this.inTransition = true;
            this.update();
            this.inTransition = false;
        }
    }

    update(time) {
        if (this.inTransition) {
            var res = [];
            time = this.currentTime.get() * this.timescale;
            for (var i = 0; i < this.componentSet.length; i++) {
                var animData = this.componentSet[i];
                for (var j = 0; j < animData.path.length; j++) {
                    var currStep = animData.path[j];
                    var nextStep = animData.path[j + 1];

                    //currently mid path, calculate and apply.
                    if (nextStep && currStep[0] <= time && nextStep[0] >= time) {
                        var percentDone = (time - currStep[0]) / (nextStep[0] - currStep[0]);
                        var state = currStep[2] ? currStep[2](percentDone) : easingCurveLinear(percentDone);

                        if (currStep[1] instanceof Array) {
                            for (var k = 0; k < currStep[1].length; k++) {
                                res[k] = currStep[1][k] + (nextStep[1][k] - currStep[1][k]) * state;
                            }
                            if (animData.component instanceof Size) animData.component.setAbsolute.apply(animData.component, res);
                            else animData.component.set.apply(animData.component, res);
                        } else {
                            animData.component.set(currStep[1] + (nextStep[1] - currStep[1]) * state);
                        }
                    }
                    //we are passed last step, set object to final state.
                    if(!nextStep && currStep[0] < time) {
                        if(currStep[1] instanceof Array) {
                            if (animData.component instanceof Size) animData.component.setAbsolute.apply(animData.component, res);
                            else animData.component.set.apply(animData.component, currStep[1]);
                        } else {
                            animData.component.set(currStep[1]);
                        }
                    }
                }
            }
        }
    }
}

export class Keyframe {
    /**
     * @typedef KeyframeObjs
     * @type {Array.<Object>}
     * @property {Object.Number}           time      Time in milliseconds to place the keyframe.
     * @property {Object.Array.<Keyframe>} keyframes An array of {@link Keyframe} data.
     */

    /**
     * Creates an array of data for use with the {@link Timeline}.
     * @method  add
     *
     * @example
     * Returns: [nodeProperty, [value1, value2], easingFunction]
     * or
     * Returns: [nodeProperty, [value1, value2]]
     *
     * @param   {Object}      nodeProperty   The animatable property of a node.
     * @param   {Array<Int>}  values         The values to animate.
     * @param   {Function}    easingFunction Easing equation to use on the animation.
     * @return  {Keyframe}    A keyframe for use with the {@link Timeline}.
     */
    static add(nodeProperty, values, easingFunction) {
        var keyframe = [nodeProperty];
        keyframe.push(values);
        if (easingFunction) {
            keyframe.push(easingFunction);
        }
        return keyframe;
    }
}
