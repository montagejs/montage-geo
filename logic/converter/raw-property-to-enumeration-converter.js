var Converter = require("montage/core/converter/converter").Converter;

/**
 * @class RawPropertyToEnumerationConverter
 * @classdesc Converts an id to its associated enumeration value.
 * @extends Converter
 */
exports.RawPropertyToEnumerationConverter = Converter.specialize( /** @lends RawPropertyToEnumerationConverter# */ {

    /**
     * The name of the enumeration within the defined module.
     * @type {string}
     */
    exportName: {
        value: undefined
    },

    /**
     * The module where the enumeration is located.
     * @type {string}
     */
    module: {
        value: undefined
    },

    /**
     * The name of the enumeration property to match
     * to the provided value
     * @type {string}
     */
    propertyName: {
        get: function () {
            if (!this._propertyName) {
                this._propertyName = this._defaultPropertyName;
            }
            return this._propertyName;
        },
        set: function (value) {
            this._propertyName = value;
        }
    },

    /**
     * Property name to use if propertyName is not provided
     * @type {string}
     */
    _defaultPropertyName: {
        value: "id"
    },

    /**
     * Require root from which to load the module
     * @type {string}
     */
    _require: {
        value: require
    },

    /**
     * Converts the specified value to a Set.
     * @function
     * @param {string||string[]} The id or array of ids for the enumeration
     * @returns {*} A or set of values in the enumeration.
     */
    convert: {
        value: function (value) {
            var self = this;
            return this._require.async(this.module).then(function (exports) {
                var enumeration = exports[self.exportName],
                    isArray = Array.isArray(value);
                return isArray ? value.map(function (item) {
                    return self._getValueForEnumerationKey(enumeration, item);
                }) : self._getValueForEnumerationKey(enumeration, value);
            });
        }
    },

    _getValueForEnumerationKey: {
        value: function (enumeration, key) {
            var methodName = "for";
            methodName += this.propertyName.substring(0, 1).toUpperCase();
            methodName += this.propertyName.substring(1).toLowerCase();
            return enumeration && enumeration.hasOwnProperty(methodName) && enumeration[methodName](key) || enumeration[key];
        }
    },

    /**
     * Reverts an enumeration to its id.
     * @function
     * @param {Enumeration} v The value to revert.
     * @returns {string} the value.
     */
    revert: {
        value: function (value) {
            var self = this;
            return Array.isArray(value) ? value.map(function (item) {
                return item[self.propertyName];
            }) : value && value[self.propertyName];
        }
    }

});
