var Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    Projection = require("logic/model/projection").Projection;

/**
 * @class WktToGeometryConverter
 * @classdesc Converts an array to a set and vice versa
 * @extends Converter
 */
exports.WktToGeometryConverter = Converter.specialize( /** @lends WktToGeometryConverter# */ {

    deserializeSelf: {
        value: function (deserializer) {
            this.inputSRID = deserializer.getProperty("inputSRID");
        }
    },

    inputSRID: {
        value: undefined
    },

    _projection: {
        get: function () {
            return this.inputSRID ? Projection.forSrid(this.inputSRID) : null;
        }
    },

    /**
     * Converts a WKT to a Geometry object
     * @function
     * @param {string} v The value to format.
     * @returns {Geometry} The value converted to a geometry.
     */
    convert: {
        value: function (value) {
            var type = Geometry.forWKTString(value);
            if (type) {
                type.projection = this._projection;
            }
            return type && type.convert(value) || null;
        }
    },

    /**
     * Reverts a Geometry to a WKT String
     * @function
     * @param {Geometry} v - The geometry to revert.
     * @returns {string} v - The geometry in WKT format.
     */
    revert: {
        value: function (value) {
        }
    }

});

var Character = Enumeration.specialize("_WKTCharacter", "expression", {}, {}, {
    CLOSE: [/^(\))/],
    DELIMITER: [/^(\,)/],
    NUMBER: [/[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/],
    OPEN: [/^(\()/]
});

var Geometry = Enumeration.specialize(/** @lends Geometry */ "id", {

    convert: {
        value: function (value) {
            if (!this._isValid(value)) {
                return;
            }
            return this._geometryForDocument(value);
        }
    },

    revert: {
        value: function (geometry) {

        }
    },

    projection: {
        value: undefined
    },

    /**
     *
     * @type {string}
     */
    _validationExpression: {
        value: undefined
    },

    /**
     * @parm {string} - the document to convert to a geometry.
     * @return {Geometry} - the new geometry.
     */
    _geometryForDocument: {
        value: function (/* document */) {

        }
    },

    // TODO: Implement
    _isEmpty: {
        value: function () {
            return false;
        }
    },

    /**
     * @param {string} - the wkt string to validate.
     * @returns {boolean} = returns true if the supplied string is valid.
     */
    _isValid: {
        value: function (string) {
            string.match(this._validationExpression);
        }
    }

}, {

    forWKTString: {
        value: function (string) {
            return  string.match(/^(geometrycollection)/i) ? this.GEOMETRY_COLLECTION :
                    string.match(/^(linestring)/i)         ? this.LINE_STRING :
                    string.match(/^(multilinestring)/i)    ? this.MULTI_LINE_STRING :
                    string.match(/^(point)/i)              ? this.POINT :
                    string.match(/^(multipoint)/i)         ? this.MULTI_POINT :
                    string.match(/^(polygon)/i)            ? this.POLYGON :
                    string.match(/^(multipolygon)/i)       ? this.MULTI_POLYGON :
                                                             null;
        }
    }

}, {

    POINT: ["Point", {

        _geometryForDocument: {
            value: function (document) {

            }
        },

        _validationExpression: {
            value: /POINT\s*\(\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*\)/i
        }

    }],

    LINE_STRING: ["LineString", {

        _geometryForDocument: {
            value: function (document) {

            }
        },

        _validationExpression: {
            value: /LINESTRING\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)/i
        }

    }],

    POLYGON: ["Polygon", {

        _geometryForDocument: {
            value: function (document) {

            }
        },

        _validationExpression: {
            value: /POLYGON\s*\(\s*(?:\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)/i
        }

    }],

    MULTI_POINT: ["MultiPoint", {

        _geometryForDocument: {
            value: function (document) {
            }
        },

        _validationExpression: {
            value: /(MULTIPOINT\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)|MULTIPOINT\s*\(\s*(?:\s*\(\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*\)\s*,?\s*)*\s*\))/i
        }

    }],

    MULTI_LINE_STRING: ["MultiLineString", {

        _geometryForDocument: {
            value: function (document) {
            }
        },

        _validationExpression: {
            value: /MULTILINESTRING\s*\(\s*(?:\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)/i
        }

    }],

    MULTI_POLYGON: ["MultiPolygon", {

        _geometryForDocument: {
            value: function (document) {
            }
        },

        _validationExpression: {
            value: /MULTIPOLYGON\s*\(\s*(?:\s*\(\s*(?:\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)/i
        }

    }],

    GEOMETRY_COLLECTION: ["GeometryCollection", {

        _geometryForDocument: {
            value: function (document) {
            }
        },

        _validationExpression: {
            value:
                /GEOMETRYCOLLECTION\s*\(\s*(?:\s*(POINT\s*\(\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*\)|LINESTRING\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)|POLYGON\s*\(\s*(?:\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)|(MULTIPOINT\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)|MULTIPOINT\s*\(\s*(?:\s*\(\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*\)\s*,?\s*)*\s*\))|MULTILINESTRING\s*\(\s*(?:\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)|MULTIPOLYGON\s*\(\s*(?:\s*\(\s*(?:\s*\(\s*(?:\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*-?(?:\.\d+|\d+(?:\.\d*)?)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\)\s*,?\s*)*\s*\))\s*,?\s*)*\s*\)/i
        }

    }]


});
