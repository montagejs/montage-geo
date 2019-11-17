var MultiPolygon = require("montage-geo/logic/model/multi-polygon").MultiPolygon,
    Bindings = require("montage-geo/frb/bindings"),
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Polygon = require("montage-geo/logic/model/polygon").Polygon,
    Position = require("montage-geo/logic/model/position").Position,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("A MultiPolygon", function () {

    function roundedBbox(bbox) {
        return bbox.map(function (coordinate) {
            return Math.round(coordinate);
        })
    }

    it("can be created", function () {
        var multipolygon = MultiPolygon.withCoordinates([
            [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
            [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
        ]);
        expect(multipolygon).toBeDefined();
        expect(multipolygon.coordinates.length).toBe(2);
        expect(multipolygon.coordinates[0] instanceof Polygon).toBe(true);
        expect(multipolygon.coordinates[1] instanceof Polygon).toBe(true);
        expect(multipolygon.coordinates[0].coordinates[0].length).toBe(5);
        expect(multipolygon.coordinates[1].coordinates[0].length).toBe(5);
        expect(roundedBbox(multipolygon.bounds().bbox).join(",")).toBe("-10,-10,10,10");
    });


    it("can serialize", function () {
        var p1 = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(p1);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var p1 = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(p1);
        new Deserializer().init(serialized, require).deserializeObject().then(function (polygon) {
            expect(p1.equals(polygon)).toBe(true);
            done();
        });
    });

    it("can update its bounds", function () {
        var multipolygon = MultiPolygon.withCoordinates([
            [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
            [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
        ]);
        expect(roundedBbox(multipolygon.bounds().bbox).join(",")).toBe("-10,-10,10,10");
        multipolygon.coordinates.push(Polygon.withCoordinates([
            [[10, 0], [10, 10], [20, 10], [20, 0], [10, 0]]
        ]));
        expect(roundedBbox(multipolygon.bounds().bbox).join(",")).toBe("-10,-10,20,10");
        multipolygon.coordinates.pop();
        expect(roundedBbox(multipolygon.bounds().bbox).join(",")).toBe("-10,-10,10,10");
        multipolygon.coordinates[0].coordinates[0].splice(3, 0, Position.withCoordinates(20, 10));
        expect(roundedBbox(multipolygon.bounds().bbox).join(",")).toBe("-10,-10,20,10");
        multipolygon.coordinates[0].coordinates[0].splice(3, 1);
        expect(roundedBbox(multipolygon.bounds().bbox).join(",")).toBe("-10,-10,10,10");
    });

    it("can create an observer for its bounds", function () {
        var geometry = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
            ]),
            controller = {
                geometry: geometry,
                bounds: undefined
            };

        Bindings.defineBinding(controller, "bounds", {"<-": "geometry.bounds()"});
        expect(controller.bounds.bbox.map(function (coordinate) {
            return Math.round(coordinate);
        }).join(",")).toBe("-10,-10,10,10");
        geometry.coordinates.push(Polygon.withCoordinates([[[10,10], [10,20], [20,20], [20,0], [10,10]]]));
        expect(controller.bounds.bbox.map(function (coordinate) {
            return Math.round(coordinate);
        }).join(",")).toBe("-10,-10,20,20");
        geometry.coordinates.pop();
        expect(controller.bounds.bbox.map(function (coordinate) {
            return Math.round(coordinate);
        }).join(",")).toBe("-10,-10,10,10");
    });

    it ("can test for equality", function () {
        var a = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
            ]),
            b = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
            ]),
            c = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0]]]
            ]),
            d = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]],
                [[[0,-10], [0,-20], [-10,-20], [-10,-10], [0,-10]]]

            ]),
            e = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-20], [-10,-10], [-10,0], [0,0]]]
            ]);

        expect(a.equals(b)).toBe(true);
        // c has one less position in its second polygon's outer ring
        expect(a.equals(c)).toBe(false);
        // d has a different number of child polygons
        expect(a.equals(d)).toBe(false);
        // e has a different latitude for the 2nd child polygon's latitude in
        // the outer ring's second position.
        expect(a.equals(e)).toBe(false);
    });

    it ("can clone itself", function () {
        var a = MultiPolygon.withCoordinates([
                [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
                [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
            ]),
            b = a.clone();

        expect(a.equals(b)).toBe(true);
    });

});
