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
            var origin = this.coordinates,
                destination = point.coordinates,
                thetaOne = Geometry.toRadians(origin.latitude),
                thetaTwo = Geometry.toRadians(destination.latitude),
                deltaLambda = Geometry.toRadians(destination.longitude - origin.longitude),
                y = Math.sin(deltaLambda) * Math.cos(thetaTwo),
                x = Math.cos(thetaOne) * Math.sin(thetaTwo) - Math.sin(thetaOne) *
                    Math.cos(thetaTwo) * Math.cos(deltaLambda),
                theta = Math.atan2(y, x);

            return (Geometry.toDegrees(theta) + 360) % 360;
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
            var earthRadius = 6371000,
                lng = this.coordinates.longitude,
                lat = this.coordinates.latitude,
                lng2 = point.coordinates.longitude,
                lat2 = point.coordinates.latitude,
                thetaOne = Geometry.toRadians(lat),
                thetaTwo = Geometry.toRadians(lat2),
                deltaTheta = Geometry.toRadians(lat2 - lat),
                deltaLambda = Geometry.toRadians(lng2 - lng),
                a = Math.sin(deltaTheta / 2) * Math.sin(deltaTheta / 2) +
                    Math.cos(thetaOne) * Math.cos(thetaTwo) *
                    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2),
                c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return earthRadius * c;

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
