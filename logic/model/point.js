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

    observeBearing: {
        value: function (emit, destination) {
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
                cancel = emit(self.bearingTo(destination));
            }

            update();
            destinationLatitudeHandler = destination.addPathChangeListener("coordinates.latitude", update);
            destinationLongitudeHandler = destination.addPathChangeListener("coordinates.longitude", update);
            originLatitudeHandler = self.addPathChangeListener("coordinates.latitude", update);
            originLongitudeHandler = self.addPathChangeListener("coordinates.longitude", update);

            return function cancelBearingObserver() {
                destinationLatitudeHandler();
                destinationLongitudeHandler();
                originLatitudeHandler();
                originLongitudeHandler();
                if (cancel) {
                    cancel();
                }
            };
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

    /**
     * Returns the bearing from this point to the provided
     * point.
     *
     * @method
     * @param {Point}
     * @returns {number}
     */
    bearingTo: {
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

    coordinatesDidChange: {
        value: function () {
            var lng, lat;
            if (this.coordinates) {
                lng = this.coordinates.longitude;
                lat = this.coordinates.latitude;
                this.bbox.splice(0, 4, lng, lat, lng, lat);
            }
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
