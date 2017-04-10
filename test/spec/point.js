var Feature = require("montage-geo/logic/model/feature").Feature,
    Point = require("montage-geo/logic/model/point").Point,
    Position = require("montage-geo/logic/model/position").Position;

describe("A Point", function () {

    it("can be created", function () {
        var coordinates = [-156.6825, 20.8783],
            point = Point.withCoordinates(coordinates);
        expect(point instanceof Point).toBe(true);
        expect(point.coordinates instanceof Position).toBe(true);
    });

});
