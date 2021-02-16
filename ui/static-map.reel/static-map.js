/**
 * @module "ui/static-map.reel"
 */
var BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Component = require("montage/ui/component").Component,
    LineString = require("logic/model/line-string").LineString,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Position = require("logic/model/position").Position,
    Point2D = require("logic/model/point-2d").Point2D,
    Polygon = require("logic/model/polygon").Polygon,
    Promise = require("montage/core/promise").Promise,
    Rect = require("logic/model/rect").Rect,
    Size = require("logic/model/size").Size,
    StyleType = require("logic/model/style").StyleType,
    TileBounds = require("logic/model/tile-bounds").TileBounds;

/**
 * @class StaticMap
 * @extends Component
 */
exports.StaticMap = Component.specialize(/** @lends StaticMap.prototype */{

    constructor: {
        value: function StaticMap() {
            this.defineBinding("renderSize", {"<-": "size.multiply(devicePixelRatio)"});
            this.defineBinding("zoom", {"<-": "_optimalZoomLevel(bounds, renderSize)"});
            this.defineBinding("webMercatorRect", {"<-": "bounds.toRect(zoom)"});
            this.addOwnPropertyChangeListener("webMercatorRect", this);
        }
    },


    /**
     * Set by owner
     * // TODO: Standardize on the tile delegate instead.
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

    /**
     * Set by owner
     * @type {BoundingBox}
     */
    bounds: {
        get: function () {
            if (!this._bounds) {
                this._bounds = BoundingBox.withCoordinates(-10, -10, 10, 10);
            }
            return this._bounds;
        },
        set: function (value) {
            if (value && value !== this._bounds) {
                this._bounds = value;
            }
        }
    },

    /**
     *
     * @type {Number}
     */
    devicePixelRatio: {
        get: function () {
            if (!this._dpr) {
                this._dpr = window.devicePixelRatio;
            }
            return this._dpr;
        },
        set: function (value) {
            if (value !== this._dpr) {
                this._dpr = value;
                this._mercatorViewBounds = null; // used?
            }
        }
    },

    /**
     * The additional features to present on the map.
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
     * A coefficient computed by dividing the web mercator rect by the print's
     * width;
     * @type {number}
     */
    featureRenderScale: {
        get: function () {
            return this.webMercatorRect.width / this.size.width;
        }
    },

    /**
     * The layers to display on the static map.
     * Set by owner.
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
                this._mercatorViewBounds = null; // used?
            }
        }
    },

    /**
     * The delegate to use for requesting images.
     * @type {TileDelegate}
     */
    tileDelegate: {
        value: undefined
    },

    /**
     * The value of this property is calculated from the assigned bounds and
     * the computed zoom level.
     * @type {Rect}
     */
    webMercatorRect: {
        value: undefined
    },

    _optimalZoomLevel: {
        value: function (bounds, renderSize) {
            var zoom = 1,
                rect = bounds.toRect(zoom);
            while (
                (rect = bounds.toRect(zoom)) &&
                (rect.width < renderSize.width || rect.height < renderSize.height)
            ) {
                ++zoom;
            }
            return zoom;
        }
    },

    /**************************************************************************
     * Event Handlers
     */

    handlePropertyChange: {
        value: function () {
            this.needsDraw = true;
        }
    },

    /**************************************************************************
     * Component Delegate Methods
     */

    draw: {
        value: function () {
            var self = this;
            this.canvas.width = this.webMercatorRect.width;
            this.canvas.height = this.webMercatorRect.height;
            this.canvas.style.width = this.size.width + "px";
            this.canvas.style.height = this.size.height + "px";
            this._drawBaseMap().then(function () {
                return self.tileDelegate && self._drawLayers(self.layers.slice()) || null;
            }).then(function () {
                return Promise.all(self.featureCollections.map(function (featureCollection) {
                    return Promise.all(featureCollection.features.map(function (feature) {
                        return self.drawFeature(feature);
                    }));
                }));
            });
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this._context = this.canvas.getContext("2d");
            }
        }
    },

    _drawBaseMap: {
        value: function () {
            var self = this,
                tileBounds = this.makeTileBounds();
            if (!this.backgroundTileDelegate) {
                return Promise.resolve();
            }
            return Promise.all(tileBounds.map(function (tileBounds) {
                return self.backgroundTileDelegate.loadTileImages(tileBounds.tiles);
            })).then(function () {
                self._drawTileBoundSetWithOpacity(tileBounds, 1.0);
            });
        }
    },

    _drawLayers: {
        value: function (layers) {
            layers = layers || [];
            return layers.length > 0 ? this._drawFirstLayer(layers) : null;
        }
    },

    _drawFirstLayer: {
        value: function (layers) {
            var layer = layers.shift(),
                tileBoundsSet = this.makeTileBounds(),
                self = this;
            return Promise.all(tileBoundsSet.map(function (tileBounds) {
                return self.tileDelegate.loadImagesForTileAndLayer(tileBounds.tiles, layer);
            })).then(function () {
                self._drawTileBoundSetWithOpacity(tileBoundsSet, layer.opacity);
                return self._drawLayers(layers);
            });
        }
    },

    _drawTileBoundSetWithOpacity: {
        value: function (tileBoundsSet, opacity) {
            var tiles = tileBoundsSet[0].tiles,
                tilesOrigin = Position.withCoordinates(tiles[0].bounds.xMin, tiles[0].bounds.yMax),
                tilesPixelOrigin = Point2D.withPosition(tilesOrigin, this.zoom),
                xOffset = this.webMercatorRect.xMin - tilesPixelOrigin.x,
                yOffset = this.webMercatorRect.yMin - tilesPixelOrigin.y,
                ctx = this._context;
            opacity = isNaN(opacity) ? 1.0 : opacity;
            tileBoundsSet.forEach(function (tileBounds) {
                tiles = tileBounds.tiles;
                ctx.save();
                ctx.globalAlpha = opacity;
                tiles.forEach(function (tile) {
                    var drawX = -xOffset + 256 * (tile.x - tiles[0].x),
                        drawY = -yOffset + 256 * (tile.y - tiles[0].y);
                    ctx.drawImage(tile.image, drawX, drawY);
                });
                xOffset -= (tileBounds.maxX - tileBounds.minX + 1) * 256;
                ctx.restore();
            });
        }
    },


    makeTileBounds: {
        value: function () {
            var zoom = this.zoom,
                zoomFactor = 1 << zoom,
                worldPixelRange = 256 * zoomFactor;
            return this._webMercatorRectSplitOverAntimeridian.map(function (rect) {
                var xmin = Math.floor(zoomFactor * rect.xMin / worldPixelRange),
                    xmax = Math.floor(zoomFactor * rect.xMax / worldPixelRange),
                    ymin = Math.floor(zoomFactor * rect.yMin / worldPixelRange),
                    ymax = Math.floor(zoomFactor * rect.yMax / worldPixelRange);
                return TileBounds.withCoordinates(xmin, ymin, xmax, ymax, zoom, null);
            });
        }
    },

    _webMercatorRectSplitOverAntimeridian: {
        get: function () {
            var worldPixelRange = 256 << this.zoom,
                rects;
            if (this.webMercatorRect.xMax > worldPixelRange) {
                rects = [
                    Rect.withOriginAndSize(
                        Point2D.withCoordinates(this.webMercatorRect.xMin, this.webMercatorRect.yMin),
                        Size.withHeightAndWidth(this.webMercatorRect.size.height, worldPixelRange - 1 - this.webMercatorRect.xMin)
                    ),
                    Rect.withOriginAndSize(
                        Point2D.withCoordinates(0, this.webMercatorRect.yMin),
                        Size.withHeightAndWidth(this.webMercatorRect.size.height, this.webMercatorRect.xMax - worldPixelRange)
                    )
                ];
            } else {
                rects = [this.webMercatorRect];
            }
            return rects;
        }
    },

    /**************************************************************************
     * Drawing Features
     */

    drawFeature: {
        value: function (feature) {
            var self = this,
                ctx = this._context,
                style = feature.style,
                size;
            if (!style) {
                return Promise.resolve();
            }
            ctx.save();
            // TODO Refactor
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
                            anchor = style.anchor || self.projectMercatorOntoCanvas(
                                Point2D.withPosition(feature.geometry.coordinates, self.zoom)
                            );
                            size = style.icon.scaledSize || style.icon.size || Size.withHeightAndWidth(image.height, image.width);
                            ctx.drawImage(
                                image,
                                anchor.x - size.width * self.featureRenderScale / 2,
                                anchor.y - size.height * self.featureRenderScale / 2,
                                size.width * self.featureRenderScale,
                                size.height * self.featureRenderScale
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
            var rects = this._webMercatorRectSplitOverAntimeridian;
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
