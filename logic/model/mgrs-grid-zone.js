var BoundingBox = require("logic/model/bounding-box").BoundingBox,
    proj4 = require("proj4");

var ACROSS_ONE = "ABCDEFGH";
var ACROSS_TWO = "JKLMNPQR";
var ACROSS_THREE = "STUVWXYZ";
var INVALID_LETTER_DESIGNATOR = 'Z';
var LATITUDE_BANDS = "CDEFGHJKLMNPQRSTUVWX";
var ONE_HUNDRED_THOUSAND = 100000;
var TEN_THOUSAND = 10000;
var ONE_THOUSAND = 1000;
var POLAR_Y_BOUNDS = BoundingBox.withCoordinates(-180, 84, 0, 90);
var POLAR_Z_BOUNDS = BoundingBox.withCoordinates(0, 84, 180, 90);
var POLAR_A_BOUNDS = BoundingBox.withCoordinates(-180, -90, 0, -80);
var POLAR_B_BOUNDS = BoundingBox.withCoordinates(0, -90, 180, -80);
var SPECIAL_CASE_UTM_ZONES = [31, 32, 33, 35, 37];
var V_LATITUDE_RANGE = [56, 64];
var X_LATITUDE_RANGE = [72, 84];
var UP_ONE = "ABCDEFGHJKLMNPQRSTUV";
var UP_TWO = "FGHJKLMNPQRSTUVABCDE";
var XNORTH_POLAR  = "RSTUXYZABCFGHJ";
var YNORTH_POLAR  = "ABCDEFGHJKLMNP";
var XSOUTH_POLAR = "JKLPQRSTUXYZABCFGHJKLPQR";
var YSOUTH_POLAR = "ABCDEFGHJKLMNPQRSTUVWXYZ";
var INFINITESIMAL = 1e-8;
var WGS84 = "EPSG:4326";

var MGRSZone = exports.MGRSZone = function () {};
exports.MGRSZone.prototype = Object.create({}, {


    /**
     * Calculates the MGRS letter designator for the given latitude.
     *
     * @private
     * @param {number} lat The latitude in WGS84 to get the letter designator
     *     for.
     * @return {char} The letter designator.
     */
    letterDesignatorForLatitude: {
        value: function (lat) {
            //This here as an error flag to show that the Latitude is
            //outside MGRS limits
            var letterDesignator = INVALID_LETTER_DESIGNATOR;
            if ((84 >= lat) && (lat >= 72)) {
                letterDesignator = 'X';
            } else if ((72 > lat) && (lat >= 64)) {
                letterDesignator = 'W';
            } else if ((64 > lat) && (lat >= 56)) {
                letterDesignator = 'V';
            } else if ((56 > lat) && (lat >= 48)) {
                letterDesignator = 'U';
            } else if ((48 > lat) && (lat >= 40)) {
                letterDesignator = 'T';
            } else if ((40 > lat) && (lat >= 32)) {
                letterDesignator = 'S';
            } else if ((32 > lat) && (lat >= 24)) {
                letterDesignator = 'R';
            } else if ((24 > lat) && (lat >= 16)) {
                letterDesignator = 'Q';
            } else if ((16 > lat) && (lat >= 8)) {
                letterDesignator = 'P';
            } else if ((8 > lat) && (lat >= 0)) {
                letterDesignator = 'N';
            } else if ((0 > lat) && (lat >= -8)) {
                letterDesignator = 'M';
            } else if ((-8 > lat) && (lat >= -16)) {
                letterDesignator = 'L';
            } else if ((-16 > lat) && (lat >= -24)) {
                letterDesignator = 'K';
            } else if ((-24 > lat) && (lat >= -32)) {
                letterDesignator = 'J';
            } else if ((-32 > lat) && (lat >= -40)) {
                letterDesignator = 'H';
            } else if ((-40 > lat) && (lat >= -48)) {
                letterDesignator = 'G';
            } else if ((-48 > lat) && (lat >= -56)) {
                letterDesignator = 'F';
            } else if ((-56 > lat) && (lat >= -64)) {
                letterDesignator = 'E';
            } else if ((-64 > lat) && (lat >= -72)) {
                letterDesignator = 'D';
            } else if ((-72 > lat) && (lat >= -80)) {
                letterDesignator = 'C';
            }

            return letterDesignator;

        }
    },

    unwind: {
        value: function (coordinates, precision) {

            var unwound = [],
                i;

            precision = precision || 1;
            for (i = coordinates.length - 1; i >= 0; i -= 1) {
                unwound.push(this.roundCoordinate(coordinates[i], precision));
                if (i === 0) {
                    unwound.push(coordinates[coordinates.length - 1]);
                }
            }

            return unwound;

        }
    },

    roundCoordinate: {
        value: function (coordinate, precision) {
            var exponent = Math.pow(10, precision);
            return coordinate.map(function (value) {
                return Math.round(value * exponent) / exponent;
            });
        }
    }

});

