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

    equals: {
        value: function (other) {
            return  this.altitude === other.altitude &&
                    this.longitude === other.longitude &&
                    this.latitude === other.latitude
        }
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
     * Returns the destination position having travelled the given distance along a geodesic
     * path given by initial bearing from ‘this’ position, using Vincenty direct solution.
     *
     * @param   {number} distance - Distance travelled along the geodesic in meters.
     * @param   {number} initialBearing - Initial bearing in degrees from north.
     * @returns {Position} Destination position.
     *
     * @example
     *   var p1 = Position.withCoordinates(144.42487, -37.95103);
     *   var p2 = p1.destination(54972.271, 306.86816);
     */
    destination: {
        value: function (distance, bearing) {
            var delta = Number(distance) / exports.Position.EARTH_RADIUS,
                theta = exports.Position.toRadians(Number(bearing)),
                thetaOne = exports.Position.toRadians(this.latitude),
                lambdaOne = exports.Position.toRadians(this.longitude),
                thetaTwo =  Math.asin(Math.sin(thetaOne) * Math.cos(delta) +
                    Math.cos(thetaOne) * Math.sin(delta) * Math.cos(theta)),
                lambdaTwo = lambdaOne + Math.atan2(
                        Math.sin(theta) * Math.sin(delta) * Math.cos(thetaOne),
                        Math.cos(delta) - Math.sin(thetaOne) * Math.sin(thetaTwo)
                    );

            lambdaTwo = (lambdaTwo + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
            lambdaTwo = exports.Position.toDegrees(lambdaTwo);
            thetaTwo = exports.Position.toDegrees(thetaTwo);

            return exports.Position.withCoordinates(lambdaTwo, thetaTwo);
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
            var earthRadius = exports.Position.EARTH_RADIUS,
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
    },

    /**
     * Returns the midpoint between 'this' position and the supplied position.
     *
     * @param   {Position} destination point.
     * @returns {Position} Midpoint between this position and the supplied position.
     *
     * @example
     *     var p1 = Position.withCoordinates(0.119, 52.205),
     *         p2 = Position.withCoordinates(2.351, 48.857);
     *     var mid = p1.midpointTo(p2);
     */
    midPointTo: {
        value: function (destination) {

            var Position = exports.Position,
                φ1 = Position.toRadians(this.latitude),
                λ1 = Position.toRadians(this.longitude),
                φ2 = Position.toRadians(destination.latitude),
                Δλ = Position.toRadians(destination.longitude - this.longitude),
                Bx = Math.cos(φ2) * Math.cos(Δλ),
                By = Math.cos(φ2) * Math.sin(Δλ),
                φ3 = Math.atan2(Math.sin(φ1) + Math.sin(φ2), Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)),
                λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

            λ3 = (λ3 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°
            return Position.withCoordinates(Position.toDegrees(λ3), Position.toDegrees(φ3));
        }
    },

    toArray: {
        value: function () {
            return [this.longitude, this.latitude];
        }
    }

});

Object.defineProperties(exports.Position, /** @lends Position */ {

    EARTH_RADIUS: {
        value: 6371e3
    },

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
