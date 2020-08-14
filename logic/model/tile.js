var BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Position = require("logic/model/position").Position;

/**
 * One of the tiles in a raster {@link Layer}.
 *
 * @class Tile
 * @extends external:Montage
 */
var Tile = exports.Tile = function () {};

exports.Tile.prototype = Object.create({}, /** @lends Tile.prototype */ {

    constructor: {
        configurable: true,
        writable: true,
        value: Tile
    },

    /**
     * Derived from [this.x]{@link Tile#x}, [this.y]{@link Tile#y},
     * [this.z]{@link Tile#z}.
     *
     * @type{?external:moment}
     */
    id: {
        get: function () {
            if (!this._id) {
                this._id = (this.x || 0) + ":" + (this.y || 0) + ":" + (this.z || 0);
            }
            return this._id;
        }
    },

    /**
     * The data for this tile's image.
     * @type {string}
     */
    dataUrl: {
        configurable: true,
        writable: true,
        value: undefined
    },

    _x: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * The identifier for this tile on the horizontal plane.
     * @type {number}
     */
    x: {
        get: function () {
            return this._x;
        }
    },

    _y: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * The identifier for this tile on the vertical plane.
     * @type {number}
     */
    y: {
        get: function () {
            return this._y;
        }
    },

    _z: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * The zoom level of this tile.
     * @type {number}
     */
    z: {
        get: function () {
            return this._z;
        }
    },

    bounds: {
        get: function() {
            var northWest = Tile.fromTileIdentifierToPosition(this.x, this.y, this.z),
                southEast = Tile.fromTileIdentifierToPosition(this.x + 1, this.y + 1, this.z),
                west = northWest.longitude !== 180 ? northWest.longitude : -180,
                east = southEast.longitude !== -180 ? southEast.longitude : 180;
            return BoundingBox.withCoordinates(west, southEast.latitude, east, northWest.latitude);
        }
    },

    /**
     * @type {boolean}
     */
    isLoaded: {
        configurable: true,
        writable: true,
        value: false
    },

    /**
     * @type {Image}
     */
    image: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * @type {number}
     */
    count: {
        configurable: true,
        writable: true,
        value: 0
    },

    positions: {
        get: function () {
            if (!this._positions) {
                this._positions = [];
            }
            return this._positions;
        },
        set: function (positions) {
            this._positions = positions;
        }
    },

    reset: {
        value: function () {
            var i, n;
            for (i = 0, n = this.positions.length; i < n; i += 1) {
                this.positions[i].retain = false;
            }
            this.count = 0;
        }
    },

    addPosition: {
        value: function (position) {
            var existingPosition = this.positions[this.count];
            if (!existingPosition) {
                this.positions[this.count] = position;
            } else {
                existingPosition.x = position.x;
                existingPosition.retain = true;
            }
            this.count++;
        }
    },

    removePosition: {
        value: function (position) {
            var positionIndex = this.positions[position];
            this.positions.splice(positionIndex, 1);
            this.count--;
        }
    },

    hasPositions: {
        get: function () {
            return this.count > 0;
        }
    }

});

Object.defineProperties(exports.Tile, /** @lends Tile.prototype */ {

    fromTileIdentifierToPosition: {
        value: function (x, y, z) {

            var n = Math.pow(2, z),
                longitudeInDegrees = x / n * 360.0 - 180.0,
                latitudeInRadians = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))),
                latitudeInDegrees = latitudeInRadians * (180.0 / Math.PI);

            return Position.withCoordinates(longitudeInDegrees, latitudeInDegrees);
        }
    },

    fromCoordinates: {
        value: function (longitude, latitude, zoom) {
            var latRadians = Position.toRadians(latitude),
                n = Math.pow(2, zoom),
                x = parseInt((longitude + 180.0) / 360.0 * n),
                y = parseInt((1.0 - Math.log(Math.tan(latRadians) + (1 / Math.cos(latRadians))) / Math.PI) / 2.0 * n);

            return exports.Tile.withIdentifier(x, y, zoom);
        }
    },

    tilesInBoundsWithZoomRange: {
        value: function (bounds, minZoom, maxZoom) {
            var tiles = [], minTile, maxTile, i, j, k;
            bounds.splitAlongAntimeridian().forEach(function (aBounds) {
                for (i = minZoom; i <= maxZoom; i += 1) {
                    minTile = exports.Tile.fromCoordinates(aBounds.xMin, aBounds.yMax, i);
                    maxTile = exports.Tile.fromCoordinates(aBounds.xMax, aBounds.yMin, i);
                    for (j = minTile.x; j <= maxTile.x; j += 1) {
                        for (k = minTile.y; k <= maxTile.y; k += 1) {
                            tiles.push(exports.Tile.withIdentifier(j, k, i));
                        }
                    }
                }
            });
            return tiles;
        }
    },

    /**
     * The canonical way of creating tiles.
     * @method
     * @returns Tile
     */
    withIdentifier: {
        value: function (x, y, z) {
            var tile = new this();
            tile._x = x;
            tile._y = y;
            tile._z = z;
            return tile;
        }
    }

});

/**
 * A transparent image.  Used to hide tiles
 */
exports.TransparentImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAHCGzyUAAAAC0lEQVQI12P4zwAAAgEBAKrChTYAAAAASUVORK5CYII=";
