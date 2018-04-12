var Circle = require("montage-geo/logic/model/circle").Circle,
    Bindings = require("montage-geo/frb/bindings"),
    Point = require("montage-geo/logic/model/point").Point,
    Position = require("montage-geo/logic/model/position").Position;

describe("A Circle", function () {

    it("can be created", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10000,
            circle = Circle.withCoordinates(coordinates, radius);
        expect(circle instanceof Circle).toBe(true);
        expect(circle.coordinates instanceof Position).toBe(true);
        expect(circle.coordinates.equals(Position.withCoordinates(coordinates))).toBe(true);
        expect(circle.radius === 10000).toBe(true);
    });

    it("can test for equality", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10000,
            c1 = Circle.withCoordinates(coordinates, radius),
            c2 = Circle.withCoordinates(coordinates, radius);
        expect(c1.equals(c2)).toBe(true);
    });

    it("can calculate if it contains a point", function () {
        var coordinates = [0, 0],
            radius = 120000,
            circle = Circle.withCoordinates(coordinates, radius),
            point1 = Point.withCoordinates([1, 0]),
            point2 = Point.withCoordinates([2, 0]);

        expect(circle.containsPoint(point1)).toBe(true);
        expect(circle.containsPoint(point2)).toBe(false);
    });

    it("can observe if it contains a point", function () {
        var coordinates = [0, 0],
            radius = 120000,
            circle = Circle.withCoordinates(coordinates, radius),
            point = Point.withCoordinates([1, 0]),
            controller = {
                circle: circle,
                contains: undefined,
                point: point
            };

        Bindings.defineBinding(controller, "contains", {"<-": "circle.containsPoint(point)"});

        expect(controller.contains).toBe(true);
        point.coordinates.longitude = 2;
        expect(controller.contains).toBe(false);
    });

    it("can calculate its area", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10,
            circle = Circle.withCoordinates(coordinates, radius);
        expect(Math.round(circle.area())).toBe(314);
    });

    it("can convert to polygon", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10000,
            circle = Circle.withCoordinates(coordinates, radius),
            polygon = circle.toPolygon();
        expect(polygon.coordinates.length).toBe(1);
        expect(polygon.coordinates[0].length).toBe(72);
    });

    it("can convert to GeoJSON", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10000,
            circle = Circle.withCoordinates(coordinates, radius),
            json = circle.toGeoJSON();

        expect(json.type).toBe("Polygon");
        expect(Array.isArray(json.coordinates)).toBe(true);
        expect(json.coordinates.length).toBe(1);
        expect(json.coordinates[0].length).toBe(72);
    });

    it("its area is observable", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10,
            circle = Circle.withCoordinates(coordinates, radius),
            controller = {
                circle: circle,
                area: undefined
            };

        Bindings.defineBinding(controller, "area", {"<-": "circle.area()"});

        expect(Math.round(controller.area)).toBe(314);
        circle.radius = 100;
        expect(Math.round(controller.area)).toBe(31416);
        circle.radius = 1000;
        expect(Math.round(controller.area)).toBe(3141593);
        circle.radius = 10;
        expect(Math.round(controller.area)).toBe(314);
    });

    it("can calculate its perimeter", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10,
            circle = Circle.withCoordinates(coordinates, radius);
        expect(Math.round(circle.perimeter())).toBe(63);
    });

    it("its area is observable", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10,
            circle = Circle.withCoordinates(coordinates, radius),
            controller = {
                circle: circle,
                perimeter: undefined
            };

        Bindings.defineBinding(controller, "perimeter", {"<-": "circle.perimeter()"});

        expect(Math.round(controller.perimeter)).toBe(63);
        circle.radius = 100;
        expect(Math.round(controller.perimeter)).toBe(628);
        circle.radius = 1000;
        expect(Math.round(controller.perimeter)).toBe(6283);
        circle.radius = 10;
        expect(Math.round(controller.perimeter)).toBe(63);
    });

    it("can clone itself", function () {
        var coordinates = [-156.6825, 20.8783],
            radius = 10,
            circle1 = Circle.withCoordinates(coordinates, radius),
            circle2 = circle1.clone();

        expect(circle1.coordinates.equals(circle2.coordinates)).toBe(true);
        expect(circle2.radius).toBe(10);
    });

});
