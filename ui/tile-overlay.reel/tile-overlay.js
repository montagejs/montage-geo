var Overlay = require("ui/overlay").Overlay,
    Map = require("montage/collections/map").Map,
    MapPane = require("logic/model/map-pane").MapPane,
    Montage = require("montage/core/core").Montage,
    Point2D = require("logic/model/point-2d").Point2D,
    Rect = require("logic/model/rect").Rect,
    Tile = require("logic/model/tile").Tile,
    TileBounds = require("logic/model/tile-bounds").TileBounds;

/**
 * @class TileOverlay
 * @extends Component
 */
exports.TileOverlay = Overlay.specialize(/** @lends TileOverlay.prototype */{

    /**************************************************************************
     * Properties
     */

    /**
     * The current bounds of the map.
     * @type {BoundingBox}
     */
    bounds: {
        value: null
    },

    hasTemplate: {
        value: true
    },

    map: {
        get: function () {
            return this._map;
        },
        set: function (value) {
            if (value !== this._map) {
                this._map = value;
                this.defineBinding("bounds", {"<-": "bounds", source: value});
                this.defineBinding("zoom", {"<-": "zoom", source: value});
            }
        }
    },

    /**
     * The maximum zoom level up to which this overlay will be displayed.
     * @type {Number}
     */
    maxZoom: {
        value: Infinity
    },

    /**
     * The minimum zoom level up to which this overlay will be displayed.
     */
    minZoom: {
        value: 0
    },

    /**
     * Opacity of the tiles.
     * @type {number}
     */
    opacity: {
        value: 1
    },

    /**
     * Subclasses should override this property to change which element of the
     * engine they should be added to.
     */
    pane: {
        writable: false,
        value: MapPane.Overlay
    },

    /**
     * The explicit z-index of the tile overlay.
     * @type {number}
     */
    zIndex: {
        value: 1
    },

    /**
     * The map's current zoom level
     * @type {number}
     */
    zoom: {
        value: 0
    },

    _levelsMap: {
        get: function () {
            if (!this.__levelsMap) {
                this.__levelsMap = new Map();
            }
            return this.__levelsMap;
        }
    },

    _levels: {
        get: function () {
            if (!this.__levels) {
                this.__levels = [];
            }
            return this.__levels;
        }
    },

    /**************************************************************************
     * Overlay Delegate Methods
     */

    didAdd: {
        value: function () {
            this.super();
            this._update();
        }
    },

    didMove: {
        value: function (center) {
            if (!this._isZooming) {
                this._update(center, this.zoom);
            }
        }
    },

    didReset: {
        value: function () {
            if (this._isZooming) {
                this._isZooming = false;
            }
        }
    },

    reset: {
        value: function (center, zoom) {
            if (zoom !== this.zoom || !center.equals(this.center)) {
                this._update(center, zoom);
            }
        }
    },

    willReset: {
        value: function () {
            if (!this._isZooming) {
                this._isZooming = true;
            }
        }
    },

    _update: {
        value: function (center, zoom) {
            var map = this.map,
                currentZoom = this.zoom;

            console.log("UPDATE...");
            if (!map) {
                return;
            }

            center = center || map.center;
            zoom = zoom || map.zoom;
            if (zoom !== currentZoom || !this._levelsMap.has(zoom)) {
                if (this._levels.length >= 2) {
                    this._switchToNewZoom(zoom);
                } else {
                    this._disableCurrentLevelBoundsListener();
                    this._addLevelForZoom(zoom);
                }
                this.zoom = zoom;
            }
            if (!this.center || !this.center.equals(center)) {
                this.center = center;
            }
            this._updateTileBounds(center, zoom);
        }
    },

    _updateTileBounds: {
        value: function (center, zoom) {
            var map = this.map,
                numberTiles = Math.pow(2, zoom),
                centerPoint = Point2D.withPosition(center, 0),
                size = map.size,
                mapCenter = map.positionToPoint(center),
                mapOrigin = mapCenter.subtract({
                    x: size.width / 2,
                    y: size.height / 2
                }),
                mapRect = Rect.withOriginAndSize(mapOrigin, size),
                centerTile = Tile.withIdentifier(
                    Math.floor((centerPoint.x * numberTiles) / 256),
                    Math.floor((centerPoint.y * numberTiles) / 256),
                    zoom
                ),
                centerTileBounds = centerTile.bounds,
                origin = map.positionToPoint({
                    longitude: centerTileBounds.xMin,
                    latitude: centerTileBounds.yMax
                }),
                minX = centerTile.x - Math.ceil((origin.x - mapRect.xMin) / 256),
                minY = centerTile.y - Math.ceil((origin.y - mapRect.yMin) / 256),
                tileOrigin = {
                    x: origin.x - ((centerTile.x - minX) * 256) - mapRect.xMin,
                    y: origin.y - ((centerTile.y - minY) * 256) - mapRect.yMin
                },
                maxX = minX + Math.ceil((Math.abs(tileOrigin.x) + mapRect.size.width - 256) / 256),
                maxY = minY + Math.ceil((Math.abs(tileOrigin.y) + mapRect.size.height - 256) / 256),
                tileBounds;

            while (minX < 0) {
                minX += numberTiles;
            }
            while (maxX < minX) {
                maxX += numberTiles;
            }
            tileBounds = TileBounds.withCoordinates(
                minX, minY, maxX, maxY, zoom, tileOrigin
            );
            if (!this._tileBounds || !this._tileBounds.equals(tileBounds)) {
                this._tileBounds = tileBounds;
            }
        }
    },

    _switchToNewZoom: {
        value: function (zoom) {
            var levels = this._levels,
                currentZoom = this.zoom,
                wasFound = false,
                newLevel = new Level(zoom),
                level, i;
            newLevel.defineBinding("tileBounds", {"<-": "_tileBounds", source: this});
            for (i = levels.length - 1; i >= 0 && !wasFound; i -= 1) {
                level = levels[i];
                if ((wasFound = level.zoom === currentZoom)) {
                    level.cancelBinding("tileBounds");
                    this._levelsMap.delete(i);
                    levels.splice(i, 1, newLevel);
                }
            }
        }
    },

    _pruneLevels: {
        value: function () {
            var levelsMap = this._levelsMap,
                zoom = this.zoom;
            levelsMap.forEach(function (level, key) {
                if (key !== zoom) {
                    levelsMap.delete(key);
                    this._removeLevel(level);
                }
            }, this);
        }
    },

    _disableCurrentLevelBoundsListener: {
        value: function () {
            var levels = this._levels,
                currentZoom = this.zoom,
                wasFound = false,
                level, i, n;
            for (i = 0, n = levels.length; i < n && !wasFound; i += 1) {
                level = levels[i];
                if ((wasFound = level.zoom === currentZoom)) {
                    level.cancelBinding("tileBounds");
                }
            }
        }
    },

    // _disableCurrentLevelBoundsListener: {
    //     value: function () {
    //         var levelsMap = this._levelsMap,
    //             zoom = this.zoom;
    //
    //         levelsMap.forEach(function (level, key) {
    //             if (key === zoom) {
    //                 level.cancelBinding("tileBounds");
    //             }
    //         });
    //     }
    // },

    _addLevelForZoom: {
        value: function (zoom) {
            var level = new Level(zoom);
            level.defineBinding("tileBounds", {"<-": "_tileBounds", source: this});
            this._levelsMap.set(zoom, level);
            this._levels.push(level);
        }
    },

    _removeLevel: {
        value: function (level) {
            var levels = this._levels,
                wasFound = false,
                aLevel, i;
            for (i = levels.length - 1; i >= 0 && !wasFound; i--) {
                aLevel = levels[i];
                if ((wasFound = aLevel === level)) {
                    levels.splice(i, 1);
                }
            }
        }
    },

    /**************************************************************************
     * Event Handlers
     */

    /**************************************************************************
     * Tile Management
     */


});

var Level = Montage.specialize(/**@lends Level.prototype */ {

    constructor: {
        value: function (zoom) {
            this._zoom = zoom;
        }
    },

    tileBounds: {
        value: undefined
    },

    _zoom: {
        value: undefined
    },

    zoom: {
        get: function () {
            return this._zoom;
        }
    }

});



