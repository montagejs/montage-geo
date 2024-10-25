var KMLGeometryToGeometryConverter = require("montage-geo/logic/converter/kml-geometry-to-geometry-converter").KMLGeometryToGeometryConverter,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    GeometryCollection = require("montage-geo/logic/model/geometry-collection").GeometryCollection,
    Point = require("montage-geo/logic/model/point").Point,
    Polygon = require("montage-geo/logic/model/polygon").Polygon;

describe("A KML Geometry to Geometry converter", function () {

    var converter;
    beforeAll(function () {
        converter = new KMLGeometryToGeometryConverter();
    });

    it ("can convert a KML Point to a Montage-Geo Point", function () {

        var kmlPoint = document.createElement("Point"),
            coordinates = document.createElement("coordinates"),
            point;

        coordinates.textContent = "-90.86948943473118,48.25450093195546";
        kmlPoint.appendChild(coordinates);

        point = converter.convert(kmlPoint, "2.2");
        expect(point).toBeDefined();
        expect(point instanceof Point).toBeTruthy();
        expect(point.coordinates.longitude).toBeCloseTo(-90.86949);
        expect(point.coordinates.latitude).toBeCloseTo(48.25450);

    });

    it ("can convert a KML LineString to a Montage-Geo LineString", function () {

            var kmlLineString = document.createElement("LineString"),
                coordinates = document.createElement("coordinates"),
                lineString;

            coordinates.textContent = "-90.86948943473118,48.25450093195546 -90.86948943473118,48.25450093195546";
            kmlLineString.appendChild(coordinates);

            lineString = converter.convert(kmlLineString, "2.2");
            expect(lineString).toBeDefined();
            expect(lineString instanceof LineString).toBeTruthy();
            expect(lineString.coordinates[0].longitude).toBeCloseTo(-90.86949);
            expect(lineString.coordinates[0].latitude).toBeCloseTo(48.25450);
            expect(lineString.coordinates[1].longitude).toBeCloseTo(-90.86949);
            expect(lineString.coordinates[1].latitude).toBeCloseTo(48.25450);

    });

    it ("can convert a KML LinearRing to a Montage-Geo LineString", function () {

        var kmlLinearRing = document.createElement("LinearRing"),
            coordinates = document.createElement("coordinates"),
            polygon, outerRing;

        coordinates.textContent = "-122.365662,37.826988,0\n" +
            "-122.365202,37.826302,0\n" +
            "-122.364581,37.82655,0\n" +
            "-122.365038,37.827237,0\n" +
            "-122.365662,37.826988,0";
        kmlLinearRing.appendChild(coordinates);

        polygon = converter.convert(kmlLinearRing, "2.2");
        outerRing = polygon.coordinates[0];
        expect(polygon).toBeDefined();
        expect(polygon.coordinates.length).toBe(1);
        expect(polygon instanceof Polygon).toBeTruthy();
        expect(outerRing[0].longitude).toBeCloseTo(-122.36566);
        expect(outerRing[0].latitude).toBeCloseTo(37.82699);
        expect(outerRing[1].longitude).toBeCloseTo(-122.36520);
        expect(outerRing[1].latitude).toBeCloseTo(37.82630);
        expect(outerRing[2].longitude).toBeCloseTo(-122.36458);
        expect(outerRing[2].latitude).toBeCloseTo(37.82655);
        expect(outerRing[3].longitude).toBeCloseTo(-122.36504);
        expect(outerRing[3].latitude).toBeCloseTo(37.82724);
        expect(outerRing[4].longitude).toBeCloseTo(-122.36566);
        expect(outerRing[4].latitude).toBeCloseTo(37.82699);

    });

    it ("can convert a KML Polygon to a Montage-Geo Polygon", function () {

            var kmlPolygon = document.createElement("Polygon"),
                outerBoundaryIs = document.createElement("outerBoundaryIs"),
                innerBoundaryIs = document.createElement("innerBoundaryIs"),
                outerRing = document.createElement("LinearRing"),
                innerRing = document.createElement("LinearRing"),
                outerRingCoordinates = document.createElement("coordinates"),
                innerRingCoordinates = document.createElement("coordinates"),
                polygon;

            outerRingCoordinates.textContent = "-122.365662,37.826988,0\n" +
                "-122.365202,37.826302,0\n" +
                "-122.364581,37.82655,0\n" +
                "-122.365038,37.827237,0\n" +
                "-122.365662,37.826988,0";

            outerRing.appendChild(outerRingCoordinates);
            outerBoundaryIs.appendChild(outerRing);
            innerRingCoordinates.textContent = "-122.365662,37.826988,0\n" +
                "-122.365202,37.826302,0\n" +
                "-122.364581,37.82655,0\n" +
                "-122.365038,37.827237,0\n" +
                "-122.365662,37.826988,0";

            innerRing.appendChild(innerRingCoordinates);
            innerBoundaryIs.appendChild(innerRing);

            kmlPolygon.appendChild(outerBoundaryIs);
            kmlPolygon.appendChild(innerBoundaryIs);

            polygon = converter.convert(kmlPolygon, "2.2");
            expect(polygon).toBeDefined();
            expect(polygon instanceof Polygon).toBeTruthy();
            expect(polygon.coordinates.length).toBe(2);
            expect(polygon.coordinates[0].length).toBe(5);
            expect(polygon.coordinates[0][0].longitude).toBe(-122.36566);
            expect(polygon.coordinates[0][0].latitude).toBe(37.82699);
            expect(polygon.coordinates[1].length).toBe(5);

    });

    it ("can convert a KML MultiGeometry to a Montage-Geo GeometryCollection", function () {

        var text = "<MultiGeometry>\n" +
            "    <LineString>\n" +
            "      <!-- north wall -->\n" +
            "      <coordinates>\n" +
            "        -122.4425587930444,37.80666418607323,0\n" +
            "        -122.4428379594768,37.80663578323093,0\n" +
            "      </coordinates>\n" +
            "    </LineString>\n" +
            "    <LineString>\n" +
            "      <!-- south wall -->\n" +
            "      <coordinates>\n" +
            "        -122.4425509770566,37.80662588061205,0\n" +
            "        -122.4428340530617,37.8065999493009,0\n" +
            "      </coordinates>\n" +
            "    </LineString>\n" +
            "  </MultiGeometry>",
            parser = new DOMParser(),
            kmlMultiGeometry = parser.parseFromString(text, "application/xml").documentElement,
            geometryCollection = converter.convert(kmlMultiGeometry, "2.2");

        expect(geometryCollection).toBeDefined();
        expect(geometryCollection instanceof GeometryCollection).toBeTruthy();
        expect(geometryCollection.geometries.length).toBe(2);
        expect(geometryCollection.geometries[0] instanceof LineString).toBeTruthy();
        expect(geometryCollection.geometries[1] instanceof LineString).toBeTruthy();

    });

    it ("can convert a KML LookAt to a Montage-Geo Point", function () {

        var text = "<LookAt>\n" +
            "      <gx:TimeStamp>\n" +
            "        <when>1994</when>\n" +
            "      </gx:TimeStamp>\n" +
            "      <longitude>-122.363</longitude>\n" +
            "      <latitude>37.81</latitude>\n" +
            "      <altitude>2000</altitude>\n" +
            "      <range>500</range>\n" +
            "      <tilt>45</tilt>\n" +
            "      <heading>0</heading>\n" +
            "      <altitudeMode>relativeToGround</altitudeMode>\n" +
            "    </LookAt>",
            parser = new DOMParser(),
            kmlLookAt = parser.parseFromString(text, "application/xml").documentElement,
            geometry = converter.convert(kmlLookAt, "2.2");

        expect(geometry).toBeDefined();
        expect(geometry instanceof Point).toBeTruthy();
        expect(geometry.coordinates.longitude).toBe(-122.363);
        expect(geometry.coordinates.latitude).toBe(37.81);
        expect(geometry.coordinates.altitude).toBe(2000);

    });

});