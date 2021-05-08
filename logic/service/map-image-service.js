var HttpService = require("montage/data/service/http-service").HttpService,
    Tile = require("logic/model/tile").Tile;

/**
 *
 * @type {function|*}
 */
exports.MapImageService = HttpService.specialize(/** @lends MapImageService.prototype */ {

    fetchRawData: {
        value: function (stream) {
            var self = this,
                request = new XMLHttpRequest(),
                parameters = stream.query.criteria.parameters,
                mapImage = parameters.mapImage,
                layer = parameters.layer,
                url = self.makeUrlWithLayerAndMapImage(layer, mapImage);

            stream.catch(function () {
                request.abort();
            });

            request.open("GET", url, true);
            request.onload = function () {
                var base64 = self._arrayBufferToBase64(request.response),
                    imageType = self._imageTypeFromBase64EncodedString(base64),
                    dataUrl = "data:image/" + imageType + ";base64," + base64,
                    rawData = self._rawDataForMapImageLayerAndDataUrl(mapImage, layer, dataUrl);

                self.addRawData(stream, [rawData]);
                self.rawDataDone(stream);
            };
            request.responseType = "arraybuffer";
            request.send(null);
        }
    },

    makeUrlWithLayerAndMapImage: {
        value: function (layer, mapImage) {
            return layer.protocol.makeUrlWithLayerAndTile(layer, mapImage);
        }
    },

    _arrayBufferToBase64: {
        value: function (buffer) {
            var binary = '',
                bytes = new Uint8Array(buffer),
                n = bytes.byteLength, i;
            for (i = 0; i < n; i += 1) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
    },

    _imageTypeFromBase64EncodedString: {
        value: function (encoded) {
            var char = encoded.charAt(0);
            return  char === "/" ? "jpg" :
                    char === "i" ? "png" :
                    char === "R" ? "gif" :
                    char === "U" ? "webp" :
                    char === "P" ? "svg" : "png";
        }
    },

    _rawDataForMapImageLayerAndDataUrl: {
        value: function (mapImage, layer, dataUrl) {
            var rawData = {};
            if (mapImage instanceof Tile) {
                rawData["x"] = mapImage.x;
                rawData["y"] = mapImage.y;
                rawData["z"] = mapImage.z;
            } else {
                rawData["id"] = mapImage.bounds.bbox.join(":");
            }
            rawData["layerId"] = layer.id;
            rawData["dataUrl"] = dataUrl;
            if (mapImage.size) {
                rawData["size"] = {
                    height: mapImage.size.height,
                    width: mapImage.size.width
                };
            }
            rawData["dpi"] = mapImage.dpi;
            return rawData;
        }
    }

});
