var HttpService = require("montage/data/service/http-service").HttpService,
    Map = require("montage/collections/map").Map,
    Protocol = require("logic/model/protocol").Protocol;

/**
 * Services that extend this class delegate to child services using protocol
 * based routing.
 * @type {ProtocolRoutedService}
 */
var ProtocolRoutedService = exports.ProtocolRoutedService = HttpService.specialize(/** @lends ProtocolRoutedService.prototype */ {

    /**************************************************************************
     * Properties
     */

    /**
     * Child services define which protocols they support for fetching layers.
     * @type {Protocol}
     */
    protocol: {
        value: undefined
    },

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
                    "The supplied protocol (" + protocol.id + ") is not supported"
                );
                return;
            }

            childService.fetchRawData(stream);
        }
    },

    protocolForStream: {
        value: function (stream) {
            var criteria = stream.query.criteria,
                parameters = criteria && criteria.parameters;
            return parameters && parameters.protocol;
        }
    },

    /**************************************************************************
     * Serialization
     */

    deserializeSelf: {
        value: function (deserializer) {
            var protocolId = deserializer.getProperty("protocolId");
            this.super(deserializer);
            if (protocolId) {
                this.protocol = Protocol.forId(protocolId);
            }
        }
    },

    /**************************************************************************
     * Protocol Methods
     */

    childServiceForProtocol: {
        value: function (protocol) {
            return this._protocolServiceMap.has(protocol) ?
                this._protocolServiceMap.get(protocol) : this._findChildServiceForProtocol(protocol);
        }
    },

    _findChildServiceForProtocol: {
        value: function (protocol) {
            var iterator = this.childServices.keys(),
                wasFound = false,
                childService;

            while(!wasFound && (childService = iterator.next().value)) {
                wasFound = childService instanceof ProtocolRoutedService && childService.protocol === protocol;
                if (wasFound) {
                    this._protocolServiceMap.set(protocol, childService);
                }
            }
            return wasFound ? childService : undefined;
        }
    },

    _protocolServiceMap: {
        get: function () {
            if (!this.__protocolServiceMap) {
                this.__protocolServiceMap = new Map();
            }
            return this.__protocolServiceMap;
        }
    },

    /**************************************************************************
     * Raw Data Service Overrides
     */

    mappingWithType: {
        value: function (type) {
            var mapping = this.super(type);
            if (!mapping && this.parentService instanceof ProtocolRoutedService) {
                mapping = this.parentService.mappingWithType(type);
            }
            return mapping;
        }
    }

});
