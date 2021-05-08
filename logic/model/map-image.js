var BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Uuid = require("montage/core/uuid").Uuid;

/**
 * One of the tiles in a raster {@link Layer}.
 *
 * @class MapImage
 * @extends external:Montage
 */
var MapImage = exports.MapImage = function () {};

exports.MapImage.prototype = Object.create({}, /** @lends MapImage.prototype */ {

    constructor: {
        configurable: true,
        writable: true,
        value: MapImage
    },

    id: {
        get: function () {
            if (!this._id) {
                this._id = Uuid.generate();
            }
            return this._id;
        },
        set: function (value) {
            this._id = value;
        }
    },

    /**
     * The extent of this image.
     * @type {BoundingBox}
     */
    bounds: {
        get: function () {
            return this._bounds;
        }
    },

    _bounds: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * The size of this image in pixels.
     * @type {Size}
     */
    size: {
        get: function () {
            return this._size;
        },
        configurable: true
    },

    _size: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * The device resolution of this image (dots per inch).
     * @type {Number}
     * @default 96
     */
    dpi: {
        get: function () {
            return this._dpi;
        },
        set: function (value) {
            this._dpi = value;
        }
    },

    _dpi: {
        configurable: true,
        writable: true,
        value: 96
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
     * @type {string}
     */
    dataUrl: {
        configurable: true,
        writable: true,
        value: undefined
    },

    /**
     * @type {Image}
     */
    image: {
        configurable: true,
        writable: true,
        value: undefined
    }

});

Object.defineProperties(exports.MapImage, {

    withBoundsAndSize: {
        value: function (bounds, size) {
            var mapImage = new this();
            mapImage._bounds = bounds;
            mapImage._size = size;
            return mapImage;
        }
    },

    withBoundsAndSizeAndDpi: {
        value: function (bounds, size, dpi) {
            var mapImage = new this();
            mapImage._bounds = bounds;
            mapImage._size = size;
            mapImage._dpi = dpi;
            return mapImage;
        }
    },

    mapImagesInBoundsWithZoomAndDpi: {
        value: function (bounds, zoom, dpi) {
            return bounds.splitAlongAntimeridian().map(function (bounds) {
                return MapImage.withBoundsAndSizeAndDpi(bounds, bounds.toRect(zoom).size, dpi);
            });
        }
    }
});
