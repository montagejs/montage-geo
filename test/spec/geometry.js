var Geometry = require("montage-geo/logic/model/geometry").Geometry;

describe("A Geometry", function () {

    it("cannot be created", function () {
        var geometry = Geometry.withCoordinates([0, 0]);
        expect(geometry).toBeNull();
    });

});
