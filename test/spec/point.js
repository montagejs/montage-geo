var Point = require("montage-geo/logic/model/point").Point,
    Bindings = require("montage-geo/frb/bindings"),
    Position = require("montage-geo/logic/model/position").Position;

describe("A Point", function () {

    it("can be created", function () {
        var coordinates = [-156.6825, 20.8783],
            point = Point.withCoordinates(coordinates);
        expect(point instanceof Point).toBe(true);
        expect(point.coordinates instanceof Position).toBe(true);
    });

    it("can be properly update its bbox", function () {
        var coordinates = [-156.6825, 20.8783],
            point = Point.withCoordinates(coordinates);
        expect(point.bbox.join(",")).toBe("-156.6825,20.8783,-156.6825,20.8783");
        point.coordinates.longitude = -156.683;
        expect(point.bbox.join(",")).toBe("-156.683,20.8783,-156.683,20.8783");
        point.coordinates.latitude = 20.9;
        expect(point.bbox.join(",")).toBe("-156.683,20.9,-156.683,20.9");
        point.coordinates = Position.withCoordinates(0, 0);
        expect(point.bbox.join(",")).toBe("0,0,0,0");
    });


    it("can calculate initial bearing to another point", function () {

        var origin = Point.withCoordinates([0.119, 52.205]),
            destination = Point.withCoordinates([2.351, 48.857]),
            bearing = origin.bearing(destination);

        expect(bearing.toFixed(1)).toBe("156.2");
        destination.coordinates.latitude = 49.213;
        origin.coordinates.longitude = 0.119;
        bearing = origin.bearing(destination);
        console.log("Reset origin new bearing (", bearing, ")");

    });

    it ("can create a binding for bearing", function () {
        var origin = Point.withCoordinates([0.119, 52.205]),
            destination = Point.withCoordinates([2.351, 48.857]),
            controller = {
                origin: origin,
                destination: destination,
                bearing: undefined
            };

        Bindings.defineBinding(controller, "bearing", {"<-": "origin.bearing(destination)"});

        expect(controller.bearing.toFixed(1)).toBe("156.2");
        controller.origin.coordinates.longitude = 0.559;
        expect(controller.bearing).toBe(160.514030702907);
        controller.destination = Point.withCoordinates([2.351, 49.213]);
        expect(controller.bearing).toBe(158.53193348882462);
        controller.origin = Point.withCoordinates([0.119, 52.205]);
        expect(controller.bearing).toBe(153.84436238102307);
        controller.destination.coordinates.latitude = 48.857;
        expect(controller.bearing.toFixed(1)).toBe("156.2");

    });

    it ("can calculate the distance between two points", function () {
        var origin = Point.withCoordinates([-5.4253, 50.0359]),
            destination = Point.withCoordinates([-3.0412, 58.3838]),
            distance = origin.distance(destination);

        expect((distance / 1000).toFixed(1)).toBe("940.9");
    });

    it ("can create a binding for distance", function () {
        var origin = Point.withCoordinates([-5.4253, 50.0359]),
            destination = Point.withCoordinates([-3.0412, 58.3838]),
            controller = {
                origin: origin,
                destination: destination,
                distance: undefined
            };

        Bindings.defineBinding(controller, "distance", {"<-": "origin.distance(destination)"});

        expect((controller.distance / 1000).toFixed(0)).toBe("941");
        destination.coordinates.longitude = -3.875;
        destination.coordinates.latitude = 59.7654;
        expect((controller.distance / 1000).toFixed(0)).toBe("1086");
        origin.coordinates.longitude = -4.4253;
        origin.coordinates.latitude = 48.0359;
        expect((controller.distance / 1000).toFixed(0)).toBe("1305");

    });

    it ("can calculate the destination to a point given a distance and an initial bearing", function () {
        var origin = Point.withCoordinates([1.4347, 54.1914]),
            destination = origin.destination(124000.8, 96);
        expect(destination.coordinates.latitude.toFixed(2)).toBe("54.06");
        expect(destination.coordinates.longitude.toFixed(2)).toBe("3.32");
    });

    it ("can create a binding for destination", function () {
        var origin = Point.withCoordinates([1.4347, 54.1914]),
            controller = {
                origin: origin,
                distance: 124000.8,
                bearing: 96
            };
        Bindings.defineBinding(controller, "destination", {"<-": "origin.destination(distance, bearing)"});
        expect(controller.destination.coordinates.latitude.toFixed(2)).toBe("54.06");
        expect(controller.destination.coordinates.longitude.toFixed(2)).toBe("3.32");
        controller.distance = 132000.8;
        expect(controller.destination.coordinates.latitude.toFixed(2)).toBe("54.05");
        expect(controller.destination.coordinates.longitude.toFixed(2)).toBe("3.45");
        controller.bearing = 98;
        expect(controller.destination.coordinates.latitude.toFixed(2)).toBe("54.01");
        expect(controller.destination.coordinates.longitude.toFixed(2)).toBe("3.44");
        controller.origin = Point.withCoordinates([2, 55]);
        expect(controller.destination.coordinates.latitude.toFixed(2)).toBe("54.82");
        expect(controller.destination.coordinates.longitude.toFixed(2)).toBe("4.04");
    });


});
