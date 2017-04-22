var Geometry = require("./geometry").Geometry,
    Map = require("collections/map"),
    Polygon = require("./polygon").Polygon;

/**
 *
 * A Geometry whose coordinates property is an array of
 * Polygon coordinate arrays.
 *
 * @class
 * @extends external:Geometry
 */
exports.MultiPolygon = Geometry.specialize(/** @lends MultiPolygon.prototype */ {

    /**
     * @type {array<Polygon>>
     */
    coordinates: {
        value: undefined
    },

    coordinatesDidChange: {
        value: function () {
            if (this._coordinatesRangeChangeCanceler) {
                this._coordinatesRangeChangeCanceler();
            }
            this._childPolygonRangeChangeCancelers.forEach(function (cancel) {
                cancel();
            });
            this._childPolygonRangeChangeCancelers.clear();
            if (this.coordinates) {
                this.coordinates.forEach(this._addPolygon.bind(this));
                this._coordinatesRangeChangeCanceler = this.coordinates.addRangeChangeListener(this, "childPolygon");
            }
        }
    },

    handleChildPolygonRangeChange: {
        value: function (plus, minus) {
            minus.forEach(this._removePolygon.bind(this));
            plus.forEach(this._addPolygon.bind(this));
            if (this._shouldRecalculate) {
                this._recalculateBbox();
                this._shouldRecalculate = false;
            }
        }
    },

    bboxPositions: {
        get: function () {
            var self = this;
            return this.coordinates ? this.coordinates.reduce(function (accumulator, polygon) {
                return accumulator.concat(self.positionsForBbox(polygon.bbox));
            }, []) : [];
        }
    },

    handleRangeChange: {
        value: function () {
            this._recalculateBbox();
        }
    },

    _addPolygon: {
        value: function (polygon) {
            var bbox = polygon.bbox,
                cancel = bbox.addRangeChangeListener(this);
            this.__childPolygonRangeChangeCancelers.set(polygon, cancel);
            if (!this._shouldRecalculate) {
                this.positionsForBbox(bbox).forEach(this._extend.bind(this));
            }
        }
    },

    _removePolygon: {
        value: function (polygon) {
            var cancel = this._childPolygonRangeChangeCancelers.get(polygon),
                positions = this.positionsForBbox(polygon.bbox);
            this._childPolygonRangeChangeCancelers.delete(polygon);
            this._shouldRecalculate =   this._shouldRecalculate ||
                                        positions.some(this.isPositionOnBoundary.bind(this));
            if (cancel) cancel();
        }
    },

    _childPolygonRangeChangeCancelers: {
        get: function () {
            if (!this.__childPolygonRangeChangeCancelers) {
                this.__childPolygonRangeChangeCancelers = new Map();
            }
            return this.__childPolygonRangeChangeCancelers;
        }
    },

    _shouldRecalculate: {
        value: false
    },

    _coordinatesRangeChangeCanceler: {
        value: undefined
    },

    /**
     * @method
     * @param {Polygon} geometry    - The polygon to test for
     *                                intersection
     * @returns {boolean}
     */
    intersects: {
        value: function (geometry) {
            return this.coordinates.some(function (polygon) {
                return polygon.intersects(geometry);
            });
        }
    }

}, {

    /**
     * Returns a newly initialized point with the specified coordinates.
     *
     * @param {array<array<number>>} rings - The LinearRings that compose
     *                                       this polygon.  The first ring
     *                                       is the outline of the polygon.
     *                                       The other rings represent holes
     *                                       inside the outer polygon.
     * @return {Polygon} polygon
     */
    withCoordinates: {
        value: function (rings) {
            var self = new this();
            self.coordinates = rings.map(function (ring) {
                return Polygon.withCoordinates(ring);
            });
            return self;
        }
    }

});
