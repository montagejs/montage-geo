var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    defaultLocalizer = require("montage/core/localizer").defaultLocalizer,
    Layer = require("montage-geo/logic/model/layer").Layer,
    Protocol = require("montage-geo/logic/model/protocol").Protocol,
    Service = require("data/montage-data.mjson").montageObject; // Keep.  Used to load the main service.

defaultLocalizer.locale = "en-US";

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    constructor: {
        value: function Main() {
            this._fetchArcGisLayers();
        }
    },

    _arcGisLayers: {
        value: undefined
    },

    _fetchArcGisLayers: {
        value: function () {
            var self = this,
                parameters = {
                    protocol: Protocol.ARCGIS,
                    serviceUrl: "https://org-disasteralert.pdc.org/disasteralert/spoe/SPOEID018/LiveFeeds/USGS_Seismic_Data/MapServer"
                },
                expression = "$protocol == protocol && $serviceUrl == serviceUrl",
                criteria = new Criteria().initWithExpression(expression, parameters),
                query = DataQuery.withTypeAndCriteria(Layer, criteria);

            return Service.fetchData(query).then(function (layers) {
                layers.forEach(function (layer) {
                    layer.featureMinZoom = Infinity;
                });
                self._arcGisLayers = layers;
                return null;
            });
        }
    }

});
