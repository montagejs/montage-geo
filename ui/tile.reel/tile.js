var AbstractImage = require("montage/ui/base/abstract-image").AbstractImage;

/**
 * @class Tile
 * @extends Component
 */
exports.Tile = AbstractImage.specialize(/** @lends Tile.prototype */{

    /**************************************************************************
     * Properties
     */

    /**
     * Set by owner.
     * Will call tileDidLoad on the delegate if it is defined when a tile is loaded.
     * @type {object}
     * @public
     */
    delegate: {
        value: undefined
    },

    /**
     * Set by owner.
     * @type {Tile}
     * @public
     */
    tile: {
        get: function () {
            return this._tile;
        },
        set: function (value) {
            this._tile = value;
            this._updateTileSrc();
        }
    },

    _didReenter: {
        value: false
    },

    _updateTileSrc: {
        value: function () {
            this.element.removeAttribute("src");
            this.element.setAttribute("src", this._tileSrc);
        }
    },

    _tileSrc: {
        get: function () {
            var tile = this.tile,
                x = tile && this._normalize(tile.x, tile.z);
            return tile ?   "https://a.tile.openstreetmap.org/" + [tile.z, x, tile.y].join("/") + ".png" :
                            this._defaultImage;
        }
    },

    _defaultImage: {
        value: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAHCGzyUAAAAC0lEQVQI12P4zwAAAgEBAKrChTYAAAAASUVORK5CYII="
    },

    /**************************************************************************
     * Utilities
     */

    draw: {
        value: function () {
            if (this._didReenter) {
                this._updateTileSrc();
                this._didReenter = false;
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this._addEventListeners();
            }
            this._didReenter = !firstTime;
            this._updateTileSrc();
        }
    },

    _addEventListeners: {
        value: function () {
            var self = this;
            this.element.onload = function () {
                var isDefaultImage = this.src === self._defaultImage;
                if (!isDefaultImage && self.delegate && typeof self.delegate.tileDidLoad === "function") {
                    self.delegate.tileDidLoad(self.tile);
                }
            };

        }
    },

    /**************************************************************************
     * Utilities
     */

    _normalize: {
        value: function (x, z) {
            var numberTiles = Math.pow(2, z);
            x = Number(x);
            while (x < 0) {
                x += numberTiles;
            }
            return x % numberTiles;
        }
    }

});
