var Montage = require("montage").Montage,
    Map = require("montage/collections/map"),
    Set = require("montage/collections/set");

/**
 * @class ClusterManager
 * @extends Montage
 *
 * This objects creates and manages per-zoom-level clusters for large amounts of features.
 *
 */
exports.ClusterManager = Montage.specialize(/** @lends ClusterManager.prototype */ {

    /**************************************************************************
     * Properties
     */

    /**
     * The array of clusters created and managed by this cluster manager.
     * @public
     * @property
     * @type {array<Cluster>}
     */
    clusters: {
        get: function () {
            if (!this._clusters) {
                this._clusters = [];
            }
            return this._clusters;
        }
    },

    /**
     * The set of features this manager is organizing into clusters.
     * @public
     * @property
     * @type {set<Feature>}
     */
    features: {
        get: function () {
            if (!this._features) {
                this._features = new Set;
            }
            return this._features;
        }
    },

    /**
     * @private
     * @property
     * @type {number}
     */
    _gridSize: {
        value: undefined
    },

    /**
     * @private
     * @property
     * @type {number}
     */
    _squareGridSize: {
        value: undefined
    },

    /**
     * The size, in pixels, of each grid block.
     * @property
     * @type {number}
     */
    gridSize: {
        get: function () {
            return this._gridSize || 60;
        },
        set: function (value) {
            this._gridSize = value;
            this._squareGridSize = Math.pow(value, 2);
            // this.reset();
        }
    },

    /**
     * The zoom level used to determine the pixel location of each of the
     * features.
     * @property
     * @type {number}
     */
    zoom: {
        get: function () {
            return this._zoom || 0;
        },
        set: function (value) {
            if (value !== this._zoom) {
                this._zoom = value;
            }
        }
    },

    /**
     * The grid of clusters.
     *
     * @private
     * @property
     * @type {Object<Number, Object<Number>, Array<Cluster>>}
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
     * Holds pointers from features to clusters.
     *
     * @private
     * @property
     * @type {map<Feature, Cluster>}
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
     * Holds pointers from features to its Point location.
     *
     * @private
     * @property
     * @type {map<Feature, Point>}
     */
    _featurePointMap: {
        get: function () {
            if (!this.__featurePointMap) {
                this.__featurePointMap = new Map();
            }
            return this.__featurePointMap;
        }
    },

    /**************************************************************************
     * Methods
     */


    /**
     * Adds a feature to this cluster set.

     * @public
     * @method
     * @param {Feature} feature - the feature to add.
     * @returns {Cluster} cluster - the cluster the feature was added to.
     */
    addFeature: {
        value: function (feature) {
            var point = this._pointForFeature(feature),
                gridSize = this._gridSize,
                x = Math.floor(point.x / gridSize),
                y = Math.floor(point.y / gridSize),
                cluster /*, clusterX, clusterY, clusterIndex */;

            cluster = this._closestCluster(point, x, y);

            if (cluster) {
                cluster.addFeature(feature, point);
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
                cluster = FeatureCluster.withFeatureAndZoom(feature, this.zoom, this.gridSize);
                cluster.clusterer = this;
                this.clusters.push(cluster);
                this._clusterGrid[y] = this._clusterGrid[y] || {};
                this._clusterGrid[y][x] = this._clusterGrid[y][x] || [];
                this._clusterGrid[y][x].push(cluster);
                cluster.y = y;
                cluster.x = x;
            }
            this.features.add(feature);
            this._featureClusterMap.set(feature, cluster);
            return cluster;
        }
    },

    /**
     * A function for finding the closest cluster to the provided point.  The
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
                point = Point.withPosition(position);
                this._featurePointMap.set(feature, point);
            }

            return point.multiply(mapSize);
        }
    }


});
