var Montage = require("montage/core/core").Montage;

/**
 *
 * A position represents a physical location on the Earth.
 *
 * @class
 * @extends external:Montage
 */
exports.Position = Montage.specialize(/** @lends Montage.prototype */ {

    /**
     * The position's altitude.
     * @type {number}
     */
    altitude: {
        value: 0
    },

    /**
     * The position's latitude.
     * @type {number}
     */
    latitude: {
        value: 0
    },

    /**
     * The position's longitude.
     * @type {number}
     */
    longitude: {
        value: 0
    }

}, {

    /**
     * Returns a newly initialized point with the specified coordinates.
     *
     * @param {number?|array?} longitude/coordinates    - Either the longitude of this position or an
     *                                                    array of coordinates.  If no arguments are passed
     *                                                    then the position defaults to 0 degrees long-
     *                                                    itude, 0 degrees latitude and 0 meters altitude.
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
            self = new this();
            if (length > 0) self.longitude = arguments[0];
            if (length > 1) self.latitude = arguments[1];
            if (length > 2) self.altitude = arguments[2];
            return self;
        }
    }

});
