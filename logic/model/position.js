var HALF_PI = Math.PI / 180.0,
    Position,
    Uuid = require("montage/core/uuid").Uuid,
    DASH_REG_EX = /-/g,
    IDENTIFIER_PREFIX = "P";


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
Position = exports.Position = function Position() {
};


Position.precision = 5;

var Defaults = {
    longitude: 0,
    latitude: 0,
    altitude: undefined,
    measure: undefined
};

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
     * The global identifier for this Position.  Used during serialization to
     * uniquely identify objects.
     *
     * @type {string}
     */
    identifier: {
        enumerable: true,
        get: function () {
            if (!this._identifier) {
                this._identifier = IDENTIFIER_PREFIX;
                this._identifier += Uuid.generate().replace(DASH_REG_EX, "");
            }
            return this._identifier;
        }
    },

    /**
     * The position's altitude.
     * @type {number}
     */
    altitude: {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined
    },

    _latitude: {
        writable: true,
        value: 0
    },

    /**
     * The position's latitude.
     * @type {number}
     */
    latitude: {
        configurable: true,
        enumerable: true,
        get: function () {
            return this._latitude;
        },
        set: function (value) {
            this._latitude = this._round(value, Position.precision);
        }
    },

    _longitude: {
        writable: true,
        value: 0
    },

    /**
     * The position's longitude.
     * @type {number}
     */
    longitude: {
        configurable: true,
        enumerable: true,
        get: function () {
            return this._longitude;
        },
        set: function (value) {
            this._longitude = this._round(value, Position.precision);
        }
    },

    /**
     * A measure at position's longitude, latitude, altitude.
     * Added to support WKT capabilities
     * @type {number}
     */
    measure: {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined
    },

    equals: {
        value: function (other) {
            return  this.altitude === other.altitude &&
                    this.longitude === other.longitude &&
                    this.latitude === other.latitude &&
                    this.measure === other.measure;
        }
    },

    _round: {
        value: function (value) {
            return Number(value.toFixed(Position.precision));
        }
    },

    /*****************************************************
     * Serialization
     */

    serializableProperties: {
        value: ["altitude", "latitude", "longitude", "measure"]
    },

    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("identifier", this.identifier);
            this._setPropertyWithDefaults(serializer, "longitude", this.longitude);
            this._setPropertyWithDefaults(serializer, "latitude", this.latitude);
            this._setPropertyWithDefaults(serializer, "altitude", this.altitude);
            this._setPropertyWithDefaults(serializer, "measure", this.measure);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
            this.longitude = this._getPropertyWithDefaults(deserializer, "longitude");
            this.latitude = this._getPropertyWithDefaults(deserializer, "latitude");
            this.altitude = this._getPropertyWithDefaults(deserializer, "altitude");
            this.measure = this._getPropertyWithDefaults(deserializer, "measure");
        }
    },

    getInfoForObject: {
        value: function () {
            return this._montage_metadata;
        }
    },

    _montage_metadata: {
        enumerable: false,
        writable: true,
        value: undefined
    },

    _setPropertyWithDefaults: {
        value:function (serializer, propertyName, value) {
            if (value !== Defaults[propertyName]) {
                serializer.setProperty(propertyName, value);
            }
        }
    },

    _getPropertyWithDefaults: {
        value:function (deserializer, propertyName) {
            var value = deserializer.getProperty(propertyName);
            return value === 0 || value ? value : Defaults[propertyName];
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

            lambdaTwo = parseFloat(lambdaTwo.toFixed(Position.precision));
            thetaTwo = parseFloat(thetaTwo.toFixed(Position.precision));

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

    /**
     * Vincenty direct calculation.
     * https://github.com/chrisveness/geodesy/blob/master/latlon-vincenty.js
     * @private
     * @param   {number} distance - Distance along bearing in meters.
     * @param   {number} initialBearing - Initial bearing in degrees from north.
     * @returns (Position} the final position.
     * @throws  {Error}  If formula failed to converge.
     */
    vincentyDirect: {
        value: function (distance, initialBearing, datum) {
            datum = datum || exports.Position.DATUM;

            var φ1 = exports.Position.toRadians(this.latitude),
                λ1 = exports.Position.toRadians(this.longitude),
                α1 = exports.Position.toRadians(initialBearing),
                s = distance;

            var a = datum.ellipsoid.a, b = datum.ellipsoid.b, f = datum.ellipsoid.f;

            var sinα1 = Math.sin(α1);
            var cosα1 = Math.cos(α1);

            var tanU1 = (1 - f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
            var σ1 = Math.atan2(tanU1, cosα1);
            var sinα = cosU1 * sinα1;
            var cosSqα = 1 - sinα * sinα;
            var uSq = cosSqα * (a * a - b * b) / (b * b);
            var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
            var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

            var cos2σM, sinσ, cosσ, Δσ;

            var σ = s / (b * A), σʹ, iterations = 0;
            do {
                cos2σM = Math.cos(2 * σ1 + σ);
                sinσ = Math.sin(σ);
                cosσ = Math.cos(σ);
                Δσ = B * sinσ * (cos2σM + B / 4 * (cosσ * (-1 + 2 * cos2σM * cos2σM) -
                    B / 6 * cos2σM * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σM * cos2σM)));
                σʹ = σ;
                σ = s / (b * A) + Δσ;
            } while (Math.abs(σ - σʹ) > 1e-12 && ++iterations < 200);
            if (iterations >= 200) throw new Error('Formula failed to converge'); // not possible?

            var x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
            var φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
            var λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
            var C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
            var L = λ - (1 - C) * f * sinα *
                (σ + C * sinσ * (cos2σM + C * cosσ * (-1 + 2 * cos2σM * cos2σM)));
            //var λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180
            var λ2 = (λ1 + L); // do not normalize
            var α2 = Math.atan2(sinα, -x);
            α2 = (α2 + 2 * Math.PI) % (2 * Math.PI); // normalise to 0...360

            return exports.Position.withCoordinates(
                this._normalizeLongitude(exports.Position.toDegrees(λ2)), exports.Position.toDegrees(φ2)
            );
        }
    },

    _normalizeLongitude: {
        value: function (longitude) {
            return  longitude > 180 ? ((longitude + 180) % 360) - 180 :
                    longitude < -180 ? ((longitude - 180) % 360) + 180 :
                    longitude;
        }
    },

    clone: {
        value: function () {
            return exports.Position.withCoordinates(this.longitude, this.latitude, this.altitude);
        }
    },

    forEach: {
        value: function (callback /*, thisp*/) {
            var thisp = arguments[1];
            callback.call(thisp, this.longitude);
            callback.call(thisp, this.latitude);

            //We don't include values that't aren't defined.
            //So the a resultinf array wouldn't have a "hole" with an undefined value
            //in a XYM layout for example.
            if(this.hasOwnProperty("altitude")) {
                callback.call(thisp, this.altitude);
            }
            if(this.measure) {
                callback.call(thisp, this.measure);
            }
        }
    }

});

