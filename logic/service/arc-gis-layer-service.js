var LayerService = require("logic/service/layer-service").LayerService;

/**
 *
 * @type {function|*}
 */
exports.ArcGisLayerService = LayerService.specialize(/** @lends ArcGisLayerService.prototype */ {

    fetchRawData: {
        value: function (stream) {
            var criteria = stream.query.criteria,
                parameters = criteria && criteria.parameters,
                serviceUrl = parameters && parameters.serviceUrl;

            if (!serviceUrl) {
                stream.dataError(
                    "A fetch for ArcGIS layers requires the service" +
                    " url to be defined."
                );
            }

            this._fetchLayersFromArcGisServiceWithUrl(stream, serviceUrl);

        }
    },

    _fetchLayersFromArcGisServiceWithUrl: {
        value: function (stream, serviceUrl) {
            var self = this,
                url = new URL(serviceUrl);
            url.searchParams.append("f", "json")
            this.fetchHttpRawData(url.toString()).then(function (response) {
                var protocolId = self.protocol.id;
                self.addRawData(stream, response.layers.map(function (layer) {
                    var url = serviceUrl + "/" + layer.id;
                    return {
                        id: url,
                        name: layer.name,
                        description: layer.description,
                        depth: 3,
                        mapServiceLayerId: layer.name,
                        mapServiceLayerIndex: layer.id,
                        projectionId: response.spatialReference.wkid,
                        protocolId: protocolId,
                        protocolVersion: response.currentVersion,
                        refreshInterval: 500,
                        url: serviceUrl
                    };
                }));
                self.rawDataDone(stream);
            });
        }
    }

});
