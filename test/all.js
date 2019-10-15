module.exports = require("montage-testing").run(require, [
    "spec/bounding-box",
    "spec/circle",
    "spec/esri-json-to-geometry-converter",
    "spec/feature",
    "spec/feature-collection",
    "spec/geohash",
    "spec/geohash-collection",
    "spec/geo-json-to-geometry-converter",
    "spec/geometry",
    "spec/geometry-collection",
    "spec/icon",
    "spec/line-string",
    "spec/multi-line-string",
    "spec/multi-point",
    "spec/multi-polygon",
    "spec/point",
    "spec/point-2d",
    "spec/polygon",
    "spec/position",
    "spec/rect",
    "spec/size",
    "spec/style",
    "spec/topojson-to-geometry-converter"
]).then(function () {
    console.log('montage-testing', 'End');
}, function (err) {
    console.log('montage-testing', 'Fail', err, err.stack);
});
