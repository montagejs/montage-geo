var Montage = require("montage/core/core").Montage;

/**
 * A geometry collection represents a collection of geometries
 * @class
 * @extends external:Montage
 */
var GeometryCollection = exports.GeometryCollection = Montage.specialize(/** @lends GeometryCollection.prototype */ {

    geometries: {
        get: function () {
            if (!this._geometries) {
                this._geometries = [];
            }
            return this._geometries;
        }
    },

    intersects: {
        value: function (bounds) {
            return this.geometries.some(function (childGeometry) {
                return childGeometry.intersects(bounds);
            });
        }
    },

    bounds: {
        value: function () {
            return this.geometries.reduce(function (aggregator, geometry) {
                if (aggregator) {
                    aggregator.extend(geometry.bounds());
                } else {
                    aggregator = geometry.bounds();
                }
                return aggregator;
            }, null);
        }
    },

    /**
     * Tests whether this geometry collection's geometries are equal to the
     * provided one.  The collection's are considered equal if the two coll-
     * ections have the same number of children and each child is equal to the
     * provide collection's child at the same position.
     * @return {boolean}
     */
    equals: {
        // TODO: Write spec
        value: function (other) {
            var isThis = other instanceof GeometryCollection,
                a = this.geometries,
                b = other.geometries;
            return isThis && a.length === b.length && this._compare(a, b);
        }
    },

    clone: {
        value: function () {
            return GeometryCollection.withGeometries(
                this.geometries.map(function (geometry) {
                    return geometry.clone();
                })
            );
        }
    },

    _compare: {
        value: function (a, b) {
            var isEqual = true, i, n;
            for (i = 0, n = a.length; i < n && isEqual; i += 1) {
                isEqual = a[i].equals(b[i]);
            }
            return isEqual;
        }
    },
    forEach: {
        value: function (callback /*, thisp*/) {

            var thisp = arguments[1]
            geometries = this.geometries;

            for(var i=0, countI = geometries.length;(i < countI); i++) {
                geometries[i].forEach(callback,thisp);
            }
        }
    }


}, {/** @lends GeometryCollection.prototype */

    withGeometries: {
        value: function (geometries) {
            var self = new this();
            self._geometries = geometries.slice();
            return self;
        }
    }

});
