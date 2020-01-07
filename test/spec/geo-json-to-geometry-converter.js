var GeoJsonToGeometryConverter = require("montage-geo/logic/converter/geo-json-to-geometry-converter").GeoJsonToGeometryConverter,
    Projection = require("montage-geo/logic/model/projection").Projection;

describe("GeoJsonToGeometryConverter", function () {

    it ("can convert a GeoJson Point to Point", function () {
        var converter = new GeoJsonToGeometryConverter(),
            point = converter.convert(geoJsonPoint);
        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);
    });

    it ("can convert a GeoJson Point to Point with Projection", function () {
        var converter = new GeoJsonToGeometryConverter(),
            point;

        converter.projection = Projection.forSrid("3857");
        point = converter.convert(geoJsonPoint3857);

        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);
    });

    it ("can convert a GeoJson MultiPoint to MultiPoint", function () {
        var converter = new GeoJsonToGeometryConverter(),
            point = converter.convert(geoJsonMultiPoint);
        expect(point).toBeDefined();
        expect(point.coordinates.length).toBe(2);
        expect(point.coordinates[0].longitude).toBe(100.0);
        expect(point.coordinates[0].latitude).toBe(0.0);
        expect(point.coordinates[1].longitude).toBe(101.0);
        expect(point.coordinates[1].latitude).toBe(1.0);
    });

    it ("can convert a GeoJson LineString to a LineString", function () {
        var converter = new GeoJsonToGeometryConverter(),
            lineString = converter.convert(geoJsonLineString);
        expect(lineString).toBeDefined();
        expect(lineString.coordinates.length).toBe(2);
        expect(lineString.coordinates[0].longitude).toBe(100.0);
        expect(lineString.coordinates[0].latitude).toBe(0.0);
        expect(lineString.coordinates[1].longitude).toBe(101.0);
        expect(lineString.coordinates[1].latitude).toBe(1.0);
    });

    it ("can convert a GeoJson MultiLineString to MultiLineString", function () {
        var converter = new GeoJsonToGeometryConverter(),
            multiLineString = converter.convert(geoJsonMultiLineString);
        expect(multiLineString).toBeDefined();
        expect(multiLineString.coordinates.length).toBe(2);
        expect(multiLineString.coordinates[0].coordinates[0].longitude).toBe(100.0);
        expect(multiLineString.coordinates[0].coordinates[0].latitude).toBe(0.0);
        expect(multiLineString.coordinates[0].coordinates[1].longitude).toBe(101.0);
        expect(multiLineString.coordinates[0].coordinates[1].latitude).toBe(1.0);
        expect(multiLineString.coordinates[1].coordinates[0].longitude).toBe(102.0);
        expect(multiLineString.coordinates[1].coordinates[0].latitude).toBe(2.0);
        expect(multiLineString.coordinates[1].coordinates[1].longitude).toBe(103.0);
        expect(multiLineString.coordinates[1].coordinates[1].latitude).toBe(3.0);
    });

    it ("can convert a GeoJson Polygon to a Polygon", function () {
        var converter = new GeoJsonToGeometryConverter(),
            polygon = converter.convert(geoJsonPolygon);
        expect(polygon).toBeDefined();
        expect(polygon.coordinates[0].length).toBe(5);
        expect(polygon.coordinates[0][0].longitude).toBe(100.0);
        expect(polygon.coordinates[0][0].latitude).toBe(0.0);
        expect(polygon.coordinates[0][1].longitude).toBe(100.0);
        expect(polygon.coordinates[0][1].latitude).toBe(1.0);
        expect(polygon.coordinates[0][2].longitude).toBe(101.0);
        expect(polygon.coordinates[0][2].latitude).toBe(1.0);
        expect(polygon.coordinates[0][3].longitude).toBe(101.0);
        expect(polygon.coordinates[0][3].latitude).toBe(0.0);
        expect(polygon.coordinates[0][4].longitude).toBe(100.0);
        expect(polygon.coordinates[0][4].latitude).toBe(0.0);
    });

    it ("can convert a GeoJson MultiPolygon to a MultiPolygon", function () {
        var converter = new GeoJsonToGeometryConverter(),
            polygon = converter.convert(geoJsonMultiPolygon);
        expect(polygon).toBeDefined();
        expect(polygon.coordinates.length).toBe(2);
        expect(polygon.coordinates[0].coordinates[0][0].longitude).toBe(102.0);
        expect(polygon.coordinates[0].coordinates[0][0].latitude).toBe(2.0);
        expect(polygon.coordinates[0].coordinates[0][1].longitude).toBe(102.0);
        expect(polygon.coordinates[0].coordinates[0][1].latitude).toBe(3.0);
        expect(polygon.coordinates[0].coordinates[0][2].longitude).toBe(103.0);
        expect(polygon.coordinates[0].coordinates[0][2].latitude).toBe(3.0);
        expect(polygon.coordinates[0].coordinates[0][3].longitude).toBe(103.0);
        expect(polygon.coordinates[0].coordinates[0][3].latitude).toBe(2.0);
        expect(polygon.coordinates[0].coordinates[0][4].longitude).toBe(102.0);
        expect(polygon.coordinates[0].coordinates[0][4].latitude).toBe(2.0);
        expect(polygon.coordinates[1].coordinates[0][0].longitude).toBe(100.0);
        expect(polygon.coordinates[1].coordinates[0][0].latitude).toBe(0.0);
        expect(polygon.coordinates[1].coordinates[0][1].longitude).toBe(100.0);
        expect(polygon.coordinates[1].coordinates[0][1].latitude).toBe(1.0);
        expect(polygon.coordinates[1].coordinates[0][2].longitude).toBe(101.0);
        expect(polygon.coordinates[1].coordinates[0][2].latitude).toBe(1.0);
        expect(polygon.coordinates[1].coordinates[0][3].longitude).toBe(101.0);
        expect(polygon.coordinates[1].coordinates[0][3].latitude).toBe(0.0);
        expect(polygon.coordinates[1].coordinates[0][4].longitude).toBe(100.0);
        expect(polygon.coordinates[1].coordinates[0][4].latitude).toBe(0.0);
        expect(polygon.coordinates[1].coordinates[1][0].longitude).toBe(100.2);
        expect(polygon.coordinates[1].coordinates[1][0].latitude).toBe(0.2);
        expect(polygon.coordinates[1].coordinates[1][1].longitude).toBe(100.8);
        expect(polygon.coordinates[1].coordinates[1][1].latitude).toBe(0.2);
        expect(polygon.coordinates[1].coordinates[1][2].longitude).toBe(100.8);
        expect(polygon.coordinates[1].coordinates[1][2].latitude).toBe(0.8);
        expect(polygon.coordinates[1].coordinates[1][3].longitude).toBe(100.2);
        expect(polygon.coordinates[1].coordinates[1][3].latitude).toBe(0.8);
        expect(polygon.coordinates[1].coordinates[1][4].longitude).toBe(100.2);
        expect(polygon.coordinates[1].coordinates[1][4].latitude).toBe(0.2);

    });

    it ("can convert a GeoJson GeometryCollection to GeometryCollection", function () {
        var converter = new GeoJsonToGeometryConverter(),
            collection = converter.convert(geoJsonGeometryCollection);

        expect(collection.geometries.length).toBe(2);
        expect(collection.geometries[0].coordinates.longitude).toBe(100.0);
        expect(collection.geometries[0].coordinates.latitude).toBe(0.0);
        expect(collection.geometries[1].coordinates[0].longitude).toBe(101.0);
        expect(collection.geometries[1].coordinates[0].latitude).toBe(0.0);
        expect(collection.geometries[1].coordinates[1].longitude).toBe(102.0);
        expect(collection.geometries[1].coordinates[1].latitude).toBe(1.0);

    });

    it ("can convert a GeoJson Feature to a Feature", function () {
        var converter = new GeoJsonToGeometryConverter(),
            feature = converter.convert(geoJsonFeature),
            polygon = feature.geometry;

        expect(feature).toBeDefined();
        expect(feature.id).toBe(42);
        expect(feature.properties).toBeDefined();
        expect(feature.properties.foo).toBe("bar");
        expect(polygon).toBeDefined();
        expect(polygon.coordinates[0].length).toBe(5);
        expect(polygon.coordinates[0][0].longitude).toBe(100.0);
        expect(polygon.coordinates[0][0].latitude).toBe(0.0);
        expect(polygon.coordinates[0][1].longitude).toBe(100.0);
        expect(polygon.coordinates[0][1].latitude).toBe(1.0);
        expect(polygon.coordinates[0][2].longitude).toBe(101.0);
        expect(polygon.coordinates[0][2].latitude).toBe(1.0);
        expect(polygon.coordinates[0][3].longitude).toBe(101.0);
        expect(polygon.coordinates[0][3].latitude).toBe(0.0);
        expect(polygon.coordinates[0][4].longitude).toBe(100.0);
        expect(polygon.coordinates[0][4].latitude).toBe(0.0);

    });

    it ("can convert a GeoJson FeatureCollection to a FeatureCollection", function () {
        var converter = new GeoJsonToGeometryConverter(),
            collection = converter.convert(geoJsonFeatureCollection),
            featureOne = collection.features[0],
            polygon = featureOne.geometry,
            featureTwo = collection.features[1],
            point = featureTwo.geometry;

        expect(collection).toBeDefined();
        expect(collection.features.length).toBe(2);
        expect(featureOne).toBeDefined();
        expect(featureOne.id).toBe(42);
        expect(featureOne.properties).toBeDefined();
        expect(featureOne.properties.foo).toBe("bar");
        expect(featureTwo).toBeDefined();
        expect(featureTwo.id).toBe(43);
        expect(featureTwo.properties).toBeDefined();
        expect(featureTwo.properties.foo).toBe("baz");
        expect(polygon).toBeDefined();
        expect(polygon.coordinates[0].length).toBe(5);
        expect(polygon.coordinates[0][0].longitude).toBe(100.0);
        expect(polygon.coordinates[0][0].latitude).toBe(0.0);
        expect(polygon.coordinates[0][1].longitude).toBe(100.0);
        expect(polygon.coordinates[0][1].latitude).toBe(1.0);
        expect(polygon.coordinates[0][2].longitude).toBe(101.0);
        expect(polygon.coordinates[0][2].latitude).toBe(1.0);
        expect(polygon.coordinates[0][3].longitude).toBe(101.0);
        expect(polygon.coordinates[0][3].latitude).toBe(0.0);
        expect(polygon.coordinates[0][4].longitude).toBe(100.0);
        expect(polygon.coordinates[0][4].latitude).toBe(0.0);
        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);

    });

    it ("can revert a Point to GeoJson Point", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonPoint),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonPoint)).toBe(true);

    });

    it ("can revert a Projected Point to GeoJson Point", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry, reverted;
        converter.projection = Projection.forSrid("3857");
        geometry = converter.convert(geoJsonPoint3857);
        reverted = converter.revert(geometry);
        reverted.coordinates[0] = Math.round(reverted.coordinates[0] * 100) / 100;
        reverted.coordinates[1] = Math.round(reverted.coordinates[1] * 100) / 100;
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonPoint3857)).toBe(true);

    });

    it ("can revert a LineString to GeoJson LineString", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonLineString),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonLineString)).toBe(true);

    });

    it ("can revert a Polygon to GeoJson Polygon", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonPolygon),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonPolygon)).toBe(true);

    });

    it ("can revert a MultiPoint to GeoJson MultiPoint", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonMultiPoint),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonMultiPoint)).toBe(true);
    });

    it ("can revert a MultiLineString to GeoJson MultiLineString", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonMultiLineString),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonMultiLineString)).toBe(true);
    });

    it ("can revert a MultiPolygon to GeoJson MultiPolygon", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonMultiPolygon),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonMultiPolygon)).toBe(true);
    });

    it ("can revert a GeometryCollection to GeoJson GeometryCollection", function () {
        var converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(geoJsonGeometryCollection),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonGeometryCollection)).toBe(true);
    });

    it ("can revert a Feature to GeoJson Feature", function () {
        var converter = new GeoJsonToGeometryConverter(),
            feature = converter.convert(geoJsonFeature),
            reverted = converter.revert(feature);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonFeature)).toBe(true);
    });

    it ("can revert a FeatureCollection to GeoJson FeatureCollection", function () {
        var converter = new GeoJsonToGeometryConverter(),
            collection = converter.convert(geoJsonFeatureCollection),
            reverted = converter.revert(collection);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, geoJsonFeatureCollection)).toBe(true);
    });

    function objectEquals(x, y) {
        'use strict';

        if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
        // after this just checking type of one would be enough
        if (x.constructor !== y.constructor) { return false; }
        // if they are functions, they should exactly refer to same one (because of closures)
        if (x instanceof Function) { return x === y; }
        // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
        if (x instanceof RegExp) { return x === y; }
        if (x === y || x.valueOf() === y.valueOf()) { return true; }
        if (Array.isArray(x) && x.length !== y.length) { return false; }

        // if they are dates, they must had equal valueOf
        if (x instanceof Date) { return false; }

        // if they are strictly equal, they both need to be object at least
        if (!(x instanceof Object)) { return false; }
        if (!(y instanceof Object)) { return false; }

        // recursive object equality check
        var p = Object.keys(x);
        return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
            p.every(function (i) { return objectEquals(x[i], y[i]); });
    }

    var geoJsonPoint = {
            type: "Point",
            coordinates: [-156.6825, 20.8783]
        },
        geoJsonPoint3857 = {
            type: "Point",
            coordinates: [-17441816.12, 2377373.07]
        },
        geoJsonMultiPoint = {
            "type": "MultiPoint",
            "coordinates": [
                [100.0, 0.0],
                [101.0, 1.0]
            ]
        },
        geoJsonLineString = {
            "type": "LineString",
            "coordinates": [
                [100.0, 0.0],
                [101.0, 1.0]
            ]
        },
        geoJsonMultiLineString = {
            "type": "MultiLineString",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 1.0]
                ],
                [
                    [102.0, 2.0],
                    [103.0, 3.0]
                ]
            ]
        },
        geoJsonPolygon = {
            "type": "Polygon",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ]
            ]
        },
        geoJsonMultiPolygon = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [102.0, 2.0],
                        [103.0, 2.0],
                        [103.0, 3.0],
                        [102.0, 3.0],
                        [102.0, 2.0]
                    ]
                ],
                [
                    [
                        [100.0, 0.0],
                        [101.0, 0.0],
                        [101.0, 1.0],
                        [100.0, 1.0],
                        [100.0, 0.0]
                    ],
                    [
                        [100.2, 0.2],
                        [100.2, 0.8],
                        [100.8, 0.8],
                        [100.8, 0.2],
                        [100.2, 0.2]
                    ]
                ]
            ]
        },
        geoJsonGeometryCollection = {
            "type": "GeometryCollection",
            "geometries": [{
                "type": "Point",
                "coordinates": [100.0, 0.0]
            }, {
                "type": "LineString",
                "coordinates": [
                    [101.0, 0.0],
                    [102.0, 1.0]
                ]
            }]
        },
        geoJsonFeature = {
            "type": "Feature",
            "id": 42,
            "properties": {
                "foo": "bar"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [100.0, 0.0],
                        [101.0, 0.0],
                        [101.0, 1.0],
                        [100.0, 1.0],
                        [100.0, 0.0]
                    ]
                ]
            }
        },
        geoJsonFeatureCollection = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "id": 42,
                    "properties": {
                        "foo": "bar"
                    },
                    "geometry": geoJsonPolygon
                },
                {
                    "type": "Feature",
                    "id": 43,
                    "properties": {
                        "foo": "baz"
                    },
                    "geometry": geoJsonPoint
                }
            ]
        };

});
