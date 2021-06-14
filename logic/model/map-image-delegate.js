var Montage = require("montage/core/core").Montage,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    DataService = require("montage/data/service/data-service").DataService,
    DataStream = require("montage/data/service/data-stream").DataStream,
    MapImage = require("logic/model/map-image").MapImage,
    Promise = require("montage/core/promise").Promise,
    Tile = require("logic/model/tile").Tile,
    TransparentImage = require("logic/model/tile").TransparentImage;

/**
 *
 * The tile-overlay uses this delegate to fetch map images to display in its
 * mosaic.  This default implementation fetches map images using Montage Data.
 * Implement this delegate if you need an alternative way of supplying map
 * images.
 *
 * @class
 * @extends external:Montage
 */
var MapImageDelegate = exports.MapImageDelegate = Montage.specialize(/** @lends MapImageDelegate.prototype */ {

    /**
     * @param {MapImage|Tile} - the map image that defines the geometry of the
     *                          data to request.
     * @param {Layer} -         the data set to use for the source.
     * @returns {Promise} -     a Promise for the map image with its data url
     *                          defined.  Note that the returned map image is
     *                          not necessarily the same object in memory as
     *                          the map image passed in as an argument.
     */
    fetchMapImageWithMapImageAndLayer: {
        value: function (mapImage, layer) {

            var rootService = DataService.mainService;

            if (!rootService || (
                !rootService.childServiceForType(Tile) &&
                !rootService.childServiceForType(MapImage)
            )) {
                return this.constructor._TransparentImagePromise;
            }

            return this._fetch(mapImage, layer).then(function (data) {
                return data && data.length > 0 ? data[0] : null;
            });
        }
    },

    /**
     * Method for cancelling the Promise for a map image returned by the method
     * fetchMapImageWithMapImageAndLayer.
     * @param {Object}
     */
    cancel: {
        value: function (stream) {
            if (stream instanceof DataStream) {
                stream.dataError("Request Cancelled by Client");
            }
        }
    },

    _fetch: {
        value: function (mapImage, layer) {
            var criteria = new Criteria().initWithExpression("$mapImage == mapImage && $layer == layer", {
                    mapImage: mapImage,
                    layer: layer
                }),
                query = DataQuery.withTypeAndCriteria(Tile, criteria);

            return DataService.mainService.fetchData(query);
        }
    }

}, {

    Instance: {
        get: function () {
            if (!this._Instance) {
                this._Instance = new this();
            }
            return this._Instance;
        }
    },

    _TransparentImagePromise: {
        get: function () {
            if (!this.__TransparentImagePromise) {
                this.__TransparentImagePromise = new Promise(function (resolve, reject) {
                    var image = new Image();
                    image.onload = function () {
                        resolve(image);
                    };
                    image.onerror = function (e) {
                        console.log("error", e);
                        reject(e);
                    };
                    image.setAttribute("crossOrigin", "anonymous");
                    image.src = TransparentImage;
                    return image;
                });
            }
            return this.__TransparentImagePromise;
        }
    }

});

exports.defaultMapImageDelegate = MapImageDelegate.Instance;
