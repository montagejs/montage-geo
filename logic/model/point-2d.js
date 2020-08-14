var Point = require("logic/model/point").Point;

/**
 *
 * A Point2D object represents a point in a two dimensional coordinate plane.
 *
 * @class
 * @extends Object
 */
exports.Point2D = function () {};

exports.Point2D.prototype = Object.create({}, /** @lends Point2D.prototype */ {

    /**
     * The constructor function for all Point2D
     * instances.
     *
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Point2D
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The global identifier for this Point2D.  Used during serialization to
     * uniquely identify objects.
     *
     * @type {string}
     */
    identifier: {
        enumerable: true,
        writable: true,
        value: undefined
    },

    /**
     * A Point2D's position on the X plane.
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
     * A Point2D's position on the X plane.
     * @public
     * @property
     * @type {number}
     */
    y: {
        configurable: true,
        writable: true,
        value: 0
    },

    /**************************************************************************
     * API
     */

    /**
     * The bearing in degrees from north of this point to the provided one.
     * @public
     * @method
     * @param {Point2D} point - the point to calculate the bearing to.
     * @type {number} degrees.
     */
    bearing: {
        value: function (other) {
            var theta = Math.atan2(other.x - this.x, other.y - this.y);
            if (theta < 0) {
                theta += Math.PI * 2;
            }
            return 180 / Math.PI * theta;
        }
    },

    /**
     * The distance from this point to the provided one.
     * @public
     * @method
     * @param {Point2D} coordinate - the coordinate to calculate
     *                                           the distance to.
     * @type {number} distance
     */
    distance: {
        value: function (other) {
            return Math.sqrt(Math.pow((this.x - other.x), 2) + Math.pow((this.y - other.y), 2));
        }
    },

    /**
     * Returns a new point that is the sum of each point's X and Y
     * pairs.
     * @public
     * @method
     * @param {Point2D} coordinate - the coordinate to add to this.
     * @type {Point2D} sum
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
     * @param {Point2D} point - the coordinate to average to this.
     * @type {Point2D} mid-point
     */
    midPoint: {
        value: function (other) {
            var point = new exports.Point2D();
            point.x = (this.x + other.x) / 2;
            point.y = (this.y + other.y) / 2;
            return point;
        }
    },

    /**
     * Calculates the square distance between this point and the provided
     * one.
     *
     * @public
     * @method
     * @param {Point2D}
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
     * @param {Point2D} coordinate - the point to subtract from this.
     * @type {Point2D} difference
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
     * Returns a new point that multiplies the provided factor with each
     * of this point's X and Y values.
     * @public
     * @method
     * @param {number} factor
     * @type {Point2D} coordinate
     */
    multiply: {
        value: function (number) {
            var point = this.clone();
            point.x *= number;
            point.y *= number;
            return point;
        }
    },

    /**
     * Returns a new point that divides the provided factor with each
     * of this point's X and Y values.
     * @public
     * @method
     * @param {number} factor
     * @type {Point2D} coordinate
     */
    divide: {
        value: function (number){
            var point = this.clone();
            point.x /= number;
            point.y /= number;
            return point;
        }
    },

    /**
     * Returns a new point at the same position as this one.
     * @public
     * @method
     * @returns {Point2D} the cloned point
     */
    clone: {
        value: function () {
            return exports.Point2D.withCoordinates(this.x, this.y);
        }
    },

    /**
     * Tests whether this point's properties match the provided one.
     * @public
     * @method
     * @param {Point2D} other - the point to test for equality.
     * @returns {boolean} -
     */
    equals: {
        value: function (other) {
            return this.x === other.x && this.y === other.y;
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
            var clip = exports.Point2D.clip,
                mapSize = 256 << (zoom || 0),
                x = (clip(this.x, 0, mapSize) / mapSize) - 0.5,
                y = 0.5 - (clip(this.y, 0, mapSize) / mapSize),
                latitude = 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI,
                longitude = 360 * x;

            return Point.withCoordinates([longitude, latitude]);
        }
    }

});

Object.defineProperties(exports.Point2D, /** @lends Point2D */ {

    /**
     * Returns a newly initialized cartesian point with the specified
     * coordinates.
     *
     * @param {number} x    - The coordinate on the X axis.
     * @param {number} y    - The coordinate on the Y axis.
     * @returns {Point2D} point
     */
    withCoordinates: {
        value: function (x, y) {
            var self = new exports.Point2D();
            self.x = x;
            self.y = y;
            return self;
        }
    },

    /**
     * Returns a newly initialized point with the provided Position
     * projected to mercator coordinates.
     *
     * @param {Position} position   - The position to convert to a point.
     * @param {Number?} zoom        - If a zoom level is provided the
     *                                coordinates will be multiplied by
     *                                2^zoom
     * @returns {Point2D} point
     */
    withPosition: {
        value: function (position, zoom) {
            var clip = exports.Point2D.clip,
                max = exports.Point2D.MAX_LATITUDE,
                mapSize = 256 << (zoom || 0),
                latitude = clip(position.latitude, -max, max),
                longitude = clip(position.longitude, -180, 180),
                x = (longitude + 180) / 360,
                sinLatitude = Math.sin(latitude * Math.PI / 180),
                y = 0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI),
                pixelX = clip(Math.round(x * mapSize), 0, mapSize),
                pixelY = clip(Math.round(y * mapSize), 0, mapSize);
            return exports.Point2D.withCoordinates(pixelX, pixelY);
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

