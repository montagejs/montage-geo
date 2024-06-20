var MapImageService = require("logic/service/map-image-service").MapImageService,
    Protocol = require("logic/model/protocol").Protocol;

/**
 *
 * @type {function|*}
 */
exports.ArcGisMapImageService = MapImageService.specialize(/** @lends ArcGisLayerService.prototype */ {

    makeUrlWithLayerAndMapImage: {
        value: function (layer, mapImage) {
            var bounds = layer.projection.projectBounds(mapImage.bounds),
                mapImageSize = mapImage.size,
                url = new URL(layer.url + "/export");

            url.searchParams.append("format", layer.imageFormat || this.defaultImageFormat);
            url.searchParams.append("bboxSR", "EPSG:" + layer.projection.srid);
            url.searchParams.append("SRS", "EPSG:" + layer.projection.srid);
            url.searchParams.append("version", layer.protocolVersion);
            url.searchParams.append("BBOX", bounds.bbox.join(","));
            url.searchParams.append("layers", "show:" + layer.mapServiceLayerIndex);
            url.searchParams.append("size", [mapImageSize.width, mapImageSize.height].join(","));
            url.searchParams.append("transparent", "true");
            url.searchParams.append("f", "image");
            url.searchParams.append("dpi", mapImage.dpi);
            url.searchParams.append("imageSR", layer.projection.srid);
            return url.href;
        }
    },

    protocol: {
        writable: false,
        value: Protocol.ARCGIS
    }


});
