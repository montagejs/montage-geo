var Renderer = require("logic/model/renderer").Renderer,
    Criteria = require("mod/core/criteria").Criteria,
    EsriSymbolToStyleConverter = require("logic/converter/esri-symbol-to-style-converter").EsriSymbolToStyleConverter,
    Promise = require("mod/core/promise").Promise,
    StyleEntry = require("logic/model/style-entry").StyleEntry;

/**
 * @class ClassBreaksRenderer
 * @extends Renderer
 *
 * This object is used by a feature layer to render it's feature data
 * provided that the feature layer is configured to use a "ClassBreaksRenderer".
 */
exports.ClassBreaksRenderer = Renderer.specialize(/** @lends ClassBreaksRenderer.prototype */ {

    /**************************************************************************
     * Properties
     * These properties are part of the ClassBreaksRenderer but are not
     * supported at this time.
     */

    field: {
        value: undefined
    },

    minValue: {
        value: undefined
    },

    transparency: {
        value: undefined
    },

    clone: {
        value: function () {
            var renderer = new this.constructor();
            renderer.entries = this.entries;
            renderer.field = this.field;
            renderer.minValue = this.minValue;
            renderer.transparency = this.transparency;
            return renderer;
        }
    }

}, {

    withArguments: {
        value: function (field, minValue, classBreaks, transparency) {
            var renderer = new this(),
                entries = classBreaks || [],
                converter = this._styleConverter,
                stylePromises = entries.map(function (entry) {
                    return converter.convert(entry["symbol"]);
                });

            renderer.field = field;
            renderer.minValue = minValue;
            renderer._transparency = transparency;
            return Promise.all(stylePromises).then(function (values) {
                renderer.entries = values.map(function (style, index) {
                    var symbol = entries[index],
                        expression = field + " <= " + symbol.classMaxValue,
                        criteria = new Criteria().initWithExpression(expression, {
                            classMinValue: symbol.classMinValue,
                            classMaxValue: symbol.classMaxValue
                        });
                    return StyleEntry.withLabelCriteriaAndStyle(symbol.label, criteria, style);
                });
                return renderer;
            });
        }
    },

    _styleConverter: {
        get: function () {
            if (!this.__styleConverter) {
                this.__styleConverter = new EsriSymbolToStyleConverter();
            }
            return this.__styleConverter;
        }
    }

});
