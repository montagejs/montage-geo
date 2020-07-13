var LeafletEngine = require("montage-geo/ui/leaflet-engine.reel").LeafletEngine,
    Feature = require("montage-geo/logic/model/feature").Feature,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("montage-geo/logic/model/multi-point").MultiPoint,
    MultiPolygon = require("montage-geo/logic/model/multi-polygon").MultiPolygon,
    Point = require("montage-geo/logic/model/point").Point,
    Polygon = require("montage-geo/logic/model/polygon").Polygon;

describe("A Leaflet Engine", function () {

    var engine;

    beforeAll(function (done) {
        engine = new LeafletEngine();
        done();
    });

    it("can be created", function () {
        expect(engine).toBeDefined();
    });

    it("can properly pre-process Point coordinates", function () {
        var feature = Feature.withMembers(1, {}, Point.withCoordinates([-156.6825, 20.8783])),
            processed = engine._processCoordinates(feature.geometry);

        expect(processed[0]).toBe(20.8783);
        expect(processed[1]).toBe(-156.6825);

    });

    it("can properly pre-process MultiPoint coordinates", function () {
        var feature = Feature.withMembers(1, {}, MultiPoint.withCoordinates([
                [0, 0], [10, 0], [10, 10], [0, 10]
            ])),
            processed = engine._processCoordinates(feature.geometry);

        expect(processed[0][0]).toBe(0);
        expect(processed[0][1]).toBe(0);
        expect(processed[1][0]).toBe(0);
        expect(processed[1][1]).toBe(10);
        expect(processed[2][0]).toBe(10);
        expect(processed[2][1]).toBe(10);
        expect(processed[3][0]).toBe(10);
        expect(processed[3][1]).toBe(0);

    });

    it("can properly pre-process LineString coordinates", function () {
        var feature = Feature.withMembers(1, {}, LineString.withCoordinates([
                [178.68, 45.51],
                [-178.43, 37.77],
                [178.2, 34.04]
            ])),
            processed = engine._processCoordinates(feature.geometry);

        expect(processed[0][0]).toBe(45.51);
        expect(processed[0][1]).toBe(178.68);
        expect(processed[1][0]).toBe(37.77);
        expect(processed[1][1]).toBe(181.57);
        expect(processed[2][0]).toBe(34.04);
        expect(processed[2][1]).toBe(178.2);

    });

    it("can properly pre-process MultiLineString coordinates", function () {
        var feature = Feature.withMembers(1, {}, MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ])),
            processed = engine._processCoordinates(feature.geometry);

        expect(processed[0][0][0]).toBe(0);
        expect(processed[0][0][1]).toBe(0);
        expect(processed[0][1][0]).toBe(10);
        expect(processed[0][1][1]).toBe(0);
        expect(processed[1][0][0]).toBe(0);
        expect(processed[1][0][1]).toBe(0);
        expect(processed[1][1][0]).toBe(-10);
        expect(processed[1][1][1]).toBe(0);
        expect(processed[2][0][0]).toBe(0);
        expect(processed[2][0][1]).toBe(0);
        expect(processed[2][1][0]).toBe(0);
        expect(processed[2][1][1]).toBe(10);
        expect(processed[3][0][0]).toBe(0);
        expect(processed[3][0][1]).toBe(0);
        expect(processed[3][1][0]).toBe(0);
        expect(processed[3][1][1]).toBe(-10);

    });

    it("can properly pre-process Polygon coordinates", function () {
        var feature = Feature.withMembers(1, {}, Polygon.withCoordinates([
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ],
                [
                    [100.8, 0.8],
                    [100.8, 0.2],
                    [100.2, 0.2],
                    [100.2, 0.8],
                    [100.8, 0.8]
                ]
            ])),
            processed = engine._processCoordinates(feature.geometry);

        expect(processed[0][0][0]).toBe(0.0);
        expect(processed[0][0][1]).toBe(100.0);
        expect(processed[0][1][0]).toBe(0.0);
        expect(processed[0][1][1]).toBe(101.0);
        expect(processed[0][2][0]).toBe(1.0);
        expect(processed[0][2][1]).toBe(101.0);
        expect(processed[0][3][0]).toBe(1.0);
        expect(processed[0][3][1]).toBe(100.0);
        expect(processed[0][4][0]).toBe(0.0);
        expect(processed[0][4][1]).toBe(100.0);

        expect(processed[1][0][0]).toBe(0.8);
        expect(processed[1][0][1]).toBe(100.8);
        expect(processed[1][1][0]).toBe(0.2);
        expect(processed[1][1][1]).toBe(100.8);
        expect(processed[1][2][0]).toBe(0.2);
        expect(processed[1][2][1]).toBe(100.2);
        expect(processed[1][3][0]).toBe(0.8);
        expect(processed[1][3][1]).toBe(100.2);
        expect(processed[1][4][0]).toBe(0.8);
        expect(processed[1][4][1]).toBe(100.8);

    });

    it("can properly pre-process MultiPolygon coordinates", function () {

        var feature = Feature.withMembers(1, {}, MultiPolygon.withCoordinates([
                [
                    [
                        [102.0, 2.0],
                        [103.0, 2.0],
                        [103.0, 3.0],
                        [102.0, 3.0],
                        [102.0, 2.0]
                    ]
                ],
                [
                    [
                        [100.0, 0.0],
                        [101.0, 0.0],
                        [101.0, 1.0],
                        [100.0, 1.0],
                        [100.0, 0.0]
                    ],
                    [
                        [100.2, 0.2],
                        [100.2, 0.8],
                        [100.8, 0.8],
                        [100.8, 0.2],
                        [100.2, 0.2]
                    ]
                ]
            ])),
            processed = engine._processCoordinates(feature.geometry);

        expect(processed[0][0][0][0]).toBe(2.0);
        expect(processed[0][0][0][1]).toBe(102.0);
        expect(processed[0][0][1][0]).toBe(2.0);
        expect(processed[0][0][1][1]).toBe(103.0);
        expect(processed[0][0][2][0]).toBe(3.0);
        expect(processed[0][0][2][1]).toBe(103.0);
        expect(processed[0][0][3][0]).toBe(3.0);
        expect(processed[0][0][3][1]).toBe(102.0);
        expect(processed[0][0][4][0]).toBe(2.0);
        expect(processed[0][0][4][1]).toBe(102.0);

        expect(processed[1][0][0][0]).toBe(0.0);
        expect(processed[1][0][0][1]).toBe(100.0);
        expect(processed[1][0][1][0]).toBe(0.0);
        expect(processed[1][0][1][1]).toBe(101.0);
        expect(processed[1][0][2][0]).toBe(1.0);
        expect(processed[1][0][2][1]).toBe(101.0);
        expect(processed[1][0][3][0]).toBe(1.0);
        expect(processed[1][0][3][1]).toBe(100.0);
        expect(processed[1][0][4][0]).toBe(0.0);
        expect(processed[1][0][4][1]).toBe(100.0);

        expect(processed[1][1][0][0]).toBe(0.2);
        expect(processed[1][1][0][1]).toBe(100.2);
        expect(processed[1][1][1][0]).toBe(0.8);
        expect(processed[1][1][1][1]).toBe(100.2);
        expect(processed[1][1][2][0]).toBe(0.8);
        expect(processed[1][1][2][1]).toBe(100.8);
        expect(processed[1][1][3][0]).toBe(0.2);
        expect(processed[1][1][3][1]).toBe(100.8);
        expect(processed[1][1][4][0]).toBe(0.2);
        expect(processed[1][1][4][1]).toBe(100.2);

    });

});
