/**
 * @module "ui/static-map.reel"
 */
var Component = require("montage/ui/component").Component,
    Position = require("logic/model/position").Position,
    Point2D = require("logic/model/point-2d").Point2D,
    Size = require("logic/model/size").Size,
    TileBounds = require("logic/model/tile-bounds").TileBounds;

/**
 * @class StaticMap
 * @extends Component
 */
exports.StaticMap = Component.specialize(/** @lends StaticMap.prototype */{

    /**
     * @type {Position|Point}
     * @default 0,0
     */
    center: {
        get: function () {
            if (!this._center) {
                this._center = Position.withCoordinates(0, 0);
            }
            return this._center;
        },
        set: function (value) {
            if (value && value !== this._center) {
                this._center = value;
            }
        }
    },

    /**
     * Zoom level of the map.
     * @type {Number}
     * @default 0
     */
    zoom: {
        get: function () {
            return this._zoom || 0;
        },
        set: function (value) {
            if (value != null && value !== this._zoom) {
                this._zoom = value;
            }
        }
    },

    /**
     * @type {Size}
     * @default 0x0
     */
    size: {
        get: function () {
            if (!this._size) {
                this._size = new Size();
            }
            return this._size;
        },
        set: function (value) {
            if (value && value !== this._size) {
                this._size = value;
            }
        }
    },

    /**
     * @type {Array<Layer>}
     */
    layers: {
        get: function () {
            if (!this._layers) {
                this._layers = [];
            }
            return this._layers;
        },
        set: function (value) {
            if (value && value !== this._layers) {
                this._layers = layers;
            }
        }
    },

    /**
     * @type {Array<FeatureCollection>}
     */
    featureCollections: {
        get: function () {
            if (!this._featureCollections) {
                this._featureCollections = [];
            }
            return this._featureCollections;
        },
        set: function (value) {
            if (value && value !== this._featureCollections) {
                this._featureCollections = value;
            }
        }
    },

    /**
     * @type {Object}
     */
    backgroundTileDelegate: {
        get: function () {
            return this._backgroundTileDelegate;
        },
        set: function (value) {
            if (value !== this._backgroundTileDelegate) {
                this._backgroundTileDelegate = value;
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this._context = this.canvas.getContext("2d");
            }
        }
    },

    draw: {
        value: function () {
            this.canvas.width = this.size.width;
            this.element.style.width = this.size.width + "px";
            this.canvas.height = this.size.height;
            this.element.style.height = this.size.height + "px";
            this.drawBaseMap();
        }
    },

    drawBaseMap: {
        value: function () {
            var self = this,
                ctx = this._context,
                tileBounds = this.makeTileBounds(),
                tiles = tileBounds.tiles;
            if (!this.backgroundTileDelegate) {
                return Promise.resolve();
            }
            return this.backgroundTileDelegate.loadTileImages(tiles).then(function () {
                var tilesOrigin = Position.withCoordinates(tiles[0].bounds.xMin, tiles[0].bounds.yMax),
                    tilesPixelOrigin = Point2D.withPosition(tilesOrigin, self.zoom),
                    xOffset = self.mercatorViewBounds.xmin - tilesPixelOrigin.x,
                    yOffset = self.mercatorViewBounds.ymin - tilesPixelOrigin.y;
                ctx.save();
                tiles.forEach(function (tile) {
                    ctx.drawImage(tile.image, -xOffset + 256 * (tile.x - tiles[0].x), -yOffset + 256 * (tile.y - tiles[0].y));
                });
                ctx.restore();
            });
        }
    },

    makeTileBounds: {
        value: function () {
            var zoomFactor = 1 << this.zoom,
                worldPixelRange = 256 * zoomFactor,
                bounds = this.mercatorViewBounds,
                xmin = Math.floor(zoomFactor * bounds.xmin / worldPixelRange),
                xmax = Math.floor(zoomFactor * bounds.xmax / worldPixelRange),
                ymin = Math.floor(zoomFactor * bounds.ymin / worldPixelRange),
                ymax = Math.floor(zoomFactor * bounds.ymax / worldPixelRange);
            return TileBounds.withCoordinates(xmin, ymin, xmax, ymax, this.zoom, null);
        }
    },

    mercatorViewBounds: {
        get: function () {
            if (!this._mercatorViewBounds) {
                var center = Point2D.withPosition(this.center, this.zoom);
                this._mercatorViewBounds = {
                    xmin: center.x - this.size.width / 2,
                    ymin: center.y - this.size.height / 2,
                    xmax: center.x + this.size.width / 2,
                    ymax: center.y + this.size.height / 2
                }
            }
            return this._mercatorViewBounds;
        }
    }
});
