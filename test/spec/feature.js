var Feature = require("montage-geo/logic/model/feature").Feature,
    Point = require("montage-geo/logic/model/point").Point;

describe("A Feature", function () {

    it("can be created", function () {
        var feature = Feature.withMembers(42, {"foo": "bar"}, {});
        expect(feature).toBeDefined();
        expect(feature.id).toBe(42);
        expect(feature.properties.foo).toBe("bar");
    });

    it("can be created with JSON", function () {
        var json = {
            id: 42,
            properties: {
                name: "Lahaina"
            },
            geometry: {
                type: "Point",
                coordinates: [-156.6825, 20.8783]
            }
        };
        var feature = Feature.withGeoJSON(json);
        expect(feature instanceof Feature).toBe(true);
        expect(feature.id).toBe(42);
        expect(feature.properties && feature.properties.name).toBe("Lahaina");
        expect(feature.geometry instanceof Point).toBe(true);
    });

});
