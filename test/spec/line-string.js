var LineString = require("montage-geo/logic/model/line-string").LineString;

describe("A LineString", function () {

    it("can be created", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]);
        expect(line).toBeDefined();
    });

    it("can test for intersection", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]),
            intersectingLine = LineString.withCoordinates([[-5, 5], [5, 5]]),
            nonIntersectingLine = LineString.withCoordinates([[-5, -5], [5, -5]]);
        expect(line.intersects(intersectingLine)).toBe(true);
        expect(line.intersects(nonIntersectingLine)).toBe(false);
    });

});
