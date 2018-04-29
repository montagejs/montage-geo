var Point = require("logic/model/point").Point;
/**
 *
 * A Cartesian Coordinate represents a point in a two dimensional coordinate system.
 *
 * @class
 * @extends Object
 */
exports.CartesianCoordinate = function () {};

exports.CartesianCoordinate.prototype = Object.create({}, /** @lends CartesianCoordinate.prototype */ {

    /**
     * The constructor function for all CartesianCoordinate
     * instances.
     *
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.CartesianCoordinate
    },

    /**
     * The cartesian coordinate's position on the X plane.
     * @public
     * @property
     * @type {number}
     */
    x: {
        configurable: true,
        writable: true,
        value: 0
    },

    /**
     * The cartesian coordinate's position on the X plane.
     * @public
     * @property
     * @type {number}
     */
    y: {
        configurable: true,
        writable: true,
        value: 0
    },

    /**
     * The bearing in degrees from this coordinate to the provided one.
     * @public
     * @method
     * @param {CartesianCoordinate} coordinate - the coordinate to calculate
     *                                           the bearing to.
     * @type {number} degrees.
     */
    bearing: {
        value: function (other) {
            var rise = this.y - other.y,
                run = this.x - other.x,
                factor = 180 / Math.PI,
                radians =   rise === 0 ? Math.PI :
                            run  === 0 ? Math.PI / 2 :
                            Math.atan(rise / run);

            return radians * factor
        }
    },

    /**
     * The distance from this coordinate to the provided one.
     * @public
     * @method
     * @param {CartesianCoordinate} coordinate - the coordinate to calculate
     *                                           the distance to.
     * @type {number} distance
     */
    distance: {
        value: function (other) {
            return Math.sqrt(Math.pow((this.x - other.x), 2) + Math.pow((this.y - other.y), 2));
        }
    },

    /**
     * Returns a new coordinate that is the sum of each coordinate's X and Y
     * pairs.
     * @public
     * @method
     * @param {CartesianCoordinate} coordinate - the coordinate to add to this.
     * @type {CartesianCoordinate} sum
     */
    add: {
        value: function (other) {
            var point = this.clone();
            point.x += other.x;
            point.y += other.y;
            return point;
        }
    },

    /**
     * Returns a new coordinate that is the average of each coordinate's X and Y
     * pairs.
     * @public
     * @method
     * @param {CartesianCoordinate} coordinate - the coordinate to average to
     *                                           this.
     * @type {CartesianCoordinate} mid-point
     */
    midPoint: {
        value: function (other) {
            var point = new exports.CartesianCoordinate();
            point.x = (this.x + other.x) / 2;
            point.y = (this.y + other.y) / 2;
            return point;
        }
    },

    /**
     * Calculates the square distance between this coordinate and the provided
     * one.
     *
     * @public
     * @method
     * @param {CartesianCoordinate}
     * @returns {number} - the square distance between the two points in pixels.
     */
    squareDistance: {
        value: function (other) {
            var distanceX = this.x - other.x,
                distanceY = this.y - other.y;
            return distanceX * distanceX + distanceY * distanceY;
        }
    },

    /**
     * Returns a new coordinate that is the difference of the two coordinates
     * X and Y pairs.
     * @public
     * @method
     * @param {CartesianCoordinate} coordinate - the coordinate to subtract
     *                                           from this.
     * @type {CartesianCoordinate} difference
     */
    subtract: {
        value: function (other) {
            var point = this.clone();
            point.x -= other.x;
            point.y -= other.y;
            return point;
        }
    },

    /**
     * Returns a new coordinate that multiplies the provided factor with each
     * of this coordinate's X and Y values.
     * @public
     * @method
     * @param {number} factor
     * @type {CartesianCoordinate} coordinate
     */
    multiply: {
        value: function (number){
            var point = this.clone();
            point.x *= number;
            point.y *= number;
            return point;
        }
    },

    /**
     * Returns a new coordinate at the same position as this one.
     * @public
     * @method
     * @type {CartesianCoordinate} coordinate
     */
    clone: {
        value: function () {
            return exports.CartesianCoordinate.withCoordinates(this.x, this.y);
        }
    },

    /**
     * Returns a new Point whose coordinates are projected
     * @public
     * @method
     * @param {number} zoom level
     * @type {Point} point
     */
    toPoint: {
        value: function (zoom) {
            var clip = exports.CartesianCoordinate.clip,
                mapSize = 256 << zoom,
                x = (clip(this.x, 0, mapSize - 1) / mapSize) - 0.5,
                y = 0.5 - (clip(this.y, 0, mapSize - 1) / mapSize),
                latitude = 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI,
                longitude = 360 * x;

            return Point.withCoordinates([longitude, latitude]);
        }
    }

});

Object.defineProperties(exports.CartesianCoordinate, /** @lends Point */ {

    /**
     * Returns a newly initialized cartesian point with the specified
     * coordinates.
     *
     * @param {number} x    - The coordinate on the X axis.
     * @param {number} y    - The coordinate on the Y axis.
     * @returns {CartesianCoordinate} point
     */
    withCoordinates: {
        value: function (x, y) {
            var self = new exports.CartesianCoordinate();
            self.x = x;
            self.y = y;
            return self;
        }
    },

    /**
     * Returns a newly initialized cartesian point with the provided Position
     * projected to mercator coordinates.
     *
     * @param {Position} position   - The position to convert to a point.
     * @param {Number?} zoom        - If a zoom level is provided the
     *                                coordinates will be multiplied by
     *                                2^zoom
     * @returns {CartesianCoordinate} point
     */
    withPosition: {
        value: function (position, zoom) {
            var clip = exports.CartesianCoordinate.clip,
                max = exports.CartesianCoordinate.MAX_LATITUDE,
                mapSize = 256,
                latitude = clip(position.latitude, -max, max),
                longitude = clip(position.longitude, -180, 180),
                x = (longitude + 180) / 360,
                sinLatitude = Math.sin(latitude * Math.PI / 180),
                y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI),
                pixelX = clip(x, 0, mapSize),
                pixelY = clip(y, 0, mapSize),
                point = exports.CartesianCoordinate.withCoordinates(pixelX, pixelY);

            return arguments.length === 1 ? point : point.multiply(mapSize << zoom);
        }
    },

    clip: {
        value: function (value, minValue, maxValue) {
            return Math.min(Math.max(value, minValue), maxValue);
        }
    },

    MAX_LATITUDE: {
        value: 85.0511287798
    }


});