var UTMZone = exports.UTMZone = function () {};
UTMZone.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.UTMZone
    },

    /**
     * Initializes a new UTMZone instance.
     * @param {number} zone - the UTM zone number.
     * @param {boolean} isNorth - whether the zone is in the northern hemisphere.
     * @returns {UTMZone} zone - the initialized zone.
     */
    init: {
        value: function (options) {

            var zone = options.number || options.zone,
                isNorth = options.isNorth;

            this.id = zone + (isNorth ? "N" : "S");
            this.zone = zone;
            this.centralMeridian = (zone - 1) * 6 - 180 + 3;
            this.isNorth = isNorth;
            this.name = zone + (isNorth ? 'N' : 'S');
            this.isPolar = zone > 60;
            return this;

        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The UTM zone number.
     * @type {number}
     */
    zone: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    centralMeridian: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    isNorth: {
        enumerable: true,
        writable: true,
        value: true
    },

    isPolar: {
        enumerable: true,
        writable: true,
        value: false
    },

    name: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Methods
     */

    bounds: {
        get: function () {

            if (!this._bounds) {
                this._bounds = this.calculateBounds();
            }

            return this._bounds;
        }
    },

    calculateBounds: {
        value: function () {

            var west = (this.zone - 1) * 6 - 180,
                east = west + 6,
                south = this.isNorth ? 0 : -80,
                north = this.isNorth ? 84 : 0;

            return BoundingBox.withCoordinates(west, south, east, north);

        }
    },

    calculateLatitudeForNorthing: {
        value: function (northing) {
            return proj4(this.projection, WGS84, [500000, northing])[1];
        }
    },

    widthInMetersAtLatitude: {
        value: function (latitude) {
            var lengthOfDegreeInLongitude = 111320 * Math.cos(latitude * Math.PI / 180);
            return this.widthOfZoneInDegreesLongitudeAtLatitude(latitude) * lengthOfDegreeInLongitude;
        }
    },

    widthOfZoneInDegreesLongitudeAtLatitude: {
        value: function (latitude) {
            var zone = this.zone;
            return  SPECIAL_CASE_UTM_ZONES.indexOf(zone) === -1 ? 6 :
                    latitude >= V_LATITUDE_RANGE[0] && latitude <= V_LATITUDE_RANGE[1] && zone === 31 ? 3 :
                    latitude >= V_LATITUDE_RANGE[0] && latitude <= V_LATITUDE_RANGE[1] && zone === 32 ? 9 :
                    latitude >= X_LATITUDE_RANGE[0] && latitude <= X_LATITUDE_RANGE[1] && (zone === 31 || zone === 37) ? 9 :
                    latitude >= X_LATITUDE_RANGE[0] && latitude <= X_LATITUDE_RANGE[1] && (zone === 33 || zone === 35) ? 12 :
                    6;
        }
    },

    hundredKMSquaresForBounds: {
        value: function (bounds) {
            return this.isPolar ? this._hundredKMSquaresForPolarBounds(bounds) :
                this._hundredKMSquaresForStandardBounds(bounds);
        }
    },

    projection: {
        get: function () {
            if (!this._projection) {
                this._projection = proj4(this._projectionDefinition);
            }
            return this._projection;
        }
    },

    toGeoJSON: {
        value: function () {
            return {
                type: "Feature",
                id: this.zone,
                geometry: {
                    "type": "Polygon",
                    "coordinates": [[
                        [this.bounds.xMin, this.bounds.yMin],
                        [this.bounds.xMax, this.bounds.yMin],
                        [this.bounds.xMax, this.bounds.yMax],
                        [this.bounds.xMin, this.bounds.yMax],
                        [this.bounds.xMin, this.bounds.yMin]
                    ]]
                },
                properties: {
                    zone: this.zone,
                    isNorth: this.isNorth
                }
            };
        }
    },

    _hundredKMSquaresForPolarBounds: {
        value: function (bounds) {
            // TODO: Implement this method.
            return [];
        }
    },

    _hundredKMSquaresForStandardBounds: {
        value: function (bounds) {

            var longitude = (this.zone - 1) * 6 - 180,
                xMin = Math.max(bounds.xMin, longitude),
                xMax = Math.min(bounds.xMax, longitude + 6),
                yMin = this.isNorth ? Math.max(bounds.yMin, 0) : Math.max(bounds.yMin, -80),
                yMax = this.isNorth ? Math.min(bounds.yMax, 84) : Math.min(bounds.yMax, 0),
                minEastingNorthing = proj4(WGS84, this.projection, [xMin, yMin]),
                maxEastingNorthing = proj4(WGS84, this.projection, [xMax, yMax]),
                squares = [],
                j = Math.floor(minEastingNorthing[1] / ONE_HUNDRED_THOUSAND) * ONE_HUNDRED_THOUSAND,
                i;

            for (; j < maxEastingNorthing[1]; j += ONE_HUNDRED_THOUSAND) {
                for (i = Math.floor(minEastingNorthing[0] / ONE_HUNDRED_THOUSAND) * ONE_HUNDRED_THOUSAND;
                     i < maxEastingNorthing[0];
                     i += ONE_HUNDRED_THOUSAND
                ) {
                    squares.push(mgrs100KMSquareZoneFactory.createMGRS100KMSquareZone({
                        easting: i, northing: j, utmZone: this
                    }));
                }
            }

            return squares;

        }
    },

    _projectionDefinition: {
        get: function () {
            return  "+proj=utm +zone=" +
                this.zone +
                " +ellps=WGS84 +datum=WGS84 +units=m +no_defs " +
                (this.isNorth ? "+north" : " +south");
        }
    }

});

/**
 * Represents a MGRS grid zone.
 * @constructor
 */
