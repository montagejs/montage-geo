var Converter = require("mod/core/converter/converter").Converter,
    Enumeration = require("mod/data/model/enumeration").Enumeration,
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    LineString = require("logic/model/line-string").LineString,
    Point = require("logic/model/point").Point,
    Polygon = require("logic/model/polygon").Polygon;

var KMLGeometryType = exports.KMLGeometryType = Enumeration.specialize("id", /** @lends KMLGeometryType.prototype */ {

    convert: {
        value: function (/* element, version */) {
            console.log("This should be overridden by the subclass.");
        }
    },

    _mapRingCoordinates: {
        value: function (element, version) {

            var textContent = element.textContent.trim()
                .replace(/[\r\n]+/g, " ")
                .replace(/\s\s+/g, ' ');

            return textContent.split(" ").map(function (rawCoordinates) {
                return rawCoordinates.split(",").map(function (stringValue) {
                    return parseFloat(stringValue);
                }).slice(0, 2);
            });

        }
    }


}, /** @lends KMLGeometryType */ {

    POINT: ["POINT", {

        convert: {
            value: function (element /*, version */) {

                var coordinatesNode = element.querySelector("coordinates"),
                    coordinates = this._mapCoordinates(coordinatesNode);

                return Point.withCoordinates(coordinates);
            }
        },

        _mapCoordinates: {
            value: function (element) {
                return element.textContent.split(",").map(function (value) {
                    return parseFloat(value);
                }).slice(0, 2);
            }
        }

    }],

    LINE_STRING: ["LINESTRING", {

        convert: {
            value: function (element, version) {

                var coordinatesNode = element.querySelector("coordinates"),
                    coordinates = this._mapCoordinates(coordinatesNode, version);

                return LineString.withCoordinates(coordinates);

            }
        },

        _mapCoordinates: {
            value: function (element, version) {
                return version === "2.0" ? this._mapCoordinates20(element) : this._mapCoordinates22(element);
            }
        },

        _mapCoordinates20: {
            value: function (element) {

                var rawCoordinates = element.textContent.trim().split(","),
                    coordinates = [], i, n;

                for (i = 0, n = rawCoordinates.length; i < n; i += 3) {
                    coordinates.push([parseFloat(rawCoordinates[i]), parseFloat(rawCoordinates[i + 1])]);
                }

                return coordinates;

            }
        },

        _mapCoordinates22: {
            value: function (element) {

                var normalizedTextContent = element.textContent.trim()
                    .replace(/[\r\n]+/g, " ")
                    .replace(/\s\s+/g, ' ');

                return normalizedTextContent.split(" ").map(function (rawCoordinates) {
                    return rawCoordinates.split(",").map(function (stringValue) {
                        return parseFloat(stringValue);
                    }).slice(0, 2);
                });

            }
        }

    }],

    LINEAR_RING: ["LINEARRING", {

        convert: {
            value: function (element /*, version */) {

                var coordinatesNode = element.querySelector("coordinates"),
                    coordinates = this._mapRingCoordinates(coordinatesNode);

                return Polygon.withCoordinates([coordinates]);
            }
        }

    }],

    POLYGON: ["POLYGON", {

        convert: {
            value: function (element, version) {
                var coordinates = this._mapCoordinates(element, version);
                return Polygon.withCoordinates(coordinates);
            }
        },

        _mapCoordinates: {
            value: function (element, version) {

                var outerRing = element.querySelector("outerBoundaryIs > LinearRing > coordinates"),
                    innerRings = element.querySelectorAll("innerBoundaryIs > LinearRing"),
                    coordinates = [this._mapRingCoordinates(outerRing, version)],
                    coordinatesNode, i, n;

                for (i = 0, n = innerRings.length; i < n; i += 1) {
                    coordinatesNode = innerRings[i].querySelector("coordinates");
                    coordinates.push(this._mapRingCoordinates(coordinatesNode, version));
                }

                return coordinates;

            }
        }

    }],

    LOOK_AT: ["LOOKAT", {

        convert: {
            value: function (element /*, version */) {

                var longitude = parseFloat(element.querySelector("longitude").textContent),
                    latitude = parseFloat(element.querySelector("latitude").textContent),
                    altitudeElement = element.querySelector("altitude"),
                    altitude = altitudeElement && parseFloat(altitudeElement.textContent) || 0.0;

                return Point.withCoordinates([longitude, latitude, altitude]);
            }
        }

    }],

    MULTI_GEOMETRY: ["MULTIGEOMETRY", {

        convert: {
            value: function (element, version) {

                var geometryCollection = new GeometryCollection(),
                    geometryNodes = element.querySelectorAll(":scope > Point, :scope > LineString, :scope > LinearRing, :scope > Polygon, :scope > MultiGeometry"),
                    child, kmlGeometryType, i, n;

                for (i = 0, n = geometryNodes.length; i < n; i += 1) {

                    child = geometryNodes[i];
                    kmlGeometryType = KMLGeometryType.forId(child.tagName.toUpperCase());
                    if (kmlGeometryType) {
                        geometryCollection.geometries.push(
                            kmlGeometryType.convert(child, version)
                        );
                    }

                }

                return geometryCollection;

            }
        }

    }]

});

/**
 * Converts a KML geometry object to a MontageGeo geometry object.
 * @class KMLGeometryToGeometryConverter
 * @extends Converter
 */
exports.KMLGeometryToGeometryConverter = Converter.specialize( /** @lends KMLGeometryToGeometryConverter# */ {

    constructor: {
        value: function KMLGeometryToGeometryConverter(version) {
            this._version = version || "2.2";
        }
    },

    /**
     * Converts a KML geometry node to a MontageGeo geometry object.
     * @param {Element} - The KML geometry node.
     * @returns {MontageGeo:Geometry}
     */
    convert: {
        value: function (element) {
            return KMLGeometryType.forId(element.tagName.toUpperCase()).convert(element, this._version);
        }
    },

    /**
     * The version of the KML specification that this converter supports.
     * @type {string}
     */
    _version: {
        value: undefined
    }

});