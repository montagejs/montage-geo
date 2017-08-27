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

}, {/** @lends GeometryCollection.prototype */

    withGeometries: {
        value: function (geometries) {
            var self = new this();
            self._geometries = geometries;
            return self;
        }
    }

});
