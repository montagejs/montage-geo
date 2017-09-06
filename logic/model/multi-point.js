var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose coordinates property is an array of positions.
 *
 * @class
 * @extends external:Geometry
 */
var MultiPoint = exports.MultiPoint = Geometry.specialize(/** @lends MultiPoint.prototype */ {

    /**
     * @override
     * @returns array<Position>
     */
    positions: {
        get: function () {
            return this.coordinates;
        }
    },

    /**
     * The "coordinates" member is an array of positions.
     * @type {array<Position>
     */
    coordinates: {
        value: undefined
    },

    intersects: {
        value: function (bounds) {
            return  this.bounds.intersects(bounds) &&
                    this.positions.some(function (position) {
                        return bounds.contains(position);
                    });
        }
    },

    toGeoJSON: {
        value: function () {
            return {
                type: "MultiPoint",
                coordinates: this.coordinates.map(function (position) {
                    return [position.longitude, position.latitude];
                })
            }
        }
    },

    /**
     * Tests whether this Multi-Point's coordinates equals the provided one.
     * For the two coordinates properties to be considered they must contain
     * the same number of positions, in the same order and with the exact
     * same values.
     *
     * @param {MultiPoint} other - the multi-point to test for equality.
     * @return {boolean}
     */
    equals: {
        value: function (other) {
            var isThis = other instanceof MultiPoint,
                a = isThis && this.coordinates,
                b = isThis && other.coordinates;
            return isThis && a.length === b.length && this._compare(a, b);
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
    }

}, {

    /**
     * Returns a newly initialized multi-point with the specified coordinates.
     *
     * @param {array<array<number>>} coordinates - The positions of this geometry.
     */
    withCoordinates: {
        value: function (coordinates) {
            var self = new this();
            self.coordinates = coordinates.map(function (coordinate) {
                return Position.withCoordinates(coordinate[0], coordinate[1]);
            });
            return self;
        }
    }

});
