var Converter = require("montage/core/converter/converter").Converter,
    Size = require("logic/model/size").Size;

/**
 * @class ObjectToSizeConverter
 * @classdesc Maps an object with width and height properties to a size and vice-versa.
 * @extends Converter
 */
exports.ObjectToSizeConverter = Converter.specialize( /** @lends ObjectToSizeConverter# */ {

    convert: {
        value: function (value) {
            return Size.withHeightAndWidth(value.height, value.width);
        }
    },

    revert: {
        value: function (size) {
            return {
                height: size.height,
                width: size.width
            };
        }
    }

});