var MGRSGridZone = exports.MGRSGridZone = function () {};
exports.MGRSGridZone.prototype = Object.create({}, /** @lends MgrsGridZone.prototype */ {

    /**
     * The constructor function for all MgrsGridZone instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.MGRSGridZone
    },

    init: {
        value: function (options) {

            var letter = options.letter,
                number = options.number;

            this.number = number;
            this.letter = letter;
            this.id = number + letter;
            this.bounds = number <= 60 ? this._makeStandardBounds(number, letter) : this._makePolarBounds(number, letter);
            return this;

        }
    },

    _makeStandardBounds: {
        value: function (number, letter) {
            var latitudeOffset = LATITUDE_BANDS.indexOf(letter) * 8;

            return BoundingBox.withCoordinates(
                this.minLongitudeForGridZone(number, letter),
                -80 + latitudeOffset,
                this.maxLongitudeForGridZone(number, letter),
                -72 + latitudeOffset + (letter === 'X' ? 4 : 0)
            );

        }
    },

    _makePolarBounds: {
        value: function (number, letter) {
            return  number === 61 && letter === 'Y' ? POLAR_Y_BOUNDS :
                    number === 61 && letter === 'Z' ? POLAR_Z_BOUNDS :
                    number === 62 && letter === 'A' ? POLAR_A_BOUNDS :
                    number === 62 && letter === 'B' ? POLAR_B_BOUNDS :
                        undefined;
        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The id of a MGRS Grid Zone is the concatenation of its UTM Zone number
     * and its letter property.
     * @type {string}
     */
    id: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * Whether this MGRS grid zone is a polar zone.
     * @type {boolean}
     */
    isPolar: {
        get: function () {
            return this.number > 60;
        }
    },

    /**
     * The numeric identifier for this MGRS grid zone.
     * @type {number}
     */
    number: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The MGRS letter designator for this grid zone.
     * @type {string}
     */
    letter: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The envelope of this MGRS grid zone.
     * @type {BoundingBox}
     */
    bounds: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Methods
     */

    toGeoJSON: {
        value: function () {
            return {
                type: "Feature",
                id: this.id,
                geometry: {
                    "type": "Polygon",
                    "coordinates": [[
                        [this.bounds.xMin, this.bounds.yMin],
                        [this.bounds.xMax, this.bounds.yMin],
                        [this.bounds.xMax, this.bounds.yMax],
                        [this.bounds.xMin, this.bounds.yMax],
                        [this.bounds.xMin, this.bounds.yMin]
                    ]]
                },
                properties: {
                    id: this.id,
                    number: this.number,
                    letter: this.letter
                }
            };
        }
    },

    maxLongitudeForGridZone: {
        value: function (zone, letter) {
            return  letter === 'X' ?
                    zone === 31 ? 9 :
                    zone === 33 ? 21 :
                    zone === 35 ? 33 :
                    zone === 37 ? 42 :
                    (zone - 1) * 6 - 180 + 6 :
                    letter === "V" ?
                    zone === 31 ? 3 :
                    zone === 32 ? 12 :
                    (zone - 1) * 6 - 180 + 6 :
                    (zone - 1) * 6 - 180 + 6;

        }
    },

    minLongitudeForGridZone: {
        value: function (zone, letter) {
            return  letter === 'X' ?
                    zone === 31 ? 0 :
                    zone === 33 ? 9 :
                    zone === 35 ? 21 :
                    zone === 37 ? 33 :
                    (zone - 1) * 6 - 180 :
                    letter === "V" ?
                    zone === 31 ? 0 :
                    zone === 32 ? 3 :
                    (zone - 1) * 6 - 180 :
                    (zone - 1) * 6 - 180;

        }
    }

});

