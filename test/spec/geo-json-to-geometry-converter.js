var converter = require("montage-geo/logic/converter/geo-json-to-geometry-converter").GeoJsonToGeometryConverter,
    Projection = require("montage-geo/logic/model/projection").Projection;

describe("GeoJsonToGeometryConverter", function () {

    it ("can convert a GeoJson Point to Point", function () {
        var converter = new converter(),
            point = converter.convert({
                type: "Point",
                coordinates: [-156.6825, 20.8783]
            });
        expect(point).toBeDefined();
        expect(point.coordinates.latitude).toBe(20.8783);
        expect(point.coordinates.longitude).toBe(-156.6825);
    });

});
