var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose coordinates property is a single position.
 *
 * @class
 * @extends external:Geometry
 */
exports.Point = Geometry.specialize(/** @lends Point.prototype */ {

    constructor: {
        value: function Point() {
            this.addPathChangeListener("coordinates.latitude", this, "coordinatesDidChange");
            this.addPathChangeListener("coordinates.longitude", this, "coordinatesDidChange");
        }
    },

    /**
     * @type {Position}
     */
    coordinates: {
        value: undefined
    },

    /**
     * @override
     * @returns array<Position>
     */
    positions: {
        get: function () {
            return [this.coordinates];
        }
    },

    intersects: {
        value: function (bounds) {
            return bounds.contains(this.coordinates);
        }
    },

    /****************************************************************
     * Measurements
     */

    /**
     * Returns the bearing from this point to the provided
     * point.
     *
     * @method
     * @param {Point}
     * @returns {number}
     */
    bearing: {
        value: function (point) {
            return this.coordinates.bearing(point.coordinates);
        }
    },

    /**
     * Calculates the distance between two points.

     * @see http://www.movable-type.co.uk/scripts/latlong.html
     *
     * @param {Point} point - the destination.
     * @return {number} The distance between the two points in meters.
s     */
    distance: {
        value: function (point) {
            return this.coordinates.distance(point.coordinates);
        }
    },

    /****************************************************************
     * Observables
     */

    /**
     * @override
     * @method
     */
    coordinatesDidChange: {
        value: function () {
            if (this.coordinates) {
                this.bounds.setWithPositions(this.positions);
            }
        }
    },

    makeDistanceObserver: {
        value: function (observeDestination) {
            var self = this;
            return function observeDistance(emit, scope) {
                return observeDestination(function replaceDestination(destination) {
                    return self.observeDistance(emit, destination);
                }, scope);
            }.bind(this);
        }
    },

    makeBearingObserver: {
        value: function (observeDestination) {
            var self = this;
            return function observeBearing(emit, scope) {
                return observeDestination(function replaceDestination(destination) {
                    return self.observeBearing(emit, destination);
                }, scope);
            }.bind(this);
        }
    },

    observeBearing: {
        value: function (emit, destination) {
            this._observe(emit, destination, this.bearing.bind(this));
        }
    },

    observeDistance: {
        value: function (emit, destination) {
            this._observe(emit, destination, this.distance.bind(this));
        }
    },

    _observe: {
        value: function (emit, destination, callback) {
            var self = this,
                destinationLatitudeHandler,
                destinationLongitudeHandler,
                originLatitudeHandler,
                originLongitudeHandler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback(destination));
            }

            update();
            destinationLatitudeHandler = destination.addPathChangeListener("coordinates.latitude", update);
            destinationLongitudeHandler = destination.addPathChangeListener("coordinates.longitude", update);
            originLatitudeHandler = this.addPathChangeListener("coordinates.latitude", update);
            originLongitudeHandler = this.addPathChangeListener("coordinates.longitude", update);

            return function cancelObserver() {
                destinationLatitudeHandler();
                destinationLongitudeHandler();
                originLatitudeHandler();
                originLongitudeHandler();
                if (cancel) {
                    cancel();
                }
            };
        }
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
