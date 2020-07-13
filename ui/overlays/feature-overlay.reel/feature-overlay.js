var Component = require("montage/ui/component").Component,
    Set = require("montage/collections/set");

/**
 * @class FeatureOverlay
 * @extends Component
 */
exports.FeatureOverlay = Component.specialize(/** @lends FeatureOverlay# */ {

    /**
     * The engine the overlay will display its features on.
     *
     * @public
     * @type {MapEngine}
     */
    engine: {
        get: function () {
            return this._engine;
        },
        set: function (value) {
            if (value !== this._engine) {
                this._engine = value;
            }
        }
    },

    /**
     * The collection of features to display on the map.
     *
     * @public
     * @type {FeatureCollection}
     */
    features: {
        get: function () {
            return this._features;
        },
        set: function (value) {
            if (value && value !== this._features) {
                this._features = value;
                if (this._featureListener) {
                    this._featureListener();
                }
                this._featureListener = this._features.addRangeChangeListener(
                    this._handleFeatureRangeChange.bind(this)
                );
            }
        }
    },

    _handleFeatureRangeChange: {
        value: function (plus, minus) {
            var engine = this._engine,
                plusSet, minusSet;
            if (engine) {
                // TODO: Noise reduction should be in the service.
                plusSet = new Set(plus);
                minusSet = new Set(minus);
                plus.forEach(function (feature) {
                    if (minusSet.has(feature)) {
                        engine.drawFeature(feature);
                    }
                });
                minus.forEach(function (feature) {
                    if (plusSet.has(feature)) {
                        engine.eraseFeature(feature);
                    }
                });
            }
        }
    },

    _drawQueue: {
        get: function () {
            if (!this.__drawQueue) {
                this.__drawQueue = [];
            }
            return this.__drawQueue;
        }
    },

    _featureListener: {
        value: undefined
    }

});
