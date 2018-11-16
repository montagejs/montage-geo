var Converter = require("montage/core/converter/converter").Converter,
    Projection = require("logic/model/projection").Projection,
    topojsonClient = require("contour-framework/topojson-client");

/**
 * @class TopojsonToGeometryConverter
 * @classdesc Converts a topojson object to a Montage Geo object and vice-versa.
 * @extends Converter
 */
exports.TopojsonToGeometryConverter = Converter.specialize( /** @lends TopojsonToGeometryConverter# */ {
    
    /**
     * Converts the specified value to a Montage-Geo Object.
     * @function
     * @param {object} v The value to format.
     * @returns {MontageGeo} The value converted to a set.
     */
    convert: {
        value: function (value) {
            var objects = this._objectsInTopology(value),
                geoJson = topojsonClient.feature(value, objects),
                converter = new GeoJsonToGeometryConverter();
            if (this.projection) {
                converter.projection = this.projection;
            }
            return converter.convert(geoJson);
        }
    },
    
    /**
     * Reverts a set to an array
     * @function
     * @param {moment} v The value to revert.
     * @returns {array} v
     */
    revert: {
        value: function (value) {
            // TODO
        }
    },
    
    path: {
        value: undefined
    },
    
    projection: {
        value: undefined
    },
    
    _objectsInTopology: {
        value: function (value) {
            var pathComponents = this.path.split(".");
            return pathComponents.reduce(function (accumulator, currentValue) {
                return accumulator[currentValue];
            }, value);
        }
    },
    
    /**************************************************************************
     * Serialization
     */
    
    serializeSelf: {
        value: function (serializer) {
            if (this.projection) {
                serializer.setProperty("projection", this.projection.srid);
            }
            serializer.setProperty("path", this.path);
        }
    },
    
    deserializeSelf: {
        value: function (deserializer) {
            var srid = deserializer.getProperty("projection");
            if (srid) {
                this.projection = Projection.forSrid(srid);
            }
            this.path = deserializer.getProperty("path");
        }
    }
    
});
