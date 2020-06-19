var EsriJsonToGeometryConverter = require("montage-geo/logic/converter/esri-json-to-geometry-converter").EsriJsonToGeometryConverter,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    Polygon = require("montage-geo/logic/model/polygon").Polygon,
    Projection = require("montage-geo/logic/model/projection").Projection;

describe("EsriJsonToGeometryConverter", function () {

    it("can convert a Esri Point to Point", function () {
        var converter = new EsriJsonToGeometryConverter(),
            point = converter.convert(esriJsonPoint);
        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);
        expect(point.coordinates.altitude).toBe(10);
    });

    it ("can revert a Point to Esri Point", function () {
        var converter = new EsriJsonToGeometryConverter(),
            geometry = converter.convert(esriJsonPoint),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, esriJsonPoint)).toBe(true);
    });

    it ("can convert a Esri MultiPoint to MultiPoint", function () {
        var converter = new EsriJsonToGeometryConverter(),
            point = converter.convert(esriJsonMultiPoint);
        expect(point).toBeDefined();
        expect(point.coordinates.length).toBe(2);
        expect(point.coordinates[0].longitude).toBe(100.0);
        expect(point.coordinates[0].latitude).toBe(0.0);
        expect(point.coordinates[1].longitude).toBe(101.0);
        expect(point.coordinates[1].latitude).toBe(1.0);
    });

    it ("can revert a MultiPoint to Esri MultiPoint", function () {
        var converter = new EsriJsonToGeometryConverter(),
            geometry = converter.convert(esriJsonMultiPoint),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, esriJsonMultiPoint)).toBe(true);
    });

    it ("can convert a Esri Point to Point with Projection", function () {
        var converter = new EsriJsonToGeometryConverter(),
            point;

        converter.projection = Projection.forSrid("3857");
        point = converter.convert(esriJsonPoint3857);

        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);
        expect(point.coordinates.altitude).toBe(undefined);
    });

    it ("can convert a Esri Polyline to a MultiLineString", function () {
        var converter = new EsriJsonToGeometryConverter(),
            multiLineString = converter.convert(esriJsonPolyline);
        expect(multiLineString).toBeDefined();
        expect(multiLineString.coordinates.length).toBe(2);
        expect(multiLineString.coordinates[0].coordinates[0].longitude).toBe(-97.06138);
        expect(multiLineString.coordinates[0].coordinates[0].latitude).toBe(32.837);
        expect(multiLineString.coordinates[0].coordinates[1].longitude).toBe(-97.06133);
        expect(multiLineString.coordinates[0].coordinates[1].latitude).toBe(32.836);
        expect(multiLineString.coordinates[0].coordinates[2].longitude).toBe(-97.06124);
        expect(multiLineString.coordinates[0].coordinates[2].latitude).toBe(32.834);
        expect(multiLineString.coordinates[0].coordinates[3].longitude).toBe(-97.06127);
        expect(multiLineString.coordinates[0].coordinates[3].latitude).toBe(32.832);
        expect(multiLineString.coordinates[1].coordinates[0].longitude).toBe(-97.06326);
        expect(multiLineString.coordinates[1].coordinates[0].latitude).toBe(32.759);
        expect(multiLineString.coordinates[1].coordinates[1].longitude).toBe(-97.06298);
        expect(multiLineString.coordinates[1].coordinates[1].latitude).toBe(32.755);
    });

    it ("can revert a LineString to Esri Polyline", function () {
        var converter = new EsriJsonToGeometryConverter(),
            geometry = LineString.withCoordinates([[0, 0], [0, 10]]),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, esriJsonSimplePolyline)).toBe(true);
    });

    it ("can revert a MultiLineString to Esri Polyline", function () {
        var converter = new EsriJsonToGeometryConverter(),
            geometry = converter.convert(esriJsonPolyline),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, esriJsonPolyline)).toBe(true);
    });

    it ("can convert a Esri Polygon to a MultiPolygon", function () {
        var converter = new EsriJsonToGeometryConverter(),
            multiPolygon = converter.convert(esriPolygon);
        expect(multiPolygon).toBeDefined();
        expect(multiPolygon.coordinates.length).toBe(1);
        expect(multiPolygon.coordinates[0].coordinates[0][0].longitude).toBe(-118.38516);
        expect(multiPolygon.coordinates[0].coordinates[0][0].latitude).toBe(34.01270);
        expect(multiPolygon.coordinates[0].coordinates[0][1].longitude).toBe(-118.38827);
        expect(multiPolygon.coordinates[0].coordinates[0][1].latitude).toBe(34.01489);
        expect(multiPolygon.coordinates[0].coordinates[0][2].longitude).toBe(-118.38813);
        expect(multiPolygon.coordinates[0].coordinates[0][2].latitude).toBe(34.01602);
        expect(multiPolygon.coordinates[0].coordinates[0][3].longitude).toBe(-118.38797);
        expect(multiPolygon.coordinates[0].coordinates[0][3].latitude).toBe(34.01648);
        expect(multiPolygon.coordinates[0].coordinates[0][4].longitude).toBe(-118.38760);
        expect(multiPolygon.coordinates[0].coordinates[0][4].latitude).toBe(34.01712);
        expect(multiPolygon.coordinates[0].coordinates[1][0].longitude).toBe(-118.38661);
        expect(multiPolygon.coordinates[0].coordinates[1][0].latitude).toBe(34.01486);
        expect(multiPolygon.coordinates[0].coordinates[1][1].longitude).toBe(-118.38634);
        expect(multiPolygon.coordinates[0].coordinates[1][1].latitude).toBe(34.01498);
        expect(multiPolygon.coordinates[0].coordinates[1][2].longitude).toBe(-118.38652);
        expect(multiPolygon.coordinates[0].coordinates[1][2].latitude).toBe(34.01563);
        expect(multiPolygon.coordinates[0].coordinates[1][3].longitude).toBe(-118.38670);
        expect(multiPolygon.coordinates[0].coordinates[1][3].latitude).toBe(34.01559);
    });

    it ("can revert a Polygon to Esri Polygon", function () {
        var converter = new EsriJsonToGeometryConverter(),
            geometry = p1 = Polygon.withCoordinates([
                [[0,0], [0,10], [10,10], [10,0], [0,0]]
            ]),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, esriSimplePolygon)).toBe(true);
    });

    it ("can revert a MultiPolygon to Esri Polygon", function () {
        var converter = new EsriJsonToGeometryConverter(),
            geometry = converter.convert(esriPolygon),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, esriPolygon)).toBe(true);
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

});

