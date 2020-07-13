var Montage = require("montage/core/core").Montage;

/**
 *
 * A layer represents a collection of geographic data.  Each layer provides a reference to
 * its data set and the instructions for how to display the information.
 *
 * @class
 * @extends external:Montage
 */
exports.Layer = Montage.specialize(/** @lends Layer.prototype */ {

    /**
     * The unique identifier for this layer.
     * @type {string}
     */
    id: {
        value: undefined
    },

    /**
     * The name of this layer.
     * @type {string}
     */
    name: {
        value: undefined
    },

    /**
     * A description of this layer.
     * @type {string}
     */
    description: {
        value: undefined
    },

    /**
     * The maximum zoom level this layer can be displayed at.
     * @type {number}
     */
    maxZoom: {
        value: undefined
    },

    /**
     * The minimum zoom level this layer can be displayed at.
     * @type {number}
     */
    minZoom: {
        value: undefined
    },

    /**
     * The number of seconds that this layer should cache its
     * data.  A value of zero indicates that this layer does
     * not need to be refreshed.
     *
     * @type {number}
     */
    refreshInterval: {
        value: 0
    },

    /**
     *
     * User to determine the stacking order of a layer within its
     * type.  Layers are stacked together first by their geometry type
     * e.g. Raster, Polygon, Line and Point.  The layer's depth indicates
     * the layer's stacking order within its type.  The lower the depth
     * the closer to the user it will appear.
     *
     * @type {number}
     * @default {3}
     */
    depth: {
        value: 3
    }

});
