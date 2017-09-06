var Geometry = require("montage-geo/logic/model/geometry").Geometry;

describe("A Geometry", function () {

    it("cannot be created", function () {
        var geometry = Geometry.withCoordinates([0, 0]);
        expect(geometry).toBeNull();
    });

    it("can convert from radians and degrees", function () {
        expect(Geometry.toRadians(90)).toBe(1.5707963267948966);
        expect(Math.round(Geometry.toDegrees(1.5707963267948966))).toBe(90);
    });

});
