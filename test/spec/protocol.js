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
        expect(protocol._supportedImageFormats.size).toBe(0);
    })

    it("can register new Protocol with supported image formats", function () {
        var protocol = Protocol.createAndRegister(
            "regions",
            "regions",
            "Regions",
            true,
            false,
            true,
            new Set([
                "image/png",
                "image/jpeg"
            ])
        )
        expect(Protocol.REGIONS).toBe(protocol);
        expect(Protocol.forId("regions")).toBe(protocol);
        expect(protocol.supportsFeatureRequests).toBe(true);
        expect(protocol.supportsGenericMapImageRequests).toBe(false);
        expect(protocol.supportsTileImageRequests).toBe(true);
        expect(protocol._supportedImageFormats.size).toBe(2);
        expect(protocol.isSupportedImageFormat("image/png")).toBe(true);
        expect(protocol.isSupportedImageFormat("image/jpeg")).toBe(true);
        expect(protocol.isSupportedImageFormat("image/png8")).toBe(false);
    })

    it("can reject new Protocol with duplicate id", function () {
        var protocol = Protocol.createAndRegister(
            "ArcGIS Server REST",
            "ARCGIS_tmp",
            "ArcGIS_tmp",
            true,
            false,
            true
        )
        expect(protocol).not.toBeDefined();
    })

    it("can reject new Protocol with duplicate value name", function () {
        var protocol = Protocol.createAndRegister(
            "ArcGIS GeoServer",
            "ARCGIS",
            "ArcGIS",
            true,
            false,
            true
        )
        expect(protocol).not.toBeDefined();
    })

})
