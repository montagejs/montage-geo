var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose coordinates property must be an array of
 * LinearRing coordinate arrays. For Polygons with multiple
 * rings, the first must be the exterior ring and any others
 * must be interior rings or holes.
 *
 * @class
 * @extends external:Geometry
 */
var Polygon = exports.Polygon = Geometry.specialize(/** @lends Polygon.prototype */ {

    addCoordinatesListener: {
        value: function (listener, handlerName) {
            var cancelers = [
                this.addRangeAtPathChangeListener("coordinates", listener, handlerName),
                this.addRangeAtPathChangeListener("coordinates[0]", listener, handlerName)
            ];
            return function () {
                cancelers.forEach(function (fn) {
                    fn();
                });
            };
        }
    },

    /**
     * @type {array<array<Position>>
     */
    coordinates: {
        value: undefined
    },

    /**
     * @override
     * @method
     */
    coordinatesDidChange: {
        value: function () {
            if (this._rangeChangeCanceler) {
                this._rangeChangeCanceler();
            }
            if (this.coordinates && this.coordinates.length) {
                this._rangeChangeCanceler = this.coordinates[0].addRangeChangeListener(this);
                if (this.coordinates[0].length > 2) {
                    this.updateBounds();
                }
            }
        }
    },

    /**
     * @method
     * @param {Polygon|BoundingBox} geometry    - The polygon or bounding box
     *                                            to test for intersection
     * @returns {boolean}
     */
    intersects: {
        value: function (geometry) {
            var isPolygon = geometry instanceof exports.Polygon;
            return isPolygon ?  this._intersectsPolygon(geometry) :
                                this._intersectsBoundingBox(geometry);
        }
    },

    /**
     * @override
     * @returns array<Position>
     */
    positions: {
        get: function () {
            return this.coordinates && this.coordinates[0];
        }
    },

    /**
     * @method
     * @param {Position} position
     * @return boolean
     */
    contains: {
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
     *
     * Returns the area of this polygon in square kilometers.
     * @method
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
     * Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
     * Laboratory, Pasadena, CA, June 2007
     * http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
     *
     * @return {number} the area of this polygon in square kilometers
     */
    area: {
        // TODO: Improve documentation and test.
        get: function () {
            var area = 0, i, length;
            for (i = 0, length = this.coordinates.length; i < length; i += 1) {
                if (i === 0) {
                    area += this._area(this.coordinates[i]);
                } else {
                    area -= this._area(this.coordinates[i]);
                }
            }
            return area;
        }
    },

    _area: {
        value: function (ring) {
            var pointsCount = ring.length,
                area = 0.0,
                p1, p2, p3, i,
                lowerIndex, middleIndex, upperIndex;
            if (pointsCount > 2) {
                for (i = 0; i < pointsCount; i++) {
                    if (i === pointsCount - 2) {// N-2
                        lowerIndex = pointsCount - 2;
                        middleIndex = pointsCount - 1;
                        upperIndex = 0;
                    } else if (i === pointsCount - 1) {// N-1
                        lowerIndex = pointsCount - 1;
                        middleIndex = 0;
                        upperIndex = 1;
                    } else { // 0 to N-3
                        lowerIndex = i;
                        middleIndex = i + 1;
                        upperIndex = i + 2;
                    }
                    p1 = ring[lowerIndex];
                    p2 = ring[middleIndex];
                    p3 = ring[upperIndex];
                    area += (Geometry.toRadians(p3.longitude) -  Geometry.toRadians(p1.longitude)) *
                        Math.sin(Geometry.toRadians(p2.latitude));
                }
                area = area * 6378137.0 * 6378137.0 / 2.0;
            }
            return Math.abs(area / 1E6);
        }
    },

    /**
     *
     * Returns the perimeter of this polygon in meters.
     *
     * @method
     * @public
     * @return Number - the perimeter.
     */
    perimeter: {
        get: function () {
            var coordinates = this.coordinates[0],
                perimeter = 0,
                coordinate, nextCoordinate,
                i, j, n;
            for (i = 0, j = 1, n = coordinates.length; i < n; i += 1, j += 1) {
                coordinate = coordinates[i];
                nextCoordinate = coordinates[j === n ? 0 : j];
                perimeter += coordinate.distance(nextCoordinate);
            }
            return perimeter;
        }
    },

    /**
     *
     * Returns this polygon as a GeoJSON object. Please checkout
     * {@link https://tools.ietf.org/html/rfc7946#section-3.1.6 | IETF Spec}
     * for more information.
     *
     * @method
     * @public
     * @return Object - an object in GeoJSON format.
     */
    toGeoJSON: {
        value: function () {
            var coordinates = this.coordinates && this.coordinates.map(function (rings) {
                    return rings.map(function (position) {
                        return [position.longitude, position.latitude];
                    });
                }) || [[]];
            return {
                type: "Polygon",
                coordinates: coordinates
            }
        }
    },

    /**
     * @method
     * @private
     * @param {BoundingBox} boundingBox
     * @return boolean
     */
    _intersectsBoundingBox: {
        value: function (boundingBox) {
            return this.coordinates[0].some(function (coordinate) {
                return boundingBox.contains(coordinate);
            });
        }
    },

    /**
     * @method
     * @private
     * @param {Polygon} polygon
     * @return boolean
     */
    _intersectsPolygon: {
        value: function (geometry) {
            return this._intersectsRing(geometry.coordinates[0]);
        }
    },

    /**
     * @method
     * @private
     * @param {Array<Position>} coordinates
     * @return boolean
     */
    _intersectsRing: {
        value: function (coordinates) {
            var tester = this.contains.bind(this);
            return coordinates.some(function (coordinate) {
                return tester(coordinate);
            });
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
    },

    _rangeChangeCanceler: {
        value: undefined
    },

    /**
     * Tests whether this Polygon's coordinates member equals the provided one.
     * The two polygons are considered equal if they have the same number of
     * rings and each ring has the same number of positions, in the same order
     * and each position is equal.
     * @param {Polygon} other - the polygon to test for equality.
     * @return {boolean}
     */
    equals: {
        value: function (other) {
            var isPolygon = other instanceof Polygon,
                a = isPolygon && this.coordinates,
                b = isPolygon && other.coordinates;

            return isPolygon && a.length === b.length && this._compareRings(a, b);
        }
    },

    _compareRings: {
        value: function (a, b) {
            var isEqual = true,
                i, n;
            for (i = 0, n = a.length; i < n && isEqual; i += 1) {
                isEqual = a[i].length === b[i].length && this._compare(a[i], b[i]);
            }
            return isEqual;
        }
    },

    _compare: {
        value: function (a, b) {
            var isEqual = true, i, n;
            for (i = 0, n = a.length; i < n && isEqual; i += 1) {
                isEqual = a[i].equals(b[i]);
            }
            return isEqual;
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
