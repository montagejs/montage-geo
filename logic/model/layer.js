 var Montage = require("montage/core/core").Montage,
     Projection = require("logic/model/projection").Projection,
     Protocol = require("logic/model/protocol").Protocol;

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
     * A layer may optionally provide a collection of features to directly draw onto the
     * map.
     * @type {FeatureCollection}
     */
    featureCollection: {
        value: undefined
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
    },

    /**
     * if the layer's protocol supports drawing the layer as features or as
     * raster images, this property indicates at which zoom level the map
     * draws the data as features.
     * @type {number}
     */
    featureMinZoom: {
        value: 0
    },

    /**
     * The image format to use for requesting map images.
     * @type {String}
     */
    imageFormat: {
        value: "image/png"
    },

    /**
     * The ID of the layer in the map service that hosts it.
     * @type {String}
     */
    mapServiceLayerId: {
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
     * The renderer used to style this layer's features.
     * @type{Renderer}
     */
    renderer: {
        value: undefined
    },

    /**
     * The coordinate system used to store the layer's geometry.
     * @type {Porjection}
     */
    projection: {
        value: undefined
    },

    /**
     * The shape of this layer's data.
     * @type {Protocol}
     */
    protocol: {
        value: undefined
    },

    /**
     * The resource location that provides this layer's data.
     * @type {String}
     */
    url: {
        value: undefined
    },

    /**************************************************************************
     * Serialization
     */

    deserializeSelf: {
        value: function (deserializer) {
            var projectionId, protocolId;
            this.id = deserializer.getProperty("id");
            this.name = deserializer.getProperty("name");
            this.description = deserializer.getProperty("description");
            this.depth = deserializer.getProperty("depth");
            this.imageFormat = deserializer.getProperty("imageFormat");
            this.mapServiceLayerId = deserializer.getProperty("mapServiceLayerId");
            this.maxZoom = deserializer.getProperty("maxZoom");
            this.minZoom = deserializer.getProperty("minZoom");
            projectionId = deserializer.getProperty("projectionId");
            if (projectionId) {
                this.projection = Projection.forSrid(projectionId);
            }
            protocolId = deserializer.getProperty("protocolId");
            if (protocolId) {
                this.protocol = Protocol.forId(protocolId);
            }
            this.refreshInterval = deserializer.getProperty("refreshInterval");
            this.renderer = deserializer.getProperty("renderer");
            this.url = deserializer.getProperty("url");
        }
    }

});
