var BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox;

describe("A BoundingBox", function () {

    it("can be created", function () {
        var bounds = BoundingBox.withCoordinates(0, 10, 20, 30);
        expect(bounds).toBeDefined();
        expect(bounds.xMin).toBe(0);
        expect(bounds.xMax).toBe(20);
        expect(bounds.yMin).toBe(10);
        expect(bounds.yMax).toBe(30);
        expect(bounds.box.join(",")).toBe("0,10,20,30");
    });

    // it("can test for intersection", function () {
    // });

});
