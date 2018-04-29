var MultiPoint = require("montage-geo/logic/model/multi-point").MultiPoint,
    Bindings = require("montage-geo/frb/bindings"),
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Position = require("montage-geo/logic/model/position").Position,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("A MultiPoint", function () {

    it("can be created", function () {
        var geometry = MultiPoint.withCoordinates([
            [0, 0], [10, 0], [10, 10], [0, 10]
        ]);
        expect(geometry).toBeDefined();
        expect(geometry.coordinates.length).toBe(4);
        expect(geometry.bounds().bbox.join(",")).toBe("0,0,10,10");
    });

    it("can serialize", function () {
        var p1 = MultiPoint.withCoordinates([
                [0, 0], [10, 0], [10, 10], [0, 10]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(p1);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var p1 = MultiPoint.withCoordinates([
                [0, 0], [10, 0], [10, 10], [0, 10]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(p1);
        new Deserializer().init(serialized, require).deserializeObject().then(function (point) {
            expect(point.constructor.name).toBe("MultiPoint");
            expect(p1.equals(point)).toBe(true);
            done();
        });
    });

    it("can observe changes to coordinates", function () {
        var position = Position.withCoordinates(20, 20),
            geometry = MultiPoint.withCoordinates([
                [0, 0], [10, 0], [10, 10], [0, 10]
            ]);
        geometry.coordinates.push(position);
        expect(geometry.bounds().bbox.join(",")).toBe("0,0,20,20");
    });

    it("can create an observer for bounds", function () {
        var geometry = MultiPoint.withCoordinates([
                [0, 0], [10, 0], [10, 10], [0, 10]
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

    it ("can test for equality", function () {
        var a = MultiPoint.withCoordinates([[0, 0], [10, 0], [10, 10], [0, 10]]),
            b = MultiPoint.withCoordinates([[0, 0], [10, 0], [10, 10], [0, 10]]),
            c = MultiPoint.withCoordinates([[0, 0], [10, 0], [10, 10]]),
            d = MultiPoint.withCoordinates([[0, 0], [10, 0], [10, 10], [10, 10]]);

        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
        expect(a.equals(d)).toBe(false);
    });

    it ("can clone itself", function () {
        var a = MultiPoint.withCoordinates([[0, 0], [10, 0], [10, 10], [0, 10]]),
            b = a.clone();

        expect(a.equals(b)).toBe(true);
    });

});
