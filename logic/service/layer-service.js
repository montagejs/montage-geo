var HttpService = require("montage/data/service/http-service").HttpService,
    Protocol = require("logic/model/protocol").Protocol;

/**
 *
 * @type {function|*}
 */
var LayerService = exports.LayerService = HttpService.specialize(/** @lends LayerService.prototype */ {

    fetchRawData: {
        value: function (stream) {
            var criteria = stream.query.criteria,
                parameters = criteria && criteria.parameters,
                protocol = parameters && parameters.protocol,
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

            childService.fetchRawData(stream);

        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            var protocolId = deserializer.getProperty("protocolId");
            this.super(deserializer);
            if (protocolId) {
                this.protocol = Protocol.forId(protocolId);
            }
        }
    },

    childServiceForProtocol: {
        value: function (protocol) {
            var iterator = this.childServices.keys(),
                wasFound = false,
                childService;

            while(!wasFound && (childService = iterator.next().value)) {
                wasFound = childService.protocol === protocol;
            }
            return wasFound ? childService : undefined;
        }
    },

    mappingWithType: {
        value: function (type) {
            var mapping = this.super(type);
            if (!mapping && this.parentService instanceof LayerService) {
                mapping = this.parentService.mappingWithType(type);
            }
            return mapping;
        }
    },

    /**
     * Child services define which protocols they support for fetching layers.
     * @type {Protocol}
     */
    protocol: {
        value: undefined
    }


});
