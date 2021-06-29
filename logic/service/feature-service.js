var ProtocolRoutedService = require("logic/service/protocol-routed-service").ProtocolRoutedService;

/**
 * Returns Feature objects from services and files in various formats.
 * @type {FeatureService}
 */
var FeatureService = exports.FeatureService = ProtocolRoutedService.specialize(/** @lends FeatureService.prototype */ {

    /**************************************************************************
     * Fetching
     */

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
                    "The supplied protocol (" + protocol.id + ") is not supported by FeatureService"
                );
                return;
            }
            childService.fetchFeatureData(stream);
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

    fetchFeatureData: {
        value: function (stream) {
            var criteria = stream.query.criteria,
                parameters = criteria.parameters,
                layer = parameters.layer,
                additionalCriteria = criteria.criteriaWithParameters(Object.assign({}, criteria.parameters)), //clone criteria
                self = this;


            // additionalCriteria.delete("layer");
            delete additionalCriteria.parameters.layer;

            this.fetchLayerFeaturesMatchingCriteria(layer, additionalCriteria).then(function (result) {
                self.addRawData(stream, result[0], result.length > 1 ? result[1] : null);
                self.rawDataDone(stream);
                return null;
            }).catch(function (error) {
                stream.dataError(error);
            });
        }
    },

    /**
     * Child Services must override this method to provide the Url to use for
     * map image request.
     * @method
     * @param {Layer} -     the layer that owns the features.
     * @param {Criteria?} = an optional set of additional filters.
     * @returns {Array} -   A tuple whose first member must be the feature raw
     *                      data array.  The returned result may have a second
     *                      member that is the context to pass to the service's
     *                      addRawData function.
     */
    fetchLayerFeaturesMatchingCriteria: {
        value: function (layer, criteria) {
            console.error("Only a subclass should call this method.");
        }
    },


    /****
     * Override MontageData API.
     */

    /**
     * DataService._addMappingToChild overwrites mapping.objectDescriptor to
     * ensure the objectDescriptor is present in service.types. This implementation
     * keeps mapping.objectDescriptor AS-IS if the objectDescriptor is not present
     * in service.types
     */
    _addMappingToChild: {
        value: function (mapping, child) {
            var service = this;
            return Promise.all([
                mapping.objectDescriptor,
                mapping.schemaDescriptor
            ]).spread(function (objectDescriptor, schemaDescriptor) {
                // TODO -- remove looking up by string to unique.
                var type = [objectDescriptor.module.id, objectDescriptor.name].join("/");
                // objectDescriptor = service._moduleIdToObjectDescriptorMap[type] || objectDescriptor;
                objectDescriptor = service._moduleIdToObjectDescriptorMap[type] || objectDescriptor;
                mapping.objectDescriptor = objectDescriptor;
                mapping.schemaDescriptor = schemaDescriptor;
                mapping.service = child;
                child.addMappingForType(mapping, objectDescriptor);
                return null;
            });
        }
    },

});
