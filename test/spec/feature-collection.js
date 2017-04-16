var FeatureCollection = require("montage-geo/logic/model/feature-collection").FeatureCollection,
    Feature = require("montage-geo/logic/model/feature").Feature,
    Point = require("montage-geo/logic/model/point").Point;

describe("A FeatureCollection", function () {

    var lahaina = Feature.withGeoJSON({
            id: 42,
            properties: {
                name: "Lahaina"
            },
            geometry: {
                type: "Point",
                coordinates: [-156.6825, 20.8783]
            }
        }),
        kahului = Feature.withGeoJSON({
            id: 43,
            properties: {
                name: "Kahului"
            },
            geometry: {
                type: "Point",
                coordinates: [-156.4729, 20.8893]
            }
        });


    it("can be created", function () {
        var collection = FeatureCollection.withFeatures();
        expect(collection).toBeDefined();
        expect(collection.size).toBe(0);
    });

    it("can add a feature", function () {
        var collection = FeatureCollection.withFeatures();
        collection.add(lahaina);
        expect(collection.size).toBe(1);
        expect(collection.has(lahaina)).toBe(true);
        expect(collection.get(42)).toBe(lahaina);
    });

    it("can remove a feature", function () {
        var collection = FeatureCollection.withFeatures();
        collection.add(lahaina);
        expect(collection.size).toBe(1);
        collection.remove(lahaina);
        expect(collection.size).toBe(0);
        expect(collection.has(lahaina)).toBe(false);
        expect(collection.get(42)).toBe(undefined);
    });

    it("can add multiple features", function () {
        var collection = FeatureCollection.withFeatures();
        collection.add(lahaina, kahului);
        expect(collection.size).toBe(2);
        expect(collection.has(lahaina)).toBe(true);
        expect(collection.has(kahului)).toBe(true);
        expect(collection.get(42)).toBe(lahaina);
        expect(collection.get(43)).toBe(kahului);
    });

    it("can remove multiple features", function () {
        var collection = FeatureCollection.withFeatures();
        collection.add(lahaina, kahului);
        expect(collection.size).toBe(2);
        collection.remove(lahaina, kahului);
        expect(collection.has(lahaina)).toBe(false);
        expect(collection.has(kahului)).toBe(false);
        expect(collection.get(42)).toBe(undefined);
        expect(collection.get(43)).toBe(undefined);
    });

    it("can register features with range changes", function () {
        var collection = FeatureCollection.withFeatures();
        collection.features.splice(0, Infinity, lahaina, kahului);
        expect(collection.size).toBe(2);
        expect(collection.has(lahaina)).toBe(true);
        expect(collection.has(kahului)).toBe(true);
        expect(collection.get(42)).toBe(lahaina);
        expect(collection.get(43)).toBe(kahului);
    });

    it("can deregister features with range changes", function () {
        var collection = FeatureCollection.withFeatures();
        collection.add(lahaina, kahului);
        expect(collection.size).toBe(2);
        collection.features.splice(0, Infinity);
        expect(collection.size).toBe(0);
        expect(collection.has(lahaina)).toBe(false);
        expect(collection.has(kahului)).toBe(false);
        expect(collection.get(42)).toBe(undefined);
        expect(collection.get(43)).toBe(undefined);
    });

    it("can remove features with duplicate ids", function () {
        var collection = FeatureCollection.withFeatures(),
            lahainaCopy = Feature.withGeoJSON({
                id: 42,
                properties: {
                    name: "Lahaina Copy"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-156.6825, 20.8783]
                }
            });
        collection.add(lahaina, lahainaCopy);
        expect(collection.size).toBe(1);
        expect(collection.has(lahainaCopy)).toBe(true);
        expect(collection.has(lahaina)).toBe(false);
        expect(collection.get(42)).toBe(lahainaCopy);
    });

    it("can clear the collection", function () {
        var collection = FeatureCollection.withFeatures();
        collection.add(lahaina, kahului);
        expect(collection.size).toBe(2);
        collection.clear();
        expect(collection.size).toBe(0);
        expect(collection.has(kahului)).toBe(false);
        expect(collection.has(lahaina)).toBe(false);
        expect(collection.get(42)).toBe(undefined);
        expect(collection.get(43)).toBe(undefined);
    });


});
