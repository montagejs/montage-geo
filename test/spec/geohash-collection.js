var GeohashCollection = require("montage-geo/logic/model/geohash-collection").GeohashCollection,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox;


describe("A GeohashCollection", function () {

    it("can be created", function () {
        var bounds = BoundingBox.withCoordinates(-179, -85, -1, 85),
            collection = GeohashCollection.withBoundingBox(bounds);

        expect(collection).toBeDefined();
        expect(collection.hashes.size).toBe(16);

    });

    it ("can calculate the correct GeoHash precision", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            bounds2 = BoundingBox.withCoordinates(0, 0, 1, 1),
            collection = GeohashCollection.withBoundingBox(bounds),
            collection2 = GeohashCollection.withBoundingBox(bounds2);
        expect(collection.precision).toBe(1);
        expect(collection2.precision).toBe(3);
    });

    it ("can clear collection when lat min and max are equal", function () {
        var bounds = BoundingBox.withCoordinates(140, 1, 179.99999, 1),
            collection = GeohashCollection.withBoundingBox(bounds);
        expect(collection.precision).toBe(10);
        expect(collection.hashes.size).toBe(0);
    });

    it ("can clear collection when lng min and max are equal", function () {
        var bounds = BoundingBox.withCoordinates(1, 0, 1, 10),
            collection = GeohashCollection.withBoundingBox(bounds);
        expect(collection.precision).toBe(10);
        expect(collection.hashes.size).toBe(0);
    });


});
