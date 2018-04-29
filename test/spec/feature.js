var Feature = require("montage-geo/logic/model/feature").Feature,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Point = require("montage-geo/logic/model/point").Point,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("A Feature", function () {

    it("can be created", function () {
        var feature = Feature.withMembers(42, {"foo": "bar"}, {});
        expect(feature).toBeDefined();
        expect(feature.id).toBe(42);
        expect(feature.properties.foo).toBe("bar");
    });

    it("can serialize", function () {
        var json = {
                id: 42,
                properties: {
                    name: "Lahaina"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-156.6825, 20.8783]
                }
            },
            feature = Feature.withGeoJSON(json),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(feature);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var json = {
                id: 42,
                properties: {
                    name: "Lahaina"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-156.6825, 20.8783]
                }
            },
            f1 = Feature.withGeoJSON(json),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(f1);
        new Deserializer().init(serialized, require).deserializeObject().then(function (feature) {
            expect(feature.constructor.name).toBe("Feature");
            expect(f1.geometry.equals(feature.geometry)).toBe(true);
            expect(f1.id === feature.id).toBe(true);
            expect(JSON.stringify(f1.properties) === JSON.stringify(feature.properties)).toBe(true);
            done();
        });
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
            },
            feature = Feature.withGeoJSON(json);
        expect(feature instanceof Feature).toBe(true);
        expect(feature.id).toBe(42);
        expect(feature.properties && feature.properties.name).toBe("Lahaina");
        expect(feature.geometry instanceof Point).toBe(true);

    });

    it("can get bounds as function", function () {
        var json = {
                id: 42,
                properties: {
                    name: "Lahaina"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-156.6825, 20.8783]
                }
            },
            feature = Feature.withGeoJSON(json),
            bounds = feature.bounds();

        expect(bounds.xMax).toBe(-156.6825);
        expect(bounds.xMin).toBe(-156.6825);
        expect(bounds.yMax).toBe(20.8783);
        expect(bounds.yMin).toBe(20.8783);
    });
});
