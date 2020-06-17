var Projection = require("montage-geo/logic/model/projection").Projection,
    Position = require("montage-geo/logic/model/position").Position,
    Point = require("montage-geo/logic/model/point").Point,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    Polygon = require("montage-geo/logic/model/polygon").Polygon,
    MultiPoint = require("montage-geo/logic/model/multi-point").MultiPoint,
    MultiLineString = require("montage-geo/logic/model/multi-line-string").MultiLineString,
    MultiPolygon = require("montage-geo/logic/model/multi-polygon").MultiPolygon,
    GeometryCollection = require("montage-geo/logic/model/geometry-collection").GeometryCollection,
   WktToGeometryConverter = require("montage-geo/logic/converter/wkt-to-geometry-converter").WktToGeometryConverter;

describe('WktToGeometryConverter', function () {
  var converter = new WktToGeometryConverter();

  it('Point PostGIS EWKT read / WKT written correctly', function () {
    var wkt = 'SRID=4326;POINT(30 10)';
    var geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);

    wkt = 'SRID=4326;POINT(30 10)';
    converter.revertsSRID = true;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'SRID=4326;POINT (30 10)';
    geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);

  });

  it('Point Z PostGIS EWKT read / WKT written correctly', function () {
    var wkt = 'SRID=4326;POINT(30 10 5)';
    var geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);

    wkt = 'SRID=4326;POINT Z(30 10 5)';
    converter.revertsSRID = true;
    expect(converter.revert(geom)).toBe(wkt);

    // test whitespace when reading
    wkt = 'SRID=4326;POINT Z (30 10 5)';
    geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);

  });

  it('Point M PostGIS EWKT read / WKT written correctly', function () {
    var wkt = 'SRID=4326;POINTM(30 10 5)';
    var geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.measure).toBe(5);

    wkt = 'SRID=4326;POINT M(30 10 5)';
    converter.revertsSRID = true;
    expect(converter.revert(geom)).toBe(wkt);

    // test whitespace when reading
    wkt = 'SRID=4326;POINT M (30 10 5)';
    geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.measure).toBe(5);
  });

  it('Point ZM PostGIS EWKT read / WKT written correctly', function () {
    var wkt = 'SRID=4326;POINT(30 10 5 0.1)';
    var geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);
    expect(geom.coordinates.measure).toBe(0.1);

    converter.revertsSRID = true;
    wkt = 'SRID=4326;POINT ZM(30 10 5 0.1)';
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);
    expect(geom.coordinates.measure).toBe(0.1);
  });

  it('Point read / written correctly', function () {
    var wkt = 'POINT(30 10)';
    var geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POINT (30 10)';
    geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);

  });

  it('Point Z read / written correctly', function () {
    var wkt = 'POINT Z(30 10 5)';
    var geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POINT Z (30 10 5)';
    geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);

  });

  it('Point M read / written correctly', function () {
    var wkt = 'POINT M(30 10 5)';
    var geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.measure).toBe(5);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POINT M (30 10 5)';
    geom = converter.convert(wkt);
    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.measure).toBe(5);
  });

  it('Point ZM read / written correctly', function () {
    var wkt = 'POINT ZM(30 10 5 0.1)';
    var geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);
    expect(geom.coordinates.measure).toBe(0.1);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POINT ZM (30 10 5 0.1)';
    geom = converter.convert(wkt);

    expect(geom instanceof Point).toBe(true);
    expect(geom.coordinates.longitude).toBe(30);
    expect(geom.coordinates.latitude).toBe(10);
    expect(geom.coordinates.altitude).toBe(5);
    expect(geom.coordinates.measure).toBe(0.1);
  });

  it('MultiPoint read / written correctly', function () {
    // there are two forms to test
    var wkt = 'MULTIPOINT((10 40),(40 30),(20 20),(30 10))';
    var geom = converter.convert(wkt);
    var positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40]);
    expect(Array.from(positions[1])).toEqual([40, 30]);
    expect(Array.from(positions[2])).toEqual([20, 20]);
    expect(Array.from(positions[3])).toEqual([30, 10]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // this has whitespace
    wkt = 'MULTIPOINT (10 40, 40 30, 20 20, 30 10)';
    geom = converter.convert(wkt);
    positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40]);
    expect(Array.from(positions[1])).toEqual([40, 30]);
    expect(Array.from(positions[2])).toEqual([20, 20]);
    expect(Array.from(positions[3])).toEqual([30, 10]);
  });

  it('MultiPoint Z read / written correctly', function () {
    // there are two forms to test
    var wkt = 'MULTIPOINT Z((10 40 1),(40 30 2),(20 20 3),(30 10 4))';
    var geom = converter.convert(wkt);
    var positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40, 1]);
    expect(Array.from(positions[1])).toEqual([40, 30, 2]);
    expect(Array.from(positions[2])).toEqual([20, 20, 3]);
    expect(Array.from(positions[3])).toEqual([30, 10, 4]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // this has whitespace and no standardized parentheses
    wkt = 'MULTIPOINT Z (10 40 1, 40 30 2, 20 20 3, 30 10 4)';
    geom = converter.convert(wkt);
    positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40, 1]);
    expect(Array.from(positions[1])).toEqual([40, 30, 2]);
    expect(Array.from(positions[2])).toEqual([20, 20, 3]);
    expect(Array.from(positions[3])).toEqual([30, 10, 4]);
  });

  it('MultiPoint M read / written correctly', function () {
    // there are two forms to test
    var wkt = 'MULTIPOINT M((10 40 1),(40 30 2),(20 20 3),(30 10 4))';
    var geom = converter.convert(wkt);
    var positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40, 1]);
    expect(Array.from(positions[1])).toEqual([40, 30, 2]);
    expect(Array.from(positions[2])).toEqual([20, 20, 3]);
    expect(Array.from(positions[3])).toEqual([30, 10, 4]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // this has whitespace and no standardized parentheses
    wkt = 'MULTIPOINT M (10 40 1, 40 30 2, 20 20 3, 30 10 4)';
    geom = converter.convert(wkt);
    positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40, 1]);
    expect(Array.from(positions[1])).toEqual([40, 30, 2]);
    expect(Array.from(positions[2])).toEqual([20, 20, 3]);
    expect(Array.from(positions[3])).toEqual([30, 10, 4]);
  });

  it('MultiPoint ZM read / written correctly', function () {
    // there are two forms to test
    var wkt =
      'MULTIPOINT ZM((10 40 1 0.1),(40 30 2 0.1),(20 20 3 0.1),(30 10 4 0.1))';
    var geom = converter.convert(wkt);
    var positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40, 1, 0.1]);
    expect(Array.from(positions[1])).toEqual([40, 30, 2, 0.1]);
    expect(Array.from(positions[2])).toEqual([20, 20, 3, 0.1]);
    expect(Array.from(positions[3])).toEqual([30, 10, 4, 0.1]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // this has whitespace and no standardized parentheses
    wkt = 'MULTIPOINT ZM (10 40 1 0.1,40 30 2 0.1,20 20 3 0.1,30 10 4 0.1)';
    geom = converter.convert(wkt);
    positions = geom.coordinates;
    expect(positions.length).toEqual(4);
    expect(Array.from(positions[0])).toEqual([10, 40, 1, 0.1]);
    expect(Array.from(positions[1])).toEqual([40, 30, 2, 0.1]);
    expect(Array.from(positions[2])).toEqual([20, 20, 3, 0.1]);
    expect(Array.from(positions[3])).toEqual([30, 10, 4, 0.1]);
  });

  it('LineString read / written correctly', function () {
    var wkt = 'LINESTRING(30 10,10 30,40 40)';
    var geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);

    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10],
      [10, 30],
      [40, 40],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt = 'LINESTRING (30 10, 10 30, 40 40)';
    geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10],
      [10, 30],
      [40, 40],
    ]);
  });

  it('LineString Z read / written correctly', function () {
    var wkt = 'LINESTRING Z(30 10 1,10 30 2,40 40 3)';
    var geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 30, 2],
      [40, 40, 3],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt = 'LINESTRING Z (30 10 1, 10 30 2, 40 40 3)';
    geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 30, 2],
      [40, 40, 3],
    ]);
  });

  it('LineString M read / written correctly', function () {
    var wkt = 'LINESTRING M(30 10 1,10 30 2,40 40 3)';
    var geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 30, 2],
      [40, 40, 3],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt = 'LINESTRING M (30 10 1, 10 30 2, 40 40 3)';
    geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 30, 2],
      [40, 40, 3],
    ]);
  });

  it('LineString ZM read / written correctly', function () {
    var wkt = 'LINESTRING ZM(30 10 1 0.1,10 30 2 0.1,40 40 3 0.1)';
    var geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1, 0.1],
      [10, 30, 2, 0.1],
      [40, 40, 3, 0.1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt = 'LINESTRING ZM (30 10 1 0.1, 10 30 2 0.1, 40 40 3 0.1)';
    geom = converter.convert(wkt);
    expect(geom instanceof LineString).toBe(true);
    expect(geom.coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1, 0.1],
      [10, 30, 2, 0.1],
      [40, 40, 3, 0.1],
    ]);
  });

  it('MultiLineString read / written correctly', function () {
    var wkt =
      'MULTILINESTRING((10 10,20 20,10 40),' + '(40 40,30 30,40 20,30 10))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);

    var linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10],
      [20, 20],
      [10, 40],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt =
      'MULTILINESTRING ( (10 10, 20 20, 10 40), ' +
      '(40 40, 30 30, 40 20, 30 10) )';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(Array.from(linestrings[0])).toEqual([10, 10, 20, 20, 10, 40]);
  });

  it('MultiLineString Z read / written correctly', function () {
    var wkt =
      'MULTILINESTRING Z((10 10 1,20 20 2,10 40 3),' +
      '(40 40 1,30 30 2,40 20 3,30 10 4))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    var linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10, 1],
      [20, 20, 2],
      [10, 40, 3],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt =
      'MULTILINESTRING Z ( (10 10 1, 20 20 2, 10 40 3), ' +
      '(40 40 1, 30 30 2, 40 20 3, 30 10 4) )';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10, 1],
      [20, 20, 2],
      [10, 40, 3],
    ]);
  });

  it('MultiLineString M read / written correctly', function () {
    var wkt =
      'MULTILINESTRING M((10 10 1,20 20 2,10 40 3),' +
      '(40 40 1,30 30 2,40 20 3,30 10 4))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    var linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10, 1],
      [20, 20, 2],
      [10, 40, 3],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt =
      'MULTILINESTRING M ( (10 10 1, 20 20 2, 10 40 3), ' +
      '(40 40 1, 30 30 2, 40 20 3, 30 10 4) )';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10, 1],
      [20, 20, 2],
      [10, 40, 3],
    ]);
  });

  it('MultiLineString ZM read / written correctly', function () {
    var wkt =
      'MULTILINESTRING ZM((10 10 1 0.1,20 20 2 0.1,10 40 3 0.1),' +
      '(40 40 1 0.1,30 30 2 0.1,40 20 3 0.1,30 10 4 0.1))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    var linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10, 1, 0.1],
      [20, 20, 2, 0.1],
      [10, 40, 3, 0.1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt =
      'MULTILINESTRING ZM ( (10 10 1 0.1, 20 20 2 0.1, 10 40 3 0.1), ' +
      '(40 40 1 0.1, 30 30 2 0.1, 40 20 3 0.1, 30 10 4 0.1) )';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiLineString).toBe(true);
    linestrings = geom.coordinates;
    expect(linestrings.length).toEqual(2);
    expect(linestrings[0] instanceof LineString).toBe(true);
    expect(linestrings[0].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [10, 10, 1, 0.1],
      [20, 20, 2, 0.1],
      [10, 40, 3, 0.1],
    ]);
  });

  it('Polygon read / written correctly', function () {
    var wkt = 'POLYGON((30 10,10 20,20 40,40 40,30 10))';
    var geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    var rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);

    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10],
      [10, 20],
      [20, 40],
      [40, 40],
      [30, 10],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // note that WKT doesn't care about winding order, we do
    wkt = 'POLYGON((35 10,10 20,15 40,45 45,35 10),(20 30,30 20,35 35,20 30))';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(2);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[1][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [35, 10],
      [10, 20],
      [15, 40],
      [45, 45],
      [35, 10],
    ]);
    expect(rings[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 30],
      [30, 20],
      [35, 35],
      [20, 30],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POLYGON ( (30 10, 10 20, 20 40, 40 40, 30 10) )';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10],
      [10, 20],
      [20, 40],
      [40, 40],
      [30, 10],
    ]);
  });

  it('Polygon Z read / written correctly', function () {
    var wkt = 'POLYGON Z((30 10 1,10 20 2,20 40 3,40 40 4,30 10 1))';
    var geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    var rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 20, 2],
      [20, 40, 3],
      [40, 40, 4],
      [30, 10, 1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // note that WKT doesn't care about winding order, we do
    wkt =
      'POLYGON Z((35 10 1,10 20 2,15 40 3,45 45 4,35 10 1),(20 30 1,30 20 2,35 35 3,20 30 1))';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(2);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[1][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [35, 10, 1],
      [10, 20, 2],
      [15, 40, 3],
      [45, 45, 4],
      [35, 10, 1],
    ]);
    expect(rings[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 30, 1],
      [30, 20, 2],
      [35, 35, 3],
      [20, 30, 1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POLYGON  Z ( (30 10 1, 10 20 2, 20 40 3, 40 40 4, 30 10 1) )';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 20, 2],
      [20, 40, 3],
      [40, 40, 4],
      [30, 10, 1],
    ]);
  });

  it('Polygon M read / written correctly', function () {
    var wkt = 'POLYGON M((30 10 1,10 20 2,20 40 3,40 40 4,30 10 1))';
    var geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    var rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 20, 2],
      [20, 40, 3],
      [40, 40, 4],
      [30, 10, 1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // note that WKT doesn't care about winding order, we do
    wkt =
      'POLYGON M((35 10 1,10 20 2,15 40 3,45 45 4,35 10 1),(20 30 1,30 20 2,35 35 3,20 30 1))';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(2);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[1][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [35, 10, 1],
      [10, 20, 2],
      [15, 40, 3],
      [45, 45, 4],
      [35, 10, 1],
    ]);
    expect(rings[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 30, 1],
      [30, 20, 2],
      [35, 35, 3],
      [20, 30, 1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt = 'POLYGON  M ( (30 10 1, 10 20 2, 20 40 3, 40 40 4, 30 10 1) )';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1],
      [10, 20, 2],
      [20, 40, 3],
      [40, 40, 4],
      [30, 10, 1],
    ]);
  });

  it('Polygon ZM read / written correctly', function () {
    var wkt =
      'POLYGON ZM((30 10 1 0.1,10 20 2 0.1,20 40 3 0.1,40 40 4 0.1,30 10 1 0.1))';
    var geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    var rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1, 0.1],
      [10, 20, 2, 0.1],
      [20, 40, 3, 0.1],
      [40, 40, 4, 0.1],
      [30, 10, 1, 0.1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // note that WKT doesn't care about winding order, we do
    wkt =
      'POLYGON ZM((35 10 1 0.1,10 20 2 0.1,15 40 3 0.1,45 45 4 0.1,35 10 1 0.1),(20 30 1 0.1,30 20 2 0.1,35 35 3 0.1,20 30 1 0.1))';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(2);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[1][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [35, 10, 1, 0.1],
      [10, 20, 2, 0.1],
      [15, 40, 3, 0.1],
      [45, 45, 4, 0.1],
      [35, 10, 1, 0.1],
    ]);
    expect(rings[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 30, 1, 0.1],
      [30, 20, 2, 0.1],
      [35, 35, 3, 0.1],
      [20, 30, 1, 0.1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt =
      'POLYGON  ZM ( (30 10 1 0.1, 10 20 2 0.1, 20 40 3 0.1, 40 40 4 0.1, 30 10 1 0.1) )';
    geom = converter.convert(wkt);
    expect(geom instanceof Polygon).toBe(true);
    rings = geom.coordinates;
    expect(rings.length).toEqual(1);
    expect(rings[0][0] instanceof Position).toBe(true);
    expect(rings[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 10, 1, 0.1],
      [10, 20, 2, 0.1],
      [20, 40, 3, 0.1],
      [40, 40, 4, 0.1],
      [30, 10, 1, 0.1],
    ]);
  });

  it('MultiPolygon read / written correctly', function () {
    // note that WKT doesn't care about winding order, we do
    var wkt =
      'MULTIPOLYGON(((40 40,45 30,20 45,40 40)),' +
      '((20 35,45 20,30 5,10 10,10 30,20 35),(30 20,20 25,20 15,30 20)))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    var polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);

    expect(polygons[0].coordinates[0][0] instanceof Position).toBe(true);

    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40],
      [45, 30],
      [20, 45],
      [40, 40],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35],
      [45, 20],
      [30, 5],
      [10, 10],
      [10, 30],
      [20, 35],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20],
      [20, 25],
      [20, 15],
      [30, 20],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt =
      'MULTIPOLYGON( ( ( 40 40,45 30, 20 45 ,40 40 )) ,' +
      '( (20 35, 45 20,30 5,10 10,10 30,20 35), ' +
      '( 30 20,  20 25,20 15  ,30 20 ) ))';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40],
      [45, 30],
      [20, 45],
      [40, 40],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35],
      [45, 20],
      [30, 5],
      [10, 10],
      [10, 30],
      [20, 35],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20],
      [20, 25],
      [20, 15],
      [30, 20],
    ]);
  });

  it('MultiPolygon Z read / written correctly', function () {
    // note that WKT doesn't care about winding order, we do
    var wkt =
      'MULTIPOLYGON Z(((40 40 1,45 30 2,20 45 3,40 40 1)),' +
      '((20 35 1,45 20 2,30 5 3,10 10 4,10 30 5,20 35 1),(30 20 1,20 25 2,20 15 3,30 20 1)))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    var polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40, 1],
      [45, 30, 2],
      [20, 45, 3],
      [40, 40, 1],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35, 1],
      [45, 20, 2],
      [30, 5, 3],
      [10, 10, 4],
      [10, 30, 5],
      [20, 35, 1],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20, 1],
      [20, 25, 2],
      [20, 15, 3],
      [30, 20, 1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt =
      'MULTIPOLYGON Z ( ( ( 40 40 1,45 30 2, 20 45 3 ,40 40 1 )) ,' +
      '( (20 35 1, 45 20 2,30 5 3,10 10 4,10 30 5,20 35 1), ' +
      '( 30 20 1,  20 25 2,20 15 3  ,30 20 1 ) ))';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40, 1],
      [45, 30, 2],
      [20, 45, 3],
      [40, 40, 1],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35, 1],
      [45, 20, 2],
      [30, 5, 3],
      [10, 10, 4],
      [10, 30, 5],
      [20, 35, 1],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20, 1],
      [20, 25, 2],
      [20, 15, 3],
      [30, 20, 1],
    ]);
  });

  it('MultiPolygon M read / written correctly', function () {
    // note that WKT doesn't care about winding order, we do
    var wkt =
      'MULTIPOLYGON M(((40 40 1,45 30 2,20 45 3,40 40 1)),' +
      '((20 35 1,45 20 2,30 5 3,10 10 4,10 30 5,20 35 1),(30 20 1,20 25 2,20 15 3,30 20 1)))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    var polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40, 1],
      [45, 30, 2],
      [20, 45, 3],
      [40, 40, 1],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35, 1],
      [45, 20, 2],
      [30, 5, 3],
      [10, 10, 4],
      [10, 30, 5],
      [20, 35, 1],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20, 1],
      [20, 25, 2],
      [20, 15, 3],
      [30, 20, 1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt =
      'MULTIPOLYGON M ( ( ( 40 40 1,45 30 2, 20 45 3 ,40 40 1 )) ,' +
      '( (20 35 1, 45 20 2,30 5 3,10 10 4,10 30 5,20 35 1), ' +
      '( 30 20 1,  20 25 2,20 15 3  ,30 20 1 ) ))';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40, 1],
      [45, 30, 2],
      [20, 45, 3],
      [40, 40, 1],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35, 1],
      [45, 20, 2],
      [30, 5, 3],
      [10, 10, 4],
      [10, 30, 5],
      [20, 35, 1],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20, 1],
      [20, 25, 2],
      [20, 15, 3],
      [30, 20, 1],
    ]);
  });

  it('MultiPolygon ZM read / written correctly', function () {
    // note that WKT doesn't care about winding order, we do
    var wkt =
      'MULTIPOLYGON ZM(((40 40 1 0.1,45 30 2 0.1,20 45 3 0.1,40 40 1 0.1)),' +
      '((20 35 1 0.1,45 20 2 0.1,30 5 3 0.1,10 10 4 0.1,10 30 5 0.1,20 35 1 0.1),(30 20 1 0.1,20 25 2 0.1,20 15 3 0.1,30 20 1 0.1)))';
    var geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    var polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40, 1, 0.1],
      [45, 30, 2, 0.1],
      [20, 45, 3, 0.1],
      [40, 40, 1, 0.1],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35, 1, 0.1],
      [45, 20, 2, 0.1],
      [30, 5, 3, 0.1],
      [10, 10, 4, 0.1],
      [10, 30, 5, 0.1],
      [20, 35, 1, 0.1],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20, 1, 0.1],
      [20, 25, 2, 0.1],
      [20, 15, 3, 0.1],
      [30, 20, 1, 0.1],
    ]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);

    // test whitespace when reading
    wkt =
      'MULTIPOLYGON ZM ( ( ( 40 40 1 0.1,45 30 2 0.1, 20 45 3 0.1 ,40 40 1  0.1 )) ,' +
      '( (20 35 1 0.1, 45 20 2 0.1,30 5 3 0.1,10 10 4 0.1,10 30 5 0.1,20 35 1 0.1), ' +
      '( 30 20 1 0.1,  20 25 2 0.1,20 15 3 0.1  ,30 20 1 0.1 ) ))';
    geom = converter.convert(wkt);
    expect(geom instanceof MultiPolygon).toBe(true);
    polygons = geom.coordinates;
    expect(polygons.length).toEqual(2);
    expect(polygons[0] instanceof Polygon).toBe(true);
    expect(polygons[1] instanceof Polygon).toBe(true);
    expect(polygons[0].coordinates.length).toEqual(1);
    expect(polygons[1].coordinates.length).toEqual(2);
    expect(polygons[0].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [40, 40, 1, 0.1],
      [45, 30, 2, 0.1],
      [20, 45, 3, 0.1],
      [40, 40, 1, 0.1],
    ]);
    expect(polygons[1].coordinates[0].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [20, 35, 1, 0.1],
      [45, 20, 2, 0.1],
      [30, 5, 3, 0.1],
      [10, 10, 4, 0.1],
      [10, 30, 5, 0.1],
      [20, 35, 1, 0.1],
    ]);
    expect(polygons[1].coordinates[1].map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [30, 20, 1, 0.1],
      [20, 25, 2, 0.1],
      [20, 15, 3, 0.1],
      [30, 20, 1, 0.1],
    ]);
  });

  it('Empty geometries read / written correctly', function () {
    var wkt = 'POINT EMPTY';
    var geom = converter.convert(wkt);
    var position = geom.coordinates;
    expect(isNaN(position.longitude)).toBe(true);
    expect(isNaN(position.latitude)).toBe(true);
    var wkts = [
      'LINESTRING',
      'POLYGON',
      'MULTIPOINT',
      'MULTILINESTRING',
      'MULTIPOLYGON',
    ];

    converter.revertsSRID = false;
    for (var i = 0, ii = wkts.length; i < ii; ++i) {
      var wkt = wkts[i] + ' EMPTY';
      var geom = converter.convert(wkt);
      expect(geom.coordinates).toEqual([]);
      expect(converter.revert(geom)).toEqual(wkt);
    }
  });

  it('Invalid geometries detected correctly', function () {
    expect(function () {
      converter.convert('POINT(1,2)');
    }).toThrow();
    expect(function () {
      converter.convert('LINESTRING(1 2,3 4');
    }).toThrow;
    expect(function () {
      converter.convert('POLYGON(1 2,3 4))');
    }).toThrow;
    expect(function () {
      converter.convert('POLGON((1 2,3 4))');
    }).toThrow;
    expect(function () {
      converter.convert('LINESTRING(1.2,3 4');
    }).toThrow;
    expect(function () {
      converter.convert('MULTIPOINT((1 2),3 4))');
    }).toThrow;
    expect(function () {
      converter.convert('MULTIPOLYGON((1 2,3 4))');
    }).toThrow;
    expect(function () {
      converter.convert('GEOMETRYCOLLECTION(1 2,3 4)');
    }).toThrow;
  });

  it('GeometryCollection read / written correctly', function () {
    var wkt = 'GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))';
    var geom = converter.convert(wkt);
    var geoms = geom.geometries;
    expect(geoms.length).toEqual(2);
    expect(geom instanceof GeometryCollection).toBe(true);

    expect(geoms[0] instanceof Point).toBe(true);
    expect(geoms[1] instanceof LineString).toBe(true);
    expect(Array.from(geoms[0].coordinates)).toEqual([4, 6]);
    expect(geoms[1].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [4, 6],
      [7, 10],
    ]);
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt = 'GEOMETRYCOLLECTION ( POINT (4 6), LINESTRING (4 6, 7 10) )';
    geom = converter.convert(wkt);
    geoms = geom.geometries;
    expect(geoms.length).toEqual(2);
    expect(geom instanceof GeometryCollection).toBe(true);
    expect(geoms[0] instanceof Point).toBe(true);
    expect(geoms[1] instanceof LineString).toBe(true);
    expect(Array.from(geoms[0].coordinates)).toEqual([4, 6]);
    expect(geoms[1].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [4, 6],
      [7, 10],
    ]);
  });
  it('GeometryCollection M PostGIS EWKTread / WKT written correctly', function () {
    var wkt = 'SRID=4326;GEOMETRYCOLLECTIONM(POINTM(4 6 8),LINESTRINGM(4 6 8,7 10 13))';
    var geom = converter.convert(wkt);
    var geoms = geom.geometries;
    expect(geoms.length).toEqual(2);
    expect(geom instanceof GeometryCollection).toBe(true);

    expect(geoms[0] instanceof Point).toBe(true);
    expect(geoms[1] instanceof LineString).toBe(true);
    expect(Array.from(geoms[0].coordinates)).toEqual([4, 6, 8]);
    expect(geoms[1].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [4, 6, 8],
      [7, 10, 13],
    ]);

    wkt = 'SRID=4326;GEOMETRYCOLLECTION M(POINT M(4 6 8),LINESTRING M(4 6 8,7 10 13))';
    converter.revertsSRID = true;
    expect(converter.revert(geom)).toEqual(wkt);
    // test whitespace when reading
    wkt = 'GEOMETRYCOLLECTION M ( POINTM (4 6 8), LINESTRINGM (4 6 8, 7 10 13) )';
    geom = converter.convert(wkt);
    geoms = geom.geometries;
    expect(geoms.length).toEqual(2);
    expect(geom instanceof GeometryCollection).toBe(true);
    expect(geoms[0] instanceof Point).toBe(true);
    expect(geoms[1] instanceof LineString).toBe(true);
    expect(Array.from(geoms[0].coordinates)).toEqual([4, 6, 8]);
    expect(geoms[1].coordinates.map(function(aPosition){
        return Array.from(aPosition)
    })).toEqual([
      [4, 6, 8],
      [7, 10, 13],
    ]);
  });


  it('Empty GeometryCollection read / written correctly', function () {
    var wkt = 'GEOMETRYCOLLECTION EMPTY';
    var geom = converter.convert(wkt);
    expect(geom.geometries).toEqual([]);

    converter.revertsSRID = false;
    expect(converter.revert(geom)).toEqual(wkt);
  });

  it('Point feature read / written correctly', function () {
    var wkt = 'POINT(30 10)';
    var feature = converter.convert(wkt);
    var geom = feature.coordinates;
    expect(Array.from(geom)).toEqual([30, 10]);
    expect(converter.revert(feature)).toEqual(wkt);
  });

  describe('scientific notation supported', function () {
    it('handles scientific notation correctly', function () {
      var wkt = 'POINT(3e1 1e1)';
      var geom = converter.convert(wkt);
      expect(Array.from(geom.coordinates)).toEqual([30, 10]);
      expect(converter.revert(geom)).toEqual('POINT(30 10)');
    });

    it('works with with negative exponent', function () {
      var wkt = 'POINT(3e-1 1e-1)';
      var geom = converter.convert(wkt);
      expect(Array.from(geom.coordinates)).toEqual([0.3, 0.1]);

      converter.revertsSRID = false;
      expect(converter.revert(geom)).toEqual('POINT(0.3 0.1)');
    });

    it('works with with explicitly positive exponent', function () {
      var wkt = 'POINT(3e+1 1e+1)';
      var geom = converter.convert(wkt);
      expect(Array.from(geom.coordinates)).toEqual([30, 10]);
      expect(converter.revert(geom)).toEqual('POINT(30 10)');
    });

    it('handles very small numbers in scientific notation', function () {
      // very small numbers keep the scientific notation, both when reading and
      // writing
      Position.precision = 10;

      var wkt = 'POINT(3e-9 1e-9)';
      var geom = converter.convert(wkt);
      expect(Array.from(geom.coordinates)).toEqual([3e-9, 1e-9]);
      expect(converter.revert(geom)).toEqual('POINT(3e-9 1e-9)');

      Position.precision = 5;

    });

    it('handles very big numbers in scientific notation', function () {
      // very big numbers keep the scientific notation, both when reading and
      // writing
      var wkt = 'POINT(3e25 1e25)';
      var geom = converter.convert(wkt);
      expect(Array.from(geom.coordinates)).toEqual([3e25, 1e25]);
      expect(converter.revert(geom)).toEqual('POINT(3e+25 1e+25)');
    });

    it('works case insensitively (e / E)', function () {
      var wkt = 'POINT(3E1 1E1)';
      var geom = converter.convert(wkt);
      expect(Array.from(geom.coordinates)).toEqual([30, 10]);
      expect(converter.revert(geom)).toEqual('POINT(30 10)');
    });

    it('detects invalid scientific notation', function () {
      expect(function () {
        // note the double 'e'
        converter.convert('POINT(3ee1 10)');
      }).toThrow();
    });
  });
});
