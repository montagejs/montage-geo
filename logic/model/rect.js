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

var Rect = exports.Rect = function Icon() {
    this.identifier = IDENTIFIER_PREFIX;
    this.identifier += Uuid.generate().replace(DASH_REG_EX, "");
};

var Defaults = {
    height: 0,
    width: 0
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

    /**
     * The origin of the rectangle as measured from the top left hand corner
     * on the two-dimensional plane.
     * @type {Point2D}
     */
    origin: {
        configurable: true,
        writable: true,
        value: null
    },

    /**
     * The size of the rectangle.
     * @type {Size}
     */
    size: {
        configurable: true,
        writable: true,
        value: 0
    },
    
    /*****************************************************
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

}, {

    withOriginAndSize: {
        value: function (origin, size) {
            var rect = new this();
            rect.origin = origin;
            rect.size = size;
            return rect;
        }
    }

});
