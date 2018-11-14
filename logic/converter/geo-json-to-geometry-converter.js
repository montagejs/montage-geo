var Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    Feature = require("logic/model/feature").Feature,
    FeatureCollection = require("logic/model/feature-collection").FeatureCollection,
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    LineString = require("logic/model/line-string").LineString,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon"),
    Point = require("logic/model/point").Point,
    Polygon = require("logic/model/polygon").Polygon;

/**
 * @class GeoJsonToGeometryConverter
 * @classdesc Converts a GeoJson object to a Montage Geo object and vice-versa.
 * @extends Converter
 */
exports.GeoJsonToGeometryConverter = Converter.specialize( /** @lends GeoJsonToGeometryConverter# */ {

    /**
     * Converts the specified value to a Montage-Geo Object.
     * @function
     * @param {Property} v The value to format.
     * @returns {moment} The value converted to a set.
     */
    convert: {
        value: function (value) {
            GeoJson.projection = this.projection;
            return GeoJson.forId(value.type).convert(value);
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
            GeoJson.projection = this.projection;
            return GeoJson.forId(value.type).revert(value);
        }
    },

    projection: {
        value: undefined
    }

});

var GeoJson = Enumeration.specialize(/** @lends GeoJSON */ "id", {

    id: {
        value: undefined
    },

    convert: {
        value: function (value) {}
    },

    projection: {
        value: undefined
    },

    revert: {
        value: function (value) {}
    }

}, {

    FEATURE_COLLECTION: ["FeatureCollection", {
        convert: {
            value: function (value) {
                var features = value.features.map(function (feature) {
                    return GeoJson.forId("Feature").convert(feature);
                });
                return FeatureCollection.withFeatures(features);
            }
        },

        revert: {
            value: function (value) {

            }
        }

    }],

    FEATURE: ["Feature", {
        convert: {
            value: function (value) {
                var geometryType = GeoJson.forId(value.geometry.type),
                    geometry = geometryType.convert(value.geometry);

                return Feature.withMembers(value.id, value.properties, geometry);
            }
        },

        revert: {
            value: function (value) {}
        }

    }],

    GEOMETRY_COLLECTION: ["GeometryCollection", {
        convert: {
            value: function (value) {
                var geometries = value.geometries.map(function (geometry) {
                    return GeoJson.forId(geometry.type).convert(geometry);
                });
                return GeometryCollection.withGeometries(geometries);
            }
        },

        revert: {
            value: function (value) {}
        }
    }],

    POINT: ["Point", {
        convert: {
            value: function (value) {
                return Point.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {}
        }
    }],

    MULTI_POINT: ["MultiPoint", {
        convert: {
            value: function (value) {
                return MultiPoint.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {}
        }
    }],

    LINE_STRING: ["LineString", {
        convert: {
            value: function (value) {
                return LineString.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {}
        }
    }],

    MULTI_LINE_STRING: ["MultiLineString", {
        convert: {
            value: function (value) {
                return MultiLineString.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {}
        }
    }],

    POLYGON: ["Polygon", {
        convert: {
            value: function (value) {
                return Polygon.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {}
        }
    }],

    MULTI_POLYGON: ["MultiPolygon", {
        convert: {
            value: function (value) {
                return MultiPolygon.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {}
        }
    }]

});
