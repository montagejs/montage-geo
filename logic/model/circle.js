var Geometry = require("./geometry").Geometry,
    Polygon = require("./polygon").Polygon,
    Position = require("./position").Position;

/**
 *
 * Represents a geodesic circle
 *
 * @class
 * @extends external:Geometry
 */
var Circle = exports.Circle = Geometry.specialize(/** @lends Circle.prototype */ {

    constructor: {
        value: function Circle() {}
    },

    /**
     * The center of this circle.
     * @type {Position}
     */
    coordinates: {
        value: undefined
    },

    /**
     * The radius of the circle in meters.
     * @type {number}
     */
    radius: {
        value: undefined
    },


    /*****************************************************
     * Serialization
     */

    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("coordinates", this.coordinates);
            serializer.setProperty("radius", this.radius);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.coordinates = deserializer.getProperty("coordinates");
            this.radius = deserializer.getProperty("radius");
        }
    },

    /****************************************************************
     * Intersection
     */

    /**
     * Tests whether the provided point is within this circle.
     * @param {Point} point - the point to test.
     * @returns {boolean}
     */
    containsPoint: {
        value: function (point) {
            // named containsPoint instead of contains because it creates a
            // conflict with FRB and cannot be made observable.
            return this.radius > this.coordinates.distance(point.coordinates);
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
     * Returns the area of this circle in meters squared.
     *
     * @returns {Number}
     */
    area: {
        value: function () {
            return Math.PI * Math.pow(this.radius, 2);
        }
    },

    /**
     * Returns the perimeter of this circle in meters.
     *
     * @returns {Number}
     */
    perimeter: {
        value: function () {
            return 2 * Math.PI * this.radius;
        }
    },

    /****************************************************************
     * Observables
     */

    makeAreaObserver: {
        value: function () {
            var self = this;
            return function observeArea(emit) {
                return self.observeArea(emit);
            };
        }
    },

    observeArea: {
        value: function (emit) {
            var callback = this.area.bind(this),
                radiusHandler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback());
            }

            update();
            radiusHandler = this.addPathChangeListener("radius", update);

            return function cancelObserver() {
                radiusHandler();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    makeContainsPointObserver: {
        value: function (observeContains) {
            var self = this;
            return function containsObserver(emit, scope) {
                return observeContains(function replacePoint(point) {
                    return self.observeContains(emit, point);
                }, scope);
            }.bind(this);
        }
    },

    observeContains: {
        value: function (emit, point) {
            var callback = this.containsPoint.bind(this),
                pointLatitudeHandler,
                pointLongitudeHandler,
                originLatitudeHandler,
                originLongitudeHandler,
                radiusHandler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback(point));
            }

            update();
            pointLatitudeHandler = point.addPathChangeListener("coordinates.latitude", update);
            pointLongitudeHandler = point.addPathChangeListener("coordinates.longitude", update);
            originLatitudeHandler = this.addPathChangeListener("coordinates.latitude", update);
            originLongitudeHandler = this.addPathChangeListener("coordinates.longitude", update);
            radiusHandler = this.addPathChangeListener("radius", update);

            return function cancelObserver() {
                pointLatitudeHandler();
                pointLongitudeHandler();
                originLatitudeHandler();
                originLongitudeHandler();
                radiusHandler();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    makePerimeterObserver: {
        value: function () {
            var self = this;
            return function observePerimeter(emit) {
                return self.observePerimeter(emit);
            };
        }
    },

    observePerimeter: {
        value: function (emit) {
            var callback = this.perimeter.bind(this),
                radiusHandler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback());
            }

            update();
            radiusHandler = this.addPathChangeListener("radius", update);

            return function cancelObserver() {
                radiusHandler();
                if (cancel) {
                    cancel();
                }
            };
        }
    },

    /****************************************************************
     * Utilities
     */

    /**
     * Returns this circle as a GeoJSON object of type Polygon.  The ring of
     * the polygon is converted to geodesic coordinates using the vincenty
     * direct method.
     * @deprecated
     * @returns {object}
     */
    toGeoJSON: {
        value: function () {
            return this.toPolygon().toGeoJSON();
        }
    },

    /**
     * Returns this circle as a Montage-Geo Polygon.  The ring of
     * the circle is converted to geodesic coordinates using the vincenty
     * direct method.
     *
     * @returns {Polygon}
     */
    toPolygon: {
        value: function (stepCount) {
            var ring = [],
                arc = 360,
                steps = stepCount || 72,
                stepSize = arc / 72,
                theta = 0,
                center = this.coordinates,
                radius = this.radius,
                position, angle, i;

            for (i = 0; i < steps; i += 1) {
                angle = theta + (stepSize * i);
                position = center.vincentyDirect(radius, angle);
                ring.push([position.longitude, position.latitude]);
            }

            return Polygon.withCoordinates([ring]);
        }
    },

    /**
     * Tests whether this Point's coordinates equals the provided one.
     * @param {Point} - the point to test for equality.
     * @return {boolean}
     */
    equals: {
        value: function (other) {
            return  other instanceof Circle &&
                    this.coordinates.equals(other.coordinates) &&
                    other.radius === this.radius;
        }
    },

    /**
     * Returns a copy of this Circle.
     *
     * @method
     * @returns {Circle}
     */
    clone: {
        value: function () {
            var center = this.coordinates;
            return Circle.withCoordinates([center.longitude, center.latitude], this.radius);
        }
    }

}, {

    /**
     * Returns a newly initialized circle with the specified center and radius.
     *
     * @param {array<number>} center - The center of this circle.
     * @param {number} radius - The radius of this circle in meters.
     * @returns {Circle}
     */
    withCoordinates: {
        value: function (coordinates, radius) {
            var self = new this();
            self.coordinates = Position.withCoordinates(coordinates);
            self.radius = radius;
            return self;
        }
    }

});
