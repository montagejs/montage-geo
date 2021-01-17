var Geometry = require("./geometry").Geometry,
    BoundingBox = require("./bounding-box").BoundingBox,
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
            serializer.setProperty("identifier", this.identifier);
            serializer.setProperty("coordinates", this.coordinates);
            serializer.setProperty("radius", this.radius);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.identifier = deserializer.getProperty("identifier");
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
        value: function (geometry) {
            return this.toPolygon().intersects(geometry);
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
     * Returns the bounding box that envelopes this circle.
     * @returns {BoundingBox}
     */
    bounds: {
        value: function () {
            var center = this.coordinates,
                radius = this.radius,
                west = center.destination(radius, 270).longitude,
                south = center.destination(radius, 180).latitude,
                east = center.destination(radius, 90).longitude,
                north = center.destination(radius, 0).latitude;

            return BoundingBox.withCoordinates(west, south, east, north);
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

    makeBoundsObserver: {
        value: function () {
            var self = this;
            return function observeBounds(emit) {
                return self.observeBounds(emit);
            };
        }
    },

    observeBounds: {
        value: function (emit) {
            var callback = this.bounds.bind(this),
                latitudeHandler,
                longitudeHandler,
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
            latitudeHandler = this.addPathChangeListener("coordinates.latitude", update);
            longitudeHandler = this.addPathChangeListener("coordinates.longitude", update);

            return function cancelObserver() {
                radiusHandler();
                latitudeHandler();
                longitudeHandler();
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

    makeIntersectsObserver: {
        value: function (observeIntersects) {
            var self = this;
            return function intersectsObserver(emit, scope) {
                return observeIntersects(function replaceGeometry(geometry) {
                    return self.observeIntersects(emit, geometry);
                }, scope);
            }.bind(this);
        }
    },

    observeIntersects: {
        value: function (emit, geometry) {
            var callback = this.intersects.bind(this),
                originLatitudeHandler,
                originLongitudeHandler,
                radiusHandler,
                cancel;

            function update() {
                if (cancel) {
                    cancel();
                }
                cancel = emit(callback(geometry));
            }

            update();
            originLatitudeHandler = this.addPathChangeListener("coordinates.latitude", update);
            originLongitudeHandler = this.addPathChangeListener("coordinates.longitude", update);
            radiusHandler = this.addPathChangeListener("radius", update);

            return function cancelObserver() {
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

            return exports.Circle.Polygon.withCoordinates([ring]);
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

    Polygon: {
        get: function () {
            return require("logic/model/polygon").Polygon;
        }
    },

    /**
     * Returns a newly initialized circle with the specified center and radius.
     *
     * @param {array<number>} center - The center of this circle.
     * @param {number} radius - The radius of this circle in meters.
     * @returns {Circle}
     */
    withCoordinates: {
        value: function (coordinates, radius, projection) {
            var self = new this();
            self.coordinates = Position.withCoordinates(coordinates, projection);
            self.radius = radius;
            return self;
        }
    }

});
