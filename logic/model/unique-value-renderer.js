var Renderer = require("logic/model/renderer").Renderer,
    Criteria = require("montage/core/criteria").Criteria,
    EsriSymbolToStyleConverter = require("logic/converter/esri-symbol-to-style-converter").EsriSymbolToStyleConverter,
    Promise = require("montage/core/promise").Promise,
    StyleEntry = require("logic/model/style-entry").StyleEntry;

/**
 * @class ClassBreaksRenderer
 * @extends Renderer
 *
 * This object is used by a feature layer to render it's feature data
 * provided that the feature layer is configured to use a "UniqueValueRenderer".
 */
exports.UniqueValueRenderer = Renderer.specialize(/** @lends UniqueValueRenderer.prototype */ {



}, {

    withArguments: {
        value: function (field1, field2, field3, fieldDelimiter, uniqueValueInfos, defaultSymbol, defaultLabel) {

            var renderer = new this(),
                entries = uniqueValueInfos || [],
                converter = this._styleConverter,
                stylePromises = entries.map(function (entry) {
                    return converter.convert(entry["symbol"]);
                });

            if (defaultSymbol) {
                stylePromises.push(converter.convert(defaultSymbol));
            }

            return Promise.all(stylePromises).then(function (values) {
                var fields = [field1, field2, field3].filter(function (field) {
                        return field;
                    }),
                    count = entries.length;
                renderer.entries = values.map(function (style, index) {
                    var symbol = index === count ? {label: defaultLabel} : entries[index],
                        expression = "",
                        criteria, field, values, i, n;

                    if (index === count) {
                        expression = "true";
                    } else {
                        values = symbol.value.split(fieldDelimiter);
                        for (i = 0, n = fields.length; i < n; i += 1) {
                            field = fields[i];
                            if (i > 0) {
                                expression += " && ";
                            }
                            expression += field;
                            expression += " == ";
                            expression += "'";
                            expression += values[i];
                            expression += "'";
                        }
                    }
                    criteria = new Criteria().initWithExpression(expression);
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
