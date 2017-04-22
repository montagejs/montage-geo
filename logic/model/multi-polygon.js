var Geometry = require("./geometry").Geometry,
    Map = require("collections/map"),
    Position = require("./position").Position;

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

    bboxPositions: {
        get: function () {
            return this.coordinates ? this.coordinates.reduce(function (accumulator, polygon) {
                return accumulator.concat(polygon[0]);
            }, []) : [];
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

    _addPolygon: {
        value: function (polygon) {
            var self,
                outerRing = polygon[0],
                cancel = outerRing.addRangeChangeListener(this);
            this._childPolygonRangeChangeCancelers.set(polygon, cancel);
            if (!this._shouldRecalculate) {
                self = this;
                outerRing.forEach(function (position) {
                    self._extend(position);
                });
            }
        }
    },

    _removePolygon: {
        value: function (polygon) {
            var cancel = this._childPolygonRangeChangeCancelers.get(polygon),
                outerRing = polygon[0];
            this._childPolygonRangeChangeCancelers.delete(polygon);
            this._shouldRecalculate =   this._shouldRecalculate ||
                                        outerRing.some(this.isPositionOnBoundary.bind(this));
            if (cancel) cancel();
        }
    },

    _shouldRecalculate: {
        value: false
    },

    _childPolygonRangeChangeCancelers: {
        get: function () {
            if (!this.__childPolygonRangeChangeCancelers) {
                this.__childPolygonRangeChangeCancelers = new Map();
            }
            return this.__childPolygonRangeChangeCancelers;
        }
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
            // TODO: implement strategy for multi-polygon
            // return this.intersectsBbox(geometry.bbox) && this._intersectsPolygon(geometry);
        }
    },

    /**
     * @method
     * @private
     * @param {Polygon} polygon
     * @return boolean
     */
    _intersectsPolygon: {
        value: function (polygon) {
            var isIntersecting = false,
                outerRing = polygon.coordinates[0],
                i, n;
            for (i = 0, n = outerRing.length; i < n && !isIntersecting; i += 1) {
                isIntersecting = this._containsPosition(outerRing[i]);
            }
            return isIntersecting;
        }
    },

    /**
     * @method
     * @private
     * @param {Position} position
     * @return boolean
     */
    _containsPosition: {
        value: function (position) {
            var coordinates = this.coordinates,
                doesContain = true,
                isInPolygon, i, n;
            for (i = 0, n = coordinates.length; i < n && doesContain; i += 1) {
                isInPolygon = this._isPositionInPolygon(coordinates[i], position);
                doesContain = i === 0 ? isInPolygon : !isInPolygon;
            }
            return doesContain;
        }
    },

    /**
     * @method
     * @private
     * @param {Polygon} polygon
     * @param {Position} position
     * @return boolean
     */
    _isPositionInPolygon: {
        value: function (polygon, position) {
            var x = position.longitude,
                y = position.latitude,
                isPositionInPolygon = false,
                iPosition, jPosition,
                i, j, length,
                x1, y1, x2, y2;

            for (i = 0, j = polygon.length - 1, length = polygon.length; i < length; j = i++) {
                iPosition = polygon[i];
                jPosition = polygon[j];
                x1 = iPosition.longitude;
                y1 = iPosition.latitude;
                x2 = jPosition.longitude;
                y2 = jPosition.latitude;

                if ((y1 < y && y2 >= y || y2 < y && y1 >= y) && (x1 <= x || x2 <= x)) {
                    if (x1 + (y - y1) / (y2 - y1) * (x2 - x1) < x) {
                        isPositionInPolygon = !isPositionInPolygon;
                    }
                }
            }

            return isPositionInPolygon;
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
                return ring.map(function (coordinates) {
                    return coordinates.map(function (coordinate) {
                        return Position.withCoordinates(coordinate);
                    });
                });
            });
            return self;
        }
    }

});
