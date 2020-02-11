var Montage = require("montage").Montage;

/**
 * @class StyleEntry
 * @extends Montage
 *
 * Represents the object that defines its various styling options.  The
 * StyleEntry defines the label, and styling instructions, as well as an
 * optional criteria used to select an individual entry for a specified
 * feature.
 */
var StyleEntry = exports.StyleEntry = Montage.specialize(/** @lends DefaultRenderer.prototype */ {

    /**
     * The label to display for this entry in the legend.
     * @type {string}
     */
    label: {
        value: undefined
    },

    /**
     * The key to use for localization purposes.
     * @type {string}
     */
    localizationKey: {
        get: function () {
            if (!this._localizationKey) {
                this._localizationKey = "montage-geo.logic.model.style-entry." + this.label;
            }
            return this._localizationKey;
        }
    },

    /**
     * The optional criteria to use when determining when
     * selecting an entry for a given feature.
     * @type {object}
     */
    criteria: {
        value: undefined
    },

    /**
     * The styling instructions for this entry.
     * @type {Style}
     */
    style: {
        value: undefined
    }

}, {

    /**
     * The canonical way of creating a StyleEntry.
     * @param {string} - the label
     * @param {Object} - the criteria
     * @param {Style} - the style
     */
    withLabelCriteriaAndStyle: {
        value: function (label, criteria, style) {
            var entry = new this();
            entry.label = label;
            entry.style = style;
            entry.criteria = criteria;
            return entry;
        }
    }

});
