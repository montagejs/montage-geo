var Geometry = require("./geometry").Geometry,
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
     *
     * @type {array<array<array<position>>>}
     */
    coordinates: {
        get: function () {
            return this._coordinates;
        },
        set: function (value) {
            if (this._rangeChangeCanceler) {
                this._rangeChangeCanceler();
            }
            this._coordinates = value;
        }
    },

    /**
     *
     * A 2*n array where n is the number of dimensions represented
     * in the contained geometries, with the lowest values for all
     * axes followed by the highest values.
     *
     * @type {array}
     */
    bbox: {
        get: function () {
            if (!this._bbox) {
                this._bbox = [];
            }
            return this._bbox;
        }
    },

    _rangeChangeCanceler: {
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
            return this.intersectsBbox(geometry.bbox) && this._intersectsPolygon(geometry);
        }
    },

    handleRangeChange: {
        value: function (plus, minus) {
            if (plus.length > 0 || minus.length > 0) {
                this._updateBbox();
            }
        }
    },

    /**
     * @method
     * @private
     */
    _updateBbox: {
        value: function () {

            var minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity,
                positions = this.coordinates[0],
                position, lng, lat, i, n;

            for (i = 0, n = positions.length; i < n; i += 1) {
                position = positions[i];
                lng = position.longitude;
                lat = position.latitude;
                if (minX > lng) minX = lng;
                if (maxX < lng) maxX = lng;
                if (minY > lat) minY = lat;
                if (maxY < lat) maxY = lat;
            }
            this.bbox.splice(0, Infinity, minX, minY, maxX, maxY);
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
                    return Position.withCoordinates(coordinates);
                });
            });
            return self;
        }
    }

});
