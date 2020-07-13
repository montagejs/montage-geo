var ClusterOrganizer = require("montage-geo/logic/model/cluster-organizer").ClusterOrganizer,
    GeoPoint = require("montage-geo/logic/model/point").Point;

describe("A Cluster Organizer", function () {

    it("can be created", function () {
        var organizer = ClusterOrganizer.withGridSizeAndZoom(80, 2);
        expect(organizer).toBeDefined();
        expect(organizer._gridSize).toBe(80);
        expect(organizer.zoom).toBe(2);

        organizer = ClusterOrganizer.withGridSizeAndZoom();
        expect(organizer).toBeDefined();
        expect(organizer._gridSize).toBe(60);
        expect(organizer.zoom).toBe(0);
    });

    it("can add features", function () {
        var organizer = ClusterOrganizer.withGridSizeAndZoom(60, 0),
            feature = {
                name: "A Feature",
                geometry: GeoPoint.withCoordinates([0, 0])
            };

        organizer.addFeature(feature);
        expect(organizer.clusters.length).toBe(1);

    });

    it("can cluster features", function () {
        var organizer = ClusterOrganizer.withGridSizeAndZoom(60, 0),
            feature1 = {
                name: "Feature 1",
                geometry: GeoPoint.withCoordinates([180, 0])
            },
            feature2 = {
                name: "Feature 2",
                geometry: GeoPoint.withCoordinates([180, 0])
            },
            feature3 = {
                name: "Feature 3",
                geometry: GeoPoint.withCoordinates([-180, 0])
            };

        organizer.addFeature(feature1);
        organizer.addFeature(feature2);
        organizer.addFeature(feature3);
        expect(organizer.clusters.length).toBe(2);

    });

    it("can remove features", function () {
        var organizer = ClusterOrganizer.withGridSizeAndZoom(60, 0),
            feature1 = {
                name: "Feature 1",
                geometry: GeoPoint.withCoordinates([180, 0])
            },
            feature2 = {
                name: "Feature 2",
                geometry: GeoPoint.withCoordinates([180, 0])
            },
            feature3 = {
                name: "Feature 3",
                geometry: GeoPoint.withCoordinates([-180, 0])
            };

        organizer.addFeature(feature1);
        organizer.addFeature(feature2);
        organizer.addFeature(feature3);
        expect(organizer.clusters.length).toBe(2);
        expect(organizer.features.size).toBe(3);
        organizer.removeFeature(feature1);
        expect(organizer.clusters.length).toBe(2);
        expect(organizer.features.size).toBe(2);
        organizer.removeFeature(feature2);
        expect(organizer.clusters.length).toBe(1);
        expect(organizer.features.size).toBe(1);
        organizer.removeFeature(feature3);
        expect(organizer.clusters.length).toBe(0);
        expect(organizer.features.size).toBe(0);
    });

    it("can reset its clusters", function () {
        var organizer = ClusterOrganizer.withGridSizeAndZoom(60, 0),
            feature1 = {
                name: "Feature 1",
                geometry: GeoPoint.withCoordinates([180, 0])
            },
            feature2 = {
                name: "Feature 2",
                geometry: GeoPoint.withCoordinates([180, 0])
            },
            feature3 = {
                name: "Feature 3",
                geometry: GeoPoint.withCoordinates([-180, 0])
            };

        organizer.reset();
        expect(organizer.clusters.length).toBe(0);
        expect(organizer.features.size).toBe(0);
    });


    it("can cluster features quickly using grid optimization", function () {

        var organizer = ClusterOrganizer.withGridSizeAndZoom(64, 5, true),
            features = [],
            longitude, latitude,
            startTime, endTime, totalTime,
            i, n;

        startTime = new Date();
        for (i = 0, n = 20000; i < n; i += 1) {
            longitude = Math.random() * 360 - 180;
            latitude = Math.random() * 170.12 - 85.06;
            features.push({
                geometry: GeoPoint.withCoordinates([longitude, latitude])
            });
        }
        endTime = new Date();
        totalTime = endTime - startTime;
        console.log("Marshaled (", n, ") features in (", totalTime, "ms)");

        startTime = new Date();
        for (i = 0, n = features.length; i < n; i += 1) {
            organizer.addFeature(features[i]);
        }
        endTime = new Date();
        totalTime = endTime - startTime;

        expect(totalTime).toBeLessThan(1000);
        expect(organizer.features.size).toBe(n);
        console.log(
            "Total Clustering Time (", totalTime, ") " +
            "Cluster Count (", organizer.clusters.length, ") " +
            "Cluster Features (", organizer.features.size, ")"
        );

        organizer.zoom = 6;
        startTime = new Date();
        for (i = 0, n = features.length; i < n; i += 1) {
            organizer.addFeature(features[i]);
        }
        endTime = new Date();
        totalTime = endTime - startTime;

        expect(totalTime).toBeLessThan(1000);
        expect(organizer.features.size).toBe(n);
        console.log(
            "Total Clustering Time (", totalTime, ") " +
            "Cluster Count (", organizer.clusters.length, ") " +
            "Cluster Features (", organizer.features.size, ")"
        );

    });



});
