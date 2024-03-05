var Renderer = require("logic/model/renderer").Renderer,
    Criteria = require("montage/core/criteria").Criteria,
    EsriSymbolToStyleConverter = require("logic/converter/esri-symbol-to-style-converter").EsriSymbolToStyleConverter,
    StyleEntry = require("logic/model/style-entry").StyleEntry;

/**
 * @class SimpleRenderer
 * @extends Renderer
 *
 * This object is used by a feature layer to render it's feature data
 * provided that the feature layer is configured to use a "SimpleRenderer".
 */
exports.SimpleRenderer = Renderer.specialize(/** @lends SimpleRenderer.prototype */ {

}, {

    withArguments: {
        value: function (symbol) {
            var renderer = new this();
            return this._styleConverter.convert(symbol).then(function (style) {
                var criteria = new Criteria().initWithExpression("true"),
                    entry = StyleEntry.withLabelCriteriaAndStyle(" ", criteria, style);
                renderer.entries = [entry];
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
