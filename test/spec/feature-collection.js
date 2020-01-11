var FeatureCollection = require("montage-geo/logic/model/feature-collection").FeatureCollection,
    Bindings = require("montage-geo/frb/bindings"),
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Feature = require("montage-geo/logic/model/feature").Feature,
    Point = require("montage-geo/logic/model/point").Point,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

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

    it("can serialize", function () {
        var collection = FeatureCollection.withFeatures(),
            serializer = new Serializer().initWithRequire(require),
            serialized;
        collection.add(lahaina, kahului);
        serialized = serializer.serializeObject(collection);
        expect(serialized).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var collection = FeatureCollection.withFeatures(),
            serializer = new Serializer().initWithRequire(require),
            serialized;
        collection.add(lahaina, kahului);
        serialized = serializer.serializeObject(collection);
        new Deserializer().init(serialized, require).deserializeObject().then(function (c1) {
            var i, n, f1, f2, isEqual = true;
            expect(c1.constructor.name).toBe("FeatureCollection");
            expect(c1.features.length === collection.features.length).toBe(true);
            expect(c1.size === collection.size).toBe(true);
            for (i = 0, n = c1.features.length; i < n && isEqual; i += 1) {
                f1 = c1.features[i];
                f2 = collection.features[i];
                isEqual =   f1.geometry.equals(f2.geometry) &&
                            f1.id === f2.id &&
                            JSON.stringify(f1.properties) === JSON.stringify(f2.properties);
            }
            expect(isEqual).toBe(true);
            done();
        });
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
        collection.clear();
        expect(collection.size).toBe(0);
        collection.add.apply(collection, [lahaina, kahului]);
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

    it("can manage internal range change listener", function () {
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
            }),
            spy = jasmine.createSpy(),
            originalHandleRangeChange = collection.handleRangeChange.bind(collection);

        Object.defineProperty(collection, "handleRangeChange", {
            value: function () {
                spy.apply(window, arguments);
                return originalHandleRangeChange.apply(collection, arguments);
            },
        });
        collection.add(lahaina); //add new feature
        expect(collection.size).toBe(1);
        expect(collection.has(lahaina)).toBe(true);
        collection.add(lahaina); //add equivalent feature
        collection.add(lahainaCopy); //add duplicate feature
        collection.add(kahului); //add new feature
        collection.remove(lahaina) //remove feature not in the collection
        collection.remove(lahainaCopy, kahului); //remove remaining features
        expect(spy.calls.all().length).toBe(0);
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
            }),
            originalHandleRangeChange = collection.handleRangeChange.bind(collection),
            originalRemove = collection.remove.bind(collection),
            spy = jasmine.createSpy(),
            spiedCalls;

        Object.defineProperty(collection, "handleRangeChange", {
            value: function () {
                spy.apply(global, ["handleRangeChange"].concat(Array.from(arguments)));
                return originalHandleRangeChange.apply(collection, arguments);
            },
        });
        Object.defineProperty(collection, "remove", {
            value: function () {
                spy.apply(global, ["remove"].concat(Array.from(arguments)));
                return originalRemove.apply(collection, arguments);
            }
        });
        collection.add(lahaina, lahainaCopy);
        expect(collection.size).toBe(1);
        expect(collection.has(lahainaCopy)).toBe(true);
        expect(collection.has(lahaina)).toBe(false);
        expect(collection.get(42)).toBe(lahainaCopy);
        collection.add(lahainaCopy);
        spiedCalls = spy.calls.all().map(function (call) { return call.args });
        expect(spiedCalls.length).toBe(1); // call remove() once for initial 'collection.add(lahaina, lahainaCopy)'
        expect(spiedCalls[0][0]).toBe("remove");
        expect(spiedCalls[0][1]).toBe(lahaina);
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

    it("can calculate own bounds from children", function () {
        var child1 = new Feature(),
            child2 = new Feature(),
            collection, bounds;

            child1.geometry = FeatureCollection.withFeatures();
            child2.geometry = FeatureCollection.withFeatures([lahaina]);
            collection = FeatureCollection.withFeatures([child1, child2, kahului]);
            // [-156.6825, 20.8783]
            //-156.4729, 20.8893]
            bounds = collection.bounds();

        expect(bounds.xMax).toEqual(-156.4729);
        expect(bounds.xMin).toEqual(-156.6825);
        expect(bounds.yMax).toEqual(20.8893);
        expect(bounds.yMin).toEqual(20.8783);

    });

    it("can observe changes to child geometries added to the collection", function () {
        var collection = FeatureCollection.withFeatures();
        collection.addContentPropertyChangeListener("geometry", function (value, key, object) {
            expect(value.coordinates.latitude).toBe(0);
            expect(value.coordinates.longitude).toBe(0);
            expect(key).toBe("geometry");
            expect(object).toBe(lahaina);
        });
        collection.features.push(lahaina);
        lahaina.geometry = Point.withCoordinates([0, 0]);
    });

    it("can cancel a content property change listener", function () {
        var collection = FeatureCollection.withFeatures(),
            canceler = collection.addContentPropertyChangeListener("geometry", function (value, key, object) {});

        expect(typeof canceler).toBe("function");
        expect(collection._contentPropertyChangeCancellers.size).toBe(1);
        canceler();
        expect(collection._contentPropertyChangeCancellers.size).toBe(0);
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
