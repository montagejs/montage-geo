/**
 * @module "ui/static-map.reel"
 */
var Component = require("montage/ui/component").Component,
    LineString = require("logic/model/line-string").LineString,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Position = require("logic/model/position").Position,
    Point2D = require("logic/model/point-2d").Point2D,
    Polygon = require("logic/model/polygon").Polygon,
    Size = require("logic/model/size").Size,
    StyleType = require("logic/model/style").StyleType,
    TileBounds = require("logic/model/tile-bounds").TileBounds;

/**
 * @class StaticMap
 * @extends Component
 */
exports.StaticMap = Component.specialize(/** @lends StaticMap.prototype */{

    /**
     * @type {Position|Point}
     * @default 0,0
     */
    center: {
        get: function () {
            if (!this._center) {
                this._center = Position.withCoordinates(0, 0);
            }
            return this._center;
        },
        set: function (value) {
            if (value && value !== this._center) {
                this._center = value;
            }
        }
    },

    /**
     * Zoom level of the map.
     * @type {Number}
     * @default 0
     */
    zoom: {
        get: function () {
            return this._zoom || 0;
        },
        set: function (value) {
            if (value != null && value !== this._zoom) {
                this._zoom = value;
            }
        }
    },

    /**
     * @type {Size}
     * @default 0x0
     */
    size: {
        get: function () {
            if (!this._size) {
                this._size = new Size();
            }
            return this._size;
        },
        set: function (value) {
            if (value && value !== this._size) {
                this._size = value;
            }
        }
    },

    /**
     * @type {Array<Layer>}
     */
    layers: {
        get: function () {
            if (!this._layers) {
                this._layers = [];
            }
            return this._layers;
        },
        set: function (value) {
            if (value && value !== this._layers) {
                this._layers = layers;
            }
        }
    },

    /**
     * @type {Array<FeatureCollection>}
     */
    featureCollections: {
        get: function () {
            if (!this._featureCollections) {
                this._featureCollections = [];
            }
            return this._featureCollections;
        },
        set: function (value) {
            if (value && value !== this._featureCollections) {
                this._featureCollections = value;
            }
        }
    },

    /**
     * @type {Object}
     */
    backgroundTileDelegate: {
        get: function () {
            return this._backgroundTileDelegate;
        },
        set: function (value) {
            if (value !== this._backgroundTileDelegate) {
                this._backgroundTileDelegate = value;
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this._context = this.canvas.getContext("2d");
            }
        }
    },

    draw: {
        value: function () {
            var self = this;
            this.canvas.width = this.size.width;
            this.element.style.width = this.size.width + "px";
            this.canvas.height = this.size.height;
            this.element.style.height = this.size.height + "px";
            this.drawBaseMap().then(function () {
                return Promise.all(self.featureCollections.map(function (featureCollection) {
                    return Promise.all(featureCollection.features.map(function (feature) {
                        return self.drawFeature(feature);
                    }));
                }));
            });
        }
    },

    drawBaseMap: {
        value: function () {
            var self = this,
                ctx = this._context,
                tileBounds = this.makeTileBounds(),
                tiles = tileBounds.tiles;
            if (!this.backgroundTileDelegate) {
                return Promise.resolve();
            }
            return this.backgroundTileDelegate.loadTileImages(tiles).then(function () {
                var tilesOrigin = Position.withCoordinates(tiles[0].bounds.xMin, tiles[0].bounds.yMax),
                    tilesPixelOrigin = Point2D.withPosition(tilesOrigin, self.zoom),
                    xOffset = self.mercatorViewBounds.xmin - tilesPixelOrigin.x,
                    yOffset = self.mercatorViewBounds.ymin - tilesPixelOrigin.y;
                ctx.save();
                tiles.forEach(function (tile) {
                    ctx.drawImage(tile.image, -xOffset + 256 * (tile.x - tiles[0].x), -yOffset + 256 * (tile.y - tiles[0].y));
                });
                ctx.restore();
            });
        }
    },

    makeTileBounds: {
        value: function () {
            var zoomFactor = 1 << this.zoom,
                worldPixelRange = 256 * zoomFactor,
                bounds = this.mercatorViewBounds,
                xmin = Math.floor(zoomFactor * bounds.xmin / worldPixelRange),
                xmax = Math.floor(zoomFactor * bounds.xmax / worldPixelRange),
                ymin = Math.floor(zoomFactor * bounds.ymin / worldPixelRange),
                ymax = Math.floor(zoomFactor * bounds.ymax / worldPixelRange);
            return TileBounds.withCoordinates(xmin, ymin, xmax, ymax, this.zoom, null);
        }
    },

    mercatorViewBounds: {
        get: function () {
            if (!this._mercatorViewBounds) {
                var center = Point2D.withPosition(this.center, this.zoom);
                this._mercatorViewBounds = {
                    xmin: center.x - this.size.width / 2,
                    ymin: center.y - this.size.height / 2,
                    xmax: center.x + this.size.width / 2,
                    ymax: center.y + this.size.height / 2
                }
            }
            return this._mercatorViewBounds;
        }
    },

    drawFeature: {
        value: function (feature) {
            var self = this,
                ctx = this._context,
                style = feature.style;
            if (!style) {
                return Promise.resolve();
            }
            ctx.save();
            return Promise.resolve().then(function () {
                if (style.type === StyleType.POINT) {
                    if (style.dataURL) {
                        var anchor = self.projectMercatorOntoCanvas(Point2D.withPosition(feature.geometry.coordinates, self.zoom));
                        return self._fetchImage(feature.style.dataURL).then(function (image) {
                            ctx.drawImage(image, anchor.x - image.width / 2, anchor.y - image.height / 2);
                        });
                    }
                } else if (style.type === StyleType.LINE_STRING) {
                    ctx.strokeStyle = style.strokeColor;
                    if (feature.geometry.constructor === MultiLineString) {
                        feature.geometry.coordinates.forEach(function (lineString) {
                            self._drawLineString(lineString.coordinates, ctx);
                        });
                    } else if (feature.geometry.constructor === LineString) {
                        self._drawLineString(feature.geometry.coordinates, ctx);
                    }
                } else if (style.type === StyleType.POLYGON) {
                    ctx.strokeStyle = style.strokeColor;
                    ctx.fillStyle = style.fillColor;
                    if (feature.geometry.constructor === MultiPolygon) {
                        feature.geometry.coordinates.forEach(function (polygon) {
                            self._drawPolygon(polygon.coordinates, ctx);
                        });
                    } else if (feature.geometry.constructor === Polygon) {
                        self._drawPolygon(feature.geometry.coordinates, ctx);
                    }
                }
            }).then(function () {
                ctx.restore();
            }, function (error) {
                ctx.restore();
                throw error;
            });
        }
    },

    projectMercatorOntoCanvas: {
        value: function (point) {
            var bounds = this.mercatorViewBounds,
                origin = Point2D.withCoordinates(bounds.xmin, bounds.ymin);
            return point.subtract(origin);
        }
    },

    _fetchImage: {
        value: function (src) {
            var image = new Image();
            image.src = src;
            return new Promise(function (resolve, reject) {
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = function (err) {
                    reject(err);
                }
            });
        }
    },

    _drawLineString: {
        value: function (coordinates, context) {
            var self = this,
                path = coordinates.map(function (position) {
                    var point = Point2D.withPosition(position, self.zoom);
                    return self.projectMercatorOntoCanvas(point);
                });
            context.beginPath();
            context.moveTo(path[0].x, path[0].y);
            path.forEach(function (p) {
                context.lineTo(p.x, p.y);
            });
            context.closePath();
            context.stroke();
        }
    },

    _drawPolygon: {
        value: function (coordinates, context) {
            var self = this,
                exteriorRing = coordinates[0],
                path = exteriorRing.map(function (position) {
                    var point = Point2D.withPosition(position, self.zoom);
                    return self.projectMercatorOntoCanvas(point);
                });
            context.beginPath();
            context.moveTo(path[0].x, path[0].y);
            path.forEach(function (p) {
                context.lineTo(p.x, p.y);
            });
            context.closePath();
            context.stroke();
            context.fill();
        }
    }

});
