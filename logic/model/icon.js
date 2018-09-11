var IDENTIFIER_PREFIX = "I",
    DASH_REG_EX = /-/g,
    Uuid = require("montage/core/uuid").Uuid;

/**
 *
 * An Icon object represents a set of drawing instructions for displaying a
 * placemark on a map.
 *
 * @class
 * @extends Object
 */

var Icon = exports.Icon = function Icon() {
    this.identifier = IDENTIFIER_PREFIX;
    this.identifier += Uuid.generate().replace(DASH_REG_EX, "");
};

exports.Icon.prototype = Object.create({}, /** @lends Icon.prototype */ {
    
    /**
     * The constructor function for all Icon instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Icon
    },
    
    /**************************************************************************
     * Properties
     */
    
    /**
     * The global identifier for this Icon.  Used during serialization to
     * uniquely identify icons.
     * @type {string}
     */
    identifier: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * Offset to be used when centering the icon's symbol.
     * @type {Point2D}
     */
    anchor: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * The dimensions used to display this icon.
     * @type {Size}
     */
    size: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * Offset to be used when centering the icon's symbol.
     * @type {string}
     */
    symbol: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Derived Properties
     */
    
    /**
     * The height of this Icon.
     * @type {Number}
     */
    height: {
        enumerable: true,
        get: function () {
            return this.size && this.size.height;
        }
    },
    
    /**
     * The width of this Icon.
     * @type {Number}
     */
    width: {
        enumerable: true,
        get: function () {
            return this.size && this.size.width;
        }
    },
    
    /**************************************************************************
     * Serialization
     */
    
    serializableProperties: {
        value: ["anchor", "size", "symbol"]
    },
    
    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("identifier", this.anchor);
            serializer.setProperty("anchor", this.anchor);
            serializer.setProperty("size", this.size);
            serializer.setProperty("symbol", this.symbol);
        }
    },
    
    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
            this.anchor = deserializer.getProperty("anchor");
            this.size = deserializer.getProperty("size");
            this.symbol = deserializer.getProperty("symbol");
        }
    },
    
    getInfoForObject: {
        value: function () {
            return this._montage_metadata;
        }
    }
    
});

Object.defineProperties(exports.Icon, /** @lends Icon **/ {
    
    /**
     * The canonical way of creating an Icon.
     * @param {string} - the dataUrl that symbolizes the Icon.
     * @param {Point2D} - the offset to be used when centering the icon's symbol.
     * @param {Size} - The dimensions used to display this icon.
     * @returns {Icon} - the newly created icon.
     */
    withSymbolAnchorAndSize: {
        value: function (symbol, anchor, size) {
            var icon = new this();
            icon.symbol = symbol;
            icon.anchor = anchor;
            icon.size = size;
            return icon;
        }
    }

});
