var Montage = require("montage/core/core").Montage,
    Map = require("collections/map"),
    Set = require("collections/set");

/**
 * A feature collection represents a group of features
 * @class
 * @extends external:Montage
 */
exports.FeatureCollection = Montage.specialize(/** @lends FeatureCollection.prototype */ {

    constructor: {
        value: function FeatureCollection() {
            this._features = [];
            this._features.addRangeChangeListener(this);
        }
    },

    /************************************************************
     * Properties
     */

    /**
     * The features within this collection.
     * @type {Array<Feature>}
     */
    features: {
        enumerable: true,
        writeable: false,
        get: function () {
            return this._features;
        }
    },

    _featuresMap: {
        enumerable: false,
        writeable: false,
        get: function () {
            if (!this.__featuresMap) {
                this.__featuresMap = new Map();
            }
            return this.__featuresMap;
        }
    },

    _featuresSet: {
        enumerable: false,
        writeable: false,
        get: function () {
            if (!this.__featuresSet) {
                this.__featuresSet = new Set();
            }
            return this.__featuresSet;
        }
    },

    /************************************************************
     * Mutating the collection
     */

    /**
     * Adds one or more features to the collection
     * @method
     * @param {...Feature}
     */
    add: {
        value: function () {
            var i, length;
            for (i = 0, length = arguments.length; i < length; i += 1) {
                this.features.push(arguments[i]);
            }
        }
    },

    /**
     * Removes one or more features from the collection
     * @method
     * @param {...Feature}
     */
    remove: {
        value: function () {
            var i, length, index;
            for (i = 0, length = arguments.length; i < length; i += 1) {
                index = this.features.indexOf(arguments[i]);
                if (index >= 0) this.features.splice(index, 1);
            }
        }
    },

    /************************************************************
     * Convenience Methods
     */

    /**
     * Remove all the features in this collection.
     * @method
     */
    clear: {
        value: function () {
            this.features.splice(0, Infinity);
        }
    },

    /**
     * Delete the feature in this collection with the specified id.
     * @method
     * @param {string|number} id
     * @returns {Feature|undefined}
     */
    delete: {
        value: function (id) {
            var feature = this._featuresMap.get(id);
            if (feature) {
                this.remove(feature);
            }
            return feature;
        }
    },

    /**
     * Returns the feature in this collection with the specified id.
     * @method
     * @param {string|number} id
     * @returns {Feature|undefined}
     */
    get: {
        value: function (id) {
            return this._featuresMap.has(id) && this._featuresMap.get(id) || undefined;
        }
    },

    /**
     * Whether or not the feature is in this collection.
     * @method
     * @param {feature} feature
     * @returns {boolean}
     */
    has: {
        value: function (feature) {
            return this._featuresSet.has(feature);
        }
    },

    /**
     * Returns the number of features in this collection.
     * @method
     * @returns {int}
     */
    size: {
        get: function () {
            return this.features.length;
        }
    },

    /************************************************************
     * Observing Changes
     */

    handleRangeChange: {
        value: function (plus, minus) {
            this._registerFeatures.apply(this, plus);
            this._deregisterFeatures.apply(this, minus);
        }
    },

    _deregisterFeatures: {
        value: function () {
            var i, length;
            for (i = 0, length = arguments.length; i < length; i += 1) {
                this._deregisterFeature(arguments[i]);
            }
        }
    },

    _deregisterFeature: {
        value: function (feature) {
            if (this._featuresSet.has(feature)) this._featuresSet.delete(feature);
            if (feature.id && this._featuresMap.has(feature.id)) this._featuresMap.delete(feature.id);
        }
    },

    _deregisterDuplicate: {
        value: function (id) {
            var duplicate = this._featuresMap.get(id);
            if (duplicate) {
                this.remove(duplicate);
                // for some reason remove will not trigger the range change listener
                // in this case?
                // TODO: Determine why this is necessary
                this._featuresSet.delete(duplicate);
            }
        }
    },

    _registerFeatures: {
        value: function () {
            var i, length;
            for (i = 0, length = arguments.length; i < length; i += 1) {
                this._registerFeature(arguments[i]);
            }
        }
    },

    _registerFeature: {
        value: function (feature) {
            var oldFeature;
            if (!this._featuresSet.has(feature)) this._featuresSet.add(feature);
            if (feature.id) {
                this._deregisterDuplicate(feature.id);
                this._featuresMap.set(feature.id, feature);
            }
        }
    }

}, {

    withGeoJSON: {
        value: function (json) {

        }
    },

    withFeatures: {
        value: function (features) {
            var self = new this();
            self.add.apply(self, features || []);
            return self;
        }
    }

});
