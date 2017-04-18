var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose coordinates member is an array of positions.
 *
 * @class
 * @extends external:Geometry
 */
exports.MultiPoint = Geometry.specialize(/** @lends MultiPoint.prototype */ {

    /**
     * @type {array<Position>}
     */
    coordinates: {
        value: undefined
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
                return Position.withCoordinates(coordinate);
            });
            return self;
        }
    }

});