var MGRS100KMSquareZone = exports.MGRS100KMSquareZone = function () {};
exports.MGRS100KMSquareZone.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.MGRS100KMSquareZone
    },

    init: {
        value: function (options) {
            this.id = this.calculateId(options.utmZone, options.identifier, options.northing);
            this.utmZone = options.utmZone;
            this.identifier = options.identifier;
            this.easting = options.easting;
            this.northing = options.northing;
            return this;
        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The UTM Zone that contains this MGRS 100K square.
     * @type {UTMZone}
     */
    utmZone: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    easting: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    northing: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    identifier: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Methods
     */

    calculateId: {
        value: function (utmZone, identifier, northing) {
            var number = utmZone.zone,
                latitude = proj4(utmZone.projection, WGS84, [500000, northing])[1],
                letter = this.letterDesignatorForLatitude(latitude);

            return number + letter + identifier + "0000000000";
        }
    },

    center: {
        get: function () {
            if (!this._center) {
                this._center = this._calculateCenter();
            }
            return this._center;
        }
    },

    childZonesForBounds: {
        value: function (bounds) {

            var subZones = [],
                projection = this.utmZone.projection,
                utmZoneBounds = this.utmZone.bounds,
                gridZoneYMin = proj4(projection, WGS84, [this.easting + 50000, this.northing])[1],
                gridZoneYMax = proj4(projection, WGS84, [this.easting + 50000, this.northing + ONE_HUNDRED_THOUSAND])[1],
                xMin = Math.max(bounds.xMin, utmZoneBounds.xMin),
                xMax = Math.min(bounds.xMax, utmZoneBounds.xMax),
                yMin = Math.max(bounds.yMin, gridZoneYMin),
                yMax = Math.min(bounds.yMax, gridZoneYMax),
                southWest = proj4(WGS84, projection, [xMin, yMin]),
                southEast = proj4(WGS84, projection, [xMax, yMin]),
                northWest = proj4(WGS84, projection, [xMin, yMax]),
                eastingStart = Math.floor(Math.max(this.easting, southWest[0]) / TEN_THOUSAND) * TEN_THOUSAND,
                eastingEnd = Math.min(this.easting + ONE_HUNDRED_THOUSAND, Math.ceil(southEast[0] / TEN_THOUSAND) * TEN_THOUSAND),
                northingStart = Math.floor(Math.max(this.northing, southWest[1]) / TEN_THOUSAND) * TEN_THOUSAND,
                northingEnd = Math.min(this.northing + ONE_HUNDRED_THOUSAND, Math.ceil(northWest[1] / TEN_THOUSAND) * TEN_THOUSAND),
                latitudeAtNorthingStart,
                latitudeAtNorthingEnd,
                widthInMetersAtNorthingStart,
                widthInMetersAtNorthingEnd,
                northingStartEastingRange,
                northingEndEastingRange,
                easting, northing;

            for (northing = northingStart; northing < northingEnd; northing += TEN_THOUSAND) {

                latitudeAtNorthingStart = proj4(this.utmZone.projection, WGS84, [500000, northing])[1];
                latitudeAtNorthingEnd = proj4(this.utmZone.projection, WGS84, [500000, northing + TEN_THOUSAND])[1];
                widthInMetersAtNorthingStart = this.utmZone.widthInMetersAtLatitude(latitudeAtNorthingStart) / 2;
                widthInMetersAtNorthingEnd = this.utmZone.widthInMetersAtLatitude(latitudeAtNorthingEnd) / 2;
                northingStartEastingRange = [500000 - widthInMetersAtNorthingStart, 500000 + widthInMetersAtNorthingStart];
                northingEndEastingRange = [500000 - widthInMetersAtNorthingEnd, 500000 + widthInMetersAtNorthingEnd];

                for (easting = eastingStart; easting < eastingEnd; easting += TEN_THOUSAND) {

                    if (
                        (easting + TEN_THOUSAND < northingStartEastingRange[0] || easting > northingStartEastingRange[1]) &&
                        (easting + TEN_THOUSAND < northingEndEastingRange[0] || easting > northingEndEastingRange[1])
                    ) {
                        continue;
                    }

                    subZones.push(new MGRS10KMSquareZone().init({
                        easting: easting - this.easting, northing: northing - this.northing, parent: this
                    }));

                }

            }

            return subZones;

        }
    },

    toGeoJSON: {
        value: function () {
            return {
                type: "Feature",
                geometry: this.geometry,
                properties: {
                    identifier: this.identifier,
                    easting: this.easting,
                    northing: this.northing,
                    utmZone: {
                        zone: this.utmZone.zone,
                        isNorth: this.utmZone.isNorth,
                    }
                }
            };
        }
    },

    geometry: {
        get: function () {
            if (!this._geometry) {
                this._geometry = this._calculateGeometry();
            }
            return this._geometry;
        }
    },

    /**
     * The clipped coordinates of this MGRS 100K square.
     * @type {CartesianPolygon}
     */
    clippedCoordinates: {
        get: function () {
            if (!this._clippedCoordinates) {
                this._clippedCoordinates = this._calculateClippedCoordinates();
            }
            return this._clippedCoordinates;
        }
    },

    /**
     * The actual easting range of the MGRS 100K square in WGS84 coordinates.
     * @type {number[]}
     * @readonly
     */
    eastingRange: {
        get: function () {
            if (!this._eastingRange) {
                this._eastingRange = this._calculateEastingRange();
            }
            return this._eastingRange;
        }
    },

    _calculateCenter: {
        value: function () {

            var centroidX = 0, centroidY = 0,
                signedArea = 0,
                coordinates = this.clippedCoordinates.coordinates,
                numVertices = coordinates.length,
                x0, x1, y0, y1, a, i;

            for (i = 0; i < numVertices; i++) {

                x0 = coordinates[i][0];
                y0 = coordinates[i][1];
                x1 = coordinates[(i + 1) % numVertices][0];
                y1 = coordinates[(i + 1) % numVertices][1];

                a = x0 * y1 - x1 * y0;
                signedArea += a;
                centroidX += (x0 + x1) * a;
                centroidY += (y0 + y1) * a;

            }

            signedArea *= 0.5;
            centroidX /= (6 * signedArea);
            centroidY /= (6 * signedArea);

            return proj4(this.utmZone.projection, WGS84, [centroidX, centroidY]);

        }
    },

    _calculateClippedCoordinates: {
        value: function () {

            var utmZone = this.utmZone,
                eastingBase = Math.floor(this.easting / ONE_HUNDRED_THOUSAND) * ONE_HUNDRED_THOUSAND,
                polygon = new CartesianPolygon().init({
                    coordinates: [
                        [eastingBase, this.northing],
                        [eastingBase, this.northing + ONE_HUNDRED_THOUSAND],
                        [eastingBase + ONE_HUNDRED_THOUSAND, this.northing + ONE_HUNDRED_THOUSAND],
                        [eastingBase + ONE_HUNDRED_THOUSAND, this.northing]
                    ]
                }),
                latitude = proj4(utmZone.projection, WGS84, [500000, this.northing])[1],
                nextLatitude = proj4(utmZone.projection, WGS84, [500000, this.northing + ONE_HUNDRED_THOUSAND])[1],
                zoneWidthInMetersAtLatitude = utmZone.widthInMetersAtLatitude(latitude),
                zoneWidthInMetersAtNextLatitude = utmZone.widthInMetersAtLatitude(nextLatitude),
                utmZonePolygon = new CartesianPolygon().init({
                    coordinates: [
                        [500000 - (zoneWidthInMetersAtLatitude / 2), this.northing],
                        [500000 - (zoneWidthInMetersAtNextLatitude / 2), this.northing + ONE_HUNDRED_THOUSAND],
                        [500000 + (zoneWidthInMetersAtNextLatitude / 2), this.northing + ONE_HUNDRED_THOUSAND],
                        [500000 + (zoneWidthInMetersAtLatitude / 2), this.northing]
                    ]
                });

            return polygon.clip(utmZonePolygon);

        }
    },

    _calculateEastingRange: {
        value: function () {

            var coordinates = this.geometry.coordinates[0],
                min = Infinity,
                max = -Infinity,
                i;

            for (i = 0; i < coordinates.length; i += 1) {
                if (i === 0) {
                    min = max = coordinates[i][0];
                } else {
                    min = Math.min(min, coordinates[i][0]);
                    max = Math.max(max, coordinates[i][0]);
                }
            }

            return [min, max];

        }
    },

    _calculateGeometry: {
        value: function () {

            var utmZone = this.utmZone,
                clipped = this.clippedCoordinates,
                projectedCoordinates = clipped.coordinates.map(function (coordinate) {
                    return proj4(utmZone.projection, WGS84, coordinate);
                }),
                counterClockwise = this.unwind(projectedCoordinates, 3);

            return {
                type: "Polygon",
                coordinates: [counterClockwise]
            };
        }
    }

});

