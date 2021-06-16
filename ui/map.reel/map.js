var Component = require("montage/ui/component").Component,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    FeatureCollectionOverlay = require("ui/feature-collection-overlay.reel").FeatureCollectionOverlay,
    LeafletEngine = require("ui/leaflet-engine.reel").LeafletEngine,
    Map = require("montage/collections/map").Map,
    MapImageOverlay = require("ui/map-image-overlay.reel").MapImageOverlay,
    Point = require("logic/model/point").Point,
    Point2D = require("logic/model/point-2d").Point2D,
    Position = require("logic/model/position").Position,
    Promise = require("montage/core/promise").Promise;

var MAX_BOUNDS = BoundingBox.withCoordinates(
    -Infinity, -85.05112878, Infinity, 85.05112878
);

/**
 * @class Map
 * @extends Component
 */
exports.Map = Component.specialize(/** @lends Map# */ {

    constructor: {
        value: function Map() {
            this.addRangeAtPathChangeListener("overlays", this);
            this.defineBinding("_tileLayers", {
                "<-":   "layers.filter{protocol.defined() && " +
                        "protocol.supportsTileImageRequests && " +
                        "(!protocol.supportsFeatureRequests || featureMinZoom > ^zoom)} ?? " +
                        "[]"
            });
            this.defineBinding("_featureLayers", {
                "<-":   "layers.filter{protocol.defined() && " +
                        "(!protocol.supportsTileImageRequests || " +
                        "(protocol.supportsFeatureRequests && featureMinZoom <= ^zoom))} ?? " +
                        "[]"
            });
            this.addRangeAtPathChangeListener("_featureLayers", this._handleFeatureLayersRangeChange.bind(this));
            this.addRangeAtPathChangeListener("_tileLayers", this._handleTileLayersRangeChange.bind(this));
            // this.addOwnPropertyChangeListener("bounds", this);
        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The current bounds of the map.
     * @type {BoundingBox}
     */
    bounds: {
        value: undefined
    },

    /**
     * The current center of the map.  Setting this value will update the map's
     * position.
     * @type {Position}
     */
    center: {
        get: function () {
            return this._center;
        },
        set: function (value) {
            if (Array.isArray(value) && value.length > 1) {
                value = Position.withCoordinates(value);
            }
            if (value && value instanceof Position) {
                this._center = value;
            }
        }
    },

    /**
     * The feature delegate used to query layer features.  If a delegate is not
     * defined, the delegate defaults to the MapImageDelegate defined in this
     * project.
     * @type {Featuredelegate}
     */
    featureDelegate: {
        value: undefined
    },

    /**
     * The layers to display as overlays in the map.
     * @type {Layer[]}
     */
    layers: {
        value: undefined
    },

    /**
     * The Map Image delegate that is passed to map image overlays.
     * If a delegate is not defined, the delegate defaults to the
     * MapImageDelegate defined in this project.
     * @type {MapImageDelegate}
     */
    mapImageDelegate: {
        value: undefined
    },

    /**
     * The are of the map the user is constrained to.  If not defined the user
     * may navigate to the whole world.
     * @type {BoundingBox}
     */
    maxBounds: {
        get: function () {
            return this._maxBounds;
        },
        set: function (value) {
            if (Array.isArray(value) && value.length === 4) {
                value = BoundingBox.withCoordinates(value[0], value[1], value[2], value[3]);
            }
            if (value instanceof BoundingBox) {
                this._maxBounds = value;
            }
        }
    },

    /**
     * The overlays to display on top of the map.
     * @type {Overlay[]}
     */
    overlays: {
        get: function () {
            if (!this._overlays) {
                this._overlays = [];
            }
            return this._overlays;
        },
        set: function (value) {
            this._overlays = value;
        }
    },

    /**
     * Defines the dimensions of the map in pixel units.
     * @type {Size}
     */
    size: {
        value: undefined
    },

    /**
     * The current zoom level of the map.
     * @type {number}
     */
    zoom: {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            if (!isNaN(value)) {
                this._zoom = value;
            }
        }
    },

    /**************************************************************************
     * Private Variables
     */

    _engine: {
        get: function () {
            var engine;
            if (!this.__engine) {
                engine = new LeafletEngine();
                engine.maxBounds = this.maxBounds || MAX_BOUNDS;
                this._startEngine(engine);
                this.__engine = engine;
            }
            return this.__engine;
        },
        set: function (value) {
            if (value && value !== this.__engine) {
                this._shutdownEngine(this.__engine);
                this.__engine = value;
                this._startEngine(value);
            }
        }
    },

    _featureLayerComponentMap: {
        get: function () {
            if (!this.__featureLayerComponentMap) {
                this.__featureLayerComponentMap = new Map();
            }
            return this.__featureLayerComponentMap;
        }
    },

    _layerCriteriaMap: {
        get: function () {
            if (!this.__layerCriteriaMap) {
                this.__layerCriteriaMap = new Map();
                this.__layerCriteriaMap.addMapChangeListener(this._layerCriteriaDidChange.bind(this));
            }
            return this.__layerCriteriaMap;
        }
    },

    _layerFeatureCollectionMap: {
        get: function () {
            if (!this.__layerFeatureCollectionMap) {
                this.__layerFeatureCollectionMap = new Map();
            }
            return this.__layerFeatureCollectionMap;
        }
    },

    _tileLayerComponentMap: {
        get: function () {
            if (!this.__tileLayerComponentMap) {
                this.__tileLayerComponentMap = new Map();
            }
            return this.__tileLayerComponentMap;
        }
    },

    _shutdownEngine: {
        value: function (engine) {
            if (engine) {
                this._cancelEngineBindings(engine);
                this._clearEngineFeatures(engine);
                this._removeEngineEventListeners(engine);
            }
        }
    },

    _startEngine: {
        value: function (engine) {
            this._defineEngineBindings(engine);
            this._drawAllFeatures(engine);
            this._addEngineEventListeners(engine);
            this._addOverlaysToEngine(engine);
        }
    },

    _addOverlaysToEngine: {
        value: function () {
            var self = this,
                overlays = this.overlays || [];
            overlays.forEach(function (overlay) {
                this.addOverlay(overlay);
                overlay.map = this;
            }, this);
        }
    },

    _defineEngineBindings: {
        value: function (engine) {
            this.defineBindings({
                "bounds": {"<-": "bounds", source: engine},
                "center": {"<->": "center", source: engine},
                "size": {"<->": "size", source: engine},
                "zoom": {"<->": "zoom", source: engine}
            });
        }
    },

    _cancelEngineBindings: {
        value: function (engine) {
            this.cancelBinding("bounds");
            this.cancelBinding("center");
            this.cancelBinding("zoom");
        }
    },

    _clearEngineFeatures: {
        value: function (engine) {
            var iterator = this._features.values(),
                feature;
            while (feature = iterator.next().value) {
                engine.eraseFeature(feature);
            }
        }
    },

    _drawAllFeatures: {
        value: function (engine) {
            var iterator = this._features.values(),
                feature;
            while (feature = iterator.next().value) {
                engine.drawFeature(feature);
            }
        }
    },

    _removeEngineEventListeners: {
        value: function (engine) {
            engine.removeEventListener("featureMouseout", this);
            engine.removeEventListener("featureMouseover", this);
            engine.removeEventListener("featureSelection", this);
        }
    },

    // In the future, this will be used to specify the current engine.
    _engineKey: {
        value: undefined
    },

    _addEngineEventListeners: {
        value: function (engine) {
            engine.addEventListener("featureMouseout", this);
            engine.addEventListener("featureMouseover", this);
            engine.addEventListener("featureSelection", this);
        }
    },

    /**************************************************************************
     * Managing Layer Features
     */

    /**
     * @method
     * @param {Criteria} - the criteria to apply to the layer
     * @param {Layer} - the layer to assign the criteria
     */
    assignCriteriaToLayer: {
        value: function (criteria, layer) {
            this._layerCriteriaMap.set(layer, criteria);
        }
    },

    getCriteriaForLayer: {
        value: function (layer) {
            return this._layerCriteriaMap.get(layer);
        }
    },

    _layerCriteriaDidChange: {
        value: function (value, key) {

        }
    },

    /**************************************************************************
     * Event Handlers
     */

    _handleFeatureLayersRangeChange: {
        value: function (plus, minus) {
            var layerComponentMap = this._featureLayerComponentMap,
                engine = this._engine,
                freeIterations = [],
                component, i, n;

            for (i = 0, n = minus.length; i < n; i += 1) {
                freeIterations.push(layerComponentMap.get(minus[i]));
            }

            for (i = 0, n = plus.length; i < n; i += 1) {
                if (freeIterations.length > 0) {
                    component = freeIterations.pop();
                } else {
                    component = this._buildFeatureCollectionOverlay();
                    engine.addOverlay(component);
                }
                component.layer = plus[i];
                layerComponentMap.set(component.layer, component);
            }

            for (i = 0, n = freeIterations.length; i < n; i += 1) {
                component = freeIterations[i];
                engine.removeOverlay(component);
                layerComponentMap.delete(component.layer);
            }
        }
    },

    _handleTileLayersRangeChange: {
        value: function (plus, minus) {
            var layerComponentMap = this._tileLayerComponentMap,
                engine = this._engine,
                freeIterations = [],
                component, i, n;

            for (i = 0, n = minus.length; i < n; i += 1) {
                freeIterations.push(layerComponentMap.get(minus[i]));
            }

            for (i = 0, n = plus.length; i < n; i += 1) {
                if (freeIterations.length > 0) {
                    component = freeIterations.pop();
                } else {
                    component = this._buildTileOverlay();
                    engine.addOverlay(component);
                }
                component.layer = plus[i];
                layerComponentMap.set(component.layer, component);
            }

            for (i = 0, n = freeIterations.length; i < n; i += 1) {
                component = freeIterations[i];
                engine.removeOverlay(component);
                layerComponentMap.delete(component.layer);
            }

        }
    },

    _handleLayerCriteriaMapChange: {
        value: function (value, key) {
            // TODO - update feature-collection for layer
        }
    },

    _buildFeatureCollectionOverlay: {
        value: function() {
            //should feature collection overlay have a layer? Or Should there be a new class?
            // overlay.
            var overlay = new FeatureCollectionOverlay();
            overlay.map = this;
            overlay.featureDelegate = this.featureDelegate;
            return overlay;

        }
    },

    _buildTileOverlay: {
        value: function () {
            var mapImageOverlay = new MapImageOverlay();
            mapImageOverlay.map = this;
            mapImageOverlay.mapImageDelegate = this.mapImageDelegate;
            return mapImageOverlay;
        }
    },

    handleRangeChange: {
        value: function (plus, minus) {
            var engine = this._engine;
            if (engine) {
                plus.forEach(function (overlay) {
                    engine.addOverlay(overlay);
                    overlay.map = this;
                }, this);
                minus.forEach(function (overlay) {
                    engine.removeOverlay(overlay);
                    overlay.map = this;
                }, this);
            }
        }
    },

    /**
     * These events may remain as is as components other than overlays that
     * need to listen to these.
     */
    handleFeatureMouseout: {
        value: function (event) {
            event.stopPropagation();
            this.dispatchEventNamed("featureMouseout", true, true, event.detail);
        }
    },

    handleFeatureMouseover: {
        value: function (event) {
            event.stopPropagation();
            this.dispatchEventNamed("featureMouseover", true, true, event.detail);
        }
    },

    handleFeatureSelection: {
        value: function (event) {
            event.stopPropagation();
            this.dispatchEventNamed("featureSelection", true, true, event.detail);
        }
    },

    /**************************************************************************
     * API
     */

    /**
     * Adds an overlay to the map to the specified pane.
     * @param {Component} - the overlay to add.
     * @param {MapPane} - The pane that the component should be added to.
     * @returns {Promise} - A promise that will be fulfilled when the overlay
     *                      is embedded into the map.
     */
    addOverlay: {
        value: function (overlay) {
            this.overlays.push(overlay);
        }
    },

    getOriginForZoom: {
        value: function (zoom) {
            this._engine && this._engine.getOriginForZoom(zoom);
        }
    },

    /**
     * Adds an overlay to the map to the specified pane.
     * @param {Component} - the overlay to add.
     * @param {MapPane} - The pane that the component should be added to.
     * @returns {Promise} - A promise that will be fulfilled when the overlay
     *                      is embedded into the map.
     */
    removeOverlay: {
        value: function (overlay, pane) {
            var index = this.overlays.indexOf(overlay);
            if (index !== -1) {
                this.overlays.splice(index, 1);
            }

        }
    },

    /**
     * Return's the geographic coordinate associated with this pixel location.
     * @param {Point2D}
     * @returns {Position}
     */
    pointToPosition: {
        value: function (point) {
            return this._engine && this._engine.pointToPosition(point);
        }
    },

    /**
     * Return's the pixel location of the provided position relative to the
     * map's origin pixel.
     *
     * @param {Position}
     * @returns {Point2D}
     */
    positionToPoint: {
        value: function (position) {
            return this._engine && this._engine.positionToPoint(position);
        }
    },

    /**
     * Return's the pixel location of the provided position relative to the
     * map's container.
     *
     * @param {Position}
     * @returns {Point2D}
     */
    positionToContainerPoint: {
        value: function (position) {
            return this._engine && this._engine.positionToContainerPoint(position);
        }
    },

    /**
     * Adds a feature to the map.
     * @param {Feature}
     * @param {boolean} [processImmediately = false] If true will execute the
     *                  command without using the deferred draw loop.
     */
    drawFeature: {
        value: function (feature, processImmediately) {
            if (this._engine) {
                this._engine.drawFeature(feature, processImmediately);
            }
            if (!this._features.has(feature)) {
                this._features.add(feature);
            }
        }
    },

    /**
     * Redraws a feature on the map.
     * @param {Feature}
     * @param {boolean} [processImmediately = false] If true will execute the
     *                  command without using the deferred draw loop.
     */
    redrawFeature: {
        value: function (feature, processImmediately) {
            if (this._engine && this._features.has(feature)) {
                this._engine.redrawFeature(feature, processImmediately);
            }
        }
    },

    /**
     * Removes a feature from the map.
     * @param {Feature}
     * @param {boolean} [processImmediately = false] If true will execute the
     *                  command without using the deferred draw loop.
     */
    eraseFeature: {
        value: function (feature, processImmediately) {
            if (this._engine) {
                this._engine.eraseFeature(feature, processImmediately);
            }
            if (this._features.has(feature)) {
                this._features.delete(feature);
            }
        }
    },

    _features: {
        get: function () {
           if (!this.__features) {
               this.__features = new Set();
           }
           return this.__features;
        }
    },

    /**
     * Sets this map to the specified bounds.
     * @method
     * @param {BoundingBox || array<number>} bounds - The bounds to move this map to.
     */
    setBounds: {
        value: function () {
            var newBounds;
            if (arguments.length === 1 && arguments[0] instanceof BoundingBox) {
                newBounds = arguments[0];
            } else if (arguments.length === 4) {
                newBounds = BoundingBox.withCoordinates(arguments[0], arguments[1], arguments[2], arguments[3]);
            }
            if (newBounds) {
                this.bounds = newBounds;
            }
            if (this._engine) {
                this._engine.bounds = newBounds;
            }
        }
    },

    /**
     * Center the map on the specified position.  The position can either be a
     * Point object or a pair of coordinates.
     * @method
     * @param {Point || number} bounds|longitude
     * @param {?number} latitude
     */
    setCenter: {
        value: function () {
            var newCenter;
            if (arguments.length === 1 && arguments[0] instanceof Position) {
                newCenter = arguments[0];
            } else if (arguments.length === 2) {
                newCenter = Position.withCoordinates([arguments[0], arguments[1]]);
            }
            if (newCenter) {
                this.center = newCenter;
            }
        }
    },

    /**
     * @method
     * @param {number} zoom level
     */
    setZoom: {
        value: function (value) {
            this.zoom = value;
        }
    }

});


