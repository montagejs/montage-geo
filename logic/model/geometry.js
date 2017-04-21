var Montage = require("montage/core/core").Montage,
    HALF_PI = Math.PI / 180.0;

/**
 *
 * A Geometry object represents points, curves, and surfaces in
 * coordinate space.
 *
 * @class
 * @extends external:Montage
 */
exports.Geometry = Montage.specialize(/** @lends Geometry.prototype */ {

    constructor: {
        value: function Geometry() {
            this.addPathChangeListener("coordinates", this, "coordinatesDidChange");
        }
    },

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
     * Subclasses should override this method to return a
     * geometry appropriate implementation
     *
     * @type {array<number>}
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
     * The points, curves and surfaces that describe this geometry.
     * @type {Position|array<Position>|array<array<Position>>}
     */
    coordinates: {
        value: undefined
    },

    intersectsBbox: {
        value: function (bbox) {
            var intersects = false,
                myBbox = this.bbox;
            if (Array.isArray(bbox) && Array.isArray(myBbox) &&
                myBbox.length === 4 && bbox.length === 4) {
                intersects = bbox[2] >= myBbox[0] &&
                             bbox[0] <= myBbox[2] &&
                             bbox[3] >= myBbox[1] &&
                             bbox[1] <= myBbox[3]
            }
            return intersects;
        }
    },

    handleRangeChange: {
        value: function (plus, minus) {
            var self = this,
                recalculate = minus.some(this.isPositionOnBoundary.bind(this));

            if (recalculate) {
                this._recalculateBbox();
            } else {
                plus.forEach(function (position) {
                    self._extend(position);
                });
            }
        }
    },

    coordinatesDidChange: {
        value: function () {}
    },

    isPositionOnBoundary: {
        value: function (position) {
            var box = this.bbox,
                lng = position.longitude,
                lat = position.latitude;
            return  box[0] === lng || box[2] === lng ||
                    box[1] === lat || box[3] === lat;
        }
    },

    /**
     *
     * Subclasses should override this function to implement their
     * bbox calculation strategy
     *
     * @method
     * @returns {bbox} bbox
     */
    _recalculateBbox: {
        value: function () {
            var positions = this.bboxPositions || [],
                minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            positions.forEach(function (position) {
                var lng = position.longitude,
                    lat = position.latitude;
                if (minX > lng) minX = lng;
                if (maxX < lng) maxX = lng;
                if (minY > lat) minY = lat;
                if (maxY < lat) maxY = lat;
            });
            this.bbox.splice(0, 4, minX, minY, maxX, maxY);
        }
    },

    bboxPositions: {
        value: undefined
    },

    _extend: {
        value: function (position) {
            var bbox = this.bbox,
                lng = position.longitude,
                lat = position.latitude;
            if (bbox[0] > lng) bbox[0] = lng;
            else if (bbox[2] < lng) bbox[2] = lng;
            if (bbox[1] > lat) bbox[1] = lat;
            else if (bbox[3] < lat) bbox[3] = lat;
        }
    }

}, {

    /**
     * Converts a value in degrees to radians
     * @method
     * @param {number} degrees
     * @returns {number} radians
     */
    toRadians: {
        value: function (degrees) {
            return degrees * HALF_PI;
        }
    },

    /**
     * Converts a value in radians to degrees
     * @method
     * @param {number} radians
     * @returns {number} degrees
     */
    toDegrees: {
        value: function (radians) {
            return radians * 57.29577951308233; // 180 divided by PI;
        }
    },

    /**
     * Returns a newly initialized geometry with the specified coordinates.
     * The default implementation returns null.  Subclasses should override
     * this method to provide their initialization logic.
     *
     * @method
     * @param {array} coordinates       - The coordinates of this geometry.
     * @return null
     */
    withCoordinates: {
        value: function (coordinates) {
            return null;
        }
    }

});
