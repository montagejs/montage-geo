var Position = require("../model/position").Position,
    Point = require("../model/point").Point,
    LineString = require("../model/line-string").LineString,
    Polygon = require("../model/polygon").Polygon,
    MultiPoint = require("../model/multi-point").MultiPoint,
    MultiLineString = require("../model/multi-line-string").MultiLineString,
    MultiPolygon = require("../model/multi-polygon").MultiPolygon,
    GeometryCollection = require("../model/geometry-collection").GeometryCollection,
    Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    Projection = require("logic/model/projection").Projection,
    WktParser,
    GeometryLayout;


/**
 * The coordinate layout for geometries, indicating whether a 3rd or 4th z ('Z')
 * or measure ('M') coordinate is available. Supported values are `'XY'`,
 * `'XYZ'`, `'XYM'`, `'XYZM'`.
 * @enum {string}
 */
exports.GeometryLayout = GeometryLayout = {
    XY: 'XY',
    XYZ: 'XYZ',
    XYM: 'XYM',
    XYZM: 'XYZM',
  };


/**
 * Geometry constructors
 * @enum {function (new:import("../geom/Geometry.js").default, Array, import("../geom/GeometryLayout.js").default)}
 */
var GeometryConstructor = {
    'POSITION': Position,
    'POINT': Point,
    // 'POINTM': Point,
    'LINESTRING': LineString,
    'POLYGON': Polygon,
    'MULTIPOINT': MultiPoint,
    'MULTILINESTRING': MultiLineString,
    'MULTIPOLYGON': MultiPolygon,
    'GEOMETRYCOLLECTION': GeometryCollection
  };

  var GeometryType = {
    POSITION: 'Position',
    POINT: 'Point',
    // POINTM: 'Point',
    LINESTRING: 'LineString',
    LINEARRING: 'LinearRing',
    POLYGON: 'Polygon',
    MULTIPOINT: 'MultiPoint',
    MULTILINESTRING: 'MultiLineString',
    MULTIPOLYGON: 'MultiPolygon',
    GEOMETRYCOLLECTION: 'GeometryCollection',
    CIRCLE: 'Circle'
};



/**
 * @typedef {Object} Options
 * @property {boolean} [splitCollection=false] Whether to split GeometryCollections into
 * multiple features on reading.
 */

/**
 * @typedef {Object} Token
 * @property {number} type
 * @property {number|string} [value]
 * @property {number} position
 */

/**
 * @const
 * @type {string}
 */
var EMPTY = 'EMPTY';

/**
 * @const
 * @type {string}
 */
var Z = 'Z';

/**
 * @const
 * @type {string}
 */
var M = 'M';

/**
 * @const
 * @type {string}
 */
var ZM = 'ZM';

/**
 * @const
 * @enum {number}
 */
var TokenType = {
    TEXT: 1,
    LEFT_PAREN: 2,
    RIGHT_PAREN: 3,
    NUMBER: 4,
    COMMA: 5,
    EOF: 6
};

/**
 * @const
 * @type {Object<string, string>}
 */
var WKTGeometryToRevertMethod = new Map,
    WKTGeometryToWKT = new Map;

for (var type in GeometryConstructor) {
    WKTGeometryToWKT.set(GeometryConstructor[type], GeometryType[type]);
    WKTGeometryToRevertMethod.set(GeometryConstructor[type], "revert"+GeometryType[type]+"Geometry");
}

/**
 * Class to tokenize a WKT string.
 */
/**
 * @param {string} wkt WKT string.
 */

var WktLexer = function(wkt) {
    return this.initWithWkt(wkt);
};

var WktLexerProto = WktLexer.prototype;
/**
 * @param {string} wkt WKT string.
 * @return {WktLexer} this.
 * @private
 */
WktLexerProto.initWithWkt = function(wkt, startIndex) {
    /**
     * @type {string}
     */
    this.wkt = wkt;

    /**
     * @type {number}
     * @private
     */
    this._index = startIndex || -1;

    return this;
};

/**
 * @param {string} c Character.
 * @return {boolean} Whether the character is alphabetic.
 * @private
 */
WktLexerProto._isAlpha = function(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
};

/**
 * @param {string} c Character.
 * @param {boolean=} opt_decimal Whether the string number
 *     contains a dot, i.e. is a decimal number.
 * @return {boolean} Whether the character is numeric.
 * @private
 */