var esriJsonPoint = {
        x: -156.6825,
        y: 20.8783,
        z: 10
    },
    esriJsonPoint3857 = {
        x: -17441816.12,
        y: 2377373.07
    },
    esriJsonMultiPoint = {
        "points": [
            [100.0, 0.0],
            [101.0, 1.0]
        ]
    },
    esriJsonPolyline = {
        "paths": [
            [
                [-97.06138, 32.837],
                [-97.06133, 32.836],
                [-97.06124, 32.834],
                [-97.06127, 32.832]
            ],
            [
                [-97.06326, 32.759],
                [-97.06298, 32.755]
            ]
        ]
    },
    esriJsonSimplePolyline = {
        "paths": [
            [
                [0, 0],
                [0, 10]
            ]
        ]
    },
    esriSimplePolygon = {
        "rings": [
            [
                [0,0],
                [0,10],
                [10,10],
                [10,0],
                [0,0]
            ]
        ]
    },
    esriPolygon = {
        "rings" : [
            [
                [ -118.38516, 34.01270 ],
                [ -118.38827, 34.01489 ],
                [ -118.38813, 34.01602 ],
                [ -118.38797, 34.01648 ],
                [ -118.38760, 34.01712 ],
                [ -118.38733, 34.01696 ],
                [ -118.38696, 34.01749 ],
                [ -118.38662, 34.01789 ],
                [ -118.38689, 34.01805 ],
                [ -118.38683, 34.01812 ],
                [ -118.38295, 34.01592 ],
                [ -118.38516, 34.01270 ]
            ],
            [
                [ -118.38661, 34.01486 ],
                [ -118.38634, 34.01498 ],
                [ -118.38652, 34.01563 ],
                [ -118.38670, 34.01559 ],
                [ -118.38679, 34.01595 ],
                [ -118.38699, 34.01591 ],
                [ -118.38707, 34.01507 ],
                [ -118.38661, 34.01486 ]
            ]
        ]
    };



