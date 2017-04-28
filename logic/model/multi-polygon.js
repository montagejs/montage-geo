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

    /**
     * @override
     * @returns array<Position>
     */
    positions: {
        get: function () {
            return this.coordinates ? this.coordinates.reduce(function (accumulator, polygon) {
                return accumulator.concat(polygon.bounds.positions);
            }, []) : [];
        }
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
                this.bounds.setWithPositions(this.positions);
                this._shouldRecalculate = false;
            }
        }
    },

    handleRangeChange: {
        value: function () {
            this.bounds.setWithPositions(this.positions);
        }
    },

    _addPolygon: {
        value: function (polygon) {
            var bbox = polygon.bounds.bbox,
                cancel = bbox.addRangeChangeListener(this);
            this._childPolygonRangeChangeCancelers.set(polygon, cancel);
            if (!this._shouldRecalculate) {
                polygon.bounds.positions.forEach(this.bounds.extend.bind(this.bounds));
            }
        }
    },

    _removePolygon: {
        value: function (polygon) {
            var cancel = this._childPolygonRangeChangeCancelers.get(polygon),
                positions = polygon.bounds.positions,
                bounds = this.bounds;
            this._childPolygonRangeChangeCancelers.delete(polygon);
            this._shouldRecalculate =   this._shouldRecalculate ||
                                        positions.some(bounds.isPositionOnBoundary.bind(bounds));
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
