var Montage = require("montage/core/core").Montage,
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    GeohashCollection = require("logic/model/geohash-collection").GeohashCollection;

var ROUND_ONE = 'e5';
var ROUND_TWO = 'e-5';

/**
 *
 * A bounding box represents an area defined by two longitudes and
 * two latitudes
 *
 * @class
 * @extends external:Montage
 */
exports.BoundingBox = Montage.specialize(/** @lends BoundingBox.prototype */ {

    /********************************************
     * Properties
     */

    /**
     * The maximum longitude
     * @type {number}
     */
    xMax: {
        get: function () {
            return this._xMax;
        },
        set: function (x) {
            x = this._round(x);
            this._xMax = x;
            if (this._bbox) {
                this._bbox.splice(2, 1, x);
            }
        }
    },

    /**
     * The minimum longitude
     * @type {number}
     */
    xMin: {
        get: function () {
            return this._xMin;
        },
        set: function (x) {
            x = this._round(x);
            this._xMin = x;
            if (this._bbox) {
                this._bbox.splice(0, 1, x);
            }
        }
    },

    /**
     * The maximum latitude
     * @type {number}
     */
    yMax: {
        get: function () {
            return this._yMax;
        },
        set: function (y) {
            y = this._round(y);
            this._yMax = y;
            if (this._bbox) {
                this._bbox.splice(3, 1, y);
            }
        }
    },

    /**
     * The minimum latitude
     * @type {number}
     */
    yMin: {
        get: function () {
            return this._yMin;
        },
        set: function (y) {
            y = this._round(y);
            this._yMin = y;
            if (this._bbox) {
                this._bbox.splice(1, 1, y);
            }
        }
    },

    _round: {
        value: function (value) {
            var isInfinity = value === Infinity || value === -Infinity;
            return isInfinity ? value : Number(value.toFixed(5));
        }
    },

    /********************************************
     * Derived Properties
     */

    /**
     * A Geometry MAY have a member named "bbox" to include
     * information on the coordinate range for its coordinates.
     * The value of the bbox member MUST be an array of
     * length 2*n where n is the number of dimensions represented
     * in the contained geometries, with all axes of the most south-
     * westerly point followed by all axes of the more northeasterly
     * point.  The axes order of a bbox follows the axes order of
     * geometries.
     *
     * @type {Array.<number>}
     */
    bbox: {
        get: function () {
            if (!this._bbox) {
                this._bbox = [this.xMin, this.yMin, this.xMax, this.yMax];
            }
            return this._bbox;
        },
        set: function (box) {
            this.xMin = box[0];
            this.xMax = box[2];
            this.yMin = box[1];
            this.yMax = box[3];
        }
    },

    center: {
        get: function () {
            var Position = exports.BoundingBox.Position,
                p1 = Position.withCoordinates(this.xMin, this.yMin),
                p2 = Position.withCoordinates(this.xMax, this.yMax);
            return p1.midPointTo(p2);
        }
    },

    /**
     *
     * Returns this bounding box with the coordinates of
     * a polygon.
     * TODO: Make Observable
     * @method
     * @returns {Array<Position>}
     */
    coordinates: {
        get: function () {
                var Position = exports.BoundingBox.Position,
                southEast = Position.withCoordinates(this.xMax, this.yMin),
                southWest = Position.withCoordinates(this.xMin, this.yMin),
                northWest = Position.withCoordinates(this.xMin, this.yMax),
                northEast = Position.withCoordinates(this.xMax, this.yMax);
            return [
                [southWest, northWest, northEast, southEast, southWest]
            ];
        }
    },

    /**
     * Return the Geohashes for this bounds.  This property can
     * be observed.
     * @type {Set}
     */
    hashes: {
        get: function () {
            return this._hashCollection.hashes;
        }
    },

    /**
     * The positions of this bounding box.
     * TODO: Make Observable
     * @returns {array<Position>}
     */
    positions: {
        get: function () {
            var Position = exports.BoundingBox.Position,
                bbox = this.bbox,
                positions = [],
                i, j, x, y;
            for (i = 0; i < 2; i += 1) {
                for (j = 0; j < 2; j += 1) {
                    x = i === 0 ? bbox[0] : bbox[2];
                    y = j === 0 ? bbox[1] : bbox[3];
                    positions.push(Position.withCoordinates(x, y));
                }
            }
            return positions;
        }
    },

    _hashCollection: {
        get: function () {
            if (!this.__hashCollection) {
                this.__hashCollection = GeohashCollection.withBoundingBox(this);
            }
            return this.__hashCollection;
        }
    },

    /******************************************************
     * Testing
     */

    /**
     * Determines whether or not the bounds contains the
     * position.
     *
     * @method
     * @param {Position} position - The position to test.
     * @returns {boolean}
     */
    contains: {
        value: function (position) {
            var lng = position.longitude,
                lat = position.latitude;
            return  lng <= this.xMax &&
                    lng >= this.xMin &&
                    lat <= this.yMax &&
                    lat >= this.yMin;
        }
    },

    /**
     * Determines whether or not the bounds intersects,
     * contains or is within the passed in feature.
     *
     * @method
     * @param {Feature}
     * @returns {boolean}
     */
    containsFeature: {
        value: function (feature) {
            var geometry = feature.geometry;
            return this.splitAlongAntimeridian().some(function (bounds) {
                return geometry instanceof GeometryCollection ? geometry.geometries.some(function (childGeometry) {
                    return childGeometry.intersects(bounds);
                }) : geometry.intersects(bounds)
            });
        }
    },

    equals: {
        value: function (other) {
            return other === this ||
                other && other.xMin === this.xMin &&
                other.yMin === this.yMin &&
                other.xMax === this.xMax &&
                other.yMax === this.yMax;
        }
    },

    /***
     * Returns true if this bounds intersects the passed in bounds.
     * @param {Object} Bounds - the bounds to compare to this bounds.
     * @return {Boolean}
     */
    intersects: {
        value: function (other) {
            var otherSplits = other.splitAlongAntimeridian();
            return this.splitAlongAntimeridian().some(function (thisSplit) {
                return otherSplits.some(function (otherSplit) {
                    // Taken from leaflet.Bounds#intersects.
                    return  otherSplit.xMax >= thisSplit.xMin &&
                            otherSplit.xMin <= thisSplit.xMax &&
                            otherSplit.yMax >= thisSplit.yMin &&
                            otherSplit.yMin <= thisSplit.yMax;
                });
            });
        }
    },

    /**
     * Test if any of the position's coordinates are on
     * any of the boundaries of this bounds.
     * @param {Position}
     * @returns {boolean}
     */
    isPositionOnBoundary: {
        value: function (position) {
            var lng = position.longitude,
                lat = position.latitude;
            return  this.contains(position) && (
                        this.xMin === lng || this.xMax === lng ||
                        this.yMin === lat || this.yMax === lat
                    );
        }
    },

    /******************************************************
     * Measurement
     */

    /**
     * Returns the area of this bounding box in square meters
     * @method
     * @returns {number}
     */
    area: {
        get: function() {
            var Position = exports.BoundingBox.Position,
                southWest = Position.withCoordinates(this.xMin, this.yMin),
                northWest = Position.withCoordinates(this.xMin, this.yMax),
                height = southWest.distance(northWest),
                spheres = this._divideIfWiderThan180Degrees(),
                area = 0;
            spheres.forEach(function (bbox) {
                var southWest = Position.withCoordinates(bbox[0], bbox[1]),
                    southEast = Position.withCoordinates(bbox[2], bbox[1]),
                    width = southWest.distance(southEast);
                area += height * width;
            });
            return area;
        }
    },

    // TODO: Rename...
    _divideIfWiderThan180Degrees: {
        value: function () {
            var split = [],
                width = this.xMax - this.xMin,
                xMid;
            if (width >= 180) {
                xMid = (this.xMin + this.xMax) / 2;
                split.push([this.xMin, this.yMin, xMid, this.yMax]);
                split.push([xMid, this.yMin, this.xMax, this.yMax]);
            } else {
                split.push(this.bbox);
            }
            return split;
        }
    },

    /******************************************************
     * Mutating
     */

    /**
     * Extend this bounding box with the provided position or bounding box.
     * @public
     * @param {Position|BoundingBox}
     */
    extend: {
        value: function (value) {
            if (value && value instanceof exports.BoundingBox) {
                this._extendWithBoundingBox(value);
            } else if (value && value instanceof exports.BoundingBox.Position) {
                this._extendWithPosition(value);
            }
        }
    },

    _extendWithBoundingBox: {
        value: function (box) {
            var coordinates = box.coordinates[0].slice(0, 4),
                i, n;
            for (i = 0, n = 4; i < n; i += 1) {
                this._extendWithPosition(coordinates[i]);
            }
        }
    },

    _extendWithPosition: {
        value: function (position) {
            var lng = position.longitude,
                lat = position.latitude;
            if (this.xMin > lng) this.xMin = lng;
            if (this.xMax < lng) this.xMax = lng;
            if (this.yMin > lat) this.yMin = lat;
            if (this.yMax < lat) this.yMax = lat;
        }
    },

    /**
     * Extend this bounding box in each direction by the number of meters
     * provided.
     * @public
     * @param {number}
     */
    buffer: {
        value: function (meters) {
            var Position = exports.BoundingBox.Position,
                distance = Math.sqrt(Math.pow(meters, 2) + Math.pow(meters, 2)),
                southWest = Position.withCoordinates(this.xMin, this.yMin),
                northEast = Position.withCoordinates(this.xMax, this.yMax);
            southWest = southWest.vincentyDirect(distance, 225);
            northEast = northEast.vincentyDirect(distance, 45);
            this.xMin = southWest.longitude;
            this.yMin = southWest.latitude;
            this.xMax = northEast.longitude;
            this.yMax = northEast.latitude;
        }
    },

    setWithPositions: {
        value: function (positions) {
            var xMin = Infinity,
                yMin = Infinity,
                xMax = -Infinity,
                yMax = -Infinity;
            positions = positions || [];
            positions.forEach(function (position) {
                var lng = position.longitude,
                    lat = position.latitude;
                if (xMin > lng) xMin = lng;
                if (xMax < lng) xMax = lng;
                if (yMin > lat) yMin = lat;
                if (yMax < lat) yMax = lat;
            });
            if (this.xMin !== xMin) this.xMin = xMin;
            if (this.yMin !== yMin) this.yMin = yMin;
            if (this.xMax !== xMax) this.xMax = xMax;
            if (this.yMax !== yMax) this.yMax = yMax;
        }
    },

    /***************************************************************************
     * Duplicating.
     */

    clone: {
        value: function () {
            var other = new exports.BoundingBox();
            other.xMin = this.xMin;
            other.yMin = this.yMin;
            other.xMax = this.xMax;
            other.yMax = this.yMax;
            return other;
        }
    },

    /******************************************************
     * Utilities
     */

    /**
     * @todo [Charles]: The array of split bounds will be cached, but the cache
     * is not updated or cleared if the bound values change. Either the cache
     * should be cleared on bound changes, or preferably bounds should be made
     * an immutable object.
     */
    splitAlongAntimeridian: {
        value: function () {
            if (!this._split) {
                this._split = [];
                if (this.xMin <= this.xMax) {
                    this._split.push(this);
                } else {
                    this._split.push(exports.BoundingBox.withCoordinates(this.xMin, this.yMin, 179.99999, this.yMax));
                    this._split.push(exports.BoundingBox.withCoordinates(-179.99999, this.yMin, this.xMax, this.yMax));
                }
            }
            return this._split;
        }
    },

    /**
     * Convert this bounding box to a rect in web mercator coordinates.  If the
     * bounding box spans the anti-meridian, the maximum longitude will be
     * greater than the map size.
     * @param {number} [zoom=0] - the zoom level to use when sizing the rect.
     * @returns {Rect}
     */
    toRect: {
        value: function (zoom) {
            var BoundingBox = exports.BoundingBox,
                Position = BoundingBox.Position,
                Point2D = BoundingBox.Point2D,
                Size = BoundingBox.Size,
                Rect = BoundingBox.Rect,
                split = this.splitAlongAntimeridian(),
                rects = split.map(function (bbox) {
                    var min = Point2D.withPosition(Position.withCoordinates([bbox.xMin, bbox.yMin]), zoom || 0),
                        max = Point2D.withPosition(Position.withCoordinates([bbox.xMax, bbox.yMax]), zoom || 0),
                        origin = Point2D.withCoordinates(min.x, max.y),
                        size = Size.withHeightAndWidth(min.y - max.y, max.x - min.x);
                    return Rect.withOriginAndSize(origin, size);
                }, this);
            if (rects.length === 2) {
                rects[0].size.width = rects[0].width + rects[1].width;
            }
            return rects[0];
        }
    }

}, {

    // Solve cyclic dependency
    Position: {
        get: function () {
            return require("logic/model/position").Position;
        }
    },

    Point2D: {
        get: function () {
            return require("logic/model/point-2d").Point2D;
        }
    },

    Rect: {
        get: function () {
            return require("logic/model/rect").Rect;
        }
    },

    Size: {
        get: function () {
            return require("logic/model/size").Size;
        }
    },

    withBbox: {
        value: function (bbox, projection) {
            return exports.BoundingBox.withCoordinates(bbox[0], bbox[1], bbox[2], bbox[3], projection);
        }
    },

    withCoordinates: {
        value: function (xMin, yMin, xMax, yMax, projection) {
            var bounds = new this(),
                minimums = projection ? projection.inverseProjectPoint([xMin, yMin]) : [xMin, yMin],
                maximums = projection ? projection.inverseProjectPoint([xMax, yMax]) : [xMax, yMax];
            bounds.xMin = minimums[0];
            bounds.yMin = minimums[1];
            bounds.xMax = maximums[0];
            bounds.yMax = maximums[1];
            return bounds;
        }
    },

    withTile: {
        value: function (tile) {
            function pixelToPosition (pixel) {
                var Position = exports.BoundingBox.Position,
                    longitude = (pixel.x - 128) / (256 / 360),
                    latitude = (2 * Math.atan(Math.exp((pixel.y - 128) / -(256 / (2 * Math.PI)))) -
                        Math.PI / 2) / (Math.PI / 180);
                return Position.withCoordinates(longitude, latitude);
            }

            var tilesPerSide = Math.pow(2, tile.z),
                southWestPoint = {
                    x: tile.x * 256 / tilesPerSide,
                    y: (tile.y + 1) * 256 / tilesPerSide
                },
                northEastPoint = {
                    x: (tile.x + 1) * 256 / tilesPerSide,
                    y: tile.y * 256 / tilesPerSide
                },
                southWestCoordinate = pixelToPosition(southWestPoint),
                northEastCoordinate = pixelToPosition(northEastPoint);

            return exports.BoundingBox.withCoordinates(
                southWestCoordinate.longitude,
                southWestCoordinate.latitude,
                northEastCoordinate.longitude,
                northEastCoordinate.latitude
            );
        }
    },

    /**
     * Returns a new bounding box using the supplied rect (which is assumed to
     * be in web mercator projection).  If a zoom level is supplied it will be
     * used in the conversion.  Otherwise, it is assumed that the rect was
     * created at zoom level 0.
     * @param {rect} - the rect to convert
     * @param {number} [zoom=0] - the zoom level to use during conversion.
     * @returns {BoundingBox}
     */
    withRectAtZoomLevel: {
        value: function (rect, zoomLevel) {
            var Point2D = exports.BoundingBox.Point2D,
                zoomCoefficient =  Math.pow(2, zoomLevel || 0),
                origin = rect.origin.divide(zoomCoefficient),
                size = rect.size.divide(zoomCoefficient),
                minY = origin.y + size.height,
                maxX, min, max;

            origin.x = origin.x % 256;
            maxX = (origin.x + size.width) % 256;

            min = Point2D.withCoordinates(origin.x, minY).toPoint().coordinates;
            max = Point2D.withCoordinates(maxX, origin.y).toPoint().coordinates;

            return exports.BoundingBox.withCoordinates(
                min.longitude, min.latitude, max.longitude, max.latitude
            );
        }
    }

});

exports.BoundingBox.EARTH = exports.BoundingBox.withCoordinates(-180.0, -85.05112878, 180.0, 85.05112878);
