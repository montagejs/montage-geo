var MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    Bindings = require("montage-geo/frb/bindings"),
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    Position = require("montage-geo/logic/model/position").Position,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("A MultiLineString", function () {

    it("can be created", function () {
        var multiline = MultiLineString.withCoordinates([
            [[0, 0], [0, 10]],
            [[0, 0], [0, -10]],
            [[0, 0], [10, 0]],
            [[0, 0], [-10, 0]]
        ]);
        expect(multiline).toBeDefined();
        expect(multiline.identifier).toBeDefined();
        expect(multiline.coordinates.length).toBe(4);
        expect(multiline.coordinates[0].coordinates[0].longitude).toBe(0);
        expect(multiline.coordinates[0].coordinates[0].latitude).toBe(0);
        expect(multiline.coordinates[0].coordinates[1].longitude).toBe(0);
        expect(multiline.coordinates[0].coordinates[1].latitude).toBe(10);
    });

    it("can serialize", function () {
        var l1 = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(l1);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var l1 = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(l1);
        new Deserializer().init(serialized, require).deserializeObject().then(function (lineString) {
            expect(l1.equals(lineString)).toBe(true);
            done();
        });
    });

    it("can calculate its bounds", function () {
        var multiline = MultiLineString.withCoordinates([
            [[0, 0], [0, 10]],
            [[0, 0], [0, -10]],
            [[0, 0], [10, 0]],
            [[0, 0], [-10, 0]]
        ]);
        expect(multiline.bounds().bbox.join(",")).toBe("-10,-10,10,10");
        multiline.coordinates[0].coordinates.push(Position.withCoordinates(0, 20));
        expect(multiline.bounds().bbox.join(",")).toBe("-10,-10,10,20");
        multiline.coordinates.push(LineString.withCoordinates([[20, 0], [30, 0]]));
        expect(multiline.bounds().bbox.join(",")).toBe("-10,-10,30,20");
        multiline.coordinates.pop();
        expect(multiline.bounds().bbox.join(",")).toBe("-10,-10,10,20");
    });

    it("can create an observer for its bounds", function () {
        var geometry = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            controller = {
                geometry: geometry,
                bounds: undefined
            };

        Bindings.defineBinding(controller, "bounds", {"<-": "geometry.bounds()"});
        expect(controller.bounds.bbox.join(",")).toBe("-10,-10,10,10");
        geometry.coordinates.push(LineString.withCoordinates([[10, 10], [20, 20]]));
        expect(controller.bounds.bbox.join(",")).toBe("-10,-10,20,20");
        geometry.coordinates.pop();
        expect(controller.bounds.bbox.join(",")).toBe("-10,-10,10,10");
    });

    it("can test for intersection with a line string", function () {
        var multiline = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            intersectingLine = LineString.withCoordinates([[-5, -5], [-5, 5]]),
            nonIntersectingLine = LineString.withCoordinates([[-5, -5], [-5, -15]]);
        expect(multiline.intersects(intersectingLine)).toBe(true);
        expect(multiline.intersects(nonIntersectingLine)).toBe(false);
    });

    it("can test for intersection with a bounding box", function () {
        var multiline = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            intersectingBoundingBox = BoundingBox.withCoordinates(-7.5, -5, -2.5, 5),
            nonIntersectingBoundingBox = BoundingBox.withCoordinates(-5, -5, -15, -15);
        expect(multiline.intersects(intersectingBoundingBox)).toBe(true);
        expect(multiline.intersects(nonIntersectingBoundingBox)).toBe(false);
    });

    it ("can test for equality", function () {
        var a = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            b = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            c = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            d = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[10, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            e = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0], [10, 10]],
                [[0, 0], [-10, 0]]
            ]);

        expect(a.equals(b)).toBe(true);
        // c has fewer line-string children
        expect(a.equals(c)).toBe(false);
        // d has a different longitude for the third child line-string's
        // first element
        expect(a.equals(d)).toBe(false);
        // e has an additional position in the third child line-string
        expect(a.equals(e)).toBe(false);
    });

    it ("can clone itself", function () {
        var a = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            b = a.clone();

        expect(a.equals(b)).toBe(true);
    });

});
