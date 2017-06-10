var Montage = require("montage/core/core").Montage,
    Geohash = require("./geohash").Geohash,
    Set = require("collections/set");

var PRECISION_SCALE = [
    0.70924, 22.7529, 729.62, 23409, 744200, 23912100,
    762450000, 24336000000, 781250000000, 25000000000000
];

/**
 *
 * An array of
 *
 * @class
 * @extends external:Montage
 */
exports.GeohashCollection = Montage.specialize(/** @lends GeohashCollection.prototype */ {

    constructor: {
        value: function GeometryCollection(bounds) {
            this._hashes = new Set();
            this._bounds = bounds;
            this.addPathChangeListener("bounds.xMin", this, "boundsDidChange");
            this.addPathChangeListener("bounds.yMin", this, "boundsDidChange");
            this.addPathChangeListener("bounds.xMax", this, "boundsDidChange");
            this.addPathChangeListener("bounds.yMax", this, "boundsDidChange");
            this._hashes.addRangeChangeListener(this);
        }
    },

    /************************************************************
     * Properties
     */

    /**
     * The bounds that encompasses this collection set.  A GeohashCollection's
     * bounds' properties can be edited but the bounds itself cannot be set.
     * @type Bounds
     */
    bounds: {
        get: function () {
            return this._bounds;
        }
    },

    /**
     * The hashes in this collection.
     * @readonly
     * @type {Set}
     */
    hashes: {
        get: function () {
            return this._hashes;
        }
    },

    /************************************************************
     * Encoding/Decoding
     */

    precision: {
        get: function () {
            var area = this.bounds.area,
                precision = -1,
                i, n;
            for (i = 0, n = PRECISION_SCALE.length; i < n && precision < 0; i += 1) {
                if (PRECISION_SCALE[i] > area) {
                    precision = i;
                }
            }
            return precision === -1 ? 1 : PRECISION_SCALE.length - precision;
        }
    },

    /************************************************************
     * Observers
     */

    boundsDidChange: {
        value: function () {

            var currentSet = new Set(),
                xMin = this.bounds.xMin,
                yMin = this.bounds.yMin,
                xMax = this.bounds.xMax,
                yMax = this.bounds.yMax,
                precision = this.precision,
                southWest = Geohash.withCoordinatesAndPrecision(xMin, yMin, precision),
                northWest = Geohash.withCoordinatesAndPrecision(xMin, yMax, precision),
                northEast = Geohash.withCoordinatesAndPrecision(xMax, yMax, precision),
                head = southWest,
                latCount = 1,
                lngCount = 1,
                direction, i, j,
                self = this;

            while (head.identifier.length === northWest.identifier.length && head.identifier !== northWest.identifier) {
                latCount += 1;
                head = head.adjacent("N");
            }

            while (head.identifier.length === northEast.identifier.length && head.identifier !== northEast.identifier) {
                lngCount += 1;
                head = head.adjacent("E");
            }

            for (i = 0; i < latCount; i += 1) {
                for (j = 0; j < lngCount; j += 1) {
                    currentSet.add(head);
                    direction = i % 2 ? "E" : "W";
                    if (j + 1 < lngCount) {
                        head = head.adjacent(direction);
                    }
                }
                head = head.adjacent("S");
            }

            this.hashes.forEach(function (hash) {
                if (!currentSet.has(hash)) {
                    self.hashes.delete(hash);
                }
            });

            currentSet.forEach(function (hash) {
                if (!self.hashes.has(hash)) {
                    self.hashes.add(hash);
                }
            });

        }
    }

}, {

    /**
     * Returns an array of Geohashes for the provided bounds.  The precision of the
     * geohashes is determined by the area of the bounds.  The larger the bounds the
     */
    withBoundingBox: {
        value: function (bounds) {
            return new this(bounds);
        }
    }

});
