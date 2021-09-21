var Protocol = require("montage-geo/logic/model/protocol").Protocol;

describe("Protocol", function () {

    it("can register new Protocol", function () {
        var protocol = Protocol.createAndRegister(
            "assets",
            "assets",
            "Assets",
            true,
            false,
            true
        )
        expect(Protocol.ASSETS).toBe(protocol);
        expect(Protocol.forId("assets")).toBe(protocol);
        expect(protocol.supportsFeatureRequests).toBe(true);
        expect(protocol.supportsGenericMapImageRequests).toBe(false);
        expect(protocol.supportsTileImageRequests).toBe(true);
    })

})
