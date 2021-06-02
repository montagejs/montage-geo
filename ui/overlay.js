var Component = require("montage/ui/component").Component,
    MapPane = require("logic/model/map-pane").MapPane;
/**
 * Overlays should subclass this class to inherit the delegate methods defined
 * herein.
 * @type {Overlay}
 */
exports.Overlay = Component.specialize(/** @lends Overlay */ {

    constructor: {
        value: function Overlay() {
            // Note 'pane == 4' in the binding. That should read 'pane == MapPane.NONE'
            this.defineBinding("_isEnabled", {"<-": "(pane == 4 || _isInDocument) && _isRegistered && map", source: this});
            this.addOwnPropertyChangeListener("_isEnabled", this.handleIsEnableDidChange.bind(this));
        }
    },

    /**************************************************************************
     * Properties
     */

    // subclass need to flip this switch
    hasTemplate: {
        value: false
    },

    /**
     * Subclasses should override this property to change which element of the
     * engine they should be added to.
     */
    pane: {
        value: MapPane.None
    },

    /**
     * Indicates if this overlay is in the DOM.
     * @type {boolean}
     */
    _isInDocument: {
        value: false
    },

    /**
     * This overlay is enabled if it is:
     * 1. In the DOM.
     * 2. Is registered with the map's engine.
     * 3. The map property is defined.
     * @type {boolean}
     */
    _isEnabled: {
        value: false
    },

    /**
     * Flag that indicates this overlay has been registered with the map.
     * @type {boolean}
     */
    _isRegistered: {
        value: false
    },

    /**************************************************************************
     * Component Delegate Methods
     */

    enterDocument: {
        value: function () {
            this._isInDocument = true;
        }
    },

    exitDocument: {
        value: function () {
            this._isInDocument = false;
        }
    },

    /**************************************************************************
     * Event Handling
     */

    handleIsEnableDidChange: {
        value: function (/* value */) {
        }
    },

    /**************************************************************************
     * Overlay Delegate Methods
     */

    /**
     * Called when the overlay is added to the engine.
     * @param {Map} - the engine the overlay was added to.
     */
    didAdd: {
        value: function (/* map */) {
            this._isRegistered = true;
        }
    },

    /**
     * Called when the overlay is removed from the engine.
     */
    didRemove: {
        value: function () {
            this._isRegistered = false;
        }
    },

    /**
     * This function is called when the map completes panning.
     * @param {Position} - the new center of the map.
     */
    didMove: {
        value: function (/* center */) {
            return void 0;
        }
    },

    /**
     * This function is called when the map engine did reset its view e.g after
     * the map has changed its zoom levels.
     */
    didReset: {
        value: function () {
            return void 0;
        }
    },

    /**
     * This function is called when the map is resized.
     * @param {Size} - the new size of the map.
     */
    resize: {
        value: function (/* size */) {
            return void 0;
        }
    },

    /**
     * This function is called when the map engine changes zoom level or resets
     * its view for any other reason.
     * @param {Position} - the current center of the map.
     * @param {Zoom} - the current zoom level of the map.
     */
    reset: {
        value: function (/* center, zoom */) {
            return void 0;
        }
    },

    /**
     * This function is called when the map engine will reset its view e.g when
     * the map is about to change zoom levels.
     */
    willReset: {
        value: function () {
            return void 0;
        }
    }

});

