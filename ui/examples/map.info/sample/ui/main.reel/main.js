var Component = require("montage/ui/component").Component,
    BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Feature = require("montage-geo/logic/model/feature").Feature;
/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    _map: {
        get: function () {
            return this.__map;
        },
        set: function (value) {
            if (value) {
                this.__map = value;
                var lahaina = Feature.withGeoJSON({
                        geometry: {
                            type: "Point",
                            coordinates: [-156.6825, 20.8783]
                        },
                        id: 1,
                        properties: {
                            name: "Lahaina"
                        }
                }), antiMeridianLine = Feature.withGeoJSON({
                        geometry: {
                            type: "LineString",
                            coordinates: [
                                [178.68, 45.51],
                                [-178.43, 37.77],
                                [178.2, 34.04]
                            ]
                        },
                        id: 2,
                        properties: {
                            name: "Anti-Meridian Line Cross Stepper"
                        }
                });

                this.__map.drawFeature(lahaina);
                this.__map.drawFeature(antiMeridianLine);
            }
        }
    },

    maxBounds: {
        get: function () {
            return BoundingBox.withCoordinates(-20, -20, 20, 20);
        }
    },

    bounds: {
        get: function () {
            return this._bounds;
        },
        set: function (value) {
            this._bounds = value;
            // console.log("Set main's bounds with value (", value, ")");
        }
    },

    center: {
        get: function () {
            return this._center;
        },
        set: function (value) {
            this._center = value;
            // console.log("Set main's center with value (", value.coordinates, ")");
        }
    },

    zoom: {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            this._zoom = value;
            // console.log("Setting main's zoom level with value (", value, ")");
        }
    }

});
