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
        expect(multiline.coordinates[0].coordinates[0].longitude).toBe(0);
        expect(multiline.coordinates[0].coordinates[0].latitude).toBe(0);
        expect(multiline.coordinates[0].coordinates[1].longitude).toBe(0);
        expect(multiline.coordinates[0].coordinates[1].latitude).toBe(10);
    });

    it("can calculate its bounds", function () {
        var multiline = MultiLineString.withCoordinates([
            [[0, 0], [0, 10]],
            [[0, 0], [0, -10]],
            [[0, 0], [10, 0]],
            [[0, 0], [-10, 0]]
        ]);
        expect(multiline.positions.length).toBe(8);
        expect(multiline.bounds.bbox.join(",")).toBe("-10,-10,10,10");
        multiline.coordinates[0].coordinates.push(Position.withCoordinates(0, 20));
        expect(multiline.bounds.bbox.join(",")).toBe("-10,-10,10,20");
        multiline.coordinates.push(LineString.withCoordinates([[20, 0], [30, 0]]));
        expect(multiline.bounds.bbox.join(",")).toBe("-10,-10,30,20");
        multiline.coordinates.pop();
        expect(multiline.bounds.bbox.join(",")).toBe("-10,-10,10,20");
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

    it ("can test for equality", function () {
        var a = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            b = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            c = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            d = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[10, 0], [10, 0]],
                [[0, 0], [-10, 0]]
            ]),
            e = MultiLineString.withCoordinates([
                [[0, 0], [0, 10]],
                [[0, 0], [0, -10]],
                [[0, 0], [10, 0], [10, 10]],
                [[0, 0], [-10, 0]]
            ]);

        expect(a.equals(b)).toBe(true);
        // c has fewer line-string children
        expect(a.equals(c)).toBe(false);
        // d has a different longitude for the third child line-string's
        // first element
        expect(a.equals(d)).toBe(false);
        // e has an additional position in the third child line-string
        expect(a.equals(e)).toBe(false);
    });

});
