var Overlay = require("ui/overlay").Overlay,
    Map = require("montage/collections/map"),
    defaultMapImageDelegate = require("logic/model/map-image-delegate").defaultMapImageDelegate;

/**
 * @class ImageTileOverlay
 * @extends Component
 */
exports.MapImageOverlay = Overlay.specialize(/** @lends MapImageOverlay.prototype */{

    constructor: {
        value: function MapImageOverlay() {
            this.addBeforeOwnPropertyChangeListener("layer", this);
            this.addOwnPropertyChangeListener("layer", this);
        }
    },

    /**
     * The layer represents the data set to display in the overlay.
     * @type {Layer}
     */
    layer: {
        value: undefined
    },

    /**
     * The delegate to use for fetching images for tiles.
     * Set by owner
     * @type {TileDelegate}
     */
    mapImageDelegate: {
        get: function () {
            if (!this._mapImageDelegate) {
                this._mapImageDelegate = defaultMapImageDelegate;
            }
            return this._mapImageDelegate;
        },
        set: function (value) {
            if (value) {
                this._mapImageDelegate = value;
            }
        }
    },

    _mapImageElementMap: {
        get: function () {
            if (!this.__mapImageElementMap) {
                this.__mapImageElementMap = new Map();
                this.__mapImageElementMap.addMapChangeListener(this._mapImageElementMapChangeListener.bind(this));
            }
            return this.__mapImageElementMap;
        }
    },

    _mapImageFetchMap: {
        get: function () {
            if (!this.__mapImageFetchMap) {
                this.__mapImageFetchMap = new Map();
            }
            return this.__mapImageFetchMap;
        }
    },

    /**************************************************************************
     * Event Handlers
     */

    handleLayerWillChange: {
        value: function () {
            // TODO remove image element srcs...
        }
    },

    handleLayerChange: {
        value: function (value) {
            if (value) {
                this._fetchAllMapImages();
            }
        }
    },

    _mapImageElementMapChangeListener: {
        value: function (value, key) {
            if (value && key && this.layer) {
                this._fetchMapImage(key);
            }
        }
    },

    /**************************************************************************
     * Engine Delegate Methods
     */

    didAdd: {
        value: function (engine) {
            engine.registerImageOverlay(this);
        }
    },

    didRemove: {
        value: function (engine) {
            engine.unregisterImageOverlay(this);
        }
    },

    /**************************************************************************
     * Image Overlay Delegate Methods
     */

    elementForTile: {
        value: function (tile) {
            var element = document.createElement("IMG");
            this._mapImageElementMap.set(tile, element);
            return element;
        }
    },

    releaseTile: {
        value: function (tile) {
            var mapImageElementMap = this._mapImageElementMap,
                mapImageFetchMap = this._mapImageFetchMap;
            if (mapImageElementMap.has(tile)) {
                mapImageElementMap.delete(tile);
            }
            if (mapImageFetchMap.has(tile)) {
                this.mapImageDelegate.cancel(mapImageFetchMap.get(tile));
                mapImageFetchMap.delete(tile);
            }
        }
    },

    /**************************************************************************
     * Tile Fetching
     */

     _fetchAllMapImages: {
         value: function () {
             var iterator = this._mapImageElementMap.keys(),
                 tile;
             while ((tile = iterator.next().value)) {
                this._fetchTile(tile);
             }
         }
    },

    _fetchMapImage: {
         value: function (tile) {
            var self = this,
                promise = this.mapImageDelegate.fetchMapImageWithMapImageAndLayer(tile, this.layer);
            this._mapImageFetchMap.set(tile, promise);
            promise.then(function (cookedTile) {
                self._mapImageFetchMap.delete(tile);
                self._updateTileAssociatedElementWithImage(tile, cookedTile.dataUrl);
            }).catch(function () {
                self._mapImageFetchMap.delete(tile);
            });
         }
    },

    _updateTileAssociatedElementWithImage: {
         value: function (tile, imageSrc) {
            var element = this._mapImageElementMap.get(tile);
            if (element && imageSrc) {
                element.src = imageSrc;
            }
         }
    }

});
