var Point2D = require("montage-geo/logic/model/point-2d").Point2D,
    Point = require("montage-geo/logic/model/point").Point;

describe("Point 2D", function () {

    var X = 10,
        Y = 20,
        point2D;

    beforeEach(function () {
        point2D = Point2D.withCoordinates(X, Y);
    });

    it("can be created", function () {
        expect(point2D).toBeDefined();
        expect(point2D.x).toBe(X);
        expect(point2D.y).toBe(Y);
    });

    it("can calculate the bearing to another 2D point", function () {
        var other = Point2D.withCoordinates(10, 40);
        expect(point2D.bearing(other)).toBe(0);
        other.x = 40;
        other.y = 20;
        expect(point2D.bearing(other)).toBe(90);
    });

    it("can calculate the distance to another 2D point", function () {
        var other = Point2D.withCoordinates(10, 40),
            distance = point2D.distance(other);
        expect(distance).toBe(20);
        other.x = 30;
        distance = point2D.distance(other);
        expect(Number(distance.toFixed(2))).toBe(28.28);
    });

    it("can add another 2D point to itself", function () {
        var added = point2D.add(Point2D.withCoordinates(10, 40));
        expect(added.x).toBe(20);
        expect(added.y).toBe(60);
    });

    it("can subtract another 2D point from itself", function () {
        var subtracted = point2D.subtract(Point2D.withCoordinates(10, 40));
        expect(subtracted.x).toBe(0);
        expect(subtracted.y).toBe(-20);
    });

    it("can calculate the midpoint between 2 points", function () {
        var midpoint = point2D.midPoint(Point2D.withCoordinates(10, 40));
        expect(midpoint.x).toBe(10);
        expect(midpoint.y).toBe(30);
    });

    it("can calculate the square distance between 2 points", function () {
        var squareDistance = point2D.squareDistance(Point2D.withCoordinates(10, 40));
        expect(squareDistance).toBe(400);
    });

    it("can create a point that is multiplied by the provided value", function () {
        var multiplied = point2D.multiply(10);
        expect(multiplied.x).toBe(100);
        expect(multiplied.y).toBe(200);
    });

    it("can create a point that is divided by the provided value", function () {
        var multiplied = point2D.multiply(10),
            divided = multiplied.divide(10);
        expect(divided.equals(point2D)).toBe(true);
    });

    it("can clone a point", function () {
        var cloned = point2D.clone();
        expect(cloned.x).toBe(10);
        expect(cloned.y).toBe(20);
    });

    it("can test for equality", function () {
        var other = point2D.clone();
        expect(point2D.equals(other)).toBe(true);
        other.x = 42;
        expect(point2D.equals(other)).toBe(false);
    });

    it("can be converted to a point", function () {
        var center = Point2D.withCoordinates(128, 128).toPoint(),
            min = Point2D.withCoordinates(0, 0).toPoint(),
            max = Point2D.withCoordinates(256, 256).toPoint();
        expect(center.coordinates).toBeDefined();
        expect(center.coordinates.latitude).toBeDefined();
        expect(center.coordinates.longitude).toBeDefined();
        expect(center.coordinates.latitude).toBe(0);
        expect(center.coordinates.longitude).toBe(0);
        expect(center.coordinates.latitude).toBe(0);
        expect(min.coordinates.longitude).toBe(-180);
        expect(max.coordinates.longitude).toBe(180);
        expect(Math.abs(max.coordinates.latitude)).toBe(min.coordinates.latitude);
    });

    it("can be converted from a position", function () {
        var center = Point2D.withPosition(Point.withCoordinates(0, 0).coordinates),
            min = Point2D.withPosition(Point.withCoordinates(-180, -90).coordinates),
            max = Point2D.withPosition(Point.withCoordinates(180, 90).coordinates);
        expect(center.x).toBe(128);
        expect(center.y).toBe(128);
        expect(min.x).toBe(0);
        expect(min.y).toBe(256);
        expect(max.x).toBe(256);
        expect(max.y).toBe(0);
    });
});
