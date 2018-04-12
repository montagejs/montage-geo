var Geometry = require("./geometry").Geometry,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose "coordinates" property is an array of
 * two or more positions.
 *
 * @class
 * @extends external:Geometry
 */
var LineString = exports.LineString = Geometry.specialize(/** @lends LineString.prototype */ {

    /**
     * The "coordinates" member is an array of two or more positions.
     * @type {array<Position>}
     */
    coordinates: {
        value: undefined
    },

    bounds: {
        value: function () {
            var xMin = Infinity,
                yMin = Infinity,
                xMax = -Infinity,
                yMax = -Infinity,
                coordinates = this.coordinates,
                coordinate, i, n;

            for (i = 0, n = coordinates && coordinates.length || 0; i < n; i += 1) {
                coordinate = coordinates[i];
                xMin = Math.min(xMin, coordinate.longitude);
                yMin = Math.min(yMin, coordinate.latitude);
                xMax = Math.max(xMax, coordinate.longitude);
                yMax = Math.max(yMax, coordinate.latitude);
            }

            return BoundingBox.withCoordinates(xMin, yMin, xMax, yMax);
        }
    },

    makeBoundsObserver: {
        value: function () {
            var self = this;
            return function observeBounds(emit, scope) {
                return self.observeBounds(emit);
            }.bind(this);
        }
    },

    observeBounds: {
        value: function (emit) {
            var self = this,
                coordinatesPathChangeListener,
                cooordinatesRangeChangeListener,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.bounds());
            }

            update();
            coordinatesPathChangeListener = this.addPathChangeListener("coordinates", update);
            cooordinatesRangeChangeListener = this.coordinates.addRangeChangeListener(update);

            return function cancelObserver() {
                coordinatesPathChangeListener();
                cooordinatesRangeChangeListener();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    /**
     * @method
     * @param{LineString|Polygon|BoundingBox}
     * @returns boolean
     */
    intersects: {
        value: function (geometry) {
            var isLineString = geometry instanceof LineString,
                coordinates,
                positions = this.coordinates,
                isIntersecting = false,
                point1, point2, point3, point4,
                i, j, a, b, length, length2;

            if (!isLineString) {
                isIntersecting = positions.some(function (position) {
                    return geometry.contains(position);
                });
            }

            if (!isIntersecting) {
                coordinates = isLineString && geometry.coordinates || geometry.coordinates[0];
                outerloop:
                    for (i = 0, j = 1, length = positions.length - 1; i < length; i++, j++) {
                        point3 = positions[i];
                        point4 = positions[j];
                        for (a = 0, b = 1, length2 = coordinates.length - 1; a < length2; a++, b++) {
                            point1 = coordinates[a];
                            point2 = coordinates[b];
                            isIntersecting = this._segmentsIntersect(
                                point1.longitude, point1.latitude,
                                point2.longitude, point2.latitude,
                                point3.longitude, point3.latitude,
                                point4.longitude, point4.latitude
                            );
                            if (isIntersecting) break outerloop;
                        }
                    }
            }
            return isIntersecting;
        }
    },

    _segmentsIntersect: {
        value: function (x1, y1, x2, y2, x3, y3, x4, y4) {
            return this._orientation(x1, y1, x3, y3, x4, y4) !== this._orientation(x2, y2, x3, y3, x4, y4) &&
                this._orientation(x1, y1, x2, y2, x3, y3) !== this._orientation(x1, y1, x2, y2, x4, y4);
        }
    },

    _orientation: {
        value: function (tx1, ty1, tx2, ty2, tx3, ty3) {
            var clockWise = ((ty3 - ty1) * (tx2 - tx1)) - ((ty2 - ty1) * (tx3 - tx1));
            return clockWise > 0 ? true : clockWise < 0 ? false : true;
        }
    },

    toGeoJSON: {
        value: function () {
            var coordinates = this.coordinates.map(function (coordinate) {
                return [coordinate.longitude, coordinate.latitude]
            });
            return {
                type: "LineString",
                coordinates: coordinates
            };
        }
    },

    /**
     * Returns a copy of this LineString.
     *
     * @method
     * @returns {Geometry}
     */
    clone: {
        value: function () {
            var coordinates = this.coordinates.map(function (coordinate) {
                return [coordinate.longitude, coordinate.latitude];
            });
            return exports.LineString.withCoordinates(coordinates);
        }
    },

    /**
     * Tests whether this LineString's coordinates equals the provided one.
     * For the two coordinates properties to be considered equal they must
     * contain the same number of positions, in the same order and with the
     * exact same values.
     *
     * @param {LineString} other - the line string to test for equality.
     * @return {boolean}
     */
    equals: {
        value: function (other) {
            var isLineString = other instanceof LineString,
                a = isLineString && this.coordinates,
                b = isLineString && other.coordinates;
            return isLineString && a.length === b.length && this._compare(a, b);
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
     * Returns a newly initialized LineString with the specified coordinates.
     *
     * @param {array<array<number>>} coordinates - The position of this point.
     */
    withCoordinates: {
        value: function (coordinates) {
            var self = new this();
            self.coordinates = coordinates.map(function (coordinate) {
                return Position.withCoordinates(coordinate);
            });
            return self;
        }
    },

    /**
     * Returns a newly initialized LineString with the specified coordinates.
     *
     * @param {array<array<number>>} coordinates - The position of this point.
     */
    withPositions: {
        value: function (positions) {
            var self = new this();
            self.coordinates = positions;
            return self;
        }
    }

});
