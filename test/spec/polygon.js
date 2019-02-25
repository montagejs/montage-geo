var Polygon = require("montage-geo/logic/model/polygon").Polygon,
    Bindings = require("montage-geo/frb/bindings"),
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Position = require("montage-geo/logic/model/position").Position,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("A Polygon", function () {

    function roundedBbox(bbox) {
        return bbox.map(function (coordinate) {
            return Math.round(coordinate);
        })
    }

    it("can be created", function () {
        var p1 = Polygon.withCoordinates([
            [[0,0], [0,10], [10,10], [10,0], [0,0]]
        ]);
        expect(p1.identifier).toBeDefined();
        expect(p1.coordinates.length).toBe(1);
        expect(p1.coordinates[0].length).toBe(5);
    });

    it("can serialize", function () {
        var p1 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(p1);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var p1 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(p1);
        new Deserializer().init(serialized, require).deserializeObject().then(function (polygon) {
            expect(p1.equals(polygon)).toBe(true);
            done();
        });
    });

    it("can properly create its bounds.", function () {
        var p1 = Polygon.withCoordinates([
            [[0,0], [0,10], [10,10], [10,0], [0,0]]
        ]);
        expect(roundedBbox(p1.bounds().bbox).join(",")).toBe("0,0,10,10");
    });

    it("can properly calculate its area", function () {
        var p1 = Polygon.withCoordinates([
            [[0,0], [0,10], [10,10], [10,0], [0,0]]
        ]);
        expect(Math.round(p1.area() / 1000)).toBe(1233);
    });

    it("can properly observe its area", function () {
        var polygon = Polygon.withCoordinates([
            [[0,0], [0,10], [10,10], [10,0], [0,0]]
        ]),
            p1 = Position.withCoordinates([0, 20]),
            p2 = Position.withCoordinates([20, 20]),
            p3 = Position.withCoordinates([20, 0]),
            controller = {
                polygon: polygon,
                area: undefined
            },
            coordinates = polygon.coordinates[0];

        Bindings.defineBinding(controller, "area", {"<-": "polygon.area()"});
        expect(Math.round(controller.area / 1000)).toBe(1233);
        coordinates.splice.apply(coordinates, [1, 3].concat([p1, p2, p3]));
        expect(Math.round(controller.area / 1000)).toBe(4857);
    });

    it("can properly calculate its perimeter", function () {
        var p1 = Polygon.withCoordinates([
            [[0,0], [0,10], [10,10], [10,0], [0,0]]
        ]);
        expect(Math.round(p1.perimeter() / 1000)).toBe(4431);
    });

    it("can properly observe its perimeter", function () {
        var polygon = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            p1 = Position.withCoordinates([0, 20]),
            p2 = Position.withCoordinates([10, 20]),
            p3 = Position.withCoordinates([10, 0]),
            controller = {
                polygon: polygon,
                perimeter: undefined
            },
            coordinates = polygon.coordinates[0];

        Bindings.defineBinding(controller, "perimeter", {"<-": "polygon.perimeter()"});
        expect(Math.round(controller.perimeter / 1000)).toBe(4431);
        coordinates.splice.apply(coordinates, [1, 3].concat([p1, p2, p3]));
        expect(Math.round(controller.perimeter / 1000)).toBe(6604);
    });

    it("can properly update its bounds.", function () {
        var p1 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            p2 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]);
        p1.coordinates[0].splice(1, 1, Position.withCoordinates(0, 20));
        p2.coordinates[0].splice(2, 0, Position.withCoordinates(5, 20));
        expect(roundedBbox(p1.bounds().bbox).join(",")).toBe("0,0,10,20");
        expect(roundedBbox(p2.bounds().bbox).join(",")).toBe("0,0,10,20");
        p2.coordinates[0].splice(2, 1);
        expect(roundedBbox(p2.bounds().bbox).join(",")).toBe("0,0,10,10");
        p1.coordinates = [
            [
                Position.withCoordinates(10, 10),
                Position.withCoordinates(10, 20),
                Position.withCoordinates(20, 20),
                Position.withCoordinates(20, 10),
                Position.withCoordinates(10, 10)
            ]
        ];
        expect(roundedBbox(p1.bounds().bbox).join(",")).toBe("10,10,20,20");
    });

    it("can create an observer for its bounds", function () {
        var geometry = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            controller = {
                geometry: geometry,
                bounds: undefined
            };

        Bindings.defineBinding(controller, "bounds", {"<-": "geometry.bounds()"});
        expect(controller.bounds.bbox.map(function (coordinate) {
            return Math.round(coordinate);
        }).join(",")).toBe("0,0,10,10");
        geometry.coordinates[0].splice(2, 0, Position.withCoordinates(20, 20));
        expect(controller.bounds.bbox.map(function (coordinate) {
            return Math.round(coordinate);
        }).join(",")).toBe("0,0,20,20");
        geometry.coordinates[0].splice(2, 1);
        expect(controller.bounds.bbox.map(function (coordinate) {
            return Math.round(coordinate);
        }).join(",")).toBe("0,0,10,10");
    });

    it("can test another polygon for intersection", function () {
        var p1 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            p2 = Polygon.withCoordinates([
                [[5,5], [5,15], [15,15], [15,5], [5,5]]
            ]);
        expect(p1.intersects(p2)).toBe(true);
    });

    it("can test another if polygon is in a hole", function () {
        var p1 = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]],
                [[10,10], [10,30], [30,30], [30,10], [10,10]]
            ]),
            p2 = Polygon.withCoordinates([
                [[15,15], [15,25], [25,25], [25,15], [15,15]]
            ]);
        expect(p1.intersects(p2)).toBe(false);
    });

    it("can test for equality", function () {
        var a = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]],
                [[10,10], [10,30], [30,30], [30,10], [10,10]]
            ]),
            b = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]],
                [[10,10], [10,30], [30,30], [30,10], [10,10]]
            ]),
            c = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]]
            ]),
            d = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]],
                [[10,10], [10,30], [30,0], [30,10], [10,10]]
            ]),
            e = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]],
                [[10,10], [10,30], [30,0], [10,10]]
            ]);

        expect(a.equals(b)).toBe(true);
        // c only doesn't have a hole
        expect(a.equals(c)).toBe(false);
        // d has a different latitude in the hole's 3rd element
        expect(a.equals(d)).toBe(false);
        // e has a different number of positions in its hole.
        expect(a.equals(e)).toBe(false);

    });

    it("can clone itself", function () {
        var a = Polygon.withCoordinates([
                [[0,0], [0,40], [40,40], [40,0], [0,0]],
                [[10,10], [10,30], [30,30], [30,10], [10,10]]
            ]),
            b = a.clone();

        expect(a.equals(b)).toBe(true);
    });


});
