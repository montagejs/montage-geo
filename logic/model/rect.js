var IDENTIFIER_PREFIX = "R",
    DASH_REG_EX = /-/g,
    Uuid = require("montage/core/uuid").Uuid;

/**
 *
 * A Rect object represents a rectangle on a two dimensional plane.
 *
 * @class
 * @extends Object
 */

var Rect = exports.Rect = function Icon() {
    this.identifier = IDENTIFIER_PREFIX;
    this.identifier += Uuid.generate().replace(DASH_REG_EX, "");
};

exports.Rect.prototype = Object.create({}, /** @lends Rect.prototype */ {
    
    /**
     * The constructor function for all Rect instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Rect
    },
    
    /**
     * The height of the rectangle.
     * @type {number}
     */
    height: {
        configurable: true,
        writable: true,
        value: 0
    },
    
    /**
     * The width of the rectangle.
     * @type {number}
     */
    width: {
        configurable: true,
        writable: true,
        value: 0
    }

});
