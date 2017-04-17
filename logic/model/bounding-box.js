var Montage = require("montage/core/core").Montage,
    LineString = require("logic/model/line-string").LineString;

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
    box: {
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
                    return otherSplit.xMax >= thisSplit.xMin &&
                        otherSplit.xMin <= thisSplit.xMax &&
                        otherSplit.yMax >= thisSplit.yMin &&
                        otherSplit.yMin <= thisSplit.yMax;
                });
            });
        }
    },

    /**
     * @todo [Charles]: The array of split bounds will be cached, but the cache
     * is not udpated or cleared if the bound values change. Either the cache
     * should be cleare on bound changes, or preferably bounds should be made
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

    toSegments: {
        value: function () {
        }
    },

    /**
     *
     * Determines whether or not the bounds intersects,
     * contains or is within the passed in feature.
     *
     * @method
     * @param {Feature}
     * @returns {boolean}
     */
    containsFeature: {
        value: function (feature) {
            var geometry = feature.geometry,
                type = geometry.type;
            return this.splitAlongAntimeridian().some(function (bounds) {
                return type === "GeometryCollection" ? geometry.geometries.some(function (geometry) {
                    return bounds._contains(geometry);
                }) : bounds._contains(geometry)
            });
        }
    },

    _contains: {
        value: function (geometry) {
            var type = geometry.type;
            return  type === "Point" ?              this._containsPoint(geometry) :
                    type === "MultiPoint" ?         this._containsMultiPoint(geometry) :
                    type === "LineString" ?         geometry.intersects(this.toSegments()) :
                    type === "MultiLineString" ?    geometry.intersects(this.toSegments()) :
                    type === "Polygon" ?            this._containsPolygon(geometry) :
                    type === "MultiPolygon" ?       this._containsPolygon(geometry) :
                                                    false;
        }
    },

    _containsPoint: {
        value: function (geometry) {
            return this._containsPosition(geometry.coordinates);
        }
    },

    _containsMultiPoint: {
        value: function (geometry) {
            var self = this;
            return geometry.coordinates.some(function (position) {
                return self._containsPosition(position);
            })
        }
    },

    _intersect: {
        value: function (geometry) {
            return this._containsLineStringPositions(geometry.coordinates);
        }
    },

    // _containsLineStringPositions: {
    //     value: function (positions) {
    //         var doesContain, extentPoints,
    //             point1, point2, point3, point4,
    //             i, length, j, a, b;
    //
    //         doesContain = geometry.coordinates.some(function (position) {
    //             return this._containsPosition(position);
    //         });
    //
    //         if (!doesContain) {
    //             extentPoints = [
    //                 [this.xMax, this.yMin],
    //                 [this.xMin, this.yMin],
    //                 [this.xMin, this.yMax],
    //                 [this.xMax, this.yMax]
    //             ];
    //             for (i = 0, length = positions.length, j = length - 1; i < length; j = i++) {
    //                 point3 = positions[i];
    //                 point4 = positions[j];
    //                 for (a = 0; a < 4; a += 1) {
    //                     b = a + 1;
    //                     if (b === 4) {
    //                         b = 0;
    //                     }
    //                     point1 = extentPoints[a];
    //                     point2 = extentPoints[b];
    //                     doesContain = Geometry.isInteresectingLines(
    //                         point1[0], point1[1],
    //                         point2[0], point2[1],
    //                         point3[0], point3[1],
    //                         point4[0], point4[1]
    //                     );
    //                 }
    //             }
    //         }
    //         return doesContain;
    //
    //     }
    // },

    _containsMultiLineString: {
        value: function (geometry) {
            var self = this;
            return geometry.coordinates.some(function (positions) {
                return self._containsLineStringPositions(positions);
            });
        }
    },

    _containsPolygon: {
        value: function (geometry) {

        }
    },

    _containsPosition: {
        value: function (position) {
            var longitude = position.longitude,
                latitude = position.latitude;
            return  longitude <= this.xMax &&
                    longitude >= this.xMin &&
                    latitude <= this.yMax &&
                    latitude >= this.yMin;
        }
    }

});