Object.defineProperties(exports.Position, /** @lends Position */ {

    Projection: {
        get: function () {
            return require("logic/model/projection").Projection;
        }
    },

    EARTH_RADIUS: {
        value: 6371e3
    },

    DATUM: {
        value: {
            ellipsoid: {
                a: 6378137,
                b: 6356752.31425,
                f: 1 / 298.257223563
            }
        }
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
            var Projection = exports.Position.Projection,
                length = arguments.length, args, self, projected, last;
            if (length && Array.isArray((args = arguments[0]))) {
                if (arguments.length === 2 && arguments[1] !== undefined) {
                    args = args.slice();
                    args.push(arguments[1]);
                }
                return exports.Position.withCoordinates.apply(this, args);
            }
            self = new exports.Position();
            last = arguments[arguments.length - 1];
            if (last instanceof Projection) {
                if (length > 1) {
                    projected = last.inverseProjectPoint([arguments[0], arguments[1]]);
                    self.longitude = projected[0];
                    self.latitude = projected[1];
                    if (arguments[2] !== last && arguments[2]) {
                        self.altitude = arguments[2];
                    }
                    if (arguments[3] !== last && arguments[3]) {
                        self.measure = arguments[3];
                    }

                }
            } else {
                if (length > 0) self.longitude = arguments[0];
                if (length > 1) self.latitude = arguments[1];
                if (length > 2) self.altitude = arguments[2];
            }
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
