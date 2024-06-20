var MapImageService = require("logic/service/map-image-service").MapImageService,
    Protocol = require("logic/model/protocol").Protocol,
    Tile = require("logic/model/tile").Tile;

/**
 *
 * @type {function|*}
 */
exports.WmsMapImageService = MapImageService.specialize(/** @lends WmsMapImageService.prototype */ {

    defaultImageFormat: {
        value: "image/png"
    },

    makeUrlWithLayerAndMapImage: {
        value: function (layer, tile) {
            var bounds, tileSize, url, sridQueryParam;

            if (!(tile instanceof Tile)) {
                return;
            }

            bounds = layer.projection.projectBounds(tile.bounds);
            tileSize = tile.size;
            url = layer.url;
            sridQueryParam = parseFloat(layer.protocolVersion) >= 1.3 ? "CRS": "SRS";

            url = new URL(layer.url);
            url.searchParams.append("LAYERS", layer.mapServiceLayerId);
            url.searchParams.append("format", layer.imageFormat || this.defaultImageFormat);
            url.searchParams.append("version", layer.protocolVersion);
            url.searchParams.append("service", "WMS");
            url.searchParams.append("TRANSPARENT", "true");
            url.searchParams.append("request", "GetMap");
            url.searchParams.append("bboxSR", layer.projection.srid);
            url.searchParams.append(sridQueryParam, "EPSG:" + layer.projection.srid);
            url.searchParams.append("WIDTH", tileSize.width);
            url.searchParams.append("HEIGHT", tileSize.height);
            url.searchParams.append("BBOX", bounds.bbox.join(","));
            url.searchParams.append("STYLES", "");
            return url.href;
        }
    },

    protocol: {
        writable: false,
        value: Protocol.WMS
    }


});
