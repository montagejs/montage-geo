var Geometry = require("./geometry").Geometry,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Position = require("./position").Position,
    Projection = require("./projection").Projection;

/**
 *
 * A Geometry whose coordinates property is a single position.
 *
 * @class
 * @extends external:Geometry
 */
var Point = exports.Point = Geometry.specialize(/** @lends Point.prototype */ {

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
     * Returns the bearing from this point to the provided point.
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
     * Returns the destination Point having travelled the given distance along a geodesic
     * path given by initial bearing from ‘this’ Point, using Vincenty direct solution.
     *
     * @param   {number} distance - Distance travelled along the geodesic in meters.
     * @param   {number} initialBearing - Initial bearing in degrees from north.
     * @returns {Position} Destination Point.
     *
     * @example
     *   var p1 = Point.withCoordinates([144.42487, -37.95103]);
     *   var p2 = p1.destination(54972.271, 306.86816);
     */
    destination: {
        value: function (distance, bearing) {
            var destination = this.coordinates.destination(distance, bearing);
            return exports.Point.withCoordinates([destination.longitude, destination.latitude]);
        }
    },

    /**
     * Calculates the distance between two points.

     * @see http://www.movable-type.co.uk/scripts/latlong.html
     *
     * @param {Point} point - the destination.
     * @return {number} The distance between the two points in meters.
     */
    distance: {
        value: function (point) {
            return this.coordinates.distance(point.coordinates);
        }
    },

    /**
     * Returns this point in the MGRS reference system.
     * @method
     * @return {string}
     */
    mgrs: {
        value: function () {
            var coordinates = this.coordinates;
            return Projection.forSrid("MGRS").projectPoint([
                coordinates.longitude, coordinates.latitude
            ]);
        }
    },

    /****************************************************************
     * Observables
     */

    /**
     * @override
     * @method
     */
    bounds: {
        value: function () {
            var longitude = this.coordinates.longitude,
                latitude = this.coordinates.latitude;
            return BoundingBox.withCoordinates(longitude, latitude, longitude, latitude);
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

    makeMgrsObserver: {
        value: function () {
            var self = this;
            return function observeMgrs(emit, scope) {
                return self.observeMgrs(emit);
            }.bind(this);
        }
    },

    observeBounds: {
        value: function (emit) {
            var self = this,
                latitudeListenerCanceler,
                longitudeListenerCanceler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.bounds());
            }

            update();
            latitudeListenerCanceler = this.addPathChangeListener("coordinates.latitude", update);
            longitudeListenerCanceler = this.addPathChangeListener("coordinates.longitude", update);

            return function cancelObserver() {
                latitudeListenerCanceler();
                longitudeListenerCanceler();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    observeMgrs: {
        value: function (emit) {
            var self = this,
                latitudeListenerCanceler,
                longitudeListenerCanceler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.mgrs());
            }

            update();
            latitudeListenerCanceler = this.addPathChangeListener("coordinates.latitude", update);
            longitudeListenerCanceler = this.addPathChangeListener("coordinates.longitude", update);

            return function cancelObserver() {
                latitudeListenerCanceler();
                longitudeListenerCanceler();
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

    makeDestinationObserver: {
        value: function () {
            var self = this,
                wrapped = function (observeDistance, observeBearing) {
                    return function observeDestination(emit, scope) {
                        var cancelObserveDistance = observeDistance(function replaceDistance(newDistance) {
                                return self.observeDestination(emit, newDistance, scope.parameters.bearing);
                            }, scope),
                            cancelObserveBearing = observeBearing(function replaceBearing(newBearing) {
                                return self.observeDestination(emit, scope.parameters.distance, newBearing);
                            }, scope);
                        return function cancelDestinationObserver() {
                            cancelObserveBearing();
                            cancelObserveDistance();
                        }
                    }
                };
            return wrapped.call(this, arguments[0], arguments[1]);
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

    observeBearing: {
        value: function (emit, destination) {
            this._observe(emit, destination, this.bearing.bind(this));
        }
    },

    observeDestination: {
        value: function (emit, distance, bearing) {
            var self = this,
                latitudeListenerCanceler,
                longitudeListenerCanceler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(self.destination(distance, bearing));
            }

            update();
            latitudeListenerCanceler = this.addPathChangeListener("coordinates.latitude", update);
            longitudeListenerCanceler = this.addPathChangeListener("coordinates.longitude", update);

            return function cancelObserver() {
                latitudeListenerCanceler();
                longitudeListenerCanceler();
                if (cancel) {
                    cancel();
                }
            };

        }
    },

    observeDistance: {
        value: function (emit, destination) {
            this._observe(emit, destination, this.distance.bind(this));
        }
    },

    _observe: {
        value: function (emit, destination, callback) {
            var destinationLatitudeHandler,
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
    },

    /**
     * Returns a copy of this Point.
     *
     * @method
     * @returns {Geometry}
     */
    clone: {
        value: function () {
            return exports.Point.withCoordinates([
                this.coordinates.longitude, this.coordinates.latitude, this.coordinates.altitude
            ]);
        }
    },

    toGeoJSON: {
        value: function () {
            var position = this.coordinates;
            return {
                type: "Point",
                coordinates: [position.longitude, position.latitude]
            };
        }
    },

    /**
     * Tests whether this Point's coordinates equals the provided one.
     * @param {Point} - the point to test for equality.
     * @return {boolean}
     */
    equals: {
        value: function (other) {
            return other instanceof Point && this.coordinates.equals(other.coordinates);
        }
    }

}, {


    /**
     * Returns a newly initialized point with the specified coordinates.
     *
     * @param {array<number>} coordinates - The position of this point.
     */
    withCoordinates: {
        value: function (coordinates, projection) {
            var self = new this();
            self.coordinates = Position.withCoordinates(coordinates, projection);
            return self;
        }
    }

});
