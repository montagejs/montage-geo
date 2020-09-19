var BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Point = require("montage-geo/logic/model/point").Point,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("montage-geo/logic/model/multi-point").MultiPoint,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer,
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
            coordinates = bounds.coordinates[0];
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

    it("can test if a position is on a boundary", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            isInBounds = Position.withCoordinates(5, 5),
            notOnBoundary = Position.withCoordinates(-10, 10),
            onBoundary = Position.withCoordinates(5, 10);
        expect(bounds.isPositionOnBoundary(isInBounds)).toBe(false);
        expect(bounds.isPositionOnBoundary(notOnBoundary)).toBe(false);
        expect(bounds.isPositionOnBoundary(onBoundary)).toBe(true);

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

        expect(inBoundsPoint.intersects(bounds)).toBe(true);
        expect(outBoundsPoint.intersects(bounds)).toBe(false);
    });

    it("can test if it contains multi-point features", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundsPoint = MultiPoint.withCoordinates([
                [-5, -5], [5, 5]
            ]),
            outBoundsPoint = MultiPoint.withCoordinates([
                [-5, -5], [-10, -10]
            ]);

        expect(inBoundsPoint.intersects(bounds)).toBe(true);
        expect(outBoundsPoint.intersects(bounds)).toBe(false);
    });

    it("can test if it contains or intersects line features", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundsLineString = LineString.withCoordinates([[1, 1], [9, 9]]),
            intersectingLineString = LineString.withCoordinates([[-1, -1], [11, 11]]),
            outBoundsLineString = LineString.withCoordinates([[0, -1], [10, -1]]);

        expect(inBoundsLineString.intersects(bounds)).toBe(true);
        expect(intersectingLineString.intersects(bounds)).toBe(true);
        expect(outBoundsLineString.intersects(bounds)).toBe(false);
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

        expect(inBoundsMultiLineString.intersects(bounds)).toBe(true);
        expect(intersectingMultiLineString.intersects(bounds)).toBe(true);
        expect(outBoundsMultiLineString.intersects(bounds)).toBe(false);
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

        expect(bounds.contains(inPosition)).toBe(true);
        expect(bounds.contains(outPosition)).toBe(false);
    });

    it("can test if it contains a bounding box", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inBoundingBoxA = BoundingBox.withCoordinates(1, 1, 9, 9),
            inBoundingBoxB = BoundingBox.withCoordinates(0, 0, 5, 5),
            outBoundingBoxA = BoundingBox.withCoordinates(5, 5, 15, 15),
            outBoundingBoxB = BoundingBox.withCoordinates(11, 11, 21, 21);

        expect(bounds.contains(inBoundingBoxA)).toBe(true);
        expect(bounds.contains(inBoundingBoxB)).toBe(true);
        expect(bounds.contains(outBoundingBoxA)).toBe(false);
        expect(bounds.contains(outBoundingBoxB)).toBe(false);
    });

    it ("can calculate its area", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            southWest = Position.withCoordinates(0, 0),
            northWest = Position.withCoordinates(0, 10),
            southEast = Position.withCoordinates(10, 0),
            height = southWest.distance(northWest),
            width = southWest.distance(southEast);

        expect((height / 1000).toFixed(0)).toBe("1112");
        expect((width / 1000).toFixed(0)).toBe("1112");
        expect((bounds.area / 1000).toFixed(0)).toBe("1236431171");

    });

    it ("can access its geohashes", function () {
        var bounds = BoundingBox.withCoordinates(-180, -85, 180, 85);
        expect(bounds.hashes.size).toBe(32);
    });

    it ("can be properly calculate its buffer", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10);
        bounds.buffer(100000);
        expect(Math.round(bounds.xMin * 10) / 10).toBe(-0.9);
        expect(Math.round(bounds.yMin * 10) / 10).toBe(-0.9);
        expect(Math.round(bounds.xMax * 10) / 10).toBe(10.9);
        expect(Math.round(bounds.yMax * 10) / 10).toBe(10.9);
    });

    it ("can be converted to a rect", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 180, 85.05112877980659),
            rect = bounds.toRect();

        expect(rect.origin).toBeDefined();
        expect(Math.round(rect.origin.x)).toBe(128);
        expect(Math.round(rect.origin.y)).toBe(0);
        expect(rect.size).toBeDefined();
        expect(Math.round(rect.size.width)).toBe(128);
        expect(Math.round(rect.size.height)).toBe(128);

    });

    it ("can be converted to a rect at provided zoom level", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 180, 85.05112877980659),
            rect = bounds.toRect(4),
            multiplied = 128 * Math.pow(2, 4);

        expect(rect.origin).toBeDefined();
        expect(Math.round(rect.origin.x)).toBe(multiplied);
        expect(Math.round(rect.origin.y)).toBe(0);
        expect(rect.size).toBeDefined();
        expect(Math.round(rect.size.width)).toBe(multiplied);
        expect(Math.round(rect.size.height)).toBe(multiplied);

    });

    it ("can be created with a rect", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 180, 85.05112877980659),
            rect = bounds.toRect(),
            reverted = BoundingBox.withRectAtZoomLevel(rect);

        expect(reverted.xMin).toBe(0);
        // TODO: Resolve but practically it is the same thing as 180.
        expect(reverted.xMax).toBe(-180);
        expect(reverted.yMin).toBe(0);
        expect(reverted.yMax).toBe(85.05113);

    });

    it ("can be created with a rect that crosses anti-meridian", function () {
        var bounds = BoundingBox.withCoordinates(90, 0, -90, 85.05112877980659),
            rect = bounds.toRect(),
            reverted = BoundingBox.withRectAtZoomLevel(rect);

        expect(reverted.xMin).toBe(90);
        expect(Math.round(reverted.xMax)).toBe(-90);
        expect(reverted.yMin).toBe(0);
        // Coordinates are trimmed at 5 decimal places
        expect(reverted.yMax).toBe(85.05113);

    });

    it("can serialize", function () {
        var bounds = BoundingBox.withCoordinates(90, 0, -90, 85.05112877980659),
            serializer = new Serializer().initWithRequire(require),
            serializedPosition = serializer.serializeObject(bounds);
        expect(serializedPosition).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var bounds = BoundingBox.withCoordinates(90, 0, -90, 85.05113),
            serializedBounds = new Serializer().initWithRequire(require).serializeObject(bounds);
        new Deserializer().init(serializedBounds, require).deserializeObject().then(function (deserializedBounds) {
            expect(deserializedBounds.xMin).toBe(90);
            expect(deserializedBounds.yMin).toBe(0);
            expect(deserializedBounds.xMax).toBe(-90);
            expect(deserializedBounds.yMax).toBe(85.05113);
            expect(deserializedBounds.equals(bounds)).toBe(true);
            done();
        });
    });

});
