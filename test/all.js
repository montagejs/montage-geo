console.log('montage-testing', 'Start');
module.exports = require("montage-testing").run(require, [
    "spec/feature",
    "spec/feature-collection",
    "spec/geometry",
    "spec/point",
    "spec/position"

]).then(function () {
    console.log('montage-testing', 'End');
}, function (err) {
    console.log('montage-testing', 'Fail', err, err.stack);
});
