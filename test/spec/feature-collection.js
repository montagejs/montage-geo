var FeatureCollection = require("montage-geo/logic/model/feature-collection").FeatureCollection,
    Bindings = require("montage-geo/frb/bindings"),
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Feature = require("montage-geo/logic/model/feature").Feature,
    Point = require("montage-geo/logic/model/point").Point;

describe("A FeatureCollection", function () {
    var lahaina, kahului;

    beforeEach(function () {
        lahaina = Feature.withGeoJSON({
            id: 42,
            properties: {
                name: "Lahaina"
            },
            geometry: {
                type: "Point",
                coordinates: [-156.6825, 20.8783]
            }
        });
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

    it("can filter by bounds intersection", function () {
        var bounds = BoundingBox.withCoordinates(0, 0, 10, 10),
            inPoint = Point.withCoordinates([5, 5]),
            outPoint = Point.withCoordinates([5, -5]),
            featureCollection = FeatureCollection.withFeatures([inPoint, outPoint]);

        expect(featureCollection.filter(bounds).length).toBe(1);

    });

    it("can observe filter changes", function () {
        var controller = {
                bounds: BoundingBox.withCoordinates(0, 0, 10, 10),
                collection: FeatureCollection.withFeatures([]),
                features: undefined
            },
            point1 = Point.withCoordinates([5, 5]),
            point2 = Point.withCoordinates([-5, 5]);

        Bindings.defineBinding(controller, "features", {"<-": "collection.filter(bounds)"});
        expect(controller.features.length).toBe(0);
        controller.collection.add(point1);
        expect(controller.features.length).toBe(1);
        controller.collection.add(point2);
        expect(controller.features.length).toBe(1);
        controller.bounds.xMin = -10;
        expect(controller.features.length).toBe(2);
        controller.bounds.xMax = 0;
        expect(controller.features.length).toBe(1);
        controller.collection.remove(point2);
        expect(controller.features.length).toBe(0);
        controller.bounds = BoundingBox.withCoordinates(0, 0, 10, 10);
        expect(controller.features.length).toBe(1);

    });

    it("can observe changes to child geometries", function () {
        var collection = FeatureCollection.withFeatures([lahaina]);
        collection.addContentPropertyChangeListener("geometry", function (value, key, object) {
            expect(value.coordinates.latitude).toBe(0);
            expect(value.coordinates.longitude).toBe(0);
            expect(key).toBe("geometry");
            expect(object).toBe(lahaina);
        });

        lahaina.geometry = Point.withCoordinates([0, 0]);

    });

    it("can update bounds for child geometries", function () {
        var collection = FeatureCollection.withFeatures([lahaina, kahului]),
            bounds = collection.bounds;

        expect(bounds.xMax.toFixed(4)).toBe('-156.4729');
        expect(bounds.xMin.toFixed(4)).toBe('-156.6825');
        expect(bounds.yMax.toFixed(4)).toBe('20.8893');
        expect(bounds.yMin.toFixed(4)).toBe('20.8783');
    });
    
    it("can update bounds for child geometry changes", function () {
        var collection = FeatureCollection.withFeatures([lahaina, kahului]),
            bounds;

        lahaina.geometry = Point.withCoordinates([0, 0]);
        bounds = collection.bounds;
        expect(bounds.xMax).toBe(0);
        expect(bounds.xMin.toFixed(4)).toBe('-156.4729');
        expect(bounds.yMax.toFixed(4)).toBe('20.8893');
        expect(bounds.yMin).toBe(0);
    });

    it("can update bounds for child geometries added to the collection", function () {
        var collection = FeatureCollection.withFeatures([kahului]),
            bounds;

        collection.features.push(lahaina);
        lahaina.geometry = Point.withCoordinates([0, 0]);
        bounds = collection.bounds;
        expect(bounds.xMax).toBe(0);
        expect(bounds.xMin.toFixed(4)).toBe('-156.4729');
        expect(bounds.yMax.toFixed(4)).toBe('20.8893');
        expect(bounds.yMin).toBe(0);
    });

    it("can update bounds for internal geometry changes on children", function () {
        var collection = FeatureCollection.withFeatures([lahaina, kahului]),
            bounds;
        
        lahaina.geometry = Point.withCoordinates([0, 0]);
        bounds = collection.bounds;
        expect(bounds.xMax).toBe(0);
        expect(bounds.xMin.toFixed(4)).toBe('-156.4729');
        expect(bounds.yMax.toFixed(4)).toBe('20.8893');
        expect(bounds.yMin).toBe(0);
    });

    it("can update bounds for internal geometry changes on children added to the collection", function () {
        var collection = FeatureCollection.withFeatures([kahului]),
            bounds;

        collection.features.push(lahaina);
        lahaina.geometry.coordinates.latitude = 0;
        lahaina.geometry.coordinates.longitude = 0;
        bounds = collection.bounds;
        expect(bounds.xMax).toBe(0);
        expect(bounds.xMin.toFixed(4)).toBe('-156.4729');
        expect(bounds.yMax.toFixed(4)).toBe('20.8893');
        expect(bounds.yMin).toBe(0);
    });

    it("can cancel unneeded observers", function () {
        var collection = FeatureCollection.withFeatures([lahaina]),
            handler = function () {};
        collection.addContentPropertyChangeListener("geometry", handler);
        expect(collection._contentPropertyChangeCancellers.get(handler).size).toBe(1);
        collection.features.splice(0, Infinity);
        expect(collection._contentPropertyChangeCancellers.get(handler).size).toBe(0);
    });

});
