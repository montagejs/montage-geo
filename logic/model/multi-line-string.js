var Geometry = require("./geometry").Geometry,
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
exports.MultiLineString = Geometry.specialize(/** @lends MultiLineString.prototype */ {

    /**
     * @type {array<Position>}
     */
    coordinates: {
        value: undefined
    },

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
                this.bounds.setWithPositions(this.positions);
                this._shouldRecalculate = false;
            }
        }
    },

    /**
     * @override
     * @returns array<Position>
     */
    positions: {
        get: function () {
            var positions = [];
            if (this.coordinates) {
                this.coordinates.forEach(function (lineString) {
                    positions.push.apply(positions, lineString.positions);
                });
            }
            return positions;
        }
    },

    handleRangeChange: {
        value: function () {
            this.bounds.setWithPositions(this.positions);
        }
    },

    _addLineString: {
        value: function (lineString) {
            var bbox = lineString.bbox,
                cancel = bbox.addRangeChangeListener(this);
            this._childLineStringsRangeChangeCancelers.set(lineString, cancel);
            if (!this._shouldRecalculate) {
                lineString.bounds.positions.forEach(this.bounds.extend.bind(this.bounds));
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
                                        positions.some(bounds.isOnBoundary.bind(bounds));
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
