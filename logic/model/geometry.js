var Montage = require("montage/core/core").Montage,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
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
     * change.
     *
     * @method
     */
    coordinatesDidChange: {
        value: function () {
            if (this._rangeChangeCanceler) {
                this._rangeChangeCanceler();
            }
            if (this.coordinates) {
                this._rangeChangeCanceler = this.coordinates.addRangeChangeListener(this);
            }
            this.bounds.setWithPositions(this.positions);
        }
    },

    /**
     * This method is called when the positions are added or removed
     * from the geometry's coordinates.
     *
     * Subclasses may choose to override this method.
     *
     * @method
     */
    handleRangeChange: {
        value: function (plus, minus) {
            var bounds = this.bounds;
            if (minus.some(bounds.isPositionOnBoundary.bind(bounds))) {
                bounds.setWithPositions(this.positions);
            } else {
                plus.forEach(bounds.extend.bind(bounds));
            }
        }
    },


    /**
     * This method is called when the positions are added or removed
     * from the geometry's coordinates.
     *
     * Subclasses may choose to override this method.
     *
     * @method
     * @param {Geometry|Bounds}
     * @returns boolean
     */
    intersects: {
        value: function (geometry) {}
    },

    _rangeChangeCanceler: {
        value: undefined
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
