var Montage = require("montage/core/core").Montage,
    Map = require("collections/map"),
    Set = require("collections/set"),
    BoundingBox = require("logic/model/bounding-box").BoundingBox;



/**
 * A feature collection represents a group of features.  Every
 * feature collection has a features property which is an
 * array of its features.  The features array cannot be set directly
 * but you may alter its content.
 *
 * @class
 * @extends external:Montage
 */
exports.FeatureCollection = Montage.specialize(/** @lends FeatureCollection.prototype */ {

    constructor: {
        value: function FeatureCollection() {
            this._features = [];
            this._features.addRangeChangeListener(this);
            var self = this;
            this.addRangeAtPathChangeListener("features.map{ geometry }", this, "_updateBounds");
        }
    },


    _updateBounds: {
        value: function () {
            var self = this,
                featureBounds, bounds; 
                
            this.features.forEach(function (feature) {
                featureBounds = feature.geometry && feature.geometry.bounds;
                bounds = bounds || featureBounds && featureBounds.clone();
                if (bounds && featureBounds) {
                    bounds.extend(featureBounds);
                }
            });

            this.bounds = bounds;
            if (bounds) {
                // console.log("FeatureCollection.updateBounds", this.name, this.bounds.bbox, this.uuid);
            }
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

    /**
     * A feature collection MAY have a member named "bounds" to
     * include information on the coordinate range for its features'
     * geometries.
     *
     * @type {BoundingBox}
     * TODO: update the bounding box when features are added and removed
     * from the collection.
     */
    bounds: {
        value: undefined
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
     * Filtering
     */

    /**
     * Returns an array of the collection's features that intersects with the
     * provided bounds.
     * @method
     * @param {BoundingBox} bounds          - The bounds to test for intersection
     * @returns {array<Feature>} features   - The features in this collection that
     *                                        intersects the provided bounds.
     */
    filter: {
        value: function (bounds) {
            return this.features.filter(function (feature) {
                return feature.intersects(bounds);
            })
        }
    },

    makeFilterObserver: {
        value: function (observeBounds) {
            var self = this;
            return function observeFilter(emit, scope) {
                return observeBounds(function replaceBounds(bounds) {
                    return self.observeFilter(emit, bounds);
                }, scope);
            }.bind(this);
        }
    },

    observeFilter: {
        value: function (emit, bounds) {
            var self = this,
                cancel,
                boundsWestChangeListenerCanceler,
                boundsEastChangeListenerCanceler,
                boundsSouthChangeListenerCanceler,
                boundsNorthChangeListenerCanceler,
                featuresRangeChangeListenerCanceler;
            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.filter(bounds));
            }
            update();
            boundsWestChangeListenerCanceler = bounds.addPathChangeListener("xMin", update);
            boundsEastChangeListenerCanceler = bounds.addPathChangeListener("xMax", update);
            boundsSouthChangeListenerCanceler = bounds.addPathChangeListener("yMin", update);
            boundsNorthChangeListenerCanceler = bounds.addPathChangeListener("yMax", update);
            featuresRangeChangeListenerCanceler = this.features.addRangeChangeListener(function (plus, minus) {
                if (plus.length || minus.length) {
                    update();
                }
            });
            return function cancelObserver() {
                boundsWestChangeListenerCanceler();
                boundsEastChangeListenerCanceler();
                boundsSouthChangeListenerCanceler();
                boundsNorthChangeListenerCanceler();
                featuresRangeChangeListenerCanceler();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    /************************************************************
     * Collection Methods
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

    addContentPropertyChangeListener: {
        value: function (name, handler) {
            var contentPropertyChangeCancellers = this._contentPropertyChangeCancellers.get(handler) || new Map();
            this._contentPropertyChangeListeners[name] = this._contentPropertyChangeListeners[name] || new Set();
            this._contentPropertyChangeListeners[name].add(handler);
            this.features.forEach(function (feature) {
                var cancel = feature.addOwnPropertyChangeListener(name, handler);
                contentPropertyChangeCancellers.set(feature, cancel);
            });
            this._contentPropertyChangeCancellers.set(handler, contentPropertyChangeCancellers);
        }
    },

    _contentPropertyChangeCancellers: {
        get: function () {
            if (!this.__contentPropertyChangeCancellers) {
                this.__contentPropertyChangeCancellers = new Map();
            }
            return this.__contentPropertyChangeCancellers;
        }
    },

    _contentPropertyChangeListeners: {
        get: function () {
            if (!this.__contentPropertyChangeListeners) {
                this.__contentPropertyChangeListeners = {};
            }
            return this.__contentPropertyChangeListeners;
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
            this._removePropertyChangeObservers(feature);
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
                this._removePropertyChangeObservers(duplicate);
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
            if (!this._featuresSet.has(feature)) this._featuresSet.add(feature);
            if (feature.id) {
                this._deregisterDuplicate(feature.id);
                this._featuresMap.set(feature.id, feature);
                this._addPropertyChangeObservers(feature);
            }
        }
    },

    _addPropertyChangeObservers: {
        value: function (feature) {
            var self = this,
                propertyName, handlers;
            for (propertyName in this._contentPropertyChangeListeners) {
                handlers = this._contentPropertyChangeListeners[propertyName];
                handlers.forEach(function (handler) {
                    var contentPropertyChangeCancellers = self._contentPropertyChangeCancellers.get(handler) || new Map(),
                        cancel = feature.addOwnPropertyChangeListener(propertyName, handler);
                    contentPropertyChangeCancellers.set(feature, cancel);
                    self._contentPropertyChangeCancellers.set(handler, contentPropertyChangeCancellers)
                });
            }
        }
    },

    _removePropertyChangeObservers: {
        value: function (feature) {
            this._contentPropertyChangeCancellers.forEach(function (cancelMap) {
                var cancel = cancelMap.get(feature);
                cancel && cancel();
                cancelMap.delete(feature);
            });
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