var MGRS100KMSquareZoneFactory = exports.MGRS100KMSquareZoneFactory = function (cache) {
    this.cache = cache || {};
};
MGRS100KMSquareZoneFactory.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: MGRS100KMSquareZoneFactory
    },

    cache: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    eastingLetters: {
        enumerable: true,
        writable: false,
        value: "ABCDEFGHJKLMNPQRSTUV"
    },

    northingLetters: {
        enumerable: true,
        writable: false,
        value: "ABCDEFGHJKLMNPQRSTUV"
    },

    /**
     * The canonical method for creating a MGRS 100K square zone.  The caller must
     * provide either an easting and northing coordinate or an identifier.
     * @param {Object} options - the options for creating the zone.
     * @param {number?} options.easting - the easting coordinate for the zone.
     * @param {number?} options.northing - the northing coordinate for the zone.
     * @param {UTMZone} options.utmZone - the UTM zone that contains the zone.
     * @param {string?} options.identifier - the identifier for the zone.
     * @returns {MGRS100KMSquareZone} zone - the created zone.
     */
    createMGRS100KMSquareZone: {
        value: function (options) {

            return options.identifier ? this.createMGRS100KMSquareZoneWithIdentifier(options) :
                this.createMGRS100KMSquareZoneWithEastingNorthing(options);

        }
    },

    createMGRS100KMSquareZoneWithIdentifier: {
        value: function (options) {

            var utmZone = options.utmZone,
                identifier = options.identifier,
                easting = this.eastingFromIdentifier(identifier),
                northing = this.northingFromIdentifier(utmZone, identifier),
                cacheKey = this.buildCacheKey(utmZone, northing, identifier);

            if (!this.cache[cacheKey]) {
                this.cache[cacheKey] = new MGRS100KMSquareZone().init({
                    utmZone: options.utmZone,
                    identifier: identifier,
                    easting: easting,
                    northing: northing
                });
            }

            return this.cache[cacheKey];

        }
    },

    createMGRS100KMSquareZoneWithEastingNorthing: {
        value: function (options) {

            var easting = options.easting,
                northing = options.northing,
                zoneNumber = options.utmZone.zone,
                identifier = this.calculateIdentifier(easting, northing, zoneNumber),
                cacheKey = this.buildCacheKey(options.utmZone, northing, identifier);

            if (!this.cache[cacheKey]) {
                this.cache[cacheKey] = new MGRS100KMSquareZone().init({
                    utmZone: options.utmZone,
                    identifier: identifier,
                    easting: easting,
                    northing: northing
                });
            }

            return this.cache[cacheKey];

        }
    },

    eastingFromIdentifier: {
        value: function (identifier) {
            var colLetter = identifier.slice(0, 2).charAt(0),
                colIndex = this.eastingLetters.indexOf(colLetter),
                eastingBase = ((colIndex % 8) + 1) * ONE_HUNDRED_THOUSAND;

            return Math.max(eastingBase, 167000);
        }
    },

    northingFromIdentifier: {
        value: function (utmZone, identifier) {

            var rowLetter = identifier.slice(2, 4).charAt(1),
                rowIndex = this.northingLetters.indexOf(rowLetter),
                northingBase = rowIndex * ONE_HUNDRED_THOUSAND;

            if (!utmZone.isNorth) {
                northingBase = 10000000 - northingBase;
            }

            return Math.max(northingBase, 0);

        }
    },

    buildCacheKey: {
        value: function (utmZone, northing, identifier) {
            return  utmZone.zone +
                    (utmZone.isNorth ? "N" : "S") +
                    (northing / 100000) +
                    identifier;
        }
    },

    calculateIdentifier: {
        value: function (easting, northing, zoneNumber) {

            var eastingLetter = this.calculateEastingLetterIdentifier(zoneNumber, easting),
                northingLetter = this.calculateNorthingLetterIdentifier(zoneNumber, northing);

            return eastingLetter + northingLetter;

        }
    },

    calculateEastingLetterIdentifier: {
        value: function (zoneNumber, easting) {

            var utmIndex = zoneNumber % 3,
                xIndex = Math.floor((easting - ONE_HUNDRED_THOUSAND) / ONE_HUNDRED_THOUSAND);

            switch (utmIndex) {
                case 0:
                    return ACROSS_THREE.charAt(xIndex);
                case 1:
                    return ACROSS_ONE.charAt(xIndex);
                default:
                    return ACROSS_TWO.charAt(xIndex);
            }

        }
    },

    calculateNorthingLetterIdentifier: {
        value: function (zoneNumber, northing) {
            var adjustedNorthing = Math.floor(northing / ONE_HUNDRED_THOUSAND),
                yIndex = adjustedNorthing % 20;

            return zoneNumber % 2 ? UP_ONE.charAt(yIndex) : UP_TWO.charAt(yIndex);
        }
    }

});

