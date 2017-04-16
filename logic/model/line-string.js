var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose "coordinates" member is an array of two or more positions.
 *
 * @class
 * @extends external:Geometry
 */
exports.LineString = Geometry.specialize(/** @lends LineString.prototype */ {

    /**
     * @type {Array<Position>}
     */
    coordinates: {
        value: undefined
    }

}, {

    /**
     * Returns a newly initialized LineString with the specified coordinates.
     *
     * @param {array<array<number>>} coordinates - The position of this point.
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
