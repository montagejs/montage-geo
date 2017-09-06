var LineString = require("montage-geo/logic/model/line-string").LineString,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Position = require("montage-geo/logic/model/position").Position;

describe("A LineString", function () {

    function roundedBbox(bbox) {
        return bbox.map(function (coordinate) {
            return Math.round(coordinate);
        })
    }

    it("can be created", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]);
        expect(line).toBeDefined();
        expect(line.bounds.bbox.join(",")).toBe("0,0,0,10");
    });

    it("can be properly update its bounds", function () {
        var line = LineString.withCoordinates([[0, 0], [0, 10]]),
            position = Position.withCoordinates(10, 10);
        expect(roundedBbox(line.bounds.bbox).join(",")).toBe("0,0,0,10");
        line.coordinates.push(position);
        expect(roundedBbox(line.bounds.bbox).join(",")).toBe("0,0,10,10");
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

});
