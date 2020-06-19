var Montage = require("montage/core/core").Montage,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Uuid = require("montage/core/uuid").Uuid,
    DASH_REG_EX = /-/g,
    IDENTIFIER_PREFIX = "G",
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

    /*****************************************************
     * Properties
     */

    /**
     * The global identifier for this Geometry.  Used during serialization to
     * uniquely identify objects.
     *
     * @type {string}
     */
    identifier: {
        get: function () {
            if (!this._identifier) {
                this._identifier = IDENTIFIER_PREFIX;
                this._identifier += Uuid.generate().replace(DASH_REG_EX, "");
            }
            return this._identifier;
        }
    },

    /**
     * The envelope for this Geometry.  This function should be overriden by
     * subclasses.
     * @type {BoundingBox}
     */
    bounds: {
        value: function () {
            return undefined;
        }
    },

    /**
     * The points, curves and surfaces that describe this geometry.
     * @type {Position|array<Position>|array<array<Position>>}
     */
    coordinates: {
        value: undefined
    },

    /**************************************************************************
     * Serialization
     */

    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("identifier", this.identifier);
            serializer.setProperty("coordinates", this.coordinates);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
            this.coordinates = deserializer.getProperty("coordinates");
        }
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

    /**
     * Returns a copy of this geometry.
     *
     * @method
     * @returns {Geometry}
     */
    clone: {
        value: function () {}
    },

    toGeoJSON: {
        value: function () {}
    },
    forEach: {
        value: function (callback /*, thisp*/) {

            var thisp = arguments[1]
                coordinates = this.coordinates;

            for(var i=0, countI = coordinates.length;(i < countI); i++) {
                coordinates[i].forEach(callback,thisp);
            }
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