var MGRS10KMSquareZone = exports.MGRS10KMSquareZone = function () {};
exports.MGRS10KMSquareZone.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.MGRS10KMSquareZone
    },

    init: {
        value: function (options) {

            var parentId = options.parent.id,
                idPrefix = parentId.slice(0, parentId.length - 10),
                eastingId = options.easting > 0 ? options.easting.toString() : "00000",
                northing = options.northing,
                northingId = northing > 0 ? northing.toString() : "00000";

            this.id = idPrefix + eastingId + northingId;
            this.parent = options.parent;
            this.easting = options.easting;
            this.northing = options.northing;
            return this;

        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The parent MGRS 100K square zone that contains this MGRS 10K square.
     * @type {MGRS100KMSquareZone}
     */
    parent: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The easting coordinate of this MGRS 10K square.
     * @type {number}
     */
    easting: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The northing coordinate of this MGRS 10K square.
     * @type {number}
     */
    northing: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The geometry of this MGRS 10K square projected into the GeoJson format.
     * @type {Object}
     */
    geometry: {
        get: function () {
            if (!this._geometry) {
                this._geometry = this._calculateGeometry();
            }
            return this._geometry;
        }
    },

    clippedCoordinates: {
        get: function () {
            if (!this._clippedCoordinates) {
                this._clippedCoordinates = this._calculateClippedCoordinates();
            }
            return this._clippedCoordinates;
        }
    },

    /**************************************************************************
     * Methods
     */

    childZonesForBounds: {
        value: function (bounds) {

            var subZones = [],
                hundredKMZone = this.parent,
                utmZone = hundredKMZone.utmZone,
                projection = utmZone.projection,
                eastingBase = hundredKMZone.easting + this.easting,
                northingBase = hundredKMZone.northing + this.northing,
                gridZoneYMin = proj4(projection, WGS84, [eastingBase + 5000, northingBase])[1],
                gridZoneYMax = proj4(projection, WGS84, [eastingBase + 5000, northingBase + TEN_THOUSAND])[1],
                hundredKMZoneEastingRange = hundredKMZone.eastingRange,
                xMin = Math.max(bounds.xMin, hundredKMZoneEastingRange[0]),
                xMax = Math.min(bounds.xMax, hundredKMZoneEastingRange[1]),
                yMin = Math.max(bounds.yMin, gridZoneYMin),
                yMax = Math.min(bounds.yMax, gridZoneYMax),
                southWest = proj4(WGS84, projection, [xMin, yMin]),
                southEast = proj4(WGS84, projection, [xMax, yMin]),
                northWest = proj4(WGS84, projection, [xMin, yMax]),
                eastingStart = Math.floor(Math.max(eastingBase, southWest[0]) / ONE_THOUSAND) * ONE_THOUSAND,
                eastingEnd = Math.min(eastingBase + TEN_THOUSAND, Math.ceil(southEast[0] / ONE_THOUSAND) * ONE_THOUSAND),
                northingStart = Math.floor(Math.max(northingBase, southWest[1]) / ONE_THOUSAND) * ONE_THOUSAND,
                northingEnd = Math.min(northingBase + TEN_THOUSAND, Math.ceil(northWest[1] / ONE_THOUSAND) * ONE_THOUSAND),
                latitudeAtNorthingStart,
                latitudeAtNorthingEnd,
                widthInMetersAtNorthingStart,
                widthInMetersAtNorthingEnd,
                northingStartEastingRange,
                northingEndEastingRange,
                easting, northing;

            for (northing = northingStart; northing < northingEnd; northing += ONE_THOUSAND) {

                latitudeAtNorthingStart = proj4(utmZone.projection, WGS84, [eastingBase + 5000, northing])[1];
                latitudeAtNorthingEnd = proj4(utmZone.projection, WGS84, [eastingBase + 5000, northing + ONE_THOUSAND])[1];
                widthInMetersAtNorthingStart = utmZone.widthInMetersAtLatitude(latitudeAtNorthingStart) / 2;
                widthInMetersAtNorthingEnd = utmZone.widthInMetersAtLatitude(latitudeAtNorthingEnd) / 2;
                northingStartEastingRange = [500000 - widthInMetersAtNorthingStart, 500000 + widthInMetersAtNorthingStart];
                northingEndEastingRange = [500000 - widthInMetersAtNorthingEnd, 500000 + widthInMetersAtNorthingEnd];

                for (easting = eastingStart; easting < eastingEnd; easting += ONE_THOUSAND) {

                    if (
                        (easting + ONE_THOUSAND < northingStartEastingRange[0] || easting > northingStartEastingRange[1]) &&
                        (easting + ONE_THOUSAND < northingEndEastingRange[0] || easting > northingEndEastingRange[1])
                    ) {
                        continue;
                    }

                    subZones.push(new MGRS1KMSquareZone().init({
                        easting: easting - eastingBase, northing: northing - northingBase, parent: this
                    }));

                }

            }

            return subZones;

        }
    },

    toGeoJSON: {
        value: function () {
            return {
                type: "Feature",
                id: this.id,
                geometry: this.geometry,
                properties: {
                    easting: this.easting,
                    northing: this.northing,
                    parentId: this.parent.id
                }
            };
        }
    },

    _calculateGeometry: {
        value: function () {

            var utmZone = this.parent.utmZone,
                clipped = this.clippedCoordinates,
                projectedCoordinates = clipped.coordinates.map(function (coordinate) {
                    return proj4(utmZone.projection, WGS84, coordinate);
                }),
                counterClockwise = this.unwind(projectedCoordinates, 6);

            return {
                type: "Polygon",
                coordinates: [counterClockwise]
            };

        }
    },

    _calculateClippedCoordinates: {
        value: function () {

            var parent = this.parent,
                parentEasting = parent.easting,
                parentNorthing = parent.northing,
                eastingBase = Math.floor((parentEasting + this.easting) / TEN_THOUSAND) * TEN_THOUSAND,
                northingBase = Math.floor((parentNorthing + this.northing) / TEN_THOUSAND) * TEN_THOUSAND,
                polygon = new CartesianPolygon().init({
                    coordinates: [
                        [eastingBase, northingBase],
                        [eastingBase, northingBase + TEN_THOUSAND],
                        [eastingBase + TEN_THOUSAND, northingBase + TEN_THOUSAND],
                        [eastingBase + TEN_THOUSAND, northingBase]
                    ]
                });

            return polygon.clip(parent.clippedCoordinates);

        }
    }

});

