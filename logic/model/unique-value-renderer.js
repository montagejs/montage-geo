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

    fieldDelimiter: {
        get: function () {
            return this._fieldDelimiter;
        }
    },

    field1: {
        get: function () {
            return this._field1;
        }
    },

    field2: {
        get: function () {
            return this._field2;
        }
    },

    field3: {
        get: function () {
            return this._field3;
        }
    },

    _field1: {
        value: undefined
    },

    _field2: {
        value: undefined
    },

    _field3: {
        value: undefined
    },

    _formattedProperties: {
        value: function (properties) {
            var formattedProperties = {};
            if (this._field1) {
                formattedProperties[this._field1] = String(properties[this._field1]);
            }
            if (this._field2) {
                formattedProperties[this._field2] = String(properties[this._field2]);
            }
            if (this._field3) {
                formattedProperties[this._field3] = String(properties[this._field3]);
            }
            return formattedProperties;
        }
    }

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
            renderer._fieldDelimiter = fieldDelimiter;
            renderer._field1 = field1;
            renderer._field2 = field2;
            renderer._field3 = field3;

            return Promise.all(stylePromises).then(function (values) {
                var fields = [field1, field2, field3].filter(function (field) {
                        return field;
                    }),
                    count = entries.length;

                renderer.entries = values.map(function (style, index) {

                    var isDefault = index === count,
                        symbol = isDefault ? {label: defaultLabel} : entries[index],
                        expression = isDefault ? "true" : undefined,
                        criteria, field, values, i, n;

                    if (!expression) {
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

                    criteria = new Criteria().initWithExpression(expression, {
                        isDefault: isDefault,
                        value: symbol.value
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
