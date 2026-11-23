var BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    MGRSGridZone = require("montage-geo/logic/model/mgrs-grid-zone").MGRSGridZone,
    MGRS10KMSquareZone = require("montage-geo/logic/model/mgrs-grid-zone").MGRS10KMSquareZone,
    MGRS100KMSquareZoneFactory = require("montage-geo/logic/model/mgrs-grid-zone").MGRS100KMSquareZoneFactory,
    UTMZone = require("montage-geo/logic/model/mgrs-grid-zone").UTMZone,
    UTMZoneService = require("montage-geo/logic/model/mgrs-grid-zone").UTMZoneService;

describe("MGRSGridZone", function () {

    it ("can create a UTM Zone", function () {

        var utmZone = new UTMZone().init({
            number: 33, isNorth: true
        });
        expect(utmZone).toBeDefined();
        expect(utmZone.id).toBe("33N");
        expect(utmZone.zone).toBe(33);
        expect(utmZone.centralMeridian).toBe(15);
        expect(utmZone.isNorth).toBe(true);
        expect(utmZone.projection).toBeDefined();
        expect(utmZone.isPolar).toBe(false);

    });

    it ("can correctly calculate the bounds of a UTM Zone", function () {
        var utmZone = new UTMZone().init({
                number: 33, isNorth: true
            }),
            bounds = utmZone.bounds;

        expect(bounds).toBeDefined();
        expect(bounds.yMin).toBe(0);
        expect(bounds.yMax).toBe(84);
        expect(bounds.xMin).toBe(12);
        expect(bounds.xMax).toBe(18);

    });

    it ("can correctly calculate the width of a UTM Zone in degrees at latitude", function () {

        var utmZone31 = new UTMZone().init({
                number: 31, isNorth: true
            }),
            utmZone32 = new UTMZone().init({
                number: 32, isNorth: true
            }),
            utmZone33 = new UTMZone().init({
                number: 33, isNorth: true
            }),
            utmZone35 = new UTMZone().init({
                number: 35, isNorth: true
            }),
            utmZone37 = new UTMZone().init({
                number: 37, isNorth: true
            }),
            mgrsGridZone31V = new MGRSGridZone().init({
                number: 31, letter: 'V'
            }),
            mgrsGridZone32V = new MGRSGridZone().init({
                number: 32, letter: 'V'
            }),
            mgrsGridZone31X = new MGRSGridZone().init({
                number: 31, letter: 'X'
            }),
            mgrsGridZone33X = new MGRSGridZone().init({
                number: 33, letter: 'X'
            }),
            mgrsGridZone35X = new MGRSGridZone().init({
                number: 35, letter: 'X'
            }),
            mgrsGridZone37X = new MGRSGridZone().init({
                number: 37, letter: 'X'
            }),
            widthInDegrees31V = utmZone31.widthOfZoneInDegreesLongitudeAtLatitude(
                mgrsGridZone31V.bounds.center.latitude
            ),
            widthInDegrees31X = utmZone31.widthOfZoneInDegreesLongitudeAtLatitude(
                mgrsGridZone31X.bounds.center.latitude
            ),
            widthInDegrees32V = utmZone32.widthOfZoneInDegreesLongitudeAtLatitude(
                mgrsGridZone32V.bounds.center.latitude
            ),
            widthInDegrees33X = utmZone33.widthOfZoneInDegreesLongitudeAtLatitude(
                mgrsGridZone33X.bounds.center.latitude
            ),
            widthInDegrees35X = utmZone35.widthOfZoneInDegreesLongitudeAtLatitude(
                mgrsGridZone35X.bounds.center.latitude
            ),
            widthInDegrees37X = utmZone37.widthOfZoneInDegreesLongitudeAtLatitude(
                mgrsGridZone37X.bounds.center.latitude
            );

        expect(widthInDegrees31V).toBe(3);
        expect(widthInDegrees32V).toBe(9);
        expect(widthInDegrees31X).toBe(9);
        expect(widthInDegrees33X).toBe(12);
        expect(widthInDegrees35X).toBe(12);
        expect(widthInDegrees37X).toBe(9);

    });

    it ("can create a MGRS Grid Zone", function () {

        var mgrsGridZone = new MGRSGridZone().init({
                number: 33, letter: 'U'
            }),
            bounds = mgrsGridZone.bounds;

        expect(mgrsGridZone).toBeDefined();
        expect(mgrsGridZone.number).toBe(33);
        expect(mgrsGridZone.letter).toBe('U');
        expect(mgrsGridZone.id).toBe("33U");
        expect(bounds).toBeDefined();
        expect(bounds.yMin).toBe(48);
        expect(bounds.yMax).toBe(56);
        expect(bounds.xMin).toBe(12);
        expect(bounds.xMax).toBe(18);

    });

    it ("can correctly longitude for a special MGRS Grid Zone", function () {

        var mgrsGridZone = new MGRSGridZone().init({
                number: 31, letter: 'X'
            }),
            bounds = mgrsGridZone.bounds;

        expect(mgrsGridZone).toBeDefined();
        expect(mgrsGridZone.number).toBe(31);
        expect(mgrsGridZone.letter).toBe('X');
        expect(bounds).toBeDefined();
        expect(bounds.yMin).toBe(72);
        expect(bounds.yMax).toBe(84);
        expect(bounds.xMin).toBe(0);
        expect(bounds.xMax).toBe(9);

    });

    it ("can create a MGRS 100K Grid Zone with Identifier", function () {

        var factory = new MGRS100KMSquareZoneFactory({}),
            utmZone = new UTMZone().init({
                number: 4, isNorth: true
            }),
            gridZone = factory.createMGRS100KMSquareZone({
                utmZone: utmZone, identifier: "GJ"
            });

        expect(gridZone).toBeDefined();
        expect(gridZone.identifier).toBe("GJ");
        expect(gridZone.utmZone).toBe(utmZone);
        expect(gridZone.easting).toBeDefined();
        expect(gridZone.northing).toBeDefined();

    });

    it ("can create a MGRS 100K Grid Zone with Easting and Northing", function () {

        var factory = new MGRS100KMSquareZoneFactory({}),
            utmZoneOne = new UTMZone().init({
                number: 1, isNorth: true
            }),
            utmZoneTwo = new UTMZone().init({
                number: 2, isNorth: true
            }),
            widthOfZoneInMetersAtLatitude = utmZoneOne.widthInMetersAtLatitude(0),
            easting = 500000 - widthOfZoneInMetersAtLatitude / 2,
            gridZoneOneStart = factory.createMGRS100KMSquareZone({
                utmZone: utmZoneOne, easting: easting, northing: 0
            }),
            gridZoneOneEnd = factory.createMGRS100KMSquareZone({
                utmZone: utmZoneOne, easting: easting + widthOfZoneInMetersAtLatitude, northing: 0
            }),
            gridZoneTwo = factory.createMGRS100KMSquareZone({
                utmZone: utmZoneTwo, easting: easting, northing: 0
            });

        expect(gridZoneOneStart).toBeDefined();
        expect(gridZoneOneStart.easting).toBe(easting);
        expect(gridZoneOneStart.northing).toBe(0);
        expect(gridZoneOneStart.identifier).toBe("AA");
        expect(gridZoneOneStart.id).toBe("1NAA0000000000");
        expect(gridZoneOneEnd).toBeDefined();
        expect(gridZoneOneEnd.easting).toBe(easting + widthOfZoneInMetersAtLatitude);
        expect(gridZoneOneEnd.northing).toBe(0);
        expect(gridZoneOneEnd.identifier).toBe("HA");
        expect(gridZoneTwo).toBeDefined();
        expect(gridZoneTwo.easting).toBe(easting);
        expect(gridZoneTwo.northing).toBe(0);
        expect(gridZoneTwo.identifier).toBe("JF");

    });

    it ("can create a MGRS 100K Grid Zone with Easting and Northing in the Southern Hemisphere",
        function () {

        var factory = new MGRS100KMSquareZoneFactory({}),
            utmZoneOne = new UTMZone().init({
                number: 1, isNorth: false
            }),
            widthOfZoneInMetersAtLatitude = utmZoneOne.widthInMetersAtLatitude(-0.903),
            easting = 500000 - widthOfZoneInMetersAtLatitude / 2,
            gridZoneOneStart = factory.createMGRS100KMSquareZone({
                utmZone: utmZoneOne, easting: easting, northing: 10000000 - 100000
            });

        expect(gridZoneOneStart).toBeDefined();
        expect(gridZoneOneStart.easting).toBe(easting);
        expect(gridZoneOneStart.northing).toBe(9900000);
        expect(gridZoneOneStart.identifier).toBe("AV");

    });

    it ("can calculate the UTM Zones for a given bounds", function () {

        var factory = new UTMZoneService({}),
            bounds = BoundingBox.withCoordinates(0, -10, 90, 10),
            zones = factory.childZonesForBounds(bounds);

        expect(zones).toBeDefined();
        expect(zones.length).toBe(32);

    });

    it ("can calculate the latitude at a northing", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            equator = utmZone.calculateLatitudeForNorthing(110683),
            fortyFiveDegrees = utmZone.calculateLatitudeForNorthing(4987330),
            northernExtent = utmZone.calculateLatitudeForNorthing(10000000);

        expect(equator).toBeDefined();
        expect(Math.round(equator * 10) / 10).toBe(1);
        expect(Math.round(fortyFiveDegrees * 10) / 10).toBe(45);
        expect(Math.round(northernExtent * 10) / 10).toBe(90);

    });

    it ("can calculate the width of a UTM Zone in meters at a provided latitude", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            equator = utmZone.widthInMetersAtLatitude(0);

        expect(equator).toBeDefined();
        expect(Math.round(equator)).toBe(667920);

    });

    it ("can create a MGRS 100K Grid Zone's Geometry for first easting in MGRS Grid Zone 1R"
        , function () {

        var factory = new MGRS100KMSquareZoneFactory({}),
            utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            widthInMeters = utmZone.widthInMetersAtLatitude(24.418),
            gridZone = factory.createMGRS100KMSquareZone({
                utmZone: utmZone, easting: 500000 - widthInMeters / 2, northing: 28 * 100000
            }),
            serialized = gridZone.toGeoJSON();

        expect(serialized).toBeDefined();
        expect(serialized.geometry).toBeDefined();
        expect(serialized.geometry.type).toBe("Polygon");
        expect(serialized.properties).toBeDefined();
        expect(serialized.properties.identifier).toBe("AJ");
        expect(serialized.properties.utmZone.zone).toBe(1);
        expect(serialized.properties.utmZone.isNorth).toBe(true);

    });

    it ("can calculate the 100KM GridZones for a given bounds in an UTM Zone", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            mgrsGridZone = new MGRSGridZone().init({
                number: 1, letter: 'N'
            }),
            gridZones = utmZone.hundredKMSquaresForBounds(mgrsGridZone.bounds);

        expect(gridZones).toBeDefined();
        expect(gridZones.length).toBe(72);

    });

    it ("can calculate the 100KM GridZones for a given bounds in an UTM Zone in the Southern Hemisphere", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: false
            }),
            mgrsGridZone = new MGRSGridZone().init({
                number: 1, letter: 'M'
            }),
            gridZones = utmZone.hundredKMSquaresForBounds(mgrsGridZone.bounds);

        expect(gridZones).toBeDefined();
        expect(gridZones.length).toBe(72);

    });

    it ("can calculate the 100KM Grid Zone's 10KM GridZones for a given bounds in an UTM Zone", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            mgrs100KMSquareZoneFactory = new MGRS100KMSquareZoneFactory({}),
            mgrs100KMSquareZone = mgrs100KMSquareZoneFactory.createMGRS100KMSquareZone({
                utmZone: utmZone, easting: 200000, northing: 0
            }),
            bounds = BoundingBox.withCoordinates(-180, 0, -90, 45),
            gridZones = mgrs100KMSquareZone.childZonesForBounds(bounds);

        expect(gridZones).toBeDefined();
        expect(gridZones.length).toBe(100);

    });

    it ("can calculate the geometry of a 10KM Grid Zone", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            mgrs100KMSquareZoneFactory = new MGRS100KMSquareZoneFactory({}),
            mgrs100KMSquareZone = mgrs100KMSquareZoneFactory.createMGRS100KMSquareZone({
                utmZone: utmZone, easting: 200000, northing: 100000
            }),
            mgrs10KMSquareZone = new MGRS10KMSquareZone().init({
                parent: mgrs100KMSquareZone, easting: 10000, northing: 10000
            });

        expect(mgrs10KMSquareZone).toBeDefined();
        expect(mgrs10KMSquareZone.parent).toBe(mgrs100KMSquareZone);
        expect(mgrs10KMSquareZone.id).toBe("1NBB1000010000");
        expect(mgrs10KMSquareZone.easting).toBe(10000);
        expect(mgrs10KMSquareZone.northing).toBe(10000);
        expect(mgrs10KMSquareZone.clippedCoordinates).toBeDefined();
        expect(mgrs10KMSquareZone.geometry).toBeDefined();
        expect(mgrs10KMSquareZone.geometry.type).toBe("Polygon");

    });


    it ("can calculate the 10KM Grid Zone's 1KM GridZones for a given bounds in an UTM Zone", function () {

        var utmZone = new UTMZone().init({
                number: 1, isNorth: true
            }),
            mgrs100KMSquareZoneFactory = new MGRS100KMSquareZoneFactory({}),
            mgrs100KMSquareZone = mgrs100KMSquareZoneFactory.createMGRS100KMSquareZone({
                utmZone: utmZone, easting: 200000, northing: 0
            }),
            bounds = BoundingBox.withCoordinates(-180, 0, -90, 45),
            gridZones = mgrs100KMSquareZone.childZonesForBounds(bounds),
            gridZone = gridZones[1],
            oneKMSquareZones = gridZone.childZonesForBounds(bounds),
            oneKMSquareZone;

        expect(oneKMSquareZones).toBeDefined();
        expect(oneKMSquareZones.length).toBe(100);

        oneKMSquareZone = oneKMSquareZones[11];
        expect(oneKMSquareZone).toBeDefined();
        expect(oneKMSquareZone.id).toBe("1NBA1100001000");
        expect(oneKMSquareZone.easting).toBe(1000);
        expect(oneKMSquareZone.northing).toBe(1000);
        expect(oneKMSquareZone.parent).toBe(gridZone);
        expect(oneKMSquareZone.geometry).toBeDefined();
        expect(oneKMSquareZone.clippedCoordinates).toBeDefined();

    });


});