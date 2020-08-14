var Tile = require("logic/model/tile").Tile;
exports.TileBounds = function () {};

exports.TileBounds.prototype = Object.create({}, /** @lends TileBounds.prototype */ {

    /**
     * The constructor function for all TileBounds instances.
     *
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.TileBounds
    },

    minX: {
        configurable: true,
        writable: true,
        value: undefined
    },

    maxX: {
        configurable: true,
        writable: true,
        value: undefined
    },

    minY: {
        configurable: true,
        writable: true,
        value: undefined
    },

    maxY: {
        configurable: true,
        writable: true,
        value: undefined
    },

    origin: {
        configurable: true,
        writable: true,
        value: undefined
    },

    zoom: {
        configurable: true,
        writable: true,
        value: undefined
    },

    tiles: {
        get: function () {
            if (!this._tiles) {
                this._tiles = this._makeTiles();
            }
            return this._tiles;
        }
    },

    _makeTiles: {
        value: function () {
            var tiles = [],
                minX = this.minX,
                minY = this.minY,
                maxX = this.maxX,
                maxY = this.maxY,
                zoom = this.zoom,
                i, j, length, length2;

            for (j = minY, length = maxY; j <= length; j++) {
                for (i = minX, length2 = maxX; i <= length2; i++) {
                    tiles.push(Tile.withIdentifier(i, j, zoom));
                }
            }
            return tiles;
        }
    },

    equals: {
        value: function (other) {
            return  this.minX === other.minX &&
                    this.maxX === other.maxX &&
                    this.minY === other.minY &&
                    this.maxY === other.maxY &&
                    this.zoom === other.zoom &&
                    this.origin.x === other.origin.x &&
                    this.origin.y === other.origin.y;
        }
    }

});

Object.defineProperties(exports.TileBounds, /** @lends TileBounds.prototype */ {

    withCoordinates: {
        value: function (minX, minY, maxX, maxY, zoom, origin) {
            var self = new exports.TileBounds();
            self.minX = minX;
            self.minY = minY;
            self.maxX = maxX;
            self.maxY = maxY;
            self.zoom = zoom;
            self.origin = origin;
            return self;
        }
    }

});
