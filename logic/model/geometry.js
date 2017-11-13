var Montage = require("montage/core/core").Montage,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
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
            // this.addPathChangeListener("coordinates", this, "coordinatesDidChange");
        }
    },

    bounds: {
        value: function () {
            return BoundingBox.withCoordinates(Infinity, Infinity, -Infinity, -Infinity);
        }
    },

    /**
     * The points, curves and surfaces that describe this geometry.
     * @type {Position|array<Position>|array<array<Position>>}
     */
    coordinates: {
        value: undefined
    },
    
    /**
     * Tests whether this geometry intersects the provided
     * geometry.
     *
     * Subclasses should override this method to implement their
     * intersection testing logic.
     *
     * @method
     * @param {Geometry|Bounds}
     * @returns boolean
     */
    intersects: {
        value: function (geometry) {}
    },

    toGeoJSON: {
        value: function () {}
    },

    _rangeChangeCanceler: {
        value: undefined
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
