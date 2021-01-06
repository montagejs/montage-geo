var IDENTIFIER_PREFIX = "R",
    DASH_REG_EX = /-/g,
    Uuid = require("montage/core/uuid").Uuid;

/**
 *
 * A Rect object represents a rectangle on a two dimensional plane.
 *
 * @class
 * @extends Object
 */

var Rect = exports.Rect = function Rect() {
};

exports.Rect.prototype = Object.create({}, /** @lends Rect.prototype */ {

    /**
     * The constructor function for all Rect instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Rect
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The global identifier for this Rect.  Used during serialization to
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
     * The origin of the rectangle as measured from the top left hand corner
     * on the two-dimensional plane.
     * @type {Point2D}
     */
    origin: {
        configurable: false,
        writable: true,
        value: undefined
    },

    /**
     * The size of the rectangle.
     * @type {Size}
     */
    size: {
        configurable: false,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Derived Properties
     */

    /**
     * The height of this Rect.
     * @type {Number}
     */
    height: {
        configurable: false,
        get: function () {
            return this.size && this.size.height || 0;
        }
    },

    /**
     * The width of this Rect.
     * @type {Number}
     */
    width: {
        configurable: false,
        get: function () {
            return this.size && this.size.width;
        }
    },

    /**
     * Returns the smallest value for the rectangle on the x coordinate system.
     * @type {Number}
     */
    xMin: {
        configurable: false,
        get: function () {
            return this.origin && this.origin.x;
        }
    },

    /**
     * Returns the center of the rectangle on the x coordinate system.
     * @type {Number}
     */
    xMid: {
        configurable: false,
        get: function () {
            return !isNaN(this.xMin) && !isNaN(this.width) && (this.xMin + this.width / 2);
        }
    },

    /**
     * Returns the largest value for the rectangle on the x coordinate system.
     * @type {Number}
     */
    xMax: {
        configurable: false,
        get: function () {
            return !isNaN(this.xMin) && !isNaN(this.width) && (this.xMin + this.width);
        }
    },

    /**
     * Returns the smallest value for the rectangle on the y coordinate system.
     * @type {Number}
     */
    yMin: {
        configurable: false,
        get: function () {
            return !isNaN(this.yMax) && !isNaN(this.height) && (this.yMax - this.height);
        }
    },

    /**
     * Returns the center of the rectangle on the y coordinate system.
     * @type {Number}
     */
    yMid: {
        configurable: false,
        get: function () {
            return !isNaN(this.yMax) && !isNaN(this.height) && (this.yMax - this.height / 2);
        }
    },

    /**
     * Returns the largest value for the rectangle on the y coordinate system.
     * @type {Number}
     */
    yMax: {
        configurable: false,
        get: function () {
            return this.origin && this.origin.y;
        }
    },

    /**************************************************************************
     * API
     */

    /**
     * Returns a copy of this rect.
     * @returns {Rect}
     */
    clone: {
        value: function () {
            var origin = this.origin.clone(),
                size = this.size.clone();
            return exports.Rect.withOriginAndSize(origin, size);
        }
    },

    /**
     * Tests whether this rect's origin and size equals the provided one.
     * @param {Rect} - the rect to test for equality.
     * @returns {boolean}
     */
    equals: {
        value: function (other) {
            return this.origin.equals(other.origin) && this.size.equals(other.size);
        }
    },

    /**************************************************************************
     * Serialization
     */

    serializableProperties: {
        value: ["origin", "size"]
    },

    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("identifier", this.identifier);
            serializer.setProperty("origin", this.origin);
            serializer.setProperty("size", this.size);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
            this.origin = deserializer.getProperty("origin");
            this.size = deserializer.getProperty("size");
        }
    },

    getInfoForObject: {
        value: function () {
            return this._montage_metadata;
        }
    }

});


Object.defineProperties(exports.Rect, /** @lends Rect */ {

    /**
     * The canonical way of creating a rect.
     * @param {Point2D} - the origin
     * @param {Point2D} - the size
     * @returns {Rect} - a newly created Rect.
     */
    withOriginAndSize: {
        value: function (origin, size) {
            var rect = new this();
            rect.origin = origin;
            rect.size = size;
            return rect;
        }
    }

});
