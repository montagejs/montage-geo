var Montage = require("montage/core/core").Montage,
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    LineString = require("logic/model/line-string").LineString,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    Point = require("logic/model/point").Point,
    Position = require("logic/model/position").Position;

/**
 *
 * A bounding box represents an area defined by two longitudes and
 * two latitudes
 *
 * @class
 * @extends external:Montage
 */
exports.BoundingBox = Montage.specialize(/** @lends BoundingBox.prototype */ {

    /**
     * The maximum longitude
     * @type {number}
     */
    xMax: {
        get: function () {
            return this._xMax;
        },
        set: function (x) {
            this._xMax = x;
            if (this._box) {
                this._box[2] = x;
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
            this._xMin = x;
            if (this._box) {
                this._box[0] = x;
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
            this._yMax = y;
            if (this._box) {
                this._box[3] = x;
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
            this._yMin = y;
            if (this._box) {
                this._box[1] = x;
            }
        }
    },

    /**
     * This [xMin, yMin, xMax, yMax] array is created lazily and no more than
     * once for a given bounds object. Once created it is kept in sync with the
     * bounds' xMin, xMax, yMin, and yMax values. Setting this will update the
     * bounds' xMin, xMax, yMin, and yMax values accordingly.
     *
     * @type {Array.<number>}
     */
    bbox: {
        get: function () {
            if (!this._box) {
                this._box = [this.xMin, this.yMin, this.xMax, this.yMax];
            }
            return this._box;
        },
        set: function (box) {
            this.xMin = box[0];
            this.xMax = box[2];
            this.yMin = box[1];
            this.yMax = box[3];
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
                    this._split.push(exports.Bounds.withCoordinates(this.xMin, this.yMin, 179.99999, this.yMax));
                    this._split.push(exports.Bounds.withCoordinates(-179.99999, this.yMin, this.xMax, this.yMax));
                }
            }
            return this._split;
        }
    },

    /**
     *
     * Returns this bounding box with the coordinates of
     * a polygon.
     *
     * @method
     * @returns {Array<Position>}
     */
    coordinates: {
        get: function () {
            var southEast = Position.withCoordinates(this.xMax, this.yMin),
                southWest = Position.withCoordinates(this.xMin, this.yMin),
                northWest = Position.withCoordinates(this.xMin, this.yMax),
                northEast = Position.withCoordinates(this.xMax, this.yMax);
            return [
                [southWest, northWest, northEast, southEast, southWest]
            ];
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
                return geometry instanceof GeometryCollection ? geometry.geometries.some(function (geometry) {
                    return bounds.containsGeometry(geometry);
                }) : bounds.containsGeometry(geometry)
            });
        }
    },

    /**
     * Determines whether or not the bounds contains the
     * position.
     *
     * @method
     * @param {Position} position - The position to test.
     * @returns {boolean}
     */
    containsPosition: {
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
     * Determines whether or not the bounds contains the
     * geometry.
     *
     * @method
     * @param {Geometry} geometry - The geometry to test.
     * @returns {boolean}
     */
    containsGeometry: {
        value: function (geometry) {
            return  geometry instanceof Point ?              this._containsPoint(geometry) :
                    geometry instanceof MultiPoint ?         this._containsMultiPoint(geometry) :
                    geometry instanceof LineString ?         this._containsLineString(geometry) :
                    geometry instanceof MultiLineString ?    this._containsMultiLineString(geometry) :
                    // type === "Polygon" ?            this._containsPolygon(geometry) :
                    // type === "MultiPolygon" ?       this._containsPolygon(geometry) :
                                                            false;
        }
    },

    _containsPoint: {
        value: function (point) {
            return this.containsPosition(point.coordinates);
        }
    },

    _containsMultiPoint: {
        value: function (geometry) {
            var self = this;
            return geometry.coordinates.some(function (position) {
                return self.containsPosition(position);
            });
        }
    },

    _containsLineString: {
        value: function (geometry) {
            var self = this;
            return geometry.coordinates.some(function (position) {
                return self.containsPosition(position);
            }) || geometry.intersects(this);
        }
    },

    _containsMultiLineString: {
        value: function (geometry) {
            var self = this,
                positions = this._flattenPositions(geometry.coordinates);
            return positions.some(function (position) {
                return self.containsPosition(position);
            }) || geometry.intersects(this);
        }
    },

    _flattenPositions: {
        value: function (coordinates) {
            var self = this;
            return coordinates.reduce(function (flat, toFlatten) {
                return flat.concat(Array.isArray(toFlatten) ? self._flattenPositions(toFlatten) : toFlatten);
            }, []);
        }
    }

}, {

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
    }

});
