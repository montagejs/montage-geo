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
var Geometry = exports.Geometry = Montage.specialize(/** @lends Geometry.prototype */ {

    /**
     * The points, curves and surfaces that describe this geometry.
     * @type {Position|array<Position>|array<array<Position>>}
     */
    coordinates: {
        value: undefined
    }

}, {

    isInteresectingLines: {
        value: function (x1, y1, x2, y2, x3, y3, x4, y4) {
            return Geometry.orientation(x1, y1, x3, y3, x4, y4) !== Geometry.orientation(x2, y2, x3, y3, x4, y4) &&
                Geometry.orientation(x1, y1, x2, y2, x3, y3) !== Geometry.orientation(x1, y1, x2, y2, x4, y4);
        }
    },

    orientation: {
        value: function (tx1, ty1, tx2, ty2, tx3, ty3) {
            var clockWise = ((ty3 - ty1) * (tx2 - tx1)) - ((ty2 - ty1) * (tx3 - tx1));
            return clockWise > 0 ? true : clockWise < 0 ? false : true;
        }
    },

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
