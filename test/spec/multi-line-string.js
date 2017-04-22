var MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    Position = require("montage-geo/logic/model/position").Position;

describe("A MultiLineString", function () {

    it("can be created", function () {
        var multiline = MultiLineString.withCoordinates([
            [[0, 0], [0, 10]],
            [[0, 0], [0, -10]],
            [[0, 0], [10, 0]],
            [[0, 0], [-10, 0]]
        ]);
        expect(multiline).toBeDefined();
        expect(multiline.coordinates.length).toBe(4);
        expect(multiline.coordinates[0][0].longitude).toBe(0);
        expect(multiline.coordinates[0][0].latitude).toBe(0);
        expect(multiline.coordinates[0][1].longitude).toBe(0);
        expect(multiline.coordinates[0][1].latitude).toBe(10);
    });

    it("can calculate its bbox", function () {
        var multiline = MultiLineString.withCoordinates([
            [[0, 0], [0, 10]],
            [[0, 0], [0, -10]],
            [[0, 0], [10, 0]],
            [[0, 0], [-10, 0]]
        ]);
        expect(multiline.bboxPositions.length).toBe(8);
        expect(multiline.bbox.join(",")).toBe("-10,-10,10,10");
        multiline.coordinates[0].push(Position.withCoordinates(0, 20));
        expect(multiline.bbox.join(",")).toBe("-10,-10,10,20");
        multiline.coordinates.push([
            Position.withCoordinates(20, 0),
            Position.withCoordinates(30, 0)
        ]);
        expect(multiline.bbox.join(",")).toBe("-10,-10,30,20");
        multiline.coordinates.pop();
        expect(multiline.bbox.join(",")).toBe("-10,-10,10,20");
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

});
