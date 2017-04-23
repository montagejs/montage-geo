var Montage = require("montage/core/core").Montage,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Position = require("./position").Position,
    HALF_PI = Math.PI / 180.0;

/**
 *
 * A Geometry object represents points, curves, and surfaces in
 * coordinate space.
 *
 * @class
 * @extends external:Montage
 */
exports.Geometry = Montage.specialize(/** @lends Geometry.prototype */ {

    constructor: {
        value: function Geometry() {
            this.addPathChangeListener("coordinates", this, "coordinatesDidChange");
        }
    },

    bounds: {
        get: function () {
            if (!this._bounds) {
                this._bounds = BoundingBox.withCoordinates(Infinity, Infinity, -Infinity, -Infinity);
            }
            return this._bounds;
        }
    },

    /**
     * The bbox property is an alias to this.bounds.bbox
     * @type {array<number>}
     */
    bbox: {
        get: function () {
            return this.bounds.bbox;
        }
    },

    /**
     * The points, curves and surfaces that describe this geometry.
     * @type {Position|array<Position>|array<array<Position>>}
     */
    coordinates: {
        value: undefined
    },

    /**
     * Returns all the positions of this geometry.  Subclasses should
     * override this method to implement their strategy for returning
     * their positions.  This property is not observable.
     *
     * @returns {array<Position>|undefined}
     */
    positions: {
        get: function () {
            return undefined;
        }
    },

    /**
     * This method is called when the geometry's coordinates
     * change.  Subclasses should overridet this method to
     * provide their handling of coordinates changing i.e.
     * updating their bbox.
     *
     * @method
     */
    coordinatesDidChange: {
        value: function () {}
    },

    handleRangeChange: {
        value: function (plus, minus) {
            var bounds = this.bounds;
            if (minus.some(bounds.isOnBoundary.bind(bounds))) {
                bounds.setWithPositions(this.positions);
            } else {
                plus.forEach(bounds.extend.bind(bounds));
            }
        }
    }

}, {

    /**
     * Converts a value in degrees to radians
     * @method
     * @param {number} degrees
     * @returns {number} radians
     */
    toRadians: {
        value: function (degrees) {
            return degrees * HALF_PI;
        }
    },

    /**
     * Converts a value in radians to degrees
     * @method
     * @param {number} radians
     * @returns {number} degrees
     */
    toDegrees: {
        value: function (radians) {
            return radians * 57.29577951308233; // 180 divided by PI;
        }
    },

    /**
     * Returns a newly initialized geometry with the specified coordinates.
     * The default implementation returns null.  Subclasses should override
     * this method to provide their initialization logic.
     *
     * @method
     * @param {array} coordinates       - The coordinates of this geometry.
     * @return null
     */
    withCoordinates: {
        value: function (coordinates) {
            return null;
        }
    }

});
