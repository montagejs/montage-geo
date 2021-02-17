var GeoJsonToGeometryConverter = require("montage-geo/logic/converter/geo-json-to-geometry-converter").GeoJsonToGeometryConverter,
    Projection = require("montage-geo/logic/model/projection").Projection;

describe("GeoJsonToGeometryConverter", function () {

    var DEFAULT_MARKER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAoCAYAAADkDTpVAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAA6hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0wOS0wN1QxNDowOTo1MjwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAzLjcuNDwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpDb21wcmVzc2lvbj4wPC90aWZmOkNvbXByZXNzaW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4yNDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNl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",
        FILL_COLOR = "rgba(255, 0, 0, 0)",
        STROKE_COLOR = "rgba(255, 255, 0, 0)",
        FILL_OPACITY = 0.75,
        STROKE_OPACITY = 0.25,
        STROKE_WEIGHT = 2.0,
        HEIGHT = 40,
        WIDTH = 24,
        icon, anchor, size;


    it ("can convert a GeoJson Point to Point", function () {
        var converter = new GeoJsonToGeometryConverter(),
            point = converter.convert(geoJsonPoint);
        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);
    });

    it ("can convert a Montage Geo GeoJson style extension Anchor to a Point2D", function () {
        var anchor = {
                x: WIDTH / 2,
                y: HEIGHT / 2,
                type: "Anchor"
            },
            point2D = new GeoJsonToGeometryConverter().convert(anchor);
        expect(point2D).toBeDefined();
        expect(point2D.x).toBe(WIDTH / 2);
        expect(point2D.y).toBe(HEIGHT / 2);
    });

    it ("can convert a Montage Geo GeoJson style extension Size to a Size", function () {
        var rawSize = {
                height: HEIGHT,
                width: WIDTH,
                type: "Size"
            },
            size = new GeoJsonToGeometryConverter().convert(rawSize);
        expect(size).toBeDefined();
        expect(size.height).toBe(HEIGHT);
        expect(size.width).toBe(WIDTH);
    });

    it ("can convert a Montage Geo GeoJson style extension Icon to a Icon", function () {
        var rawIcon = {
                symbol: DEFAULT_MARKER,
                anchor: {
                    x: WIDTH / 4,
                    y: HEIGHT / 4
                },
                size: {
                    height: HEIGHT,
                    width: WIDTH
                },
                scaledSize: {
                    height: HEIGHT / 2,
                    width: WIDTH / 2
                },
                type: "Icon"
            },
            icon = new GeoJsonToGeometryConverter().convert(rawIcon);
        expect(icon).toBeDefined();
        expect(icon.symbol).toBe(DEFAULT_MARKER);
        expect(icon.anchor).toBeDefined();
        expect(icon.anchor.x).toBe(WIDTH / 4);
        expect(icon.anchor.y).toBe(HEIGHT / 4);
        expect(icon.size).toBeDefined();
        expect(icon.size.height).toBe(HEIGHT);
        expect(icon.size.width).toBe(WIDTH);
        expect(icon.scaledSize).toBeDefined();
        expect(icon.scaledSize.height).toBe(HEIGHT / 2);
        expect(icon.scaledSize.width).toBe(WIDTH / 2);
    });

    it ("can convert a Montage Geo GeoJson style extension Icon Style to a Style", function () {
        var rawIcon = {
                symbol: DEFAULT_MARKER,
                anchor: {
                    x: WIDTH / 4,
                    y: HEIGHT / 4
                },
                size: {
                    height: HEIGHT,
                    width: WIDTH
                },
                scaledSize: {
                    height: HEIGHT / 2,
                    width: WIDTH / 2
                },
                type: "Icon"
            },
            rawStyle = {
                icon: rawIcon,
                styleType: 0,
                type: "Style"
            },
            style = new GeoJsonToGeometryConverter().convert(rawStyle);
        expect(style.icon).toBeDefined();
        expect(style.icon.symbol).toBe(DEFAULT_MARKER);
        expect(style.icon.anchor).toBeDefined();
        expect(style.icon.anchor.x).toBe(WIDTH / 4);
        expect(style.icon.anchor.y).toBe(HEIGHT / 4);
        expect(style.icon.size).toBeDefined();
        expect(style.icon.size.height).toBe(HEIGHT);
        expect(style.icon.size.width).toBe(WIDTH);
        expect(style.icon.scaledSize).toBeDefined();
        expect(style.icon.scaledSize.height).toBe(HEIGHT / 2);
        expect(style.icon.scaledSize.width).toBe(WIDTH / 2);
    });

    it ("can convert a Montage Geo GeoJson style extension Line Style to a Style", function () {
        var rawStyle = {
                strokeColor: STROKE_COLOR,
                strokeOpacity: STROKE_OPACITY,
                strokeWeight: STROKE_WEIGHT,
                styleType: 1,
                type: "Style"
            },
            style = new GeoJsonToGeometryConverter().convert(rawStyle);
        expect(style).toBeDefined();
        expect(style.strokeColor).toBe(STROKE_COLOR);
        expect(style.strokeOpacity).toBe(STROKE_OPACITY);
        expect(style.strokeWeight).toBe(STROKE_WEIGHT);
    });

    it ("can convert a Montage Geo GeoJson style extension Polygon Style to a Style", function () {
        var rawStyle = {
                fillColor: FILL_COLOR,
                fillOpacity: FILL_OPACITY,
                strokeColor: STROKE_COLOR,
                strokeOpacity: STROKE_OPACITY,
                strokeWeight: STROKE_WEIGHT,
                styleType: 2,
                type: "Style"
            },
            style = new GeoJsonToGeometryConverter().convert(rawStyle);
        expect(style).toBeDefined();
        expect(style.fillColor).toBe(FILL_COLOR);
        expect(style.fillOpacity).toBe(FILL_OPACITY);
        expect(style.strokeColor).toBe(STROKE_COLOR);
        expect(style.strokeOpacity).toBe(STROKE_OPACITY);
        expect(style.strokeWeight).toBe(STROKE_WEIGHT);
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
            polygon = feature.geometry,
            style = feature.style;

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
        expect(style).toBeDefined();
        expect(style.strokeColor).toBe(STROKE_COLOR);
        expect(style.strokeOpacity).toBe(STROKE_OPACITY);
        expect(style.strokeWeight).toBe(STROKE_WEIGHT);
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

    it ("can revert a Point2D to a Montage Geo GeoJson Anchor Style extension", function () {
        var anchor = {
                x: WIDTH / 2,
                y: HEIGHT / 2,
                type: "Anchor"
            },
            converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(anchor),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, anchor)).toBe(true);
    });

    it ("can revert a Size to a Montage Geo GeoJson Size Style extension", function () {
        var rawSize = {
                height: HEIGHT,
                width: WIDTH,
                type: "Size"
            },
            converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(rawSize),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, rawSize)).toBe(true);
    });

    it ("can revert an Icon to a Montage Geo GeoJson Icon Style extension", function () {
        var rawIcon = {
                symbol: DEFAULT_MARKER,
                anchor: {
                    x: WIDTH / 4,
                    y: HEIGHT / 4,
                    type: "Anchor"
                },
                size: {
                    height: HEIGHT,
                    width: WIDTH,
                    type: "Size"
                },
                scaledSize: {
                    height: HEIGHT / 2,
                    width: WIDTH / 2,
                    type: "Size"
                },
                type: "Icon"
            },
            converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(rawIcon),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, rawIcon)).toBe(true);
    });

    it ("can convert a Style with Icon to a Montage Geo GeoJson Style extension", function () {
        var rawIcon = {
                symbol: DEFAULT_MARKER,
                anchor: {
                    x: WIDTH / 4,
                    y: HEIGHT / 4,
                    type: "Anchor"
                },
                size: {
                    height: HEIGHT,
                    width: WIDTH,
                    type: "Size"
                },
                scaledSize: {
                    height: HEIGHT / 2,
                    width: WIDTH / 2,
                    type: "Size"
                },
                type: "Icon"
            },
            rawStyle = {
                icon: rawIcon,
                styleType: 0,
                type: "Style"
            },
            converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(rawStyle),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, rawStyle)).toBe(true);
    });

    it ("can revert a Line Style to a Montage Geo GeoJson Style extension", function () {
        var rawStyle = {
                strokeColor: STROKE_COLOR,
                strokeOpacity: STROKE_OPACITY,
                strokeWeight: STROKE_WEIGHT,
                styleType: 1,
                type: "Style"
            },
            converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(rawStyle),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, rawStyle)).toBe(true);
    });

    it ("can revert a Polygon Style to a Montage Geo GeoJson style extension", function () {
        var rawStyle = {
                fillColor: FILL_COLOR,
                fillOpacity: FILL_OPACITY,
                strokeColor: STROKE_COLOR,
                strokeOpacity: STROKE_OPACITY,
                strokeWeight: STROKE_WEIGHT,
                styleType: 2,
                type: "Style"
            },
            converter = new GeoJsonToGeometryConverter(),
            geometry = converter.convert(rawStyle),
            reverted = converter.revert(geometry);
        expect(reverted).toBeDefined();
        expect(objectEquals(reverted, rawStyle)).toBe(true);
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
            },
            "style": {
                "type": "Style",
                "styleType": 1,
                "strokeColor": STROKE_COLOR,
                "strokeOpacity": STROKE_OPACITY,
                "strokeWeight": STROKE_WEIGHT
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
                    "geometry": geoJsonPolygon,
                    "style": null
                },
                {
                    "type": "Feature",
                    "id": 43,
                    "properties": {
                        "foo": "baz"
                    },
                    "geometry": geoJsonPoint,
                    "style": null
                }
            ]
        };

});
