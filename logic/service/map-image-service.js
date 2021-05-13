var ProtocolRoutedService = require("logic/service/protocol-routed-service").ProtocolRoutedService,
    Tile = require("logic/model/tile").Tile;

/**
 *
 * @type {function|*}
 */
exports.MapImageService = ProtocolRoutedService.specialize(/** @lends MapImageService.prototype */ {

    fetchRawData: {
        value: function (stream) {
            var protocol = this.protocolForStream(stream),
                childService = protocol && this.childServiceForProtocol(protocol);

            if (!protocol) {
                // TODO: Implement Auto-discovery of protocol
                stream.dataError(
                    "A fetch for layers requires the protocol and the service" +
                    " url to be defined."
                );
                return;
            } else if (!childService) {
                stream.dataError(
                    "The supplied protocol (" + protocol.id + ") is not supported"
                );
                return;
            }
            childService.fetchMapImageData(stream);
        }
    },

    protocolForStream: {
        value: function (stream) {
            var criteria = stream.query.criteria,
                parameters = criteria && criteria.parameters,
                layer = parameters && parameters.layer;
            return layer && layer.protocol;
        }
    },

    fetchMapImageData: {
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

    /**
     * Child Services must override this method to provide the Url to use for
     * map image request.
     * @param {Layer}
     * @param {MapImage}
     * @type {function}
     * @returns {string}
     */
    makeUrlWithLayerAndMapImage: {
        value: function (layer, mapImage) {
            console.error("Only a subclass should call this method.");
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
