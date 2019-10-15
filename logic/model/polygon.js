var Geometry = require("./geometry").Geometry,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    d3Geo = require("d3-geo"),
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

    /**
     * @type {array<array<Position>>
     */
    coordinates: {
        value: undefined
    },

    bounds: {
        value: function () {
            var bounds = d3Geo.geoBounds(Polygon.GeoJsonConverter.revert(this));
            return BoundingBox.withCoordinates(bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]);
        }
    },

    /**
     * Returns a copy of this Polygon.
     *
     * @method
     * @returns {Polygon}
     */
    clone: {
        value: function () {
            var rings = this.coordinates && this.coordinates.map(function (rings) {
                return rings.map(function (position) {
                    return [position.longitude, position.latitude];
                });
            }) || [[]];
            return Polygon.withCoordinates(rings);
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
                coordinatesRangeChangeListener,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.bounds());
            }

            update();
            coordinatesPathChangeListener = this.addPathChangeListener("coordinates", update);
            if (this.coordinates && this.coordinates.length) {
                coordinatesRangeChangeListener = this.coordinates[0].addRangeChangeListener(update);
            }

            return function cancelObserver() {
                coordinatesPathChangeListener();
                if (coordinatesRangeChangeListener) {
                    coordinatesRangeChangeListener();
                }
                if (cancel) {
                    cancel();
                }
            };
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
        value: function () {
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

    makeAreaObserver: {
        value: function () {
            var self = this;
            return function observeArea(emit) {
                return self.observeArea(emit);
            };
        }
    },

    observeArea: {
        value: function (emit) {
            var callback = this.area.bind(this),
                coordinates = this.coordinates,
                ringsHandler, ringHandlers = [],
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback());
                clearObservers();
                initializeObservers();
            }

            function clearObservers() {
                var canceller;
                if (ringsHandler) {
                    ringsHandler();
                }
                while (canceller = ringHandlers.pop()) {
                    canceller();
                }
            }

            function initializeObservers() {
                ringsHandler = coordinates.addRangeChangeListener(update);
                coordinates.forEach(function (ring) {
                    ringHandlers.push(ring.addRangeChangeListener(update));
                });
            }

            update();
            return function cancelObserver() {
                clearObservers();
                if (cancel) {
                    cancel();
                }
            };
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
        value: function () {
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

    makePerimeterObserver: {
        value: function () {
            var self = this;
            return function observePerimeter(emit) {
                return self.observePerimeter(emit);
            };
        }
    },

    observePerimeter: {
        value: function (emit) {
            var callback = this.perimeter.bind(this),
                coordinates = this.coordinates,
                rangeChangeListener,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback());
                clearObserver();
                initializeObserver();
            }

            function clearObserver() {
                if (rangeChangeListener) {
                    rangeChangeListener();
                }
            }

            function initializeObserver() {
                if (coordinates && coordinates.length) {
                    rangeChangeListener = coordinates[0].addRangeChangeListener(update);
                }
            }

            update();
            return function cancelObserver() {
                clearObserver();
                if (cancel) {
                    cancel();
                }
            };
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
     * @deprecated
     * @return Object - an object in GeoJSON format.
     */
    toGeoJSON: {
        value: function () {
            return Polygon.GeoJsonConverter.revert(this);
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
            var self = this;
            return this.coordinates.some(function (ring) {
                return ring.some(function (coordinate) {
                    return boundingBox.contains(coordinate);
                });
            }) || boundingBox.coordinates[0].some(function (position) {
                return self.contains(position);
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

    GeoJsonConverter: {
        get: function () {
            return require("logic/converter/geo-json-to-geometry-converter").GeoJsonToGeometryConverter.getInstance();
        }
    },

    /**
     * Returns a newly initialized polygon with the specified coordinates.
     *
     * @param {array<array<number>>} rings - The LinearRings that compose
     *                                       this polygon.  The first ring
     *                                       is the outline of the polygon.
     *                                       The other rings represent holes
     *                                       inside the outer polygon.
     * @param {?Projection} projection     - If supplied projects the supplied
     *                                       coordinates to this reference
     *                                       system.
     * @return {Polygon} polygon
     */
    withCoordinates: {
        value: function (rings, projection) {
            var self = new this();
            self.coordinates = rings.map(function (ring) {
                return ring.map(function (coordinates) {
                    return Position.withCoordinates(coordinates, projection);
                });
            });
            return self;
        }
    }

});
