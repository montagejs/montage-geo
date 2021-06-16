var Overlay = require("ui/overlay").Overlay,
    ClusterOrganizer = require("logic/model/cluster-organizer").ClusterOrganizer,
    Map = require("montage/collections/map"),
    MapPane = require("logic/model/map-pane").MapPane,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    Point = require("logic/model/point").Point,
    Set = require("montage/collections/set"),
    defaultFeatureDelegate = require("logic/model/feature-delegate").defaultFeatureDelegate;



/**
 * @class FeatureCollectionOverlay
 * @extends Component
 */
exports.FeatureCollectionOverlay = Overlay.specialize( /** @lends FeatureCollectionOverlay# */ {

    constructor: {
        value: function FeatureCollectionOverlay() {
            this.addBeforeOwnPropertyChangeListener("layer", this);
            this.addOwnPropertyChangeListener("layer", this);
        }
    },

    /***********************************************************************
     * Properties
     */

    /**
     * The collection of features to display.
     * @type {FeatureCollection}
     */
    collection: {
        get: function () {
            return this._collection;
        },
        set: function (value) {
            if (value !== this._collection) {
                this._cancelCollectionListeners();
                this._clearAll(true); // TODO: Determine if can't be deferred?
                this._collection = value;
                if (value) {
                    this._addCollectionListeners();
                    this._addFeatures(value.features);
                }
            }
        }
    },

    /**
     * The delegate to use for fetching images for tiles.
     * Set by owner
     * @type {TileDelegate}
     */
    featureDelegate: {
        get: function () {
            if (!this._featureDelegate) {
                this._featureDelegate = defaultFeatureDelegate;
            }
            return this._mapImageDelegate;
        },
        set: function (value) {
            if (value) {
                this._featureDelegate = value;
            }
        }
    },

    // TODO: Maybe make FeatureCollectionOverlay a template-less component.
    hasTemplate: {
        value: true
    },

    /**
     * The layer represents the data set to display in the overlay.
     * @type {Layer}
     */
    layer: {
        value: undefined
    },

    /**
     * The map that this overlay's features are symbolized on.
     * @type {Map}
     */
    map: {
        value: undefined
    },

    /**
     * The pane this component should be positioned in.
     * @type {MapPane}
     */
    pane: {
        writable: false,
        value: MapPane.None
    },

    /**
     * @type {Map}
     */
    _featureGeometryMap: {
        get: function () {
            if (!this.__featureGeometryMap) {
                this.__featureGeometryMap = new Map();
            }
            return this.__featureGeometryMap;
        }
    },

    /**
     * The current zoom level of the map.
     * @type {number}
     */
    _zoom: {
        value: 0
    },

    /***********************************************************************
     * Listeners
     */

    _cancelCollectionListeners: {
        value: function () {
            if (this._featuresRangeChangeListener) {
                this._featuresRangeChangeListener();
            }
            if (this._geometryChangeListener) {
                this._geometryChangeListener();
            }
            if (this._styleChangeListener) {
                this._styleChangeListener();
            }
        }
    },

    _addCollectionListeners: {
        value: function () {
            var collection = this.collection;
            this._geometryChangeListener = collection.addContentPropertyChangeListener(
                "geometry", this._handleFeatureGeometryChange.bind(this)
            );
            this._styleChangeListener = collection.addContentPropertyChangeListener(
                "style", this._handleFeatureStyleChange.bind(this)
            );
            this._featuresRangeChangeListener = collection.features.addRangeChangeListener(
                this._handleFeaturesRangeChange.bind(this)
            );
        }
    },

    _addMapListeners: {
        value: function () {
            var map;
            if (map = this.map) {
                map.addEventListener("featureMouseout", this);
                map.addEventListener("featureMouseover", this);
                map.addEventListener("featureSelection", this);
                this.defineBinding("_zoom", {
                    "<-": "currentZoom",
                    source: map
                });
            }
        }
    },

    _cancelMapListeners: {
        value: function () {
            var map;
            if (map = this.map) {
                map.removeEventListener("featureMouseout", this);
                map.removeEventListener("featureMouseover", this);
                map.removeEventListener("featureSelection", this);
                this.cancelBinding("_zoom");
            }
        }
    },

    /***********************************************************************
     * Observing the collection changes
     */

    /**
     * @override
     */
    handleIsEnableDidChange: {
        value: function (value) {
            if (value) {
                this._drawAll();
                this._addMapListeners();
            } else {
                this._clearAll(true);
                this._cancelMapListeners();
            }
        }
    },

    handleLayerWillChange: {
        value: function () {
            // TODO remove image element srcs...
        }
    },

    handleLayerChange: {
        value: function (value) {
            if (value) {
                this._fetchFeatures();
            }
        }
    },

    /**
     * Range change listener for the collection's features.
     * @method
     * @private
     * @param {array<Feature>} - The features added to the collection.
     * @param {array<Feature>} - The features removed from the collection.
     */
    _handleFeaturesRangeChange: {
        value: function (plus, minus) {
            var plusSet = new Set(plus),
                minusSet = new Set(minus),
                filteredPlus, filteredMinus;

            // TODO: Determine if necessary to really filter.
            filteredPlus = plus.filter(function (feature) {
                return !minusSet.has(feature);
            });

            filteredMinus = minus.filter(function (feature) {
                return !plusSet.has(feature);
            });
            this._removeFeatures(filteredMinus);
            this._addFeatures(filteredPlus);
        }
    },

    _handleFeatureGeometryChange: {
        value: function (value, key, object) {
            var oldGeometry;
            if (key === "geometry") {
                oldGeometry = this._featureGeometryMap.get(object);
                if (!oldGeometry || !oldGeometry.equals(value)) {
                    this._redrawFeature(object);
                }
                this._featureGeometryMap.set(object, value);
            }
        }
    },

    _handleFeatureStyleChange: {
        value: function (value, key, object) {
            if (key === "style") {
                this._redrawFeature(object);
            }
        }
    },

    _featuresRangeChangeListener: {
        value: undefined
    },

    _geometryChangeListener: {
        value: undefined
    },

    /***********************************************************************
     * Overlay Delegate Methods
     */

    /**
     * @override
     */
    didReset: {
        value: function () {
            if (this.isClustering) {
                this._featureQueue.clear();
                this._redrawAll();
            }
        }
    },

    /***********************************************************************
     * Event handlers
     */

    handleFeatureMouseout: {
        value: function (event) {
            var coordinates = event.detail.coordinate,
                feature = event.detail.feature,
                geometry = feature.geometry,
                isCollectionFeature = this._drawnFeatures.has(feature),
                isMousedOver = isCollectionFeature && this._mousedOverFeatures.has(feature),
                isPolygon = isMousedOver && typeof geometry.contains === "function",
                handler;

            if (isCollectionFeature) {
                event.stopPropagation();
            }

            if (isMousedOver) {
                // if (isMousedOver && (!isPolygon || !geometry.contains(coordinates))) {
                handler = this.featureSelectionHandler;
                this._mousedOverFeatures.delete(feature);
                if (handler && typeof handler.handleFeatureMouseout === "function") {
                    this.featureSelectionHandler.handleFeatureMouseout(feature);
                }
            }
        }
    },

    handleFeatureMouseover: {
        value: function (event) {
            var feature = event.detail.feature,
                isCollectionFeature = this._drawnFeatures.has(feature),
                handler;
            if (isCollectionFeature) {
                event.stopPropagation();
                handler = this.featureSelectionHandler;
                this._mousedOverFeatures.add(feature);
                if (handler && typeof handler.handleFeatureMouseover === "function") {
                    handler.handleFeatureMouseover(feature);
                }
            }
        }
    },

    handleFeatureSelection: {
        value: function (event) {
            var feature = event.detail.feature;
            if (this.isClustering && this._drawnFeatures.has(feature)) {
                if (feature.size > 1) {
                    this.application.delegate.map.fitToBounds(feature.bounds);
                } else {
                    feature = feature.features[0];
                }
            }
            if (this.collection.has(feature) && this.featureSelectionHandler) {
                if (typeof this.featureSelectionHandler === "function") {
                    this.featureSelectionHandler(feature);
                } else if (typeof this.featureSelectionHandler.handleFeatureSelection === "function") {
                    this.featureSelectionHandler.handleFeatureSelection(feature);
                }
            }
        }
    },

    /***********************************************************************
     * Engine Delegate Methods
     */

    didAdd: {
        value: function (engine) {
            //Is this needed?
        }
    },

    didMove: {
        value: function (center) {
            console.log("FeatureCollectionOverlay.didMove", center);
        }
    },

    didRemove: {
        value: function (engine) {
            //Is this needed?
        }
    },

    /**************************************************************************
     * Feature Fetching
     */

    _fetchFeatures: {
        value: function () {
            if (!layer) {
                console.warn("FeatureCollectionOverlay cannot fetch features without a layer");
                return;
            }
            console.log("FeatureCollectionOverlay._fetchFeatures");
            // this.__fetchFeatures();
        }
    },

    __fetchFeatures: {
        value: function () {
            //TODO Convert to FeatureCriteria once FeatureCriteria extends Criteria
            var criteria = new Criteria().initWithExpression("featureCriteria == $featureCriteria", {
                featureCriteria: this.map.getCriteriaForLayer(this.layer)
            });
            this.fetchFeaturesWithCriteriaAndLayer(criteria, layer).then(function (features) {
                console.log("FeatureCollectionOverlay.__fetchFeatures", features);
            })
        }
    },

    /***********************************************************************
     * Feature Drawing
     */

    /**
     * The set of features that were sent to be drawn by the map engine.
     */
    _drawnFeatures: {
        get: function () {
            if (!this.__drawnFeatures) {
                this.__drawnFeatures = new Set();
            }
            return this.__drawnFeatures;
        }
    },

    /**
     * Removes all drawn features from the map.
     * @private
     * @method
     * @param {boolean} deferRemoval
     */
    _clearAll: {
        value: function (clearImmediately) {
            if (this.collection) {
                this._removeFeatures(this.collection.features, clearImmediately);
            }
        }
    },

    /**
     * Queues an array of features to be drawn on the map during the next draw
     * cycle.
     * @private
     * @param {array<Feature>}
     * @method
     */
    _addFeatures: {
        value: function (features) {
            if (this.isClustering) {
                this._addFeaturesToClusterManager(features);
            } else {
                this._drawFeatures(features);
            }
        }
    },

    _drawAll: {
        value: function () {
            this._addFeatures(this.collection.features);
        }
    },

    _drawFeatures: {
        value: function (features) {
            var geometryMap = this._featureGeometryMap,
                map = this.map;
            features.forEach(function (feature) {
                geometryMap.set(feature, feature.geometry);
                map.drawFeature(feature);
            });
        }
    },

    /**
     * Queues an array of features to be removed from the map during the next
     * draw cycle.
     * @private
     * @param {array<Feature>}
     * @method
     */
    _removeFeatures: {
        value: function (features) {
            var geometryMap = this._featureGeometryMap,
                map = this.map,
                feature, i, n;
            for (i = 0, n = features.length; i < n; i += 1) {
                feature = features[i];
                if (geometryMap.has(feature)) {
                    geometryMap.delete(feature);
                }
                map.eraseFeature(feature);
            }
        }
    },

    /**
     * Queues all drawn features to be redrawn on the map.
     * @private
     * @method
     */
    _redrawAll: {
        value: function () {
            this._clearAll(true);
            this._drawAll();
        }
    },

    /**
     * Queues a single feature to be redrawn on the map during the next draw
     * cycle.
     * @private
     * @param {Feature}
     * @method
     */
    _redrawFeature: {
        value: function (feature) {
            this.map.redrawFeature(feature);
        }
    },

    /***********************************************************************
     * Clustering
     */

    // clusterColor: {
    //     value: undefined
    // },
    //
    // clusterKey: {
    //     value: undefined
    // },
    //
    // clusterSize: {
    //     value: undefined
    // },
    //
    // spiderClusters: {
    //     value: false
    // },

    _isClustering: {
        value: false
    },

    /**
     * Indicates whether the features should be clustered when in close prox-
     * imity to one another.  Default is false.
     * @type {boolean}
     */
    isClustering: {
        get: function () {
            return this._isClustering;
        },
        set: function (value) {
            value = Boolean(value);
            // if (value !== this._isClustering) {
            //     this._isClustering = value;
            //     if (value) {
            //         // TODO -- REFACTOR
            //         this._clusterManager = ClusterOrganizer.withOptions({
            //             color: this.clusterColor,
            //             key: this.clusterKey,
            //             size: this.clusterSize,
            //             spider: this.spiderClusters
            //         });
            //         this._clusterManager.defineBinding("zoom", {"<-": "_zoom", source: this});
            //         this._clusterManager.zoom = this.application.delegate.map.position.zoom;
            //     } else {
            //         this._clusterManager.cancelBinding("zoom");
            //         this._clusterManager = null;
            //     }
            //     // needs redraw
            // }
        }
    },

    /**
     * @private
     * @type {ClusterOrganizer}
     */
    _clusterManager: {
        value: undefined
    },

    /**
     * Adds an array of features to the cluster manager.  The associated clust-
     * ers will be queued up to be drawn on the map during the next draw cycle.
     * @private
     * @param {array<Feature>}
     * @method
     */
    _addFeaturesToClusterManager: {
        value: function (features) {
            var feature, i, n;
            for (i = 0, n = features.length; i < n; i += 1) {
                feature = features[i];
                this._featureGeometryMap.set(feature, feature.geometry);
                if (this._isFeatureClusterable(feature)) {
                    this._addFeatureToClusterManager(features[i]);
                } else {
                    this._addFeature(feature);
                }
            }
        }
    },

    /**
     * Adds a feature to the cluster manager and queues its associated cluster
     * to be drawn or redrawn on the map during the next draw cycle.
     * @private
     * @param {Feature}
     * @method
     */
    _addFeatureToClusterManager: {
        value: function (feature) {
            var cluster = this._clusterManager.addFeature(feature),
                drawnFeatures = this._drawnFeatures;
            if (drawnFeatures.has(cluster)) {
                this._featureQueue.set(cluster, DRAW_QUEUE_COMMANDS["REDRAW"]);
            } else {
                this._featureQueue.set(cluster, DRAW_QUEUE_COMMANDS["ADD"]);
            }
        }
    },

    /**
     *
     * Returns true if the feature can be clustered.  Only features whose geo-
     * metry are of type Point or MultiPoint can be clustered.  If the geometry
     * is of type multipoint it can only have one position.
     * @method
     * @private
     * @param {Feature} - the feature
     * @returns {boolean}
     */
    _isFeatureClusterable: {
        value: function (feature) {
            var geometry = feature.geometry;
            return geometry instanceof Point || (geometry instanceof MultiPoint && geometry.coordinates.length === 1);
        }
    },

    /**
     * @private
     * @type {ClusterOrganizer}
     */
    _clusterManager: {
        value: undefined
    },

    /**
     *
     * Returns true if the feature can be clustered.  Only features whose geo-
     * metry are of type Point or MultiPoint can be clustered.  If the geometry
     * is of type multipoint it can only have one position.
     * @method
     * @private
     * @param {Feature} - the feature
     * @returns {boolean}
     */
    _isFeatureClusterable: {
        value: function (feature) {
            var geometry = feature.geometry;
            return geometry instanceof Point || (geometry instanceof MultiPoint && geometry.coordinates.length === 1);
        }
    },

    /***********************************************************************
     * Map Tip Management
     */

    _mousedOverFeatures: {
        get: function () {
            if (!this.__mousedOverFeatures) {
                this.__mousedOverFeatures = new Set();
            }
            return this.__mousedOverFeatures;
        }
    },

    /***********************************************************************
     * Opacity
     */

    opacity: {
        get: function () {
            return this._opacity || 1;
        },
        set: function (value) {
            if (value !== this._opacity) {
                this._opacity = value;
                // TODO: Redraw features...
            }
        }
    }

    /***********************************************************************
     * Range Animation
     */

    /***********************************************************************
     * Refreshing Data
     */

    /***********************************************************************
     * Symbols
     */

});
