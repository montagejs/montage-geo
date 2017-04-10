var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose coordinates member is a single position.
 *
 * @class
 * @extends external:Geometry
 */
exports.Point = Geometry.specialize(/** @lends Point.prototype */ {

    /**
     * @type {Position}
     */
    coordinates: {
        value: undefined
    }

}, {

    /**
     * Returns a newly initialized point with the specified coordinates.
     *
     * @param {array<number>} coordinates - The position of this point.
     */
    withCoordinates: {
        value: function (coordinates) {
            var self = new this();
            self.coordinates = Position.withCoordinates(coordinates);
            return self;
        }
    }

});
