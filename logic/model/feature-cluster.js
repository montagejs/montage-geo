var Montage = require("montage/core/core").Montage,
    Map = require("montage/collections/map"),
    Set = require("montage/collections/set");

/**
 *
 * A feature cluster represents a collection of features that are grouped
 * together on the map because they appear within a given distance in
 * pixels at a given zoom level.
 *
 * @class
 * @extends external:Montage
 */
exports.FeatureCluster = Montage.specialize(/** @lends FeatureCluster.prototype */ {

    constructor: {
        value: function FeatureCluster() {
            this._features = new Set();
        }
    },

    /**
     * The features of this cluster.  Do not manipulate the contents
     * of this array directly.  To add or remove features from a cluster
     * use the add and remove functions.
     * @public
     * @type {Set<Feature>}
     */
    features: {
        get: function () {
            return this._features;
        }
    },

    /**
     * The pixel location of this cluster.
     * @public
     * @type {Point}
     */
    point: {
        value: undefined
    },

    /**
     * Use this method to add features to the cluster.  The feature's pixel
     * location must be provided when adding features to the cluster.  The
     * cluster's point will be automatically updated after adding the feature
     * to the cluster.
     * @public
     * @method
     * @param {Feature} feature -   the feature to add to this cluster.
     * @param {Point} point -       the pixel location of the feature to add.
     */
    add: {
        value: function (feature, point) {
            if (this._features.has(feature)) {
                // TODO: Remove before adding.
            }
            this._features.add(feature);
            this._addPoint(point);
            this._featurePointMap.set(feature, point);
        }
    },

    /**
     * Use this method to remove features from the cluster.  The cluster's
     * point will be updated after removing the feature from the cluster.
     * If the cluster no longer has any features, its point will be set to
     * null.
     * @public
     * @method
     * @param {Feature} feature -   the feature to add to this cluster.
     */
    remove: {
        value: function (feature) {
            if (this._features.has(feature)) {
                this._removePoint(this._featurePointMap.get(feature));
                this._featurePointMap.delete(feature);
                this._features.delete(feature);
            }
        }
    },

    /**
     * Stores the mapping between a feature and the point it was added to
     * it.
     * @private
     * @type Map<Feature, Point>
     */
    _featurePointMap: {
        get: function () {
            if (!this.__featurePointMap) {
                this.__featurePointMap = new Map();
            }
            return this.__featurePointMap;
        }
    },

    /**
     * Updates the point's coordinates by adding a point.
     * @private
     * @method
     */
    _addPoint: {
        value: function (point) {
            var size = this._features.size;
            if (size > 1) {
                this.point.x = (this.point.x * (size - 1) + point.x) / size;
                this.point.y = (this.point.y * (size - 1) + point.y) / size;
            } else {
                this.point = point;
            }
        }
    },

    /**
     * Updates the point's coordinates by subtracting a point.
     * @private
     * @method
     */
    _removePoint: {
        value: function (point) {
            var size = this._features.size;
            if (size > 1) {
                this.point.x = (this.point.x * size - point.x) / (size - 1);
                this.point.y = (this.point.y * size - point.y) / (size - 1);
            } else {
                this.point = null;
            }
        }
    }

});
