var Montage = require("montage/core/core").Montage,
    FeatureCluster = require("logic/model/feature-cluster").FeatureCluster,
    Map = require("montage/collections/map"),
    Point2D = require("logic/model/point-2d").Point2D,
    Set = require("montage/collections/set"),
    DEFAULT_GRID_SIZE = 60,
    DEFAULT_ZOOM_LEVEL = 0;

/**
 *
 * A cluster organizer sorts a set of features into clusters.  Features are
 * grouped together if they are within a given pixel distance from each other.
 * The feature's pixel location is calculated by taking its geometry and projecting
 * it to a point in the Mercator coordinate system and then multiplying the point's
 * coordinates with the current size of the map.
 *
 * @class
 * @extends external:Montage
 */
exports.ClusterOrganizer = Montage.specialize(/** @lends ClusterOrganizer.prototype */ {

    constructor: {
        value: function ClusterOrganizer() {
            this._clusters = [];
            this._features = new Set();
        }
    },

    /********************************************************************************
     * Properties
     */

    /**
     * The array of clusters calculated by this cluster controller.  Do not manipulate
     * the contents of this property directly.
     *
     * @public
     * @type {Array<FeatureCluster>}
     */
    clusters: {
        get: function () {
            return this._clusters;
        }
    },

    /**
     * The set of features added to this cluster organizer.  Do not manipulate the
     * contents of this property directly.
     *
     * @public
     * @type {Set<Feature>}
     */
    features: {
        get: function () {
            return this._features;
        }
    },

    /**
     * The height and width in pixels that the features should be clustered by.
     *
     * @public
     * @type {Number}
     */
    gridSize: {
        get: function () {
            return this._gridSize;
        }
    },

    useGridOptimization: {
        value: false
    },

    /**
     * The current zoom level of the map.
     *
     * @public
     * @type {Number}
     */
    zoom: {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            if (this._zoom !== value) {
                this._zoom = value;
                this.reset();
            }
        }
    },

    /**
     * When using the grid optimization this property holds the pointers to the
     * clusters.
     *
     * @private
     * @type {Object<Number, Object<Number, Array<FeatureCluster>>>}
     */
    _clusterGrid: {
        get: function () {
            if (!this.__clusterGrid) {
                this.__clusterGrid = {};
            }
            return this.__clusterGrid;
        }
    },

    /**
     * Dictionary for storing the pointer of a feature to its cluster.  Used to
     * quickly remove features from their associated cluster.
     *
     * @private
     * @type {Map<Feature, Point}
     */
    _featureClusterMap: {
        get: function () {
            if (!this.__featureClusterMap) {
                this.__featureClusterMap = new Map();
            }
            return this.__featureClusterMap;
        }
    },

    /**
     * Cache for storing the point of a feature based upon its geometry.
     *
     * @private
     * @type {Map<Feature, Point}
     */
    _featurePointMap: {
        get: function () {
            if (!this.__featurePointMap) {
                this.__featurePointMap = new Map();
            }
            return this.__featurePointMap;
        }
    },

    /********************************************************************************
     * Methods
     */

    /**
     * Adds a feature to the cluster organizer.
     * @public
     * @method
     * @param {Feature}     - The feature to add.  The feature's geometry must be either
     *                        a point or a multi-point.  If the feature's geometry is a
     *                        multi-point, the first position in its coordinates array
     *                        will be used.
     */
    addFeature: {
        // TODO: Decide whether to support multi-point geometries or not.  Currently
        // TODO: (cont'd) supported because the Pacific Disaster Center uses it inter-
        // TODO: (cont'd) changeably with point geometries e.g. Historical Earthquakes
        value: function (feature) {
            var cluster = this.useGridOptimization ?    this._addFeatureUsingGrid(feature) :
                                                        this._addFeature(feature);
            if (!this.features.has(feature)) {
                this.features.add(feature);
            }
            this._featureClusterMap.set(feature, cluster);
        }
    },

    /**
     * Removes a feature from the cluster organizer.
     * @public
     * @method
     * @param {Feature}     - The feature to remove.
     */
    removeFeature: {
        value: function (feature) {
            if (this.features.has(feature)) {
                this._removeFeature(feature);
            }
        }
    },

    /**
     * Resets the organizer to its original state.
     * @public
     * @method
     */
    reset: {
        value: function () {
            this.clusters.splice(0, Infinity);
            this.features.clear();
            this.__clusterGrid = {};
            if (this.__featureClusterMap) this.__featureClusterMap.clear();
            if (this.__featurePointMap) this.__featurePointMap.clear();
        }
    },

    _addFeatureUsingGrid: {
        value: function (feature) {
            var point = this._pointForFeature(feature),
                gridSize = this._gridSize,
                x = Math.floor(point.x / gridSize),
                y = Math.floor(point.y / gridSize),
                cluster, clusterX, clusterY, clusterIndex;

            cluster = this._closestCluster(point, x, y);

            if (cluster) {
                cluster.add(feature, point);
                // TODO: Fix case where cluster is moved into another grid cell
                // clusterX = Math.floor(cluster.point.x / gridSize);
                // clusterY = Math.floor(cluster.point.y / gridSize);
                // pulled into another grid cell.
                // if (x !== clusterX || y !== clusterY) {
                //     clusterIndex = this._clusterGrid[y][x].indexOf(cluster);
                //     this._clusterGrid[y][x].splice(clusterIndex, 1);
                //     this._clusterGrid[clusterY][clusterX] = this._clusterGrid[clusterY][clusterX] || [];
                //     this._clusterGrid[clusterY][clusterX].push(cluster);
                // }
            } else {
                cluster = new FeatureCluster();
                cluster.add(feature, point);
                this.clusters.push(cluster);
                this._clusterGrid[y] = this._clusterGrid[y] || {};
                this._clusterGrid[y][x] = this._clusterGrid[y][x] || [];
                this._clusterGrid[y][x].push(cluster);
            }
            return cluster;
        }
    },

    _addFeature: {
        value: function (feature) {
            var closestDistance = Infinity,
                point = this._pointForFeature(feature),
                closestCluster, distance;

            this.clusters.forEach(function (cluster) {
                distance = cluster.point.distance(point);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCluster = cluster;
                }
            });

            if (closestCluster && closestDistance < this.gridSize) {
                closestCluster.add(feature, point);
            } else {
                closestCluster = new FeatureCluster();
                closestCluster.add(feature, point);
                this.clusters.push(closestCluster);
            }
            return closestCluster;
        }
    },

    /**
     * Function for finding the closest cluster to the provided point.  The
     * row and column the point is located is provided to optimize the dis-
     * covery of the closest cluster.
     *
     * @private
     * @method
     * @param {Point}   - the point to use for calculating distances.
     * @param {Number}  - the column the point is located in.
     * @param {Number}  - the row the point is located in.
     * @returns {FeatureCluster|null}
     */
    _closestCluster: {
        value: function (point, x, y) {
            var closestDistance = this._squareGridSize,
                closest = null,
                row, clusters,
                cluster, distance,
                i, j, k, length;
            for (i = y - 1; i <= y + 1; i += 1) {
                row = this._clusterGrid[i];
                if (row) {
                    for (j = x - 1; j <= x + 1; j += 1) {
                        clusters = row[j];
                        if (clusters) {
                            for (k = 0, length = clusters.length; k < length; k += 1) {
                                cluster = clusters[k];
                                distance = point.squareDistance(cluster.point);
                                if (distance < closestDistance) {
                                    closestDistance = distance;
                                    closest = cluster;
                                }
                            }
                        }
                    }
                }
            }
            return closest;
        }
    },

    _pointForFeature: {
        value: function (feature) {
            var point = this._featurePointMap.get(feature),
                zoom = this.zoom,
                mapSize = 256 << zoom,
                coordinates, position;

            if (!point) {
                coordinates = feature.geometry.coordinates;
                position = Array.isArray(coordinates) ? coordinates[0] : coordinates;
                point = Point2D.withPosition(position);
                this._featurePointMap.set(feature, point);
            }

            return point.multiply(mapSize);
        }
    },

    _removeFeature: {
        value: function (feature) {
            var cluster = this._featureClusterMap.get(feature),
                features = cluster.features,
                iterator = features.keys(),
                index = this.clusters.indexOf(cluster),
                gridSize = this._gridSize,
                x, y, clusterIndex, aFeature;
            this.clusters.splice(index, 1);
            this.features.delete(feature);
            this._featureClusterMap.delete(feature);
            this._featurePointMap.delete(feature);
            if (this.useGridOptimization) {
                x = Math.floor(cluster.point.x / gridSize);
                y = Math.floor(cluster.point.y / gridSize);
                clusterIndex = this._clusterGrid[y][x].indexOf(cluster);
                this._clusterGrid[y][x].splice(clusterIndex, 1);
            }
            while (aFeature = iterator.next().value) {
                if (aFeature !== feature) {
                    this.addFeature(aFeature);
                }
            }
        }
    }

}, {

    withGridSizeAndZoom: {
        value: function (gridSize, zoom, useGridOptimization) {
            var self = new this();
            self._gridSize = gridSize || DEFAULT_GRID_SIZE;
            self._squareGridSize = Math.pow(self._gridSize, 2);
            self._zoom = zoom || DEFAULT_ZOOM_LEVEL;
            self.useGridOptimization = useGridOptimization || false;
            return self;
        }
    }

});
