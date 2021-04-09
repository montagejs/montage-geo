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
            p4 = Position.withCoordinates([0, 30]),
            p5 = Position.withCoordinates([30, 30]),
            p6 = Position.withCoordinates([30, 0]),
            controller = {
                polygon: polygon,
                area: undefined
            },
            coordinates = polygon.coordinates[0];

        Bindings.defineBinding(controller, "area", {"<-": "polygon.area()"});
        expect(Math.round(controller.area / 1000)).toBe(1233);
        coordinates.splice.apply(coordinates, [1, 3].concat([p1, p2, p3]));
        expect(Math.round(controller.area / 1000)).toBe(4857);
        polygon.coordinates = [[polygon.coordinates[0][0], p4, p5, p6, polygon.coordinates[0][0]]];
        expect(Math.round(controller.area / 1000)).toBe(10650);
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
            p4 = Position.withCoordinates([0, 30]),
            p5 = Position.withCoordinates([30, 30]),
            p6 = Position.withCoordinates([30, 0]),
            controller = {
                polygon: polygon,
                perimeter: undefined
            },
            coordinates = polygon.coordinates[0];

        Bindings.defineBinding(controller, "perimeter", {"<-": "polygon.perimeter()"});
        expect(Math.round(controller.perimeter / 1000)).toBe(4431);
        coordinates.splice.apply(coordinates, [1, 3].concat([p1, p2, p3]));
        expect(Math.round(controller.perimeter / 1000)).toBe(6604);
        polygon.coordinates = [[polygon.coordinates[0][0], p4, p5, p6, polygon.coordinates[0][0]]];
        expect(Math.round(controller.perimeter / 1000)).toBe(12888);
    });

    it("can calculate the bounds of a small polygon", function () {
        // {minX: -121.9464, minY: 37.3368, maxX: -121.8989, maxY: 37.3792}
        var polygon = Polygon.withCoordinates([
                [[-121.9464,37.3368], [-121.9464,37.3792], [-121.8989,37.3792], [-121.8989,37.3368], [-121.9464,37.3368]]
            ]),
            bounds = polygon.bounds();
        expect(bounds.xMin).toBe(-121.9464);
        expect(bounds.yMin).toBe(37.3368);
        expect(bounds.xMax).toBe(-121.8989);
        expect(bounds.yMax).toBe(37.3792);

    });
    it("can calculate the bounds of a small office", function () {
        var ring = [
                [-121.9435,37.3775], [-121.9464,37.3626], [-121.9369,37.353], [-121.9281,37.3393], [-121.9066,37.3368],
                [-121.8989,37.3416], [-121.9016,37.3521], [-121.9043,37.3623], [-121.909,37.3736], [-121.9174,37.3786],
                [-121.9315,37.3792], [-121.9435,37.3775]
            ].reverse(),
            polygon = Polygon.withCoordinates([ring]),
            bounds = polygon.bounds(),
            woFn = function (ring) {
                var sum = 0,
                    i, j, n, p1, p2;
                for (i = 0, n = ring.length; i < n; i += 1) {
                    j = i + 1;
                    if (j === n) {
                        j = 0;
                    }
                    p1 = ring[i];
                    p2 = ring[j];
                    sum += (p2[0] - p1[0]) * (p2[1] + p1[1]);
                }
                return sum >= 0;
            };

        expect(woFn(ring)).toBe(true);

        expect(bounds.xMin).toBe(-121.9464);
        expect(bounds.yMin).toBe(37.3368);
        expect(bounds.xMax).toBe(-121.8989);
        expect(bounds.yMax).toBe(37.3792);

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

    it("can observe tests for intersection", function () {
        var p1 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            p2 = Polygon.withCoordinates([
                [[5,5], [5,15], [15,15], [15,5], [5,5]]
            ]),
            p3 = Polygon.withCoordinates([
                [[-10,0], [-10,10], [0,10], [0,0], [-10,0]]
            ]),
            p4 = Polygon.withCoordinates([
                [[-5,5], [-5,15], [5,15], [5,5], [-5,5]]
            ]),
            p4Perimeter = p4.coordinates[0].slice(),
            controller = {
                intersects: false,
                geometry: p2,
                polygon: p1
            };
        Bindings.defineBinding(controller, "intersects", {"<-": "polygon.intersects(geometry)"});
        expect(controller.intersects).toBeTruthy();
        controller.geometry = p3;
        expect(controller.intersects).toBeFalsy();
        controller.polygon = p4;
        expect(controller.intersects).toBeTruthy();
        controller.polygon.coordinates.splice.apply(controller.polygon.coordinates, [0, Infinity].concat(p1.coordinates));
        expect(controller.intersects).toBeFalsy();
        controller.polygon.coordinates[0].splice.apply(controller.polygon.coordinates[0], [0, Infinity].concat(p4Perimeter));
        expect(controller.intersects).toBeTruthy();
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

    xit("can split along the anti-meridian", function () {
        // var polygon = Polygon.withCoordinates([
        //         [[-170,0], [-170,40], [170,40], [170,0], [-170,0]]
        //     ]),
        //     split = polygon.splitAlongAntiMeridian();
        // expect(split).toBeDefined();
        // expect(split.length).toBe(2);
    });

});
