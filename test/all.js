console.log('montage-testing', 'Start');

module.exports = require("mod/testing").run(require, [
    "spec/wkt-to-geometry-converter",
    "spec/bounding-box",
    "spec/circle",
    "spec/cluster-organizer",
    "spec/esri-json-to-geometry-converter",
    {name: "spec/esri-symbol-to-style-converter", node: false},
    "spec/feature",
    "spec/feature-cluster",
    "spec/feature-collection",
    "spec/geohash",
    "spec/geohash-collection",
    "spec/geo-json-to-geometry-converter",
    "spec/geometry",
    "spec/geometry-collection",
    "spec/icon",
    {name: "spec/kml-geometry-to-geometry-converter", node: false},
    "spec/kml-style-to-style-converter",
    {name: "spec/leaflet-engine", node: false},
    "spec/line-string",
    "spec/mgrs-grid-zone",
    "spec/multi-line-string",
    "spec/multi-point",
    "spec/multi-polygon",
    "spec/point",
    "spec/point-2d",
    "spec/polygon",
    "spec/position",
    "spec/protocol",
    "spec/rect",
    "spec/renderer",
    "spec/size",
    "spec/style",
    "spec/topojson-to-geometry-converter"
]).then(function () {
    console.log('montage-testing', 'End');
}, function (err) {
    console.log('montage-testing', 'Fail', err, err.stack);
});
