var IDENTIFIER_PREFIX = "S",
    DASH_REG_EX = /-/g,
    Uuid = require("montage/core/uuid").Uuid;

/**
 *
 * A Size object represents a structure that has a height and a width.
 *
 * @class
 * @extends Object
 */

var Size = exports.Size = function Size() {
};

var Defaults = {
    height: 0,
    width: 0
};

exports.Size.prototype = Object.create({}, /** @lends Size.prototype */ {

    /**
     * The constructor function for all Size instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Size
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The global identifier for this Size.  Used during serialization to
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

    /**************************************************************************
     * API
     */

    /**
     * Returns a new suze that multiplies the provided factor with height and
     * width of this size.
     * @public
     * @method
     * @param {number} factor
     * @type {Size} size
     */
    multiply: {
        value: function (number) {
            var size = this.clone();
            size.width *= number;
            size.height *= number;
            return size;
        }
    },

    /**
     * Returns a new Size that divides the provided factor into height and
     * width of this Size.
     * @public
     * @method
     * @param {number} factor
     * @type {Size} size
     */
    divide: {
        value: function (number) {
            var size = this.clone();
            size.width /= number;
            size.height /= number;
            return size;
        }
    },

    /**
     * Returns a copy of this size.
     * @returns {Size} - the cloned size.
     */
    clone: {
        value: function () {
            return exports.Size.withHeightAndWidth(this.height, this.width);
        }
    },

    /**
     * Tests whether the provided size has the same dimensions as this size.
     * @param {Size} - the size to test.
     * @returns {boolean} - returns true if the dimensions match.
     */
    equals: {
        value: function (other) {
            return other.height === this.height &&  other.width === this.width;
        }
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

Object.defineProperties(exports.Size, /** @lends Size */ {

    withHeightAndWidth: {
        value: function (height, width) {
            var size = new this();
            size.height = height;
            size.width = width;
            return size;
        }
    }

});
