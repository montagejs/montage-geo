var Montage = require("montage/core/core").Montage;

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
    }

});
