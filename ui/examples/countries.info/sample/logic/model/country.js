var Feature = require("montage-geo/logic/model/feature").Feature,
    DataObjectDescriptor = require("montage/data/model/data-object-descriptor").DataObjectDescriptor;

/**
 * Represents a country of the World.
 *
 * @class Country
 * @extends external:Montage
 */
exports.Country = Feature.specialize(/** @lends Country.prototype */ {

    id: {
        value: undefined
    },

    name: {
        value: undefined
    }

}, {

    /**
     * The Montage Data type of countries.
     *
     * @type {external:DataObjectDescriptor}
     */
    TYPE: {
        get: DataObjectDescriptor.getterFor(exports, "Country", "id", {
        })
    }

});
