var BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Point = require("montage-geo/logic/model/point").Point,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("montage-geo/logic/model/multi-point").MultiPoint,
    Position = require("montage-geo/logic/model/position").Position;

describe("A BoundingBox", function () {

    it("can be created", function () {
        var bounds = BoundingBox.withCoordinates(0, 10, 20, 30);
        expect(bounds).toBeDefined();
        expect(bounds.xMin).toBe(0);
        expect(bounds.xMax).toBe(20);
        expect(bounds.yMin).toBe(10);
        expect(bounds.yMax).toBe(30);
    });

    it("can convert to bbox", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10);
        expect(bounds.bbox.join(",")).toBe("0,0,10,10");

    });

    it("can convert to an array of coordinates", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            coordinates = bounds.coordinates;
        expect(coordinates.length).toBe(5);
        expect(coordinates[0].longitude).toBe(0);
        expect(coordinates[0].latitude).toBe(0);
        expect(coordinates[1].longitude).toBe(0);
        expect(coordinates[1].latitude).toBe(10);
        expect(coordinates[2].longitude).toBe(10);
        expect(coordinates[2].latitude).toBe(10);
        expect(coordinates[3].longitude).toBe(10);
        expect(coordinates[3].latitude).toBe(0);
        expect(coordinates[4].longitude).toBe(0);
        expect(coordinates[4].latitude).toBe(0);

    });

    it("can test for equality", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            otherBounds = BoundingBox.withCoordinates(0, 0, 10, 10);

        expect(bounds.equals(otherBounds)).toBe(true);
    });

    it("can test if it contains point features", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundsPoint = Point.withCoordinates([5, 5]),
            outBoundsPoint = Point.withCoordinates([5, -5]);

        expect(bounds.containsGeometry(inBoundsPoint)).toBe(true);
        expect(bounds.containsGeometry(outBoundsPoint)).toBe(false);
    });

    it("can test if it contains multi-point features", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundsPoint = MultiPoint.withCoordinates([
                [-5, -5], [5, 5]
            ]),
            outBoundsPoint = MultiPoint.withCoordinates([
                [-5, -5], [-10, -10]
            ]);

        expect(bounds.containsGeometry(inBoundsPoint)).toBe(true);
        expect(bounds.containsGeometry(outBoundsPoint)).toBe(false);
    });

    it("can test if it contains or intersects line features", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundsLineString = LineString.withCoordinates([[1, 1], [9, 9]]),
            intersectingLineString = LineString.withCoordinates([[-1, -1], [11, 11]]),
            outBoundsLineString = LineString.withCoordinates([[0, -1], [10, -1]]);

        expect(bounds.containsGeometry(inBoundsLineString)).toBe(true);
        expect(bounds.containsGeometry(intersectingLineString)).toBe(true);
        expect(bounds.containsGeometry(outBoundsLineString)).toBe(false);
    });

    it("can test if it contains or intersects multi-line features", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundsMultiLineString = MultiLineString.withCoordinates([
                [[1, -1], [1, -9], [9, -9], [9, -1]],
                [[1, 1], [1, 9], [9, 9], [9, 1]]
            ]),
            intersectingMultiLineString = MultiLineString.withCoordinates([
                [[-10, -1], [-1, -1], [10, -1], [10, -11]],
                [[-10, -1], [-1, -1], [11, 11], [1, 11]]
            ]),
            outBoundsMultiLineString = MultiLineString.withCoordinates([
                [[-10, -1], [-1, -1], [10, -1], [10, -11]]
            ]);

        expect(bounds.containsGeometry(inBoundsMultiLineString)).toBe(true);
        expect(bounds.containsGeometry(intersectingMultiLineString)).toBe(true);
        expect(bounds.containsGeometry(outBoundsMultiLineString)).toBe(false);
    });

    it("can test if it intersects another bounds", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            intersectingBounds = BoundingBox.withCoordinates(-5, -5, 5, 5),
            insideBounds = BoundingBox.withCoordinates(1, 1, 9, 9),
            outsideBounds = BoundingBox.withCoordinates(-1, -1, 11, 11),
            horizontalCrossBounds = BoundingBox.withCoordinates(-5, 4, 15, 6),
            verticalCrossBounds = BoundingBox.withCoordinates(4, -5, 6, 15),
            nonIntersectingBounds = BoundingBox.withCoordinates(11, 0, 11, 10);

        expect(bounds.intersects(intersectingBounds)).toBe(true);
        expect(bounds.intersects(insideBounds)).toBe(true);
        expect(bounds.intersects(outsideBounds)).toBe(true);
        expect(bounds.intersects(horizontalCrossBounds)).toBe(true);
        expect(bounds.intersects(verticalCrossBounds)).toBe(true);
        expect(bounds.intersects(nonIntersectingBounds)).toBe(false);

    });

    it("can test if it contains a position", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inPosition = Position.withCoordinates(5, 5),
            outPosition = Position.withCoordinates(-5, 5);

        expect(bounds.containsPosition(inPosition)).toBe(true);
        expect(bounds.containsPosition(outPosition)).toBe(false);
    });

});
