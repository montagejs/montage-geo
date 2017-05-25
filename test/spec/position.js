var Position = require("montage-geo/logic/model/position").Position;

describe("A Position", function () {

    it("can be created", function () {
        var p1 = Position.withCoordinates([-156.6825, 20.8783]);
        var p2 = Position.withCoordinates(-156.6825, 20.8783);
        expect(p1.longitude === p2.longitude).toBe(true);
        expect(p1.latitude === p2.latitude).toBe(true);
        expect(p1.altitude === p2.altitude).toBe(true);
    });

    it("can calculate the midpoint between a position and another", function () {
        var p1 = Position.withCoordinates(0.119, 52.205),
            p2 = Position.withCoordinates(2.351, 48.857),
            mid = p1.midPointTo(p2);
        expect(mid.latitude).toBe(50.53632687827434);
        expect(mid.longitude).toBe(1.2746141006781915);
    });

});
