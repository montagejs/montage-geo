var Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    LineString = require("logic/model/line-string").LineString,
    Map = require("montage/collections/map"),
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Point = require("logic/model/point").Point,
    Polygon = require("logic/model/polygon").Polygon,
    Projection = require("logic/model/projection").Projection;

var MONTAGE_CONSTRUCTOR_TYPE_MAP = new Map();
MONTAGE_CONSTRUCTOR_TYPE_MAP.set(LineString, "Polyline");
MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiLineString, "Polyline");
MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiPoint, "MultiPoint");
MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Point, "Point");
MONTAGE_CONSTRUCTOR_TYPE_MAP.set(MultiPolygon, "Polygon");
MONTAGE_CONSTRUCTOR_TYPE_MAP.set(Polygon, "Polygon");


/**
 * @class EsriJsonToGeometryConverter
 * @classdesc Converts an Esri Geometry object to a Montage Geo object and
 * vice-versa.  Esri defines four types of geometry: Point, MultiPoint, Poly-
 * line and Polygon.  When converting these types map to Point, MultiPoint,
 * MultiLine-String and MultiPolygon respectively.  When reverting from
 * MontageGeo the reverse is also true with the addition of LineString mapping
 * to Polyline and Polygon mapping to Polygon.
 * @extends Converter
 */
exports.EsriJsonToGeometryConverter = Converter.specialize( /** @lends EsriJsonToGeometryConverter# */ {

    type: {
        value: undefined
    },

    /**
     * Converts the specified value to a Montage-Geo Object.
     * @function
     * @param {object} v The value to format.
     * @returns {MontageGeo} The value converted to a set.
     */
    convert: {
        value: function (value) {
            var type = this._typeForGeometry(value);
            if (!type) {
                console.warn("--------------------------");
                console.warn("Could not convert geometry.   Unknown Format.");
                console.warn("Raw geometry (", value, ")");
                console.warn("--------------------------");
                return null;
            }
            EsriJson.prototype.projection = this.projection;
            return type.convert(value);
        }
    },

    /**
     * Reverts a Montage-Geo object to EsriJson notation.
     * @function
     * @param {MontageGeo} v The value to revert.
     * @returns {object} v
     */
    revert: {
        value: function (value) {
            var type = MONTAGE_CONSTRUCTOR_TYPE_MAP.get(value.constructor),
                result = null;

            if (type) {
                EsriJson.prototype.projection = this.projection;
                result = EsriJson.forId(type).revert(value);
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
            serializer.setProperty("type", this.type);
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
            this.type = deserializer.getProperty("type");
        }
    },

    _typeForGeometry: {
        value: function (geometry) {
            var type;
            if (geometry.hasOwnProperty("x")) {
                type = EsriJson.POINT;
            } else if (geometry.hasOwnProperty("points")) {
                type = EsriJson.MULTI_POINT;
            } else if (geometry.hasOwnProperty("paths")) {
                type = EsriJson.POLYLINE;
            } else if (geometry.hasOwnProperty("rings")) {
                type = EsriJson.POLYGON;
            }
            return type;
        }
    }

}, {

    getInstance: {
        value: function () {
            return exports.EsriJsonToGeometryConverter._instance;
        }
    },

    _instance: {
        get: function () {
            if (!exports.EsriJsonToGeometryConverter.__instance) {
                exports.EsriJsonToGeometryConverter.__instance = new exports.EsriJsonToGeometryConverter();
            }
            return exports.EsriJsonToGeometryConverter.__instance;
        }
    }

});

var EsriJson = Enumeration.specialize(/** @lends EsriJson */ "id", {

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
                coordinates.push(position.altitude);
            }

            return coordinates;
        }
    }

}, {

    POINT: ["Point", {
        convert: {
            value: function (value) {
                return Point.withCoordinates([value.x, value.y, value.z], this.projection);
            }
        },
        revert: {
            value: function (value) {
                var projected = this._revertPosition(value.coordinates),
                    altitude = projected.length === 3 ? projected[2] : 0;
                return {
                    "x": projected[0],
                    "y": projected[1],
                    "z": altitude
                };
            }
        }
    }],

    MULTI_POINT: ["MultiPoint", {
        convert: {
            value: function (value) {
                return MultiPoint.withCoordinates(value.points, this.projection);
            }
        },
        revert: {
            value: function (value) {
                return {
                    "points": value.coordinates.map(this._revertPosition.bind(this))
                };
            }
        }
    }],

    POLYLINE: ["Polyline", {
        convert: {
            value: function (value) {
                return MultiLineString.withCoordinates(value.paths, this.projection);
            }
        },
        revert: {
            value: function (value) {
                return value instanceof MultiLineString ?   this._revertMultiLineString(value) :
                                                            this._revertLineString(value);
            }
        },
        _revertMultiLineString: {
            value: function (value) {
                return {
                    "paths": this._polylinePathsForLineStrings(value.coordinates)
                };
            }
        },
        _revertLineString: {
            value: function (value) {
                return {
                    "paths": [this._polylinePathForLineString(value)]
                };
            }
        },
        _polylinePathsForLineStrings: {
            value: function (lineStrings) {
                return lineStrings.map(function (lineString) {
                    return this._polylinePathForLineString(lineString);
                }, this);
            }
        },
        _polylinePathForLineString: {
            value: function (path) {
                return path.coordinates.map(function (position) {
                    return this._revertPosition(position);
                }, this);
            }
        }
    }],

    POLYGON: ["Polygon", {
        convert: {
            value: function (value) {
                var self = this,
                    rings = value.rings,
                    polygons = rings.reduce(function (accumulator, ring) {
                        var polygon = Polygon.withCoordinates([ring], self.projection);
                        if (self._isWoundClockwise(ring)) {
                            accumulator.filled.push(polygon);
                        } else {
                            accumulator.holes.push(polygon);
                        }
                        return accumulator;
                    }, {filled: [], holes: []}),
                    converted = new MultiPolygon();

                polygons.holes.forEach(function (hole) {
                    var filled = polygons.filled,
                        wasFound = false,
                        i, n, polygon;
                    for (i = 0, n = filled.length; i < n && !wasFound; i += 1) {
                        polygon = filled[i];
                        if (wasFound = polygon.intersects(hole)) {
                            polygon.coordinates.push(hole.coordinates[0]);
                        }
                    }
                });
                converted.coordinates = polygons.filled;
                return converted;
            }
        },
        revert: {
            value: function (value) {
                return value instanceof MultiPolygon ?  this._revertMultiPolygon(value) :
                                                        this._revertPolygon(value);
            }
        },
        _revertMultiPolygon: {
            value: function (value) {
                var polygons = value.coordinates.reduce(function (accumulator, polygon) {
                    polygon.coordinates.forEach(function (ring) {
                        accumulator.push(ring);
                    });
                    return accumulator;
                }, []);
                return {
                    "rings": this._polygonRingsForPolygons(polygons)
                };
            }
        },
        _revertPolygon: {
            value: function (value) {
                var rings = value.coordinates.map(function (ring) {
                    return ring;
                });
                return {
                    "rings": this._polygonRingsForPolygons(rings)
                };
            }
        },
        _polygonRingsForPolygons: {
            value: function (polygons) {
                return polygons.map(function (polygon) {
                    return this._polygonRingForPolygon(polygon);
                }, this);
            }
        },
        _polygonRingForPolygon: {
            value: function (polygon) {
                return polygon.map(function (position) {
                    return this._revertPosition(position);
                }, this);
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
    }]

});
