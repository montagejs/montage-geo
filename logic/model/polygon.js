var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose coordinates member must be an array of
 * LinearRing coordinate arrays. For Polygons with multiple
 * rings, the first must be the exterior ring and any others
 * must be interior rings or holes.
 *
 * @class
 * @extends external:Geometry
 */
exports.Polygon = Geometry.specialize(/** @lends Polygon.prototype */ {

    /**
     *
     * @type {array<array<position>>}
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
            if (this._coordinates && this._coordinates.length > 0) {
                this._rangeChangeCanceler = this._coordinates[0].addRangeChangeListener(this);
            }
            this._updateBbox();
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

    /**
     * @method
     * @param {Polygon} geometry    - The polygon to test for
     *                                intersection
     * @returns {boolean}
     */
    intersects: {
        value: function (geometry) {
            if (this._boundsIntersectsBounds(geometry)) {

            }
        }
    },

    handleRangeChange: {
        value: function (plus, minus) {
            if (plus.length > 0 || minus.length > 0) {
                this._updateBbox();
            }
        }
    },

    _rangeChangeCanceler: {
        value: undefined
    },

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

    _boundsIntersectsBounds: {
        value: function (geometry) {
            var bounds = Bounds.withBbox(geometry.bbox);
            return  this._isBboxInBbox(this.bbox, bbox) ||
                    this._isBboxInBbox(bbox, this.bbox) ||
                    false;
        }
    },



    _isBboxInBbox: {
        value: function (bbox1, bbox2) {
            var bounds = Bounds.withBbox(bbox1),
                corners = [
                    Position.withCoordinates(bbox2[0], bbox[1]), // SW
                    Position.withCoordinates(bbox2[0], bbox[3]), // NW
                    Position.withCoordinates(bbox2[2], bbox[3]), // NE
                    Position.withCoordinates(bbox2[2], bbox[1])  // SE
                ];
            return corners.some(function (position) {
                return bounds.containsPosition(position);
            });
        }
    },

    _bboxIntersect: {
        value: function (bbox1, bbox2) {

        }
    },

    _containsPosition: {
        value: function (position) {
            var coordinates = this.coordinates,
                doesContain = true,
                isInPolygon, i, n;
            for (i = 0, n = coordinates.length; i < n && doesContain; i += 1) {
                isInPolygon = this._polygonContainsPosition(coordinates[i], position);
                doesContain = i === 0 ? isInPolygon : !isInPolygon;
            }
            return doesContain;
        }
    },

    _polygonContainsPosition: {
        value: function (polygon, position) {
            var x = position.longitude,
                y = position.latitude,
                isInPolygon = false,
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
                        isInPolygon = !isInPolygon;
                    }
                }
            }

            return isInPolygon;
        }
    }

}, {

    /**
     * Returns a newly initialized point with the specified coordinates.
     *
     * @param {array<array<number>>} rings - The LinearRings that compose
     *                                       this polygon.
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
