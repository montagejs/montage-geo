var MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox;

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
        expect(multiline.coordinates[0][0].toArray().join(",")).toBe("0,0");
        expect(multiline.coordinates[0][1].toArray().join(",")).toBe("0,10");
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
