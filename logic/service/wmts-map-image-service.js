var MapImageService = require("logic/service/map-image-service").MapImageService,
    Protocol = require("logic/model/protocol").Protocol,
    Tile = require("logic/model/tile").Tile;

/**
 *
 * @type {function|*}
 */
exports.WmtsMapImageService = MapImageService.specialize(/** @lends WmsMapImageService.prototype */ {

    protocol: {
        writable: false,
        value: Protocol.WMTS
    },

    makeUrlWithLayerAndMapImage: {
        value: function (layer, tile) {
            if (!(tile instanceof Tile)) {
                return;
            }
            return layer.tileUrlTemplate ?  this._makeUrlFromTemplateForLayerAndTile(layer, tile) :
                                            this._makeDefaultUrlForLayerAndTile(layer, tile);
        }
    },

    _makeDefaultUrlForLayerAndTile: {
        value: function (layer, tile) {
            var url = new URL(layer.url + "/WMTS");
            url.searchParams.append("service", "WMTS");
            url.searchParams.append("version", layer.protocolVersion || "1.0.0");
            url.searchParams.append("request", "GetTile");
            url.searchParams.append("format", layer.imageFormat || "image/png");
            url.searchParams.append("tileMatrix", tile.z);
            url.searchParams.append("TileRow", tile.y);
            url.searchParams.append("TileCol", this._normalizeTileColumn(tile.x, tile.y, tile.z));
            url.searchParams.append("style", "default");
            url.searchParams.append("tileMatrixSet", layer.tileMatrixSet || "default028mm");
            url.searchParams.append("layer", layer.mapServiceLayerId);
            return url.href;
        }
    },

    _makeUrlFromTemplateForLayerAndTile: {
        value: function (layer, tile) {
            return layer.tileUrlTemplate
                .replace("/{Time}/", "/")
                .replace("{Style}", "default")
                .replace("{TileMatrixSet}", (layer.tileMatrixSet || "default028mm"))
                .replace("{TileMatrix}", tile.z)
                .replace("{TileRow}", tile.y)
                .replace("{TileCol}", this._normalizeTileColumn(tile.x, tile.y, tile.z));
        }
    },

    _normalizeTileColumn: {
        value: function (x, y, z) {
            var numberTiles = Math.pow(2, z);
            x = Number(x);
            while (x < 0) {
                x += numberTiles;
            }
            return x % numberTiles;
        }
    }

});
