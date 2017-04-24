var GeohashCollection = require("montage-geo/logic/model/geohash-collection").GeohashCollection,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox;


describe("A GeohashCollection", function () {

    it("can be created", function () {
        var bounds = BoundingBox.withCoordinates(-179, -85, -1, 85),
            collection = GeohashCollection.withBoundingBox(bounds);

        expect(collection).toBeDefined();
        expect(collection.hashes.size).toBe(16);

    });

    // TODO: Move tests to Geohash Collection
    it ("can calculate the correct GeoHash precision", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            bounds2 = BoundingBox.withCoordinates(0, 0, 1, 1),
            collection = GeohashCollection.withBoundingBox(bounds),
            collection2 = GeohashCollection.withBoundingBox(bounds2);

        expect(collection.precision).toBe(1);
        expect(collection2.precision).toBe(3);

    });


});
