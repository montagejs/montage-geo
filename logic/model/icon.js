var IDENTIFIER_PREFIX = "I",
    DASH_REG_EX = /-/g,
    Uuid = require("montage/core/uuid").Uuid;

/**
 *
 * An Icon object represents a set of drawing instructions for displaying a
 * placemark on a map.
 *
 * @class
 * @extends Object
 */

var Icon = exports.Icon = function Icon() {
    this.identifier = IDENTIFIER_PREFIX;
    this.identifier += Uuid.generate().replace(DASH_REG_EX, "");
};

exports.Icon.prototype = Object.create({}, /** @lends Icon.prototype */ {
    
    /**
     * The constructor function for all Icon instances.
     * @type {function}
     */
    constructor: {
        configurable: true,
        writable: true,
        value: exports.Icon
    },
    
    /**
     * The global identifier for this Icon.  Used during serialization to
     * uniquely identify icons.
     * @type {string}
     */
    identifier: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * Offset to be used when centering the icon's symbol.
     * @type {Point2D}
     */
    anchor: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * The dimensions used to display this icon.
     * @type {Size}
     */
    size: {
        enumerable: true,
        writable: true,
        value: undefined
    },
    
    /**
     * Offset to be used when centering the icon's symbol.
     * @type {string}
     */
    symbol: {
        enumerable: true,
        writable: true,
        value: undefined
    }
    
});
