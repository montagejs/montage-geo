var Montage = require("montage").Montage,
    Scope = require("frb/scope");

/**
 * This super class contains logic and methods that are common to all renderers.
 *
 * @class Renderer
 * @extends Montage
 */
var Renderer = exports.Renderer = Montage.specialize( /** @lends Renderer.prototype */ {

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
    render: {
        value: function (feature) {
            var entries = this.entries,
                properties = feature.properties,
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
    }

}, {



});
