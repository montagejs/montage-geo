var FeatureService = require("logic/service/feature-service").FeatureService,
    Protocol = require("logic/model/protocol").Protocol;

/**
 * Returns Feature objects from services and files in various formats.
 * @type {FeatureService}
 */
var ArcGisFeatureService = exports.ArcGisFeatureService = FeatureService.specialize(/** @lends FeatureService.prototype */ {

    protocol: {
        writable: false,
        value: Protocol.ARCGIS
    }

});
