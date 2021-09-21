var Converter = require("montage/core/converter/converter").Converter,
    BoundingBox = require("logic/model/bounding-box").BoundingBox;

/**
 * @class BboxToBoundsConverter
 * @classdesc Converts an array in "bbox" format https://tools.ietf.org/html/rfc7946#page-12
 * to a BoundingBox and vice-versa.
 * @extends Converter
 */
exports.BboxToBoundsConverter = Converter.specialize( /** @lends BboxToBoundsConverter# */ {

    /**
     * The projection to use for converting the bbox into WGS 84
     * @type {Projection}
     */
    projection: {
        value: undefined
    },

    convert: {
        value: function (value) {
            if (!value) {
                return;
            }
            return BoundingBox.withBbox(value, this.projection);
        }
    },

    revert: {
        value: function (boundingBox) {
            return boundingBox && boundingBox.bbox;
        }
    }

});
