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
    Rect = require("logic/model/rect").Rect,
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
                this._mercatorViewBounds = null;
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
                this._mercatorViewBounds = null;
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
                this._mercatorViewBounds = null;
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
                this._layers = value;
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

    featureRenderScale: {
        value: 1
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
            this.canvas.height = this.size.height;
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
                tileBounds = this.makeTileBounds();
            if (!this.backgroundTileDelegate) {
                return Promise.resolve();
            }
            return Promise.all(tileBounds.map(function (tileBounds) {
                return self.backgroundTileDelegate.loadTileImages(tileBounds.tiles);
            })).then(function () {
                var tiles = tileBounds[0].tiles,
                    tilesOrigin = Position.withCoordinates(tiles[0].bounds.xMin, tiles[0].bounds.yMax),
                    tilesPixelOrigin = Point2D.withPosition(tilesOrigin, self.zoom),
                    mercatorViewBounds = self.mercatorViewBounds,
                    xOffset = mercatorViewBounds.xMin - tilesPixelOrigin.x,
                    yOffset = mercatorViewBounds.yMin - tilesPixelOrigin.y;
                tileBounds.forEach(function (tileBounds) {
                    tiles = tileBounds.tiles;
                    ctx.save();
                    tiles.forEach(function (tile) {
                        var drawX = -xOffset + 256 * (tile.x - tiles[0].x),
                            drawY = -yOffset + 256 * (tile.y - tiles[0].y);
                        ctx.drawImage(tile.image, drawX, drawY);
                    });
                    xOffset -= (tileBounds.maxX - tileBounds.minX + 1) * 256;
                    ctx.restore();
                });
            });
        }
    },

    makeTileBounds: {
        value: function () {
            var zoom = this.zoom,
                zoomFactor = 1 << zoom,
                worldPixelRange = 256 * zoomFactor,
                mercatorViewBounds = this.mercatorViewBounds,
                rects;
            if (mercatorViewBounds.xMax > worldPixelRange) {
                rects = [
                    Rect.withOriginAndSize(
                        Point2D.withCoordinates(mercatorViewBounds.xMin, mercatorViewBounds.yMin),
                        Size.withHeightAndWidth(mercatorViewBounds.size.height, worldPixelRange - 1 - mercatorViewBounds.xMin)
                    ),
                    Rect.withOriginAndSize(
                        Point2D.withCoordinates(0, mercatorViewBounds.yMin),
                        Size.withHeightAndWidth(mercatorViewBounds.size.height, mercatorViewBounds.xMax - worldPixelRange)
                    )
                ]
            } else {
                rects = [mercatorViewBounds];
            }
            return rects.map(function (rect) {
                var xmin = Math.floor(zoomFactor * rect.xMin / worldPixelRange),
                    xmax = Math.floor(zoomFactor * rect.xMax / worldPixelRange),
                    ymin = Math.floor(zoomFactor * rect.yMin / worldPixelRange),
                    ymax = Math.floor(zoomFactor * rect.yMax / worldPixelRange);
                return TileBounds.withCoordinates(xmin, ymin, xmax, ymax, zoom, null);
            });
        }
    },

    mercatorViewBounds: {
        get: function () {
            if (!this._mercatorViewBounds) {
                var center = Point2D.withPosition(this.center, this.zoom);
                this._mercatorViewBounds = Rect.withOriginAndSize(
                    Point2D.withCoordinates(this._normalizeX(center.x - this.size.width / 2, this.zoom), center.y - this.size.height / 2),
                    this.size
                );
            }
            return this._mercatorViewBounds;
        }
    },

    _normalizeX: {
        value: function (x, z) {
            var mapSize = 256 << z;
            if (x < 0) {
                x += mapSize;
            } else if (x > mapSize) {
                x -= mapSize;
            }
            return x;
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
                var anchor;
                if (style.type === StyleType.POINT) {
                    anchor = self.projectMercatorOntoCanvas(Point2D.withPosition(feature.geometry.coordinates, self.zoom));
                    if (style.dataURL) {
                        return self._fetchImage(style.dataURL).then(function (image) {
                            ctx.drawImage(
                                image,
                                anchor.x - image.width * self.featureRenderScale / 2,
                                anchor.y - image.height * self.featureRenderScale / 2,
                                image.width * self.featureRenderScale,
                                image.height * self.featureRenderScale
                            );
                        });
                    } else if (style.icon) {
                        return self._fetchImage(style.icon.symbol).then(function (image) {
                            ctx.drawImage(
                                image,
                                anchor.x - style.icon.anchor.x * self.featureRenderScale,
                                anchor.y - style.icon.anchor.y * self.featureRenderScale,
                                style.icon.size.width * self.featureRenderScale,
                                style.icon.size.height * self.featureRenderScale
                            );
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
        value: function (point2d) {
            var mercatorViewBounds = this.mercatorViewBounds,
                worldPixelRange = 256 << this.zoom,
                rects;
            if (mercatorViewBounds.xMax > worldPixelRange) {
                rects = [
                    Rect.withOriginAndSize(
                        Point2D.withCoordinates(mercatorViewBounds.xMin, mercatorViewBounds.yMin),
                        Size.withHeightAndWidth(mercatorViewBounds.size.height, worldPixelRange - 1 - mercatorViewBounds.xMin)
                    ),
                    Rect.withOriginAndSize(
                        Point2D.withCoordinates(0, mercatorViewBounds.yMin),
                        Size.withHeightAndWidth(mercatorViewBounds.size.height, mercatorViewBounds.xMax - worldPixelRange)
                    )
                ]
            } else {
                rects = [mercatorViewBounds];
            }
            if (rects.length === 1 || rects[0].contains(point2d)) {
                return point2d.subtract(rects[0].origin);
            } else {
                return point2d.subtract(rects[1].origin).add(Point2D.withCoordinates(rects[0].size.width, 0));
            }
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
