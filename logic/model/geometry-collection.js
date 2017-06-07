var Montage = require("montage/core/core").Montage;

/**
 * A geometry collection represents a collection of geometries
 * @class
 * @extends external:Montage
 */
exports.GeometryCollection = Montage.specialize(/** @lends GeometryCollection.prototype */ {

    geometries: {
        get: function () {
            if (!this._geometries) {
                this._geometries = [];
            }
            return this._geometries;
        }
    }

}, {});
