var FeatureCluster = require("montage-geo/logic/model/feature-cluster").FeatureCluster,
    Point = require("montage-geo/logic/model/point-2d").Point2D;

describe("A Feature Cluster", function () {

    it("can be created", function () {
        var cluster = new FeatureCluster();
        expect(cluster).toBeDefined();
        expect(cluster.features).toBeDefined();
    });

    it("can add features", function () {

        var cluster = new FeatureCluster(),
            feature1 = {name: "Feature 1"},
            feature2 = {name: "Feature 2"},
            point1 = Point.withCoordinates(0, 0),
            point2 = Point.withCoordinates(10, 10);

        cluster.add(feature1, point1);
        expect(cluster.features.size).toBe(1);
        cluster.add(feature2, point2);
        expect(cluster.features.size).toBe(2);

    });

    it("can remove features", function () {

        var cluster = new FeatureCluster(),
            feature1 = {name: "Feature 1"},
            feature2 = {name: "Feature 2"},
            point1 = Point.withCoordinates(0, 0),
            point2 = Point.withCoordinates(10, 10);

        cluster.add(feature1, point1);
        cluster.add(feature2, point2);
        cluster.remove(feature1);
        expect(cluster.features.size).toBe(1);
        cluster.remove(feature2);
        expect(cluster.features.size).toBe(0);
        expect(cluster.point).toBe(null);

    });

    it("can calculate its point", function () {

        var cluster = new FeatureCluster(),
            feature1 = {name: "Feature 1"},
            feature2 = {name: "Feature 2"},
            feature3 = {name: "Feature 3"},
            point1 = Point.withCoordinates(0, 0),
            point2 = Point.withCoordinates(10, 10),
            point3 = Point.withCoordinates(20, 20);

        cluster.add(feature1, point1);
        expect(cluster.point).toBeDefined();
        expect(cluster.point.x).toBe(0);
        expect(cluster.point.y).toBe(0);

        cluster.add(feature2, point2);
        expect(cluster.point).toBeDefined();
        expect(cluster.point.x).toBe(5);
        expect(cluster.point.y).toBe(5);

        cluster.add(feature3, point3);
        expect(cluster.point).toBeDefined();
        expect(cluster.point.x).toBe(10);
        expect(cluster.point.y).toBe(10);

        cluster.remove(feature3);
        expect(cluster.point).toBeDefined();
        expect(cluster.point.x).toBe(5);
        expect(cluster.point.y).toBe(5);

        cluster.remove(feature2);
        expect(cluster.point).toBeDefined();
        expect(cluster.point.x).toBe(0);
        expect(cluster.point.y).toBe(0);

        cluster.remove(feature1);
        expect(cluster.point).toBe(null);

    });

});
