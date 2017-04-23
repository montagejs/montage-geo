var HALF_PI = Math.PI / 180.0;

/**
 *
 * A position represents a physical location on the Earth.
 *
 * Position is a JavaScript Object subclass rather than a Montage subclass
 * so positions can be as lightweight as possible: They need to be
 * lightweight because many will be created and there's no benefit for them
 * to be derived from the Montage prototype because they don't use any of the
 * Montage class functionality.
 *
 * @class
 * @extends Object
 */
exports.Position = function () {};

exports.Position.prototype = Object.create({}, /** @lends Position.prototype */ {

    /**
     * The constructor function for all Position instances.
     *
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Position
    },

    /**
     * The position's altitude.
     * @type {number}
     */
    altitude: {
        configurable: true,
        writable: true,
        value: 0
    },

    /**
     * The position's latitude.
     * @type {number}
     */
    latitude: {
        configurable: true,
        writable: true,
        value: 0
    },

    /**
     * The position's longitude.
     * @type {number}
     */
    longitude: {
        configurable: true,
        writable: true,
        value: 0
    },

    /*****************************************************
     * Measurement
     */

    /**
     * Returns the bearing from this Position to the provided
     * Position.
     *
     * @method
     * @param {Position}
     * @returns {number}
     */
    bearing: {
        value: function (destination) {
            var thetaOne = exports.Position.toRadians(this.latitude),
                thetaTwo = exports.Position.toRadians(destination.latitude),
                deltaLambda = exports.Position.toRadians(destination.longitude - this.longitude),
                y = Math.sin(deltaLambda) * Math.cos(thetaTwo),
                x = Math.cos(thetaOne) * Math.sin(thetaTwo) - Math.sin(thetaOne) *
                    Math.cos(thetaTwo) * Math.cos(deltaLambda),
                theta = Math.atan2(y, x);

            return (exports.Position.toDegrees(theta) + 360) % 360;
        }
    },

    /**
     * Calculates the distance between two Position.

     * @see http://www.movable-type.co.uk/scripts/latlong.html
     *
     * @param {Point} point - the destination.
     * @return {number} The distance between the two Position in meters.
     s     */
    distance: {
        value: function (position) {
            var earthRadius = 6371000,
                lng = this.longitude,
                lat = this.latitude,
                lng2 = position.longitude,
                lat2 = position.latitude,
                thetaOne = exports.Position.toRadians(lat),
                thetaTwo = exports.Position.toRadians(lat2),
                deltaTheta = exports.Position.toRadians(lat2 - lat),
                deltaLambda = exports.Position.toRadians(lng2 - lng),
                a = Math.sin(deltaTheta / 2) * Math.sin(deltaTheta / 2) +
                    Math.cos(thetaOne) * Math.cos(thetaTwo) *
                    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2),
                c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return earthRadius * c;

        }
    }

});

Object.defineProperties(exports.Position, /** @lends Position */ {

    /**
     * Returns a newly initialized point with the specified coordinates.
     *
     * @param {number?|array?} longitude/coordinates    - Either the longitude of this position or an
     *                                                    array of coordinates.  If no arguments are passed
     *                                                    then the position defaults to 0 degrees longitude,
     *                                                    0 degrees latitude and 0 meters altitude.
     * @param {number?} latitude                        - The latitude of the position.  If no value is
     *                                                    provided the latitude is set to 0.
     * @param {number?} altitude                        - The altitude of the position in meters.  If no
     *                                                    value is provided the altitude is set to 0.
     *
     */
    withCoordinates: {
        value: function () {
            var length = arguments.length, self;
            if (length && Array.isArray(arguments[0])) {
                return exports.Position.withCoordinates.apply(this, (arguments[0]));
            }
            self = new exports.Position();
            if (length > 0) self.longitude = arguments[0];
            if (length > 1) self.latitude = arguments[1];
            if (length > 2) self.altitude = arguments[2];
            return self;
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
    }

});
