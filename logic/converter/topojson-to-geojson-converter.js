var Converter = require("mod/core/converter/converter").Converter,
    topojsonClient = require("topojson-client");

/**
 * @class TopojsonToGeojsonConverter
 * @classdesc Converts a topojson object to a GeoJson object.
 * @extends Converter
 */
exports.TopojsonToGeojsonConverter = Converter.specialize( /** @lends TopojsonToGeojsonConverter# */ {
    
    /**
     * Converts the specified value to either a GeometryCollection or a
     * FeatureCollection
     * @function
     * @param {object} v The value to format.
     * @returns {FeatureCollection|GeometryCollection} The value converted to
     * the corresponding GeoJson object.
     */
    convert: {
        value: function (value) {
            var objects = this._objectsInTopology(value);
            return topojsonClient.feature(value, objects);
        }
    },
    
    /**
     * Reverts a Montage-Geo object to topojson.
     * @function
     * @param {Montage-Geo} value - The value to revert.
     * @returns {object} response - The value converted to GeoJson.
     */
    revert: {
        value: function (value) {
            // TODO -- There is not a simple analog in the topojson client API.
        }
    },

    /**
     * The path to use to access the geometry in the topology object.  Should
     * be delimited by '.'.
     * @type {string}
     */
    keyPath: {
        value: undefined
    },

    /**
     * @private
     * @param {object} - The topology to extract the objects from.
     */
    _objectsInTopology: {
        value: function (value) {
            var keyPathComponents = this.keyPath.split(".");
            return keyPathComponents.reduce(function (accumulator, currentValue) {
                return accumulator[currentValue];
            }, value);
        }
    },
    
    /**************************************************************************
     * Serialization
     */
    
    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("keyPath", this.keyPath);
        }
    },
    
    deserializeSelf: {
        value: function (deserializer) {
            this.keyPath = deserializer.getProperty("keyPath");
        }
    }
    
});