WktLexerProto._isNumeric = function(c, opt_decimal) {
    var decimal = opt_decimal !== undefined ? opt_decimal : false;
    return (c >= '0' && c <= '9') || (c == '.' && !decimal);
};

/**
 * @param {string} c Character.
 * @return {boolean} Whether the character is whitespace.
 * @private
 */
WktLexerProto._isWhiteSpace = function(c) {
    return c == ' ' || c == '\t' || c == '\r' || c == '\n';
};

/**
 * @return {string} Next string character.
 * @private
 */
WktLexerProto._nextChar = function() {
    return this.wkt.charAt(++this._index);
};

/**
 * Fetch and return the next token.
 * @return {!Token} Next string token.
 */
WktLexerProto.nextToken = function() {
    var c = this._nextChar();
    var position = this._index;
    /** @type {number|string} */
    var value = c;
    var type;

    if (c == '(') {
    type = TokenType.LEFT_PAREN;
    } else if (c == ',') {
    type = TokenType.COMMA;
    } else if (c == ')') {
    type = TokenType.RIGHT_PAREN;
    } else if (this._isNumeric(c) || c == '-') {
    type = TokenType.NUMBER;
    value = this._readNumber();
    } else if (this._isAlpha(c)) {
    type = TokenType.TEXT;
    value = this._readText();
    } else if (this._isWhiteSpace(c)) {
    return this.nextToken();
    } else if (c === '') {
    type = TokenType.EOF;
    } else {
    throw new Error('Unexpected character: ' + c);
    }

    return {position: position, value: value, type: type};
};

/**
 * @return {number} Numeric token value.
 * @private
 */
WktLexerProto._readNumber = function() {
    var c;
    var index = this._index;
    var decimal = false;
    var scientificNotation = false;
    do {
    if (c == '.') {
        decimal = true;
    } else if (c == 'e' || c == 'E') {
        scientificNotation = true;
    }
    c = this._nextChar();
    } while (
    this._isNumeric(c, decimal) ||
    // if we haven't detected a scientific number before, 'e' or 'E'
    // hint that we should continue to read
    (!scientificNotation && (c == 'e' || c == 'E')) ||
    // once we know that we have a scientific number, both '-' and '+'
    // are allowed
    (scientificNotation && (c == '-' || c == '+'))
    );
    return parseFloat(this.wkt.substring(index, this._index--));
};

/**
 * @return {string} String token value.
 * @private
 */
WktLexerProto._readText = function() {
    var c;
    var index = this._index;
    do {
    c = this._nextChar();
    } while (this._isAlpha(c));
    return this.wkt.substring(index, this._index--).toUpperCase();
};


/**
 * Class to parse the tokens from the WKT string.
 * * @param {WktLexer} lexer The lexer.
 */
exports.WktParser = WktParser = function WktParser(lexer) {
    /**
     * @type {WktLexer}
     * @private
     */
    this._lexer = lexer || new WktLexer();

    this._layout = GeometryLayout.XY;

    return this;
};


var WKTParserProto = WktParser.prototype;

/**
 * @type {Token}
 * @private
 */
WKTParserProto._token = undefined;

/**
 * Fetch the next token form the lexer and replace the active token.
 * @private
 */
WKTParserProto._consume = function() {
    this._token = this._lexer.nextToken();
};

/**
 * Tests if the given type matches the type of the current token.
 * @param {TokenType} type Token type.
 * @return {boolean} Whether the token matches the given type.
 */
WKTParserProto.isTokenType = function(type) {
    var isMatch = this._token.type == type;
    return isMatch;
};

/**
 * If the given type matches the current token, consume it.
 * @param {TokenType} type Token type.
 * @return {boolean} Whether the token matches the given type.
 */
WKTParserProto.match = function(type) {
    var isMatch = this.isTokenType(type);
    if (isMatch) {
    this._consume();
    }
    return isMatch;
};

/**
 * Try to parse the tokens provided by the lexer.
 * @return {import("../geom/Geometry.js").default} The geometry.
 */
WKTParserProto.parse = function(wktString, projection, startIndex) {
    this._lexer.initWithWkt(wktString,startIndex);

    //Set projection before parsing
    this._projection = projection;
    this._consume();
    var geometry = this._parseGeometry();

    //Cleanup when we're done
    this._projection =  null;
    return geometry;
};

