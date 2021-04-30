/**
 * @module "ui/image-tile-overlay.reel"
 */
var Component = require("montage/ui/component").Component,
    WeakMap = require("montage/collections/weak-map").WeakMap;

/**
 * @class ImageTileOverlay
 * @extends Component
 */
exports.ImageTileOverlay = Component.specialize(/** @lends ImageTileOverlay.prototype */{


    constructor: {
        value: function ImageTileOverlay() {
            this.addOwnPropertyChangeListener("engine", this);
            this.addOwnPropertyChangeListener("layer", this);
        }
    },

    /**
     * The engine is a reference to the interface to the actual map
     * implementation technology, e.g., LeafletJS, Google Maps, etc.
     * @type {MapEngine}
     */
    engine: {
        value: undefined
    },

    /**
     * The layer represents the data set to display in the overlay.
     * @type {Layer}
     */
    layer: {
        value: undefined
    },

    _tileElementMap: {
        get: function () {
            if (!this.__tileElementMap) {
                this.__tileElementMap = new WeakMap();
            }
            return this.__tileElementMap;
        }
    },

    /**************************************************************************
     * Event Handlers
     */

    handleEngineChange: {
        value: function (value) {
            // TODO: reinitialize the overlay with the new implementation.
        }
    },

    handleLayerChange: {
        value: function (value) {
            // TODO: update the tiles with the new data set.
        }
    },

    /**************************************************************************
     * Setup
     */

    register: {
        value: function (engine) {
            // TODO: Invoke image overlay registration method on engine.
        }
    },

    /**************************************************************************
     * Teardown
     */

    unregister: {
        value: function (engine) {
            // TODO: Invoke unregister image overlay method on engine.
        }
    },


    /**************************************************************************
     * Image Overlay Delegate Methods
     */

    elementForTile: {
        value: function (tile) {
            var element = this._tileElementMap.get(tile);
            if (!element) {
                element = document.createElement("DIV");
                this._tileElementMap.set(tile, element);
            }
            return element;
        }
    },

    releaseTile: {
        value: function (tile) {
            this._tileElementMap.delete(tile);
        }
    }

});
