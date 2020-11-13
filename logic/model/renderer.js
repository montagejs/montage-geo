var Converter = require("montage/core/converter/converter").Converter,
    deprecate = require("montage/core/deprecate");

/**
 * This super class contains logic and methods that are common to all renderers.
 *
 * @class Renderer
 * @extends Montage
 */
var Renderer = exports.Renderer = Converter.specialize( /** @lends Renderer.prototype */ {

    /***************************************************************************
     * Properties
     */

    /**
     * The list of options for displaying data displayed by this renderer.
     * @type {StyleEntry[]}
     */
    entries: {
        value: undefined
    },

    /***************************************************************************
     * Functions
     */

    /**
     * Returns the style for the provided feature.
     * @param {Feature} - feature
     * @returns {Style}
     */
    convert: {
        value: function (feature) {
            var entries = this.entries,
                properties = this._formattedProperties(feature.properties),
                wasFound = false,
                entry, i, n;
            for (i = 0, n = entries.length; i < n && !wasFound; i += 1) {
                entry = entries[i];
                if (entry.criteria.evaluate(properties)) {
                    wasFound = true;
                }
            }
            return entry && entry.style;
        }
    },

    /**
     * Returns the style for the provided feature.
     * @param {Feature} - feature
     * @deprecated
     * @returns {Style}
     */
    render: {
        value: deprecate.deprecateMethod(void 0, function (feature) {
            return this.convert(feature);
        }, "render", "convert")
    },

    /**
     * Provides a layer of indirection to format properties before evaluation.
     * Subclasses can use this method to coerce property values.
     * @param {Object} - properties
     * @returns {Object} - formatted properties
     */
    _formattedProperties: {
        value: function (properties) {
            return properties;
        }
    }

}, {



});
