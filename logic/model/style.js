var IDENTIFIER_PREFIX = "S",
    DASH_REG_EX = /-/g,
    Uuid = require("montage/core/uuid").Uuid;

/**
 *
 * A Style object represents a set of drawing instructions for displaying geometry on a map.
 *
 * @class
 * @extends Object
 */

var Style = exports.Style = function Style() {
    this.identifier = IDENTIFIER_PREFIX;
    this.identifier += Uuid.generate().replace(DASH_REG_EX, "");
};

exports.Style.prototype = Object.create({}, /** @lends Style.prototype */ {
    
    /**
     * The constructor function for all Style instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Style
    },
    
    /**
     * The global identifier for this Style.  Used during serialization to
     * uniquely identify objects.
     * @type {string}
     */
    identifier: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * The color to use to fill in polygons.  The value must conform to the
     * RGBA specification.
     * @type {string}
     */
    fillColor: {
        enumerable: true,
        writable: true,
        value: "rgba(0, 0, 0, 0)"
    },
    
    /**
     * The opacity of a polygon's fill.
     * @type {number}
     */
    fillOpacity: {
        enumerable: true,
        writable: true,
        value: 1
    },
    
    /**
     * An object that defines the drawing instructions a place mark.
     * @type {Icon}
     */
    icon: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The color to use for the stroke of lines and polygons.  The value must
     * conform to the RGBA specification.
     * @type {string}
     */
    strokeColor: {
        enumerable: true,
        writable: true,
        value: "rgba(0, 0, 0, 0)"
    },
    
    /**
     * The opacity of the stroke of a polygon or line.
     * @type {number}
     */
    strokeOpacity: {
        enumerable: true,
        writable: true,
        value: 1
    },

    /**
     * The thickness of the stroke of a polygon or line.
     * @type {number}
     */
    strokeWeight: {
        enumerable: true,
        writable: true,
        value: 1
    },
    
    /*****************************************************
     * Serialization
     */
    
    serializableProperties: {
        value: ["fillColor", "fillOpacity", "strokeColor", "strokeOpacity", "strokeWeight"]
    },
    
    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("identifier", this.identifier);
            serializer.setProperty("icon", this.icon);
            this._setPropertyWithDefaults(serializer, "fillColor", this.fillColor);
            this._setPropertyWithDefaults(serializer, "fillOpacity", this.fillOpacity);
            this._setPropertyWithDefaults(serializer, "strokeColor", this.strokeColor);
            this._setPropertyWithDefaults(serializer, "strokeOpacity", this.strokeOpacity);
            this._setPropertyWithDefaults(serializer, "strokeWeight", this.strokeWeight);
        }
    },
    
    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
            this.icon = deserializer.getProperty("icon");
            this.fillColor = this._getPropertyWithDefaults(deserializer, "fillColor");
            this.fillOpacity = this._getPropertyWithDefaults(deserializer, "fillOpacity");
            this.strokeColor = this._getPropertyWithDefaults(deserializer, "strokeColor");
            this.strokeOpacity = this._getPropertyWithDefaults(deserializer, "strokeOpacity");
            this.strokeWeight = this._getPropertyWithDefaults(deserializer, "strokeWeight");
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

var Defaults = {
    fillColor: "rgba(0, 0, 0, 0)",
    fillOpacity: 1,
    strokeColor: "rgba(0, 0, 0, 0)",
    strokeOpacity: 1,
    strokeWeight: 1
};

Object.defineProperties(exports.Style, /** @lends Style.prototype */ {
    
    withValues: {
        value: function () {
        
        }
    }
    
});
