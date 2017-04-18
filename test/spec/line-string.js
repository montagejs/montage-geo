var LineString = require("montage-geo/logic/model/line-string").LineString,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox;

describe("A LineString", function () {

    it("can be created", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]);
        expect(line).toBeDefined();
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

});
