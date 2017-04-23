var Montage = require("montage/core/core").Montage,
    Point = require("./point").Point;

/**
 *
 * A Feature object represents a spatially bounded thing.
 *
 * @class
 * @extends external:Montage
 */
exports.Feature = Montage.specialize(/** @lends Feature.prototype */ {

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
     * A feature MAY have a member named "bbox" to include information on the
     * coordinate range for its Geometries
     *
     * @type {array<number>}
     */
    bbox: {
        get: function () {
            return this.geometry && this.geometry.bbox;
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
        value: undefined
    }

}, {

    withGeoJSON: {
        value: function (json) {
            var rawGeometry, geometry;
            json = typeof json === "string" ? this._toJSON(json) : json;
            rawGeometry = json.geometry || {};
            geometry = exports.Feature._geometryWithTypeAndCoordinates(rawGeometry.type, rawGeometry.coordinates);
            return exports.Feature.withMembers(json.id, json.properties, geometry);
        }
    },

    _geometryWithTypeAndCoordinates: {
        value: function (type, coordinates) {
            if (type === "Point") return Point.withCoordinates(coordinates);
            return null;
        }
    },

    _toJSON: {
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
     */
    withMembers: {
        value: function (id, properties, geometry) {
            var self = new this();
            if (id) self.id = id;
            self.properties = properties || null;
            self.geometry = geometry || null;
            return self;
        }
    }

});
