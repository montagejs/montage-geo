var Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    Feature = require("logic/model/feature").Feature,
    FeatureCollection = require("logic/model/feature-collection").FeatureCollection,
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    Icon = require("logic/model/icon").Icon,
    LineString = require("logic/model/line-string").LineString,
    Map = require("montage/collections/map"),
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Point = require("logic/model/point").Point,
    Point2D = require("logic/model/point-2d").Point2D,
    Polygon = require("logic/model/polygon").Polygon,
    Projection = require("logic/model/projection").Projection,
    Size = require("logic/model/size").Size,
    Style = require("logic/model/style").Style,
    StyleType = require("logic/model/style").StyleType;

var MONTAGE_CONSTRUCTOR_TYPE_MAP = new Map();
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Feature, "Feature");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(FeatureCollection, "FeatureCollection");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(GeometryCollection, "GeometryCollection");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Icon, "Icon");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(LineString, "LineString");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiLineString, "MultiLineString");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiPoint, "MultiPoint");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiPolygon, "MultiPolygon");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Point, "Point");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Point2D, "Anchor");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Polygon, "Polygon");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Size, "Size");
    MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Style, "Style");


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
            if (!value) {
                return;
            }
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
}, {

    getInstance: {
        value: function () {
            return exports.GeoJsonToGeometryConverter._instance;
        }
    },

    _instance: {
        get: function () {
            if (!exports.GeoJsonToGeometryConverter.__instance) {
                exports.GeoJsonToGeometryConverter.__instance = new exports.GeoJsonToGeometryConverter();
            }
            return exports.GeoJsonToGeometryConverter.__instance;
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

    _convertRing: {
        value: function (ring, isExterior) {
            var isWoundClockwise = this._isWoundClockwise(ring);
            if (!isWoundClockwise && isExterior || isWoundClockwise && !isExterior) {
                ring = ring.slice().reverse();
            }
            return ring;
        }
    },

    _revertRing: {
        value: function (ring, isExterior) {
            var revertPositionFn = this._revertPosition.bind(this),
                rawRing = ring.map(revertPositionFn),
                isWoundClockwise = this._isWoundClockwise(rawRing);
            if (isWoundClockwise && isExterior || !isWoundClockwise && !isExterior) {
                rawRing = rawRing.reverse();
            }
            return rawRing;
        }
    },

    _revertPosition: {
        value: function (position) {
            var coordinates = [position.longitude, position.latitude],
                altitude = position.altitude;

            if (this.projection) {
                coordinates = this.projection.projectPoint(coordinates);
            }

            if (altitude) {
                coordinates.push(altitude);
            }

            return coordinates;
        }
    },

    _isWoundClockwise: {
        value: function (ring) {
            var sum = 0,
                i, j, n, p1, p2;
            for (i = 0, n = ring.length; i < n; i += 1) {
                j = i + 1;
                if (j === n) {
                    j = 0;
                }
                p1 = ring[i];
                p2 = ring[j];
                sum += (p2[0] - p1[0]) * (p2[1] + p1[1]);
            }
            return sum >= 0;
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
                    geometry = geometryType.convert(value.geometry),
                    style = value.style && GeoJson.STYLE.convert(value.style);

                return Feature.withMembers(value.id, value.properties || {}, geometry, style);
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
                if (value.hasOwnProperty("style")) {
                    reverted.style = GeoJson.STYLE.revert(value.style);
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
                return Polygon.withCoordinates(value.coordinates.map(function (ring, index) {
                    return this._convertRing(ring, index === 0);
                }, this), this.projection);
            }
        },

        revert: {
            value: function (value) {
                return {
                    "type": "Polygon",
                    "coordinates": value.coordinates.map(function (ring, index) {
                        return this._revertRing(ring, index === 0);
                    }, this)
                };
            }
        }
    }],

    MULTI_POLYGON: ["MultiPolygon", {
        convert: {
            value: function (value) {
                var polygons = value.coordinates.map(function (polygon) {
                    return polygon.map(function (ring, index) {
                        return this._convertRing(ring, index === 0);
                    }, this);
                }, this);
                return MultiPolygon.withCoordinates(polygons, this.projection);
            }
        },

        revert: {
            value: function (value) {
                return {
                    "type": "MultiPolygon",
                    "coordinates": value.coordinates.map(function (polygon) {
                        return polygon.coordinates.map(function (ring, index) {
                            return this._revertRing(ring, index === 0);
                        }, this);
                    }, this)
                };
            }
        }
    }],

    STYLE: ["Style", {

        convert: {
            value: function (value) {
                var styleType = value && value.styleType;
                return  styleType === StyleType.POINT ?         this._convertPoint(value) :
                        styleType === StyleType.LINE_STRING ?   this._convertLineString(value) :
                        styleType === StyleType.POLYGON ?       this._convertPolygon(value) :
                                                                null;
            }
        },

        revert: {
            value: function (value) {
                var styleType = value && value.type;
                return  styleType === StyleType.POINT ?         this._revertPoint(value) :
                        styleType === StyleType.LINE_STRING ?   this._revertLineString(value) :
                        styleType === StyleType.POLYGON ?       this._revertPolygon(value) :
                                                                null;
            }
        },

        _convertPoint: {
            value: function (value) {
                return Style.withValues(GeoJson.ICON.convert(value.icon));
            }
        },

        _convertLineString: {
            value: function (value) {
                return Style.withValues(value.strokeColor, value.strokeOpacity, value.strokeWeight);
            }
        },

        _convertPolygon: {
            value: function (value) {
                return Style.withValues(
                    value.fillColor, value.fillOpacity, value.strokeColor, value.strokeOpacity, value.strokeWeight
                );
            }
        },

        _revertPoint: {
            value: function (value) {
                return {
                    icon: GeoJson.ICON.revert(value.icon),
                    styleType: value.type,
                    type: "Style"
                };
            }
        },

        _revertLineString: {
            value: function (value) {
                return {
                    strokeColor: value.strokeColor,
                    strokeOpacity: value.strokeOpacity,
                    strokeWeight: value.strokeWeight,
                    styleType: value.type,
                    type: "Style"
                };
            }
        },

        _revertPolygon: {
            value: function (value) {
                return {
                    fillColor: value.fillColor,
                    fillOpacity: value.fillOpacity,
                    strokeColor: value.strokeColor,
                    strokeOpacity: value.strokeOpacity,
                    strokeWeight: value.strokeWeight,
                    styleType: value.type,
                    type: "Style"
                };
            }
        }

    }],

    ICON: ["Icon", {
        convert: {
            value: function (value) {
                if (!value) {
                    return;
                }
                return Icon.withSymbolAnchorAndSize(
                    value.symbol,
                    GeoJson.ANCHOR.convert(value.anchor),
                    GeoJson.SIZE.convert(value.size),
                    GeoJson.SIZE.convert(value.scaledSize)
                );
            }
        },

        revert: {
            value: function (value) {
                if (!value) {
                    return;
                }
                return {
                    symbol: value.symbol,
                    anchor: GeoJson.ANCHOR.revert(value.anchor),
                    size: GeoJson.SIZE.revert(value.size),
                    scaledSize: GeoJson.SIZE.revert(value.scaledSize),
                    type: "Icon"
                };
            }
        }
    }],

    ANCHOR: ["Anchor", {

        convert: {
            value: function (value) {
                return value && Point2D.withCoordinates(value.x, value.y) || null;
            }
        },

        revert: {
            value: function (value) {
                return value && {
                    x: value.x,
                    y: value.y,
                    type: "Anchor"
                } || null;
            }
        }
    }],

    SIZE: ["Size", {

        convert: {
            value: function (value) {
                return value && Size.withHeightAndWidth(value.height, value.width) || null;
            }
        },

        revert: {
            value: function (value) {
                return value && {
                    height: value.height,
                    width: value.width,
                    type: "Size"
                } || null;
            }
        }

    }]

});
