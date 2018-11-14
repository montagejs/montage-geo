var Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    Feature = require("logic/model/feature").Feature,
    FeatureCollection = require("logic/model/feature-collection").FeatureCollection,
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    LineString = require("logic/model/line-string").LineString,
    Map = require("montage/collections/map"),
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Point = require("logic/model/point").Point,
    Polygon = require("logic/model/polygon").Polygon,
    Projection = require("logic/model/projection").Projection;

var MONTAGE_CONSTRUCTOR_TYPE_MAP = new Map();
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Feature, "Feature");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(FeatureCollection, "FeatureCollection");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(GeometryCollection, "GeometryCollection");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(LineString, "LineString");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiLineString, "MultiLineString");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiPoint, "MultiPoint");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiPolygon, "MultiPolygon");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Point, "Point");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Polygon, "Polygon");


/**
 * @class GeoJsonToGeometryConverter
 * @classdesc Converts a GeoJson object to a Montage Geo object and vice-versa.
 * @extends Converter
 */
exports.GeoJsonToGeometryConverter = Converter.specialize( /** @lends GeoJsonToGeometryConverter# */ {

    /**
     * Converts the specified value to a Montage-Geo Object.
     * @function
     * @param {object} v The value to format.
     * @returns {MontageGeo} The value converted to a set.
     */
    convert: {
        value: function (value) {
            GeoJson.prototype.projection = this.projection;
            return GeoJson.forId(value.type).convert(value);
        }
    },

    /**
     * Reverts a Montage-Geo object to GeoJson notation.
     * @function
     * @param {MontageGeo} v The value to revert.
     * @returns {object} v
     */
    revert: {
        value: function (value) {
            var type = MONTAGE_CONSTRUCTOR_TYPE_MAP.get(value.constructor),
                result = null;
            
            if (type) {
                GeoJson.prototype.projection = this.projection;
                result = GeoJson.forId(type).revert(value);
            }
            return result;
        }
    },
    
    /**
     * @type {Projection} - a projection to use during the conversion process
     *                      to transform the coordinates to the specified
     *                      coordinate space.
     */
    projection: {
        value: undefined
    },
    
    /**************************************************************************
     * Serialization
     */
    
    serializeSelf: {
        value: function (serializer) {
            if (this.projection) {
                serializer.setProperty("projection", this.projection.srid);
            }
        }
    },
    
    deserializeSelf: {
        value: function (deserializer) {
            var srid = deserializer.getProperty("projection");
            if (srid) {
                this.projection = Projection.forSrid(srid);
            }
        }
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
    },
    
    _revertPosition: {
        value: function (position) {
            var coordinates = [position.longitude, position.latitude];
    
            if (this.projection) {
                coordinates = this.projection.projectPoint(coordinates);
            }
    
            if (position.altitude) {
                coordinates.push(altitude);
            }
            
            return coordinates;
        }
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
                return {
                    "type": "FeatureCollection",
                    "features": value.features.map(function (feature) {
                        return GeoJson.FEATURE.revert(feature);
                    })
                }
            }
        }

    }],

    FEATURE: ["Feature", {
        convert: {
            value: function (value) {
                var geometryType = GeoJson.forId(value.geometry.type),
                    geometry = geometryType.convert(value.geometry);

                return Feature.withMembers(value.id, value.properties || {}, geometry);
            }
        },

        revert: {
            value: function (value) {
                var reverted = {
                        "type": "Feature"
                    },
                    geometry = value.geometry,
                    type = MONTAGE_CONSTRUCTOR_TYPE_MAP.get(geometry.constructor);
                reverted.geometry = GeoJson.forId(type).revert(geometry);
                if (value.hasOwnProperty("id")) {
                    reverted.id = value.id;
                }
                if (value.hasOwnProperty("properties")) {
                    reverted.properties = value.properties;
                }
                return reverted;
            }
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
            value: function (value) {
                return {
                    "type": "GeometryCollection",
                    "geometries": value.geometries.map(function (geometry) {
                        var type = MONTAGE_CONSTRUCTOR_TYPE_MAP.get(geometry.constructor);
                        return type && GeoJson.forId(type).revert(geometry) || null;
                    }).filter(function (geometry) {
                        return geometry;
                    })
                };
            }
        }
    }],

    POINT: ["Point", {
        convert: {
            value: function (value) {
                return Point.withCoordinates(value.coordinates, this.projection);
            }
        },
        revert: {
            value: function (value) {
                return {
                    "type": "Point",
                    "coordinates": this._revertPosition(value.coordinates)
                };
            }
        }
    }],

    MULTI_POINT: ["MultiPoint", {
        convert: {
            value: function (value) {
                return MultiPoint.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {
                return {
                    "type": "MultiPoint",
                    "coordinates": value.coordinates.map(this._revertPosition.bind(this))
                };
            }
        }
    }],

    LINE_STRING: ["LineString", {
        convert: {
            value: function (value) {
                return LineString.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {
                return {
                    "type": "LineString",
                    "coordinates": value.coordinates.map(this._revertPosition.bind(this))
                }
            }
        }
    }],

    MULTI_LINE_STRING: ["MultiLineString", {
        convert: {
            value: function (value) {
                return MultiLineString.withCoordinates(value.coordinates, this.projection);
            }
        },
        revert: {
            value: function (value) {
                return {
                    "type": "MultiLineString",
                    "coordinates": value.coordinates.map(function (lineString) {
                        return lineString.coordinates.map(this._revertPosition.bind(this));
                    }, this)
                }
            }
        }
    }],

    POLYGON: ["Polygon", {
        convert: {
            value: function (value) {
                return Polygon.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {
                return {
                    "type": "Polygon",
                    "coordinates": value.coordinates.map(function (ring) {
                        return ring.map(this._revertPosition.bind(this))
                    }, this)
                };
            }
        }
    }],

    MULTI_POLYGON: ["MultiPolygon", {
        convert: {
            value: function (value) {
                return MultiPolygon.withCoordinates(value.coordinates, this.projection);
            }
        },

        revert: {
            value: function (value) {
                return {
                    "type": "MultiPolygon",
                    "coordinates": value.coordinates.map(function (polygon) {
                        return polygon.coordinates.map(function (ring) {
                            return ring.map(this._revertPosition.bind(this));
                        }, this);
                    }, this)
                };
            }
        }
    }]

});