var MGRS1KMSquareZone = exports.MGRS1KMSquareZone = function () {};
exports.MGRS1KMSquareZone.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.MGRS1KMSquareZone
    },

    init: {
        value: function (options) {

            var parentId = options.parent.id,
                idPrefix = parentId.slice(0, parentId.length - 10),
                parentEasting = options.parent.easting.toString().slice(0, 1),
                parentNorthing = options.parent.northing.toString().slice(0, 1),
                northing = options.northing,
                id = idPrefix;

            id += parentEasting;
            id += options.easting;
            id += parentNorthing;
            id += northing > 0 ? northing.toString() : "00000";

            this.id = id;
            this.parent = options.parent;
            this.easting = options.easting;
            this.northing = options.northing;
            return this;

        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The MGRS ID for this MGRS 1KM square.
     * @type {string}
     */
    id: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The parent MGRS 10KM square zone that contains this MGRS 1KM square.
     * @type {MGRS10KMSquareZone}
     */
    parent: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The easting coordinate for this MGRS 1KM square within its parent 10KM square.
     * @type {number}
     */
    easting: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * The northing coordinate for this MGRS 1KM square within its parent 10KM square.
     * @type {number}
     */
    northing: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Methods
     */

    toGeoJSON: {
        value: function () {
            return {
                type: "Feature",
                id: this.id,
                geometry: this.geometry,
                properties: {
                    easting: this.easting,
                    northing: this.northing,
                    parentId: this.parent.id
                }
            };
        }
    },

    geometry: {
        get: function () {
            if (!this._geometry) {
                this._geometry = this._calculateGeometry();
            }
            return this._geometry;
        }
    },

    clippedCoordinates: {
        get: function () {
            if (!this._clippedCoordinates) {
                this._clippedCoordinates = this._calculateClippedCoordinates();
            }
            return this._clippedCoordinates;
        }
    },

    _calculateGeometry: {
        value: function () {

            var utmZone = this.parent.parent.utmZone,
                clipped = this.clippedCoordinates,
                projectedCoordinates = clipped.coordinates.map(function (coordinate) {
                    return proj4(utmZone.projection, WGS84, coordinate);
                }),
                counterClockwise = this.unwind(projectedCoordinates, 10);

            return {
                type: "Polygon",
                coordinates: [counterClockwise]
            };

        }
    },

    _calculateClippedCoordinates: {
        value: function () {

            var parent = this.parent,
                grandParent = parent.parent,
                grandParentEasting = grandParent.easting,
                grandParentNorthing = grandParent.northing,
                parentEasting = parent.easting,
                parentNorthing = parent.northing,
                eastingBase = Math.floor((grandParentEasting + parentEasting + this.easting) / ONE_THOUSAND) * ONE_THOUSAND,
                northingBase = Math.floor((grandParentNorthing + parentNorthing + this.northing) / ONE_THOUSAND) * ONE_THOUSAND,
                polygon = new CartesianPolygon().init({
                    coordinates: [
                        [eastingBase, northingBase],
                        [eastingBase, northingBase + ONE_THOUSAND],
                        [eastingBase + ONE_THOUSAND, northingBase + ONE_THOUSAND],
                        [eastingBase + ONE_THOUSAND, northingBase]
                    ]
                });

            return polygon.clip(parent.clippedCoordinates);

        }
    }


});

var MGRSGridZoneFactory = function (cache) {
    this.cache = cache || {};
};
MGRSGridZoneFactory.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: MGRSGridZoneFactory
    },

    forNumberAndLetter: {
        value: function (number, letter) {
            var id = number + letter;
            if (!this.cache[id]) {
                this.cache[id] = new MGRSGridZone().init({
                    number: number,
                    letter: letter
                });
            }
            return this.cache[id];
        }
    },

    polarZoneForPoleAndHemisphere: {
        value: function (isNorth, isWest) {

            var number = isNorth ? 61 : 62,
                letter = isNorth ? isWest ? "Y" : "Z" : isWest ? "A" : "B",
                id = number + letter;

            if (!this.cache[id]) {
                this.cache[id] = new MGRSGridZone().init({
                    number: number,
                    letter: letter
                });
            }

            return this.cache[id];

        }
    }

});
var mgrs100KMSquareZoneFactory = new MGRS100KMSquareZoneFactory({});

exports.MGRSGridZoneService = function (cache) {
    this.factory = new MGRSGridZoneFactory(cache || {});
};
exports.MGRSGridZoneService.prototype = Object.create(MGRSZone.prototype, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.MGRSGridZoneService
    },

    /**
     * The factory used to create MGRSGridZone instances.
     * @type {MGRSGridZoneFactory}
     */
    factory: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * Returns an array of MGRSGridZone instances that intersect the provided bounds.
     * @param {BoundingBox} bounds - the bounds to find intersecting zones for.
     * @returns {Array.<MGRSGridZone>} zones - the zones that intersect
     */
    childZonesForBounds: {
        value: function (bounds) {

            var factory, zones, numbers, letters;
            if (!bounds) {
                return [];
            }

            numbers = this.zoneNumbersForBounds(bounds);
            letters = this.zoneLettersForBounds(bounds);
            factory = this.factory;
            zones = numbers.map(function (number) {

                return letters.filter(function (letter) {
                    return letter !== 'X' || (number !== 32 && number !== 34 && number !== 36);
                }).map(function (letter) {
                    return factory.forNumberAndLetter(number, letter);
                });

            }).reduce(function (aggregate, zonesForNumber) {
                return aggregate.concat(zonesForNumber);
            }, []);

            if (bounds.yMax > 84 && bounds.intersects(POLAR_Y_BOUNDS)) {
                zones.push(factory.polarZoneForPoleAndHemisphere(true, true));
            }

            if (bounds.yMax > 84 && bounds.intersects(POLAR_Z_BOUNDS)) {
                zones.push(factory.polarZoneForPoleAndHemisphere(true, false));
            }

            if (bounds.yMin < -80 && bounds.intersects(POLAR_A_BOUNDS)) {
                zones.push(factory.polarZoneForPoleAndHemisphere(false, true));
            }

            if (bounds.yMin < -80 && bounds.intersects(POLAR_B_BOUNDS)) {
                zones.push(factory.polarZoneForPoleAndHemisphere(false, false));
            }

            return zones;

        }
    },

    zoneLettersForBounds: {
        value: function (bounds) {
            var letters = [],
                min = this.zoneLetterDesignatorForLatitude(bounds.yMin, 'C'),
                max = this.zoneLetterDesignatorForLatitude(bounds.yMax, 'X'),
                latitudeBandsArray = LATITUDE_BANDS.split(""),
                c, stop;

            for (c = LATITUDE_BANDS.indexOf(min), stop = LATITUDE_BANDS.indexOf(max); c <= stop; c++) {
                letters.push(latitudeBandsArray[c]);
            }

            return letters;

        }
    },

    zoneLetterDesignatorForLatitude: {
        value: function (latitude, defaultLetterDesignator) {
            var zoneLetter = this.letterDesignatorForLatitude(latitude);
            return zoneLetter === INVALID_LETTER_DESIGNATOR ? defaultLetterDesignator : zoneLetter;
        }
    },

    zoneNumbersForBounds: {
        value: function (bounds) {

            var min = this.zoneNumberForLongitude(bounds.xMin),
                max = this.zoneNumberForLongitude(bounds.xMax);

            return min <= max ? this.zoneNumbersForRange(min, max) :
                this.zoneNumbersForRange(min, 60).concat(this.zoneNumbersForRange(1, max));

        }
    },

    zoneNumbersForRange: {
        value: function (min, max) {

            var numbers = [], i;
            for (i = min; i <= max; i += 1) {
                numbers.push(i);
            }

            return numbers;

        }
    },

    zoneNumberForLongitude: {
        value: function (longitude) {
            // TODO: Add support for special cases.
            return Math.floor((longitude + 180) / 6) + 1;
        }
    }

});

