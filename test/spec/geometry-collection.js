var GeometryCollection = require("montage-geo/logic/model/geometry-collection").GeometryCollection,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    Point = require("montage-geo/logic/model/point").Point;

describe("A GeometryCollection", function () {

    it("can be created", function () {
        var point = Point.withCoordinates([0, 0]),
            geometries = [point],
            collection = GeometryCollection.withGeometries(geometries);
        expect(collection).toBeDefined();
        expect(collection.geometries.length).toBe(1);
    });

    it("can be test for equality", function () {
        var point = Point.withCoordinates([0, 0]),
            geometries = [point],
            collectionA = GeometryCollection.withGeometries(geometries),
            collectionB = GeometryCollection.withGeometries(geometries);

        expect(collectionA.equals(collectionB)).toBe(true);

        geometries.push(Point.withCoordinates([10, 10]));
        collectionB = GeometryCollection.withGeometries(geometries);
        expect(collectionA.equals(collectionB)).toBe(false);

        geometries.splice(0, 1, LineString.withCoordinates([[0, 0], [10, 10]]));
        collectionB = GeometryCollection.withGeometries(geometries);
        expect(collectionA.equals(collectionB)).toBe(false);

    });

    it("can calculate its bounds", function () {
        var point1 = Point.withCoordinates([0, 0]),
            point2 = Point.withCoordinates([10, 10]),
            geometries = [point1, point2],
            collection = GeometryCollection.withGeometries(geometries),
            bounds = collection.bounds();
        expect(collection).toBeDefined();
        expect(collection.geometries.length).toBe(2);
        expect(bounds.xMin).toBe(0);
        expect(bounds.yMin).toBe(0);
        expect(bounds.xMax).toBe(10);
        expect(bounds.yMax).toBe(10);
    });

    it("can be cloned", function () {
        var point1 = Point.withCoordinates([0, 0]),
            point2 = Point.withCoordinates([10, 10]),
            geometries = [point1, point2],
            collection = GeometryCollection.withGeometries(geometries),
            clone = collection.clone();

        expect(clone.geometries.length).toBe(2);
        expect(collection.equals(clone)).toBe(true);

    });

});
