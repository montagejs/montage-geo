var Converter = require("mod/core/converter/converter").Converter,
    Enumeration = require("mod/data/model/enumeration").Enumeration,
    LineString = require("logic/model/line-string").LineString,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Point = require("logic/model/point").Point,
    Polygon = require("logic/model/polygon").Polygon,
    Projection = require("logic/model/projection").Projection;


var ShapefileGeometryType = exports.ShapefileGeometryType = Enumeration.specialize("id", /** @lends ShapefileGeometryType# */ {

    convert: {
        value: function (/* projection, data */) {
            return null;
        }
    }

}, {

    _parseCoordinate: {
        value: function (projection, data, offset) {

            var longitude = this._parseFloat(data, offset),
                latitude = this._parseFloat(data, offset + 8);

            return projection.inverse([longitude, latitude]);

        }
    },

    _parseMultiPoint: {
        value: function (projection, data) {

            var count = this._parseInt(data, 32),
                offset = 36, coordinates;

            return count === 1 ?    [this._parseCoordinate(projection, data, offset)] :
                                    this._parsePointArray(projection, data, offset, count);

        }
    },

    _parsePointArray: {
        value: function (projection, data, offset, number) {
            var i, points = [];
            for (i = 0; i < number; i += 1, offset += 16) {
                points.push(this._parseCoordinate(projection, data, offset));
            }
            return points;
        }
    },

    _parseArrayGroup: {
        value: function (projection, data, offset, partOffset, number, total) {
            var out = [], i, currentNumber, nextNumber, pointNumber;

            for (i = 0, nextNumber = 0; i < number;) {

                i++;
                partOffset += 4;
                currentNumber = nextNumber;
                if (i === number) {
                    nextNumber = total;
                } else {
                    nextNumber = this._parseInt(data, partOffset);
                }

                pointNumber = nextNumber - currentNumber;
                if (!pointNumber) {
                    continue;
                }

                out.push(this._parsePointArray(projection, data, offset, pointNumber));
                offset += (pointNumber << 4);

            }

            return out;

        }
    },

    _parsePolyline: {
        value: function (projection, data) {

            var geometry = {},
                numParts = this._parseInt(data, 32),
                num = this._parseInt(data, 36),
                offset, partOffset;

            if (numParts === 1) {
                geometry.type = "LineString";
                offset = 44;
                geometry.coordinates = this._parsePointArray(projection, data, offset, num);
            } else {
                geometry.type = "MultiLineString";
                offset = 40 + (numParts << 2);
                partOffset = 40;
                geometry.coordinates = this._parseArrayGroup(projection, data, offset, partOffset, numParts, num);
            }

            return geometry;
        }
    },

    _parseZPolyline: {
        value: function (projection, data) {

            var geometry = this._parsePolyline(projection, data),
                coordinates = geometry.coordinates,
                number = coordinates.length,
                zOffset = 60 + (number << 4);

            geometry.coordinates = geometry.type === "LineString" ?
                this._parseZPointArray(data, zOffset, number, coordinates) :
                this._parseZArrayGroup(data, zOffset, number, coordinates);

            return geometry;

        }
    },

    _parsePolygon: {
        value: function (geometry) {

            var reduced;
            if ("LineString" === geometry.type) {
                return Polygon.withCoordinates([geometry.coordinates]);
            }

            reduced = geometry.coordinates.reduce(this._reducePolygon.bind(this), []);
            return reduced.length === 1 ?   Polygon.withCoordinates(reduced) :
                                            MultiPolygon.withCoordinates(reduced);
        }
    },

    _parseZPointArray: {
        value: function (data, zOffset, number, coordinates) {
            var i;
            for (i = 0; i < number; i += 1, zOffset += 8) {
                coordinates[i].push(this._parseFloat(data, zOffset));
            }
            return coordinates;
        }
    },

    _parseZArrayGroup: {
        value: function (data, zOffset, number, coordinates) {
            var i;
            for (i = 0; i < number; i += 1) {
                coordinates[i] = this._parseZPointArray(data, zOffset, coordinates[i].length, coordinates[i]);
                zOffset += (coordinates[i].length << 3);
            }
            return coordinates;
        }
    },

    _reducePolygon: {
        value: function (accumulator, polygon) {

            if (!accumulator.length || this._isClockWise(polygon)) {
                accumulator.push([polygon]);
            } else {
                accumulator[accumulator.length - 1].push(polygon);
            }

            return accumulator;

        }
    },

    _isClockWise: {
        value: function (array) {

            var sum = 0, i, n, previous, current;
            for (i = 0, n = array.length; i < n; i += 1) {
                previous = current || array[0];
                current = array[i];
                sum += ((current[0] - previous[0]) * (current[1] + previous[1]));
            }

            return sum > 0;

        }
    },

    _parseFloat: {
        value: function (data, offset) {
            return data.getFloat64(offset, true);
        }
    },

    _parseInt: {
        value: function (data, offset) {
            return data.getInt32(offset, true);
        }
    }

}, {

    POINT: [1, {
        convert: {
            value: function (projection, data) {
                return Point.withCoordinates(this._parseCoordinate(projection, data, 0));
            }
        }
    }],

    POLYLINE: [3, {
        convert: {
            value: function (projection, data) {

                var geometry = this._parsePolyline(projection, data);
                return "LineString" === geometry.type ? LineString.withCoordinates(geometry.coordinates) :
                                                        MultiLineString.withCoordinates(geometry.coordinates);

            }
        }
    }],

    POLYGON: [5, {
        convert: {
            value: function (projection, data) {

                var geometry = this._parsePolyline(projection, data),
                    reduced;

                if ("LineString" === geometry.type) {
                    return Polygon.withCoordinates([geometry.coordinates]);
                }

                reduced = geometry.coordinates.reduce(this._reducePolygon.bind(this), []);
                return reduced.length === 1 ?   Polygon.withCoordinates(reduced[0]) :
                                                MultiPolygon.withCoordinates(reduced);
            }
        }
    }],

    MULTIPOINT: [8, {
        convert: {
            value: function (projection, data) {

                var coordinates = this._parseMultiPoint(projection, data);

                return coordinates.length === 1 ?   Point.withCoordinates(coordinates) :
                                                    MultiPoint.withCoordinates(coordinates);
            }
        }
    }],

    ZPOINT: [11, {
        convert: {
            value: function (projection, data) {
                var coordinates = this._parseCoordinate(projection, data, 0);
                coordinates.push(this._parseFloat(data, 16));
                return Point.withCoordinates(coordinates);
            }
        }
    }],

    ZMULTIPOINT: [18, {
        convert: {
            value: function (projection, data) {

                var geometry = this._parseMultiPoint(projection, data),
                    coordinates = geometry.coordinates,
                    count, zOffset;

                if ("Point" === geometry.type) {
                    coordinates.push(this._parseFloat(data, 72));
                } else {
                    count = coordinates.length;
                    zOffset = 56 + (count << 4);
                    coordinates = this._parseZPointArray(projection, data, zOffset, count);
                }

                return MultiPoint.withCoordinates(coordinates);

            }
        }
    }],

    ZPOLYLINE: [13, {
        convert: {
            value: function (projection, data) {
                var geometry = this._parseZPolyline(projection, data);
                return "LineString" === geometry.type ? LineString.withCoordinates(geometry.coordinates) :
                                                        MultiLineString.withCoordinates(geometry.coordinates);
            }
        }
    }],

    ZPOLYGON: [15, {
        convert: {
            value: function (projection, data) {

                var geometry = this._parseZPolyline(projection, data),
                    reduced;

                if (geometry.type === "LineString") {
                    return Polygon.withCoordinates([geometry.coordinates]);
                }

                reduced = geometry.coordinates.reduce(this._reducePolygon.bind(this), []);
                return reduced.length === 1 ?   Polygon.withCoordinates(reduced[0]) :
                                                MultiPolygon.withCoordinates(reduced);
            }
        }
    }]

});


/**
 * Converts a Shapefile Geometry to a Geometry object.
 * @class ShapefileGeometryToGeometryConverter
 * @classdesc
 * @extends Converter
 */
exports.ShapefileGeometryToGeometryConverter = Converter.specialize( /** @lends ShapefileGeometryToGeometryConverter# */ {

    init: {
        value: function (options) {
            this.projection = options.projection || Projection.forSrid(3857);
            return this;
        }
    },

    /**
     * The projection to use when converting the Shapefile Geometry to a Geometry object.
     * @type {Projection}
     */
    projection: {
        value: undefined
    },

    /**
    * Converts the specified Shapefile Geometry to a Geometry object.
    * @param {object} The Shapefile Geometry to convert
    * @returns {Geometry} The Shapefile Geometry converted to a Geometry object.
    */
    convert: {
        value: function (value) {
            var type = ShapefileGeometryType.forId(value.type);
            return type ? type.convert.call(ShapefileGeometryType, this.projection, value.data) : null;
        }
    }

});