var UTMZoneService = exports.UTMZoneService = function (cache) {
    this.cache = cache || {};
};
exports.UTMZoneService.prototype = Object.create({}, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.UTMZoneService
    },

    cache: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    childZonesForBounds: {
        value: function (bounds) {

            if (bounds.crossesAntiMeridian()) {
                return bounds.splitAlongAntimeridian()
                    .map(this.childZonesForBounds, this)
                    .reduce(function (aggregate, zones) {
                        return aggregate && aggregate.concat(zones) || zones;
                    });
            }

            return this._childZonesForBounds(bounds);

        }
    },

    _childZonesForBounds: {
        value: function (bounds) {

            var xMin = bounds.xMin,
                xMax = bounds.xMax,
                zones = [],
                includeSouth = bounds.yMin < 0,
                includeNorth = bounds.yMax > 0,
                zone, n;

            for (zone = Math.floor((xMin + 180) / 6) + 1, n = Math.floor((xMax + 180) / 6) + 1; zone <= n; zone += 1) {
                if (includeNorth) {
                    zones.push(this.createUTMZone(zone, true));
                }
                if (includeSouth) {
                    zones.push(this.createUTMZone(zone, false));
                }
            }

            return zones;

        }
    },

    /**
     * Creates a new UTMZone instance.
     * @param {number} zone - the UTM zone number.
     * @param {boolean} isNorth - whether the zone is in the northern hemisphere.
     * @returns {UTMZone} zone - the created zone.
     */
    createUTMZone: {
        value: function (zone, isNorth) {
            var identifier = zone + (isNorth ? 'N' : 'S');
            if (!this.cache[identifier]) {
                this.cache[identifier] = new UTMZone().init({
                    zone: zone,
                    isNorth: isNorth
                });
            }
            return this.cache[identifier];
        }
    }

});

var CartesianPolygon = exports.CartesianPolygon = function () {};
exports.CartesianPolygon.prototype = Object.create({}, {

    constructor: {
        configurable: true,
        writable: true,
        value: exports.CartesianPolygon
    },

    init: {
        value: function (options) {
            this.coordinates = options.coordinates || [];
            return this;
        }
    },

    /**************************************************************************
     * Properties
     */

    coordinates: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**************************************************************************
     * Methods
     */

    clip: {
        value: function (other) {

            var coordinatesCopy = this.coordinates.slice(),
                clipperCoordinates = other.coordinates,
                i, k;

            for (i = 0; i < clipperCoordinates.length; i += 1) {
                k = (i + 1) % clipperCoordinates.length;
                this.clipSegment(
                    coordinatesCopy,
                    clipperCoordinates[i][0],
                    clipperCoordinates[i][1],
                    clipperCoordinates[k][0],
                    clipperCoordinates[k][1]
                );
            }

            return new CartesianPolygon().init({coordinates: coordinatesCopy});

        }

    },

    clipSegment: {
        value: function (polyPoints, x1, y1, x2, y2) {

            var newPoints = [],
                i, k, ix, iy, kx, ky, iPos, kPos, z;

            for (i = 0; i < polyPoints.length; i += 1) {

                k = (i + 1) % polyPoints.length;
                ix = polyPoints[i][0];
                iy = polyPoints[i][1];
                kx = polyPoints[k][0];
                ky = polyPoints[k][1];
                iPos = (x2 - x1) * (iy - y1) - (y2 - y1) * (ix - x1);
                kPos = (x2 - x1) * (ky - y1) - (y2 - y1) * (kx - x1);

                if (iPos < 0 && kPos < 0) {
                    newPoints.push([kx, ky]);
                } else if (iPos >= 0 && kPos < 0) {

                    newPoints.push([
                        this.xIntersect(x1, y1, x2, y2, ix, iy, kx, ky),
                        this.yIntersect(x1, y1, x2, y2, ix, iy, kx, ky)
                    ]);

                    newPoints.push([kx, ky]);

                } else if (iPos < 0 && kPos >= 0) {

                    newPoints.push([
                        this.xIntersect(x1, y1, x2, y2, ix, iy, kx, ky),
                        this.yIntersect(x1, y1, x2, y2, ix, iy, kx, ky)
                    ]);

                }

            }

            polyPoints.length = 0;
            Array.prototype.push.apply(polyPoints, newPoints);

        }
    },

    xIntersect: {
        value: function (x1, y1, x2, y2, x3, y3, x4, y4) {

            var number = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
                denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

            return number / denominator;

        }
    },

    yIntersect: {
        value: function (x1, y1, x2, y2, x3, y3, x4, y4) {

            var number = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
                denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

            return number / denominator;

        }
    }

});