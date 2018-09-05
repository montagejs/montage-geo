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
     * The height of the rectangle.
     * @type {number}
     */
    height: {
        configurable: true,
        writable: true,
        value: 0
    },
    
    /**
     * The width of the rectangle.
     * @type {number}
     */
    width: {
        configurable: true,
        writable: true,
        value: 0
    },
    
    /*****************************************************
     * Serialization
     */
    
    serializableProperties: {
        value: ["height", "width"]
    },
    
    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("identifier", this.identifier);
            this._setPropertyWithDefaults(serializer, "height", this.height);
            this._setPropertyWithDefaults(serializer, "width", this.width);
        }
    },
    
    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
            this.height = this._getPropertyWithDefaults(deserializer, "height");
            this.width = this._getPropertyWithDefaults(deserializer, "width");
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
            if (value != Defaults[propertyName]) {
                serializer.setProperty(propertyName, value);
            }
        }
    },
    
    _getPropertyWithDefaults: {
        value:function (deserializer, propertyName) {
            return deserializer.getProperty(propertyName) || Defaults[propertyName];
        }
    }

});
