var MultiPolygon = require("montage-geo/logic/model/multi-polygon").MultiPolygon,
    Position = require("montage-geo/logic/model/position").Position;

describe("A MultiPolygon", function () {

    it("can be created", function () {
        var multipolygon = MultiPolygon.withCoordinates([
            [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
            [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
        ]);
        expect(multipolygon).toBeDefined();
        expect(multipolygon.coordinates.length).toBe(2);
        expect(multipolygon.coordinates[0].length).toBe(1);
        expect(multipolygon.coordinates[1].length).toBe(1);
        expect(multipolygon.coordinates[0][0].length).toBe(5);
        expect(multipolygon.coordinates[1][0].length).toBe(5);
        expect(multipolygon.bbox.join(",")).toBe("-10,-10,10,10");
    });

    it("can update its bbox", function () {
        var multipolygon = MultiPolygon.withCoordinates([
            [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
            [[[0,0], [0,-10], [-10,-10], [-10,0], [0,0]]]
        ]);
        expect(multipolygon.bbox.join(",")).toBe("-10,-10,10,10");
        multipolygon.coordinates.push([[
            Position.withCoordinates(10, 0),
            Position.withCoordinates(10, 10),
            Position.withCoordinates(20, 10),
            Position.withCoordinates(20, 0),
            Position.withCoordinates(10, 0)
        ]]);
        expect(multipolygon.bbox.join(",")).toBe("-10,-10,20,10");
        multipolygon.coordinates.pop();
        expect(multipolygon.bbox.join(",")).toBe("-10,-10,10,10");
        multipolygon.coordinates[0][0].splice(3, 0, Position.withCoordinates(20, 10));
        expect(multipolygon.bbox.join(",")).toBe("-10,-10,20,10");
        multipolygon.coordinates[0][0].splice(3, 1);
        expect(multipolygon.bbox.join(",")).toBe("-10,-10,10,10");
    });


    // it("can calculate its bbox", function () {
    //     var multiline = MultiLineString.withCoordinates([
    //         [[0, 0], [0, 10]],
    //         [[0, 0], [0, -10]],
    //         [[0, 0], [10, 0]],
    //         [[0, 0], [-10, 0]]
    //     ]);
    //     expect(multiline.bboxPositions.length).toBe(8);
    //     expect(multiline.bbox.join(",")).toBe("-10,-10,10,10");
    //     multiline.coordinates[0].push(Position.withCoordinates(0, 20));
    //     expect(multiline.bbox.join(",")).toBe("-10,-10,10,20");
    //     multiline.coordinates.push([
    //         Position.withCoordinates(20, 0),
    //         Position.withCoordinates(30, 0)
    //     ]);
    //     expect(multiline.bbox.join(",")).toBe("-10,-10,30,20");
    //     multiline.coordinates.pop();
    //     expect(multiline.bbox.join(",")).toBe("-10,-10,10,20");
    // });
    //
    // it("can test for intersection with a line string", function () {
    //     var multiline = MultiLineString.withCoordinates([
    //             [[0, 0], [0, 10]],
    //             [[0, 0], [0, -10]],
    //             [[0, 0], [10, 0]],
    //             [[0, 0], [-10, 0]]
    //         ]),
    //         intersectingLine = LineString.withCoordinates([[-5, -5], [-5, 5]]),
    //         nonIntersectingLine = LineString.withCoordinates([[-5, -5], [-5, -15]]);
    //     expect(multiline.intersects(intersectingLine)).toBe(true);
    //     expect(multiline.intersects(nonIntersectingLine)).toBe(false);
    // });
    //
    // it("can test for intersection with a bounding box", function () {
    //     var multiline = MultiLineString.withCoordinates([
    //             [[0, 0], [0, 10]],
    //             [[0, 0], [0, -10]],
    //             [[0, 0], [10, 0]],
    //             [[0, 0], [-10, 0]]
    //         ]),
    //         intersectingBoundingBox = BoundingBox.withCoordinates(-7.5, -5, -2.5, 5),
    //         nonIntersectingBoundingBox = BoundingBox.withCoordinates(-5, -5, -15, -15);
    //     expect(multiline.intersects(intersectingBoundingBox)).toBe(true);
    //     expect(multiline.intersects(nonIntersectingBoundingBox)).toBe(false);
    // });

});
