var Montage = require("montage/core/core").Montage;

var CHARACTERS = '0123456789bcdefghjkmnpqrstuvwxyz';

var PRECISION_SCALE = [
    0.70924, 22.7529, 729.62, 23409, 744200, 23912100,
    762450000, 24336000000, 781250000000, 25000000000000
];

var GEOHASH_NEIGHBOR = {
    n: [ 'p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx' ],
    s: [ '14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp' ],
    e: [ 'bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy' ],
    w: [ '238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb' ]
};

var GEOHASH_BORDER = {
    n: [ 'prxz',     'bcfguvyz' ],
    s: [ '028b',     '0145hjnp' ],
    e: [ 'bcfguvyz', 'prxz'     ],
    w: [ '0145hjnp', '028b'     ]
};

/**
 *
 * A Geohash represents a location (anywhere in the world) using a short alphanumeric string,
 * with greater precision obtained with longer strings.
 *
 * @class
 * @extends external:Montage
 */
var Geohash = exports.Geohash = Montage.specialize(/** @lends Geohash.prototype */ {

    constructor: {
        value: function Geohash(identifier) {
            this.identifier = identifier;
        }
    },

    /************************************************************
     * Properties
     */

    /**
     * The identifier of this Geohash
     * @type {string}
     */
    identifer: {
        value: undefined
    },

    adjacent: {
        value: function (direction) {

            var geohash = this.identifier,
                lastCh, parent, type;

            direction = direction.toLowerCase();

            if (geohash.length === 0) throw new Error('Invalid geohash');
            if ('nsew'.indexOf(direction) == -1) throw new Error('Invalid direction');

            geohash = parent && parent.identifier || this.identifier;


            lastCh = geohash.slice(-1);    // last character of hash
            parent = Geohash.withIdentifier(geohash.slice(0, -1)); // hash without last character

            type = geohash.length % 2;

            // check for edge-cases which don't share common prefix
            if (GEOHASH_BORDER[direction][type].indexOf(lastCh) != -1 && parent.identifier !== '') {
                parent = parent.adjacent(direction);
            }

            // append letter for direction to parent
            return new Geohash(parent.identifier + CHARACTERS.charAt(GEOHASH_NEIGHBOR[direction][type].indexOf(lastCh)));
        }
    },

    bounds: {
        get: function () {
            if (!this._bounds) {
                this._bounds = this._makeBounds();
            }
            return this._bounds;
        }
    },

    _makeBounds: {
        value: function() {

            var geohash = this.identifier,
                evenBit = true,
                yMin =  -90,
                yMax =  90,
                xMin = -180,
                xMax = 180,
                yMid, xMid,
                char, index,
                bitN, i, n;

            for (i = 0; i < geohash.length; i++) {
                char = geohash.charAt(i);
                index = CHARACTERS.indexOf(char);
                for (n = 4; n >= 0; n--) {
                    bitN = index >> n & 1;
                    if (evenBit) {
                        // longitude
                        xMid = (xMin + xMax) / 2;
                        if (bitN == 1) {
                            xMin = xMid;
                        } else {
                            xMax = xMid;
                        }
                    } else {
                        // latitude
                        yMid = (yMin + yMax) / 2;
                        if (bitN == 1) {
                            yMin = yMid;
                        } else {
                            yMax = yMid;
                        }
                    }
                    evenBit = !evenBit;
                }
            }

            return Geohash.BoundingBox.withCoordinates(xMin, yMin, xMax, yMax);
        }
    }

}, {

    cache: {
        get: function () {
            if (!exports.Geohash._cache) {
                exports.Geohash._cache = {};
            }
            return exports.Geohash._cache;
        }
    },

    /**
     * Returns an array of Geohashes for the provided bounds.  The precision of the
     * geohashes is determined by the area of the bounds.  The larger the bounds the
     */
    withCoordinatesAndPrecision: {
        value: function (longitude, latitude, precision) {

            var index = 0,
                bit = 0,
                evenBit = true,
                identifier = '',
                yMin =  -90,
                yMax =  90,
                xMin = -180,
                xMax = 180,
                xMid, yMid;

            while (identifier.length < precision) {

                if (evenBit) {
                    // bisect E - W longitude
                    xMid = (xMin + xMax) / 2;
                    if (longitude >= xMid) {
                        index = index * 2 + 1;
                        xMin = xMid;
                    } else {
                        index = index * 2;
                        xMax = xMid;
                    }
                } else {
                    // bisect N - S latitude
                    yMid = (yMin + yMax) / 2;
                    if (latitude >= yMid) {
                        index = index * 2 + 1;
                        yMin = yMid;
                    } else {
                        index = index * 2;
                        yMax = yMid;
                    }
                }
                evenBit = !evenBit;

                if (++bit == 5) {
                    // 5 bits gives us a character: append it and start over
                    identifier += CHARACTERS.charAt(index);
                    bit = 0;
                    index = 0;
                }
            }

            return Geohash.withIdentifier(identifier);
        }
    },

    withIdentifier: {
        value: function (identifier) {
            identifier = identifier.toLowerCase();
            var hash = exports.Geohash.cache[identifier];
            if (!hash) {
                hash = new this();
                hash.identifier = identifier;
                exports.Geohash.cache[identifier] = hash;
            }
            return hash;
        }
    },

    BoundingBox: {
        get: function () {
            return require("./bounding-box").BoundingBox;
        }
    }
});