/**
 * Try to parse the dimensional info.
 * @return {import("../geom/GeometryLayout.js").default} The layout.
 * @private
 */
WKTParserProto._parseGeometryLayout = function() {
    var layout = GeometryLayout.XY;
    var dimToken = this._token;
    if (this.isTokenType(TokenType.TEXT)) {
        var dimInfo = dimToken.value;
        if (dimInfo === Z) {
            layout = GeometryLayout.XYZ;
        } else if (dimInfo === M) {
            layout = GeometryLayout.XYM;
        } else if (dimInfo === ZM) {
            layout = GeometryLayout.XYZM;
        }
        if (layout !== GeometryLayout.XY) {
            this._consume();
        }
    } else {
        //Likely POSTGIS EWKT 2D, 3D or 4D (XYZM), we're going to delay until we look at the data.
        //for 2D+M, ST_AsEWKT() returns "SRID=4326;POINTM(-149.5704689 -17.5400963 5)"

        layout = undefined;
    }
    return layout;
};

/**
 * @return {!Array<import("../geom/Geometry.js").default>} A collection of geometries.
 * @private
 */
WKTParserProto._parseGeometryCollectionText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var geometries = [];
        do {
            geometries.push(this._parseGeometry());
        } while (this.match(TokenType.COMMA));
        if (this.match(TokenType.RIGHT_PAREN)) {
            return geometries;
        }
    } else if (this._isEmptyGeometry()) {
        return [];
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {Array<number>} All values in a point.
 * @private
 */
WKTParserProto._parsePointText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates = this._parsePoint();
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return null;
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {Array<number>} All values in a point.
 * @private
 */
WKTParserProto._parsePointMText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates = this._parsePoint();
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return null;
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<!Array<number>>} All points in a linestring.
 * @private
 */
WKTParserProto._parseLineStringText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates = this._parsePointList();
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return [];
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<!Array<!Array<number>>>} All points in a polygon.
 * @private
 */
WKTParserProto._parsePolygonText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates = this._parseLineStringTextList();
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return [];
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<!Array<number>>} All points in a multipoint.
 * @private
 */
WKTParserProto._parseMultiPointText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates;
        if (this._token.type == TokenType.LEFT_PAREN) {
            coordinates = this._parsePointTextList();
        } else {
            coordinates = this._parsePointList();
        }
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return [];
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<!Array<!Array<number>>>} All linestring points
 *                                          in a multilinestring.
 * @private
 */
WKTParserProto._parseMultiLineStringText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates = this._parseLineStringTextList();
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return [];
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<!Array<!Array<!Array<number>>>>} All polygon points in a multipolygon.
 * @private
 */
