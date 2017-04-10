var Position = require("montage-geo/logic/model/position").Position;

describe("A Position", function () {

    it("can be created", function () {
        var p1 = Position.withCoordinates([-156.6825, 20.8783]);
        var p2 = Position.withCoordinates(-156.6825, 20.8783);
        expect(p1.longitude === p2.longitude).toBe(true);
        expect(p1.latitude === p2.latitude).toBe(true);
        expect(p1.altitude === p2.altitude).toBe(true);
    });

});
