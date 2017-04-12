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

    it("can calculate initial bearing to another point", function () {

        var origin = Point.withCoordinates([0.119, 52.205]),
            destination = Point.withCoordinates([2.351, 48.857]),
            bearing = origin.bearingTo(destination);

        expect(bearing.toFixed(1)).toBe("156.2");
        destination.coordinates.latitude = 49.213;
        origin.coordinates.longitude = 0.119;
        bearing = origin.bearingTo(destination);
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

        //

    });

});