WKTParserProto._parseMultiPolygonText = function() {
    if (this.match(TokenType.LEFT_PAREN)) {
        var coordinates = this._parsePolygonTextList();
        if (this.match(TokenType.RIGHT_PAREN)) {
            return coordinates;
        }
    } else if (this._isEmptyGeometry()) {
        return [];
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<number>} A point.
 * @private
 */
WKTParserProto._parsePoint = function() {
    var coordinates = [];
    //4 is the max
    var dimensions = this._layout ? this._layout.length : 4;
    for (var i = 0; i < dimensions; ++i) {
        var token = this._token;
        if (this.match(TokenType.NUMBER)) {
            coordinates.push(/** @type {number} */ (token.value));
        } else {
            break;
        }
    }

    if(!this._layout) {
        if(coordinates.length === 4) {
            this._layout = GeometryLayout.XYZM;
        } else if(coordinates.length === 2) {
            this._layout = GeometryLayout.XY;
        } else if(coordinates.length === 3) {
            this._layout = GeometryLayout.XYZ;
        }
        dimensions = this._layout.length;
    } else if(this._layout === GeometryLayout.XYM) {
        //We need to insert an undefined at Z's index:
        coordinates.splice(2,0,undefined);
        dimensions = 4;
    }

    if (this._layout && coordinates.length == dimensions) {
        return coordinates;
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @return {!Array<!Array<number>>} An array of points.
 * @private
 */
WKTParserProto._parsePointList = function() {
    var coordinates = [this._parsePoint()];
    while (this.match(TokenType.COMMA)) {
        coordinates.push(this._parsePoint());
    }
    return coordinates;
};

/**
 * @return {!Array<!Array<number>>} An array of points.
 * @private
 */
WKTParserProto._parsePointTextList = function() {
    var coordinates = [this._parsePointText()];
    while (this.match(TokenType.COMMA)) {
        coordinates.push(this._parsePointText());
    }
    return coordinates;
};

/**
 * @return {!Array<!Array<!Array<number>>>} An array of points.
 * @private
 */
WKTParserProto._parseLineStringTextList = function() {
    var coordinates = [this._parseLineStringText()];
    while (this.match(TokenType.COMMA)) {
        coordinates.push(this._parseLineStringText());
    }
    return coordinates;
};

/**
 * @return {!Array<!Array<!Array<!Array<number>>>>} An array of points.
 * @private
 */
WKTParserProto._parsePolygonTextList = function() {
    var coordinates = [this._parsePolygonText()];
    while (this.match(TokenType.COMMA)) {
        coordinates.push(this._parsePolygonText());
    }
    return coordinates;
};

/**
 * @return {boolean} Whether the token implies an empty geometry.
 * @private
 */
WKTParserProto._isEmptyGeometry = function() {
    var isEmpty = this.isTokenType(TokenType.TEXT) && this._token.value == EMPTY;
    if (isEmpty) {
        this._consume();
    }
    return isEmpty;
};

/**
 * Create an error message for an unexpected token error.
 * @return {string} Error message.
 * @private
 */
WKTParserProto._formatErrorMessage = function() {
    return (
        'Unexpected `' +
        this._token.value +
        '` at position ' +
        this._token.position +
        ' in `' +
        this._lexer.wkt +
        '`'
    );
};

/**
 * @return {!import("../geom/Geometry.js").default} The geometry.
 * @private
 */
WKTParserProto._parseGeometry = function() {
    var token = this._token;
    if (this.match(TokenType.TEXT)) {
    var geomType = token.value;

    //Piggybacking on OpenLayer code, POSTGIS returns a non-standard 'POINTM' instead of 'POINT M'
    //which OpenLayer LExer doesn't know about. So instead of tweaking the lexer for now, we detect it here.
    if(geomType.endsWith(M)) {
        this._layout = layout = GeometryLayout.XYM;
        geomType = geomType.substring(0,geomType.length-1);
    } else {
        this._layout = this._parseGeometryLayout();
    }
    if (geomType.indexOf('GEOMETRYCOLLECTION') === 0) {
        var geometries = this._parseGeometryCollectionText();
        return GeometryCollection.withGeometries(geometries);
    } else {
        var ctor = GeometryConstructor[geomType];
        if (!ctor) {
        throw new Error('Invalid geometry type: ' + geomType);
        }

        var coordinates;
        switch (geomType) {
            case 'POINT': {
                coordinates = this._parsePointText();
                break;
            }
            case 'LINESTRING': {
                coordinates = this._parseLineStringText();
                break;
            }
            case 'POLYGON': {
                coordinates = this._parsePolygonText();
                break;
            }
            case 'MULTIPOINT': {
                coordinates = this._parseMultiPointText();
                break;
            }
            case 'MULTILINESTRING': {
                coordinates = this._parseMultiLineStringText();
                break;
            }
            case 'MULTIPOLYGON': {
                coordinates = this._parseMultiPolygonText();
                break;
            }
            default: {
                throw new Error('Invalid geometry type: ' + geomType);
            }
        }

        if (!coordinates) {
        if (ctor === GeometryConstructor['POINT']) {
            coordinates = [NaN, NaN];
        } else {
            coordinates = [];
        }
        }
        return ctor.withCoordinates(coordinates, this._projection);
    }
    }
    throw new Error(this._formatErrorMessage());
};

/**
 * @class WktToGeometryConverter
 * @classdesc Converts an EWkt to a Geometry and vice versa
 * @extends Converter
 */
exports.WktToGeometryConverter = Converter.specialize( /** @lends WktToGeometryConverter# */ {
    serializeSelf: {
        value: function (serializer) {
            this._setPropertyWithDefaults(serializer, "convertingSRID", this.convertingSRID);
            this._setPropertyWithDefaults(serializer, "revertingSRID", this.revertingSRID);
            this._setPropertyWithDefaults(serializer, "convertingGeometryLayout", this.convertingGeometryLayout);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.convertingSRID = this._getPropertyWithDefaults(deserializer, "convertingSRID");
            this.revertingSRID = this._getPropertyWithDefaults(deserializer, "revertingSRID");
            this.convertingGeometryLayout = this._getPropertyWithDefaults(deserializer, "convertingGeometryLayout");
        }
    },

    _setPropertyWithDefaults: {
        value:function (serializer, propertyName, value) {
            if (value != this.consructor.prototype[propertyName]) {
                serializer.setProperty(propertyName, value);
            }
        }
    },

    _getPropertyWithDefaults: {
        value:function (deserializer, propertyName) {
            return deserializer.getProperty(propertyName) || this.consructor.prototype[propertyName];
        }
    },

    /**
     * The SRID of WKT String being converted to a geometry.
     * As of now, montage-geo is coded to only handle SRID 4326,
     *
     * and therefore assumes data is coming in that SRID as well.
     *
     * This is why both convertingSRID and revertingSRID are set to 4326
     *
     * If that changes in the future, the converter will need to evolve
     * to handle the conversion between convertingSRID and revertingSRID,
     * and vice-versa.
     *
     * @property { String } - revertingGeometryLayout
     *
     * defaults to GeometryLayout.XYZM;
     */
    convertingSRID: {
        value: "4326"
    },
    revertingSRID: {
        value: "4326"
    },

    /**
     * The Geometry Layout of WKT String being converted to a geometry.
     * The converter also dynamically introspect what is actually there and
     * does some checking to avoid situations where data's Geometry Layout
     * wouldn't match the value of this property if set. If left undefined,
     * no check is made.
     *
     * @property { String } - revertingGeometryLayout
     *
     * defaults to GeometryLayout.XYZM;
     */
    convertingGeometryLayout: {
        value: undefined
    },

     /**
     * The Geometry Layout of a Geometry reverted to a WKT String
     * Montage geo Geometries know how to deal with XYZM, so not expecting to be changed
     *
     * @property { String } - revertingGeometryLayout
     *
     * defaults to GeometryLayout.XYZM;
     */

    revertingGeometryLayout: {
        value: GeometryLayout.XYZM
    },

    __convertingProjection: {
        value: undefined
    },


    _convertingProjection: {
        get: function () {
            return this.__convertingProjection || (this.__convertingProjection = (this.convertingSRID ? Projection.forSrid(this.convertingSRID) : null));
        }
    },

    _revertingProjection: {
        get: function () {
            return this.revertingSRID ? Projection.forSrid(this.revertingSRID) : null;
        }
    },

    _wktParser: {
        value: undefined
    },

    wktParser: {
        get: function() {
            return this._wktParser || (this._wktParser = new WktParser());
        }
    },

    _SRID_Regex: {
        value: /^SRID=(\d+);/
    },

    /**
     * Converts a WKT to a Geometry object
     * @function
     * @param {string} v The value to format.
     * @returns {Geometry} The value converted to a geometry.
     */
    convert: {
        value: function (wktString) {
            var srid,
                myConvertingSRID = this.convertingSRID,
                wkt,
                match = wktString.match(this._SRID_Regex),
                startIndex,
                geometry;
            if (match) {
                //this.convertingSRID = srid = parseInt(match[1], 10);
                srid = match[1];
                startIndex = match[0].length - 1;
                //wkt = wktString.substring(match[0].length);
                wkt = wktString;

                //If they don't match, shall we convert? Raise?
                if(myConvertingSRID) {
                    if(srid && myConvertingSRID !== srid) {
                        console.warn("SRID embedded in WKT string ["+srid+"] doesn't match this.convertingSRID ["+ myConvertingSRID +"]");
                    }
                } else if(srid) {
                    //We got no constraint on our convertingSRID, we adopt the ones from data.
                    this.convertingSRID = srid;
                }

            } else {
                wkt = wktString;
            }

            // var lexer = new WktLexer(wktString),
            //     parser = new WktParser(lexer);
            geometry = this.wktParser.parse(wkt,this._convertingProjection, startIndex);

            //Now that we're done, we check that if we didn't have one SRID set, we get back to it.
            if(!myConvertingSRID) {
                this.convertingSRID = myConvertingSRID;
            }
            this.__convertingProjection = null;

            return geometry;

        }
    },

    /**
     * Reverts a Geometry to a WKT String
     * @function
     * @param {Geometry} v - The geometry to revert.
     * @returns {string} v - The geometry in WKT format.
     */
    revert: {
        value: function (geometry, _revertsSRID) {
            var geometryReverterMethod = WKTGeometryToRevertMethod.get(geometry.constructor),
                type = WKTGeometryToWKT.get(geometry.constructor),
                enc,
                wktSring = "";

            if(this.revertsSRID && _revertsSRID !== false) {
                wktSring += 'SRID=';
                wktSring += this.convertingSRID;
                wktSring += ";";
            }


            type = type.toUpperCase();
            var dimInfo = this.wktGeometryLayout(geometry);

            /*
                If we've been set a specific convertingGeometryLayout, there are some expectations
                what what format is should be used. For example in a database or API context,
                if the backend expects 2D geometry but the reverted Geometry is 3D, we need to catch that.
                There can only be a pbm if this.convertingGeometryLayout is less than 4 dimensions
            */

            if(this.convertingGeometryLayout && this.convertingGeometryLayout.length < 4) {
                //geometry being reverted has more dimension than convertingGeometryLayout
                if((dimInfo.length+2/*adding XY*/ ) > this.convertingGeometryLayout.length) {
                    throw new Error("Geometry being reverted has more dimensions [XY"+dimInfo+"] than converter's convertingGeometryLayout ["+this.convertingGeometryLayout+"]");
                } else {
                    /*
                        both sides are the same length, but could be XYM vs XYZ
                    */
                    if(
                        (this.convertingGeometryLayout.indexOf("M") !== -1 && dimInfo.indexOf("M") === -1) ||
                        (this.convertingGeometryLayout.indexOf("Z") !== -1 && dimInfo.indexOf("Z") === -1)
                     ) {
                        throw new Error("The dimensions of Geometry being reverted [XY"+dimInfo+"] don't match converter's convertingGeometryLayout dimensions ["+this.convertingGeometryLayout+"]");
                    }

                }
            }

            enc = this[geometryReverterMethod](geometry,this.convertingGeometryLayout);

            if (dimInfo.length > 0) {
                type += ' ' + dimInfo;
            }

            if (enc.length === 0) {
              return type + ' ' + EMPTY;
            }
            /*
                montage-geo only knows how to work in 4326 only for now, which is why post creation
                of the Positions, we don't keep track of the projection used, it got to be 4326.

                When that evolves, this code will need to evolve too, and not just include the right
                SRID
            */
            wktSring += type;
            wktSring += '(';
            wktSring += enc;
            wktSring += ')';

            return wktSring;
        }
    },

    /**
     * Reverts a Geometry to a WKT String
     *
     * @property { Boolean} - Wether the converter should revert the Geometry's SRID into the wkt string
     *
     * defaults to false;
     */
    revertsSRID: {
        value: false
    },

    /**
     * @param {Geometry} geom a geometry.
     * @return {string} Potential dimensional information for WKT type.
     */

    wktGeometryLayout: {
        value: function wktGeometryLayout(geom) {

            var dimInfo = '',
                aChildNode = geom.coordinates || geom.geometries,
                aPosition;

            //For a Point it's a Position, for others it's an array of positions.
            while(aChildNode && ! (aChildNode instanceof Position)) {
                if(Array.isArray(aChildNode)) {
                    aChildNode = aChildNode[0];
                } else {
                    aChildNode = aChildNode.coordinates
                    ? Array.isArray(aChildNode.coordinates)
                        ? aChildNode.coordinates[0]
                        : aChildNode.coordinates
                    : aChildNode.geometries && aChildNode.geometries[0];
                }
            }
            aPosition = aChildNode;

            //For empty geometries, there won't be any
            if(aPosition) {
                // aPosition = Array.isArray(coordinates) ? coordinates[0] : coordinates;
                if (aPosition.hasOwnProperty("altitude") && (Number(aPosition.altitude) !== NaN)) {
                    dimInfo += Z;
                }
                if (!isNaN(Number(aPosition.measure))) {
                    dimInfo += M;
                }
            }
            return dimInfo;
        }
    },

    /**
     * @param {Point} geom Point geometry.
     * @return {string} Coordinates part of Point as WKT.
     */
    revertPositionGeometry: {
        value: function revertPositionGeometry(position, convertingGeometryLayout) {
            var wktPointValue = "";

            if(position.longitude && position.latitude) {
                wktPointValue += position.longitude;
                wktPointValue += " ";
                wktPointValue += position.latitude;
            }

            if((position.hasOwnProperty("altitude") && !convertingGeometryLayout) || (convertingGeometryLayout && convertingGeometryLayout.indexOf("Z") !== -1)) {
                wktPointValue += " ";
                wktPointValue += position.altitude;
            }

            if(position.measure && (!convertingGeometryLayout || (convertingGeometryLayout && convertingGeometryLayout.indexOf("M") !== -1))) {
                wktPointValue += " ";
                wktPointValue += position.measure;
            }

            return wktPointValue;
        }
    },
    /**
     * @param {Point} geom Point geometry.
     * @return {string} Coordinates part of Point as WKT.
     */
    revertPointGeometry: {
        value: function revertPointGeometry(geom, convertingGeometryLayout) {
            return this.revertPositionGeometry(/*position*/geom.coordinates, convertingGeometryLayout);
        }
    },
    /**
     * @param {LineString|import("../geom/LinearRing.js").default} geom LineString geometry.
     * @return {string} Coordinates part of LineString as WKT.
     */
    revertLineStringGeometry: {
        value: function revertLineStringGeometry(geom, convertingGeometryLayout) {
            var coordinates = geom.coordinates;
            var array = [];
            for (var i = 0, ii = coordinates.length; i < ii; ++i) {
              array.push(this.revertPositionGeometry(coordinates[i]));
            }
            return array.join(',');
        }
    },


    _revertPosisitionArray: {
        value: function revertLineStringGeometry(coordinates, convertingGeometryLayout) {
            var array = [];
            for (var i = 0, ii = coordinates.length; i < ii; ++i) {
              array.push(this.revertPositionGeometry(coordinates[i]));
            }
            return array.join(',');
        }
    },

    /**
     * @param {Polygon} geom Polygon geometry.
     * @return {string} Coordinates part of Polygon as WKT.
     */
    revertPolygonGeometry: {
        value: function revertPolygonGeometry(geom, convertingGeometryLayout) {
            var array = [];
            var rings = geom.coordinates;
            for (var i = 0, ii = rings.length; i < ii; ++i) {
                array.push('(' + this._revertPosisitionArray(rings[i]) + ')');
            }
            return array.join(',');
        }
    },

    /**
     * @param {MultiPoint} geom MultiPoint geometry.
     * @return {string} Coordinates part of MultiPoint as WKT.
     */
    revertMultiPointGeometry: {
        value: function revertMultiPointGeometry(geom, convertingGeometryLayout) {
            var array = [];
            var components = geom.coordinates;
            for (var i = 0, ii = components.length; i < ii; ++i) {
                array.push('(' + this.revertPositionGeometry(components[i]) + ')');
            }
            return array.join(',');
        }
    },

    /**
     * @param {MultiLineString} geom MultiLineString geometry.
     * @return {string} Coordinates part of MultiLineString as WKT.
     */
    revertMultiLineStringGeometry: {
        value: function revertMultiLineStringGeometry(geom, convertingGeometryLayout) {
            var array = [];
            var components = geom.coordinates;
            for (var i = 0, ii = components.length; i < ii; ++i) {
              array.push('(' + this.revertLineStringGeometry(components[i]) + ')');
            }
            return array.join(',');
        }
    },

    /**
     * @param {MultiPolygon} geom MultiPolygon geometry.
     * @return {string} Coordinates part of MultiPolygon as WKT.
     */
    revertMultiPolygonGeometry: {
        value: function revertMultiPolygonGeometry(geom, convertingGeometryLayout) {
            var array = [];
            var components = geom.coordinates;
            for (var i = 0, ii = components.length; i < ii; ++i) {
              array.push('(' + this.revertPolygonGeometry(components[i]) + ')');
            }
            return array.join(',');
        }
    },

    /**
     * @param {GeometryCollection} geom GeometryCollection geometry.
     * @return {string} Coordinates part of GeometryCollection as WKT.
     */
    revertGeometryCollectionGeometry: {
        value: function revertGeometryCollectionGeometry(geom, convertingGeometryLayout) {
            var array = [],
                geoms = geom.geometries;


            for (var i = 0, ii = geoms.length; i < ii; ++i) {
                /*
                    If we revert SRID, it should only be for the top geometry, so we disable it for sub-geometries
                    buy passing a private internal flag to revert() of sub geometries
                */
                array.push(this.revert(geoms[i], false));
            }
            return array.join(',');
        }
    }

});
