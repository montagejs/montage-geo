var LineString = require("montage-geo/logic/model/line-string").LineString,
    Bindings = require("montage-geo/frb/bindings"),
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Position = require("montage-geo/logic/model/position").Position,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("A LineString", function () {

    function roundedBbox(bbox) {
        return bbox.map(function (coordinate) {
            return Math.round(coordinate);
        })
    }

    it("can be created", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]);
        expect(line).toBeDefined();
        expect(line.bounds().bbox.join(",")).toBe("0,0,0,10");
    });

    it("can serialize", function () {
        var l1 = LineString.withCoordinates([[0, 0], [0, 10]]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(l1);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var l1 = LineString.withCoordinates([[0, 0], [0, 10]]),
            serialized = new Serializer().initWithRequire(require).serializeObject(l1);
        new Deserializer().init(serialized, require).deserializeObject().then(function (lineString) {
            expect(l1.equals(lineString)).toBe(true);
            done();
        });
    });

    it("can be properly update its bounds", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]),
            position = Position.withCoordinates(10, 10);
        expect(roundedBbox(line.bounds().bbox).join(",")).toBe("0,0,0,10");
        line.coordinates.push(position);
        expect(roundedBbox(line.bounds().bbox).join(",")).toBe("0,0,10,10");
    });

    it("can create an observer for its bounds", function () {
        var geometry = LineString.withCoordinates([
                [0, 0], [10, 10]
            ]),
            controller = {
                geometry: geometry,
                bounds: undefined
            };

        Bindings.defineBinding(controller, "bounds", {"<-": "geometry.bounds()"});
        expect(controller.bounds.bbox.join(",")).toBe("0,0,10,10");
        geometry.coordinates.push(Position.withCoordinates(20, 20));
        expect(controller.bounds.bbox.join(",")).toBe("0,0,20,20");
        geometry.coordinates.pop();
        expect(controller.bounds.bbox.join(",")).toBe("0,0,10,10");
    });

    it("can test for intersection with another line string", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]),
            intersectingLine = LineString.withCoordinates([[-5, 5], [5, 5]]),
            nonIntersectingLine = LineString.withCoordinates([[-5, -5], [5, -5]]);
        expect(line.intersects(intersectingLine)).toBe(true);
        expect(line.intersects(nonIntersectingLine)).toBe(false);
    });

    it("can test for intersection with a bounding box", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]),
            intersectingBoundingBox = BoundingBox.withCoordinates(-5, -5, 5, 5),
            nonIntersectingBoundingBox = BoundingBox.withCoordinates(-5, -5, -15, -15);
        expect(line.intersects(intersectingBoundingBox)).toBe(true);
        expect(line.intersects(nonIntersectingBoundingBox)).toBe(false);
    });

    it ("can test for equality", function () {
        var a = LineString.withCoordinates([[0, 0], [10, 0], [10, 10], [0, 10]]),
            b = LineString.withCoordinates([[0, 0], [10, 0], [10, 10], [0, 10]]),
            c = LineString.withCoordinates([[0, 0], [10, 0], [10, 10]]),
            d = LineString.withCoordinates([[0, 0], [10, 0], [10, 10], [10, 10]]);

        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
        expect(a.equals(d)).toBe(false);
    });

    it ("can test clone itself", function () {
        var a = LineString.withCoordinates([[0, 0], [10, 0], [10, 10], [0, 10]]),
            b = a.clone();

        expect(a.equals(b)).toBe(true);
    });

});
