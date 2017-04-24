var Geohash = require("montage-geo/logic/model/geohash").Geohash;


describe("A Geohash", function () {

    it("can be created", function () {
        var hash = Geohash.withIdentifier("Z");
        expect(hash).toBeDefined();
        expect(hash.bounds).toBeDefined();
        console.log(hash.bounds);
    });

    it("can cache hashes", function () {
        var hash = Geohash.withIdentifier("Z"),
            copy = Geohash.withIdentifier("z");
        expect(hash).toBe(copy);
    });

});
