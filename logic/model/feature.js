var Montage = require("montage/core/core").Montage,
    LineString = require("./line-string").LineString,
    MultiLineString = require("./multi-line-string").MultiLineString,
    MultiPolygon = require("./multi-polygon").MultiPolygon,
    MultiPoint = require("./multi-point").MultiPoint,
    Point = require("./point").Point,
    Polygon = require("./polygon").Polygon;

/**
 *
 * A Feature object represents a spatially bounded thing.
 *
 * @class
 * @extends external:Montage
 */
exports.Feature = Montage.specialize(/** @lends Feature.prototype */ {

    constructor: {
        value: function Feature() {}
    },

    /**
     * If a Feature has a commonly used identifier, that identifier
     * SHOULD be included as a member of the Feature object with the name
     * "id", and the value of this member is either a JSON string or
     * number.
     *
     * @type {string|number}
     */
    id: {
        value: undefined
    },

    /**
     * A feature MAY have a member named "bounds" to include information on the
     * coordinate range for its Geometries
     *
     * @type {BoundingBox}
     */
    bounds: {
        value: function () {
            return this.geometry && this.geometry.bounds();
        }
    },

    /**
     * @type {object|null}
     */
    properties: {
        value: undefined
    },

    /**
     * The value of the geometry member SHALL be either a Geometry object
     * as defined above or, in the case that the Feature is unlocated, a
     * JSON null value.
     *
     * @type {Geometry|null}
     */
    geometry: {
        value: null
    },

    /**
     * The style to use when symbolizing this feature onto a map.
     * @type {Style}
     */
    style: {
        value: undefined
    },

    /**
     * Tests to see if this feature's geometry intersects the provided bounds.
     * @method
     * @param {BoundingBox} bounds - The bounds to test for intersection
     * @returns boolean
     */
    intersects: {
        value: function (bounds) {
            return this.geometry.intersects(bounds);
        }
    },

    /*****************************************************
     * Serialization
     */

    serializeSelf: {
        value: function (serializer) {
            serializer.setProperty("id", this.id);
            serializer.setProperty("geometry", this.geometry);
            serializer.setProperty("properties", this.properties);
        }
    },

    deserializeSelf: {
        value: function (deserializer) {
            this.id = deserializer.getProperty("id");
            this.geometry = deserializer.getProperty("geometry");
            this.properties = deserializer.getProperty("properties");
        }
    }

}, {

    withGeoJSON: {
        value: function (json) {
            var rawGeometry, geometry;
            json = typeof json === "string" ? this._parseJSON(json) : json;
            rawGeometry = json.geometry || {};
            geometry = exports.Feature._geometryWithTypeAndCoordinates(rawGeometry.type, rawGeometry.coordinates);
            return exports.Feature.withMembers(json.id, json.properties, geometry);
        }
    },

    _geometryWithTypeAndCoordinates: {
        value: function (type, coordinates) {
            if (type === "LineString")      return LineString.withCoordinates(coordinates);
            if (type === "MultiLineString") return MultiLineString.withCoordinates(coordinates);
            if (type === "MultiPoint")      return MultiPoint.withCoordinates(coordinates);
            if (type === "MultiPolygon")    return MultiPolygon.withCoordinates(coordinates);
            if (type === "Point")           return Point.withCoordinates(coordinates);
            if (type === "Polygon")         return Polygon.withCoordinates(coordinates);
            return null;
        }
    },

    _parseJSON: {
        value: function (string) {
            var json;
            try {
                json = JSON.parse(string);
            } catch (error) {
                console.warn("------------------------------------------------------------");
                console.warn("Could not parse JSON (", string, ") with error (", error, ")");
                console.warn("------------------------------------------------------------");
                json = null;
            }
            return json;
        }
    },

    /**
     * Returns a newly initialized feature with the provided members.
     *
     * @param {string?|number?} id          - An optional identifier for this feature.
     * @param {object|null} properties      - The properties member of this feature.
     * @param {Geometry|null} geometry      - The geometry for this feature.  Null if the
     *                                        feature does not have a location.
     * @param {Style|null} style            - The style definition for this feature.
     */
    withMembers: {
        value: function (id, properties, geometry, style) {
            var self = new this();
            if (id) self.id = id;
            self.properties = properties || null;
            self.geometry = geometry || null;
            self.style = style || null;
            return self;
        }
    }

});
