var Geometry = require("./geometry").Geometry,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    LineString = require("./line-string").LineString,
    Map = require("collections/map");

/**
 *
 * A Geometry whose "coordinates" property must be an array of
 * LineString coordinate arrays.
 *
 * @class
 * @extends external:Geometry
 */
var MultiLineString = exports.MultiLineString = Geometry.specialize(/** @lends MultiLineString.prototype */ {

    constructor: {
        value: function MultiLineString() {}
    },

    /**
     * The coordinates member of a multi-line string is an array of line string
     * geometries.
     * @type {array<LineString>}
     */
    coordinates: {
        value: undefined
    },

    bounds: {
        value: function () {
            return this.coordinates.map(function (lineString) {
                return lineString.bounds();
            }).reduce(function (bounds, childBounds) {
                bounds.extend(childBounds)
                return bounds;
            }, BoundingBox.withCoordinates(Infinity, Infinity, -Infinity, -Infinity));
        }
    },

    makeBoundsObserver: {
        value: function () {
            var self = this;
            return function observeBounds(emit, scope) {
                return self.observeBounds(emit);
            }.bind(this);
        }
    },

    observeBounds: {
        value: function (emit) {
            var self = this,
                coordinatesPathChangeListener,
                coordinatesRangeChangeListener,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.bounds());
            }

            update();
            coordinatesPathChangeListener = this.addPathChangeListener("coordinates", update);
            coordinatesRangeChangeListener = this.coordinates.addRangeChangeListener(update);

            return function cancelObserver() {
                coordinatesPathChangeListener();
                coordinatesRangeChangeListener();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    /**
     * @method
     * @param{LineString|Polygon|BoundingBox}
     * @returns boolean
     */
    intersects: {
        value: function (geometry) {
            return this.coordinates.some(function (lineString) {
                return lineString.intersects(geometry);
            });
        }
    },

    toGeoJSON: {
        value: function () {
            var coordinates = this.coordinates.map(function (lineString) {
                return lineString.coordinates.map(function (position) {
                    return [position.longitude, position.latitude];
                });
            });
            return {
                type: "MultiLineString",
                coordinates: coordinates
            }
        }
    },

    /**
     * @override
     * @method
     */
    coordinatesDidChange: {
        value: function () {
            if (this._rangeChangeCanceler) {
                this._rangeChangeCanceler();
            }
            this._childLineStringsRangeChangeCancelers.forEach(function (cancel) {
                cancel();
            });
            this._childLineStringsRangeChangeCancelers.clear();
            if (this.coordinates) {
                this.coordinates.forEach(this._addLineString.bind(this));
                this._rangeChangeCanceler = this.coordinates.addRangeChangeListener(this, "childLineString");
            }
        }
    },

    handleChildLineStringRangeChange: {
        value: function (plus, minus) {
            minus.forEach(this._removeLineString.bind(this));
            plus.forEach(this._addLineString.bind(this));
            if (this._shouldRecalculate) {
                this.updateBounds();
                // this.bounds.setWithPositions(this.positions);
                this._shouldRecalculate = false;
            }
        }
    },

    /**
     * @override
     * @method
     */
    handleRangeChange: {
        value: function () {
            this.updateBounds();
            // this.bounds.setWithPositions(this.positions);
        }
    },

    _addLineString: {
        value: function (lineString) {
            var bbox = lineString.bounds.bbox,
                cancel = bbox.addRangeChangeListener(this);
            this._childLineStringsRangeChangeCancelers.set(lineString, cancel);
            if (!this._shouldRecalculate) {
                this.updateBounds();
            }
        }
    },

    _removeLineString: {
        value: function (lineString) {
            var cancel = this._childLineStringsRangeChangeCancelers.get(lineString),
                positions = lineString.bounds.positions,
                bounds = this.bounds;
            this._childLineStringsRangeChangeCancelers.delete(lineString);
            this._shouldRecalculate =   this._shouldRecalculate ||
                                        positions.some(bounds.isPositionOnBoundary.bind(bounds));
            if (cancel) cancel();
        }
    },

    _childLineStringsRangeChangeCancelers: {
        get: function () {
            if (!this.__childLineStringsRangeChangeCancelers) {
                this.__childLineStringsRangeChangeCancelers = new Map();
            }
            return this.__childLineStringsRangeChangeCancelers;
        }
    },

    _rangeChangeCanceler: {
        value: undefined
    },

    _shouldRecalculate: {
        value: false
    },

    /**
     * Tests whether this Multi-Line String's coordinates member equals the
     * provided one.  The two geometries are considered equal if they have the
     * same number of child line-strings and each child is considered equal
     * to the passed in multi-line string's child at the same position.
     * @param {MultiLineString} other - the multi-line string to test for
     *                                  equality.
     * @return {boolean}
     */
    equals: {
        value: function (other) {
            var isThis = other instanceof MultiLineString,
                a = isThis && this.coordinates,
                b = isThis && other.coordinates;
            return isThis && a.length === b.length && this._compare(a, b);
        }
    },

    /**
     * Returns a copy of this MultiLineString.
     *
     * @method
     * @returns {Geometry}
     */
    clone: {
        value: function () {
            var coordinates = this.coordinates.map(function (lineString) {
                return lineString.coordinates.map(function (coordinate) {
                    return [coordinate.longitude, coordinate.latitude];
                });
            });
            return exports.MultiLineString.withCoordinates(coordinates);
        }
    },

    _compare: {
        value: function (a, b) {
            var isEqual = true, i, n;
            for (i = 0, n = a.length; i < n && isEqual; i += 1) {
                isEqual = a[i].equals(b[i]);
            }
            return isEqual;
        }
    }

}, {

    /**
     * Returns a newly initialized MultiLineString with the specified coordinates.
     *
     * @param {array<array<array<number>>>} coordinates - The positions of this
     * MultiLineString.
     */
    withCoordinates: {
        value: function (lineStrings) {
            var self = new this();
            self.coordinates = lineStrings.map(function (lineString) {
                return LineString.withCoordinates(lineString);
            });
            return self;
        }
    }

});
