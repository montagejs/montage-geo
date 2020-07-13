var Overlay = require("ui/overlay").Overlay,
    MapPane = require("logic/model/map-pane").MapPane,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Point = require("logic/model/point").Point;


/**
 * @class HeatmapOverlay
 * @extends Component
 */
exports.HeatmapOverlay = Overlay.specialize(/** @lends HeatmapOverlay.prototype */{

    constructor: {
        value: function HeatmapOverlay() {
            var self = this,
                redraw = function () {
                    self.needsDraw = true;
                };
            Overlay.call(this);
            this.addRangeAtPathChangeListener("collection.features", redraw);
        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The features to draw as a heatmap.
     * @type {FeatureCollection}
     */
    collection: {
        value: undefined
    },

    /**
     * @override
     */
    hasTemplate: {
        value: true
    },

    /**
     * The map that this overlays features are symbolized on.
     * @type {Map}
     */
    map: {
        get: function () {
            return this._map;
        },
        set: function (value) {
            this._map = value;
            this.needsDraw = true;
        }
    },

    maxZoom: {
        writable: false,
        value: 30
    },

    pane: {
        value: MapPane.Overlay
    },

    _levels: {
        get: function () {
            if (!this.__levels) {
                this.__levels = {};
            }
            return this.__levels;
        }
    },

    _zoom: {
        value: 0
    },

    /***********************************************************************
     * Heatmap Options
     */

    /**
     * @type {number}
     * @default {20}
     */
    blur: {
        value: 20
    },

    gradientScale: {
        value: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    },

    radius: {
        value: 20
    },

    /**
     * The color scale used for symbolizing the heat map's density.
     * To set the
     */
    gradient: {
        get: function () {
            if (!this._gradient) {
                this._gradient = this._createGradientWithColorRange(this.gradientScale);
            }
            return this._gradient;
        },
        set: function (value) {
            if (value) {
                this._gradient = this._createGradientWithColorRange(value);
            }
        }
    },

    /***********************************************************************
     * Overlay Delegate Methods
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
     * Event Handling
     */

    /**
     * @override
     */
    handleIsEnableDidChange: {
        value: function () {
            this.needsDraw = true;
        }
    },

    /***********************************************************************
     * Overlay Delegate Methods
     */

    reset: {
        value: function (center, zoom) {
            // TODO: Consider something like min/max zooms.
            // TODO: Cont'd could be in the map.
            var zoomChanged = zoom !== this._zoom;
            if (zoomChanged) {
                this._zoom = zoom;
                this._updateLevels();
            }
            // if (this._isEnabled && this.map) {
            //     this._calculatePoints();
            //     this._paint();
            // }
        }
    },

    didMove: {
        value: function () {
            if (this._isEnabled) {
                this.needsDraw = true;
            }
        }
    },

    _updateLevels: {
        value: function () {
            var currentZoom = this._zoom,
                currentLevel = this._levels[currentZoom],
                maxZoom = this.maxZoom,
                element,
                zoom;
            for (zoom in this._levels) {
                if (this._levels[zoom].element.children.length || current === zoom) {
                    this._levels[zoom].style.zIndex = maxZoom - Math.abs(currentZoom - zoom);
                    this._updateLevel(zoom);
                }
            }
            if (!currentLevel) {
                element = document.createElement("div");
                element.classList.add("montageMaps-HeatmapOverlayLevel");
                element.style.zIndex = maxZoom;
                currentLevel = {
                    element: element,
                    origin: this.map.getOriginForZoom(currentZoom),
                    zoom: currentZoom
                };

            }
        }
    },

    _updateLevel: {
        value: function () {
            return void 0;
        }
    },

    /***********************************************************************
     * Component Delegate Methods
     */

    draw: {
        value: function () {
            if (this._isEnabled && this._points) {
                this._position();
                this._paint();
            } else {
                this._clear();
            }
        }
    },

    willDraw: {
        value: function () {
            if (this._isEnabled) {
                this._calculatePoints();
            }
        }
    },

    _position: {
        value: function () {
            var map = this.map,
                size = map.size,
                center = map.center,
                pixelCenter = map.positionToPoint(center),
                offset = {
                    left: pixelCenter.x - size.width / 2,
                    top: pixelCenter.y - size.height / 2
                };
            this.element.style.transform = "translate3d(" + offset.left + "px, " + offset.top + "px, 0)";
            this.element.setAttribute("width", size.width);
            this.element.setAttribute("height", size.height);
        }
    },

    _calculatePoints: {
        value: function () {
            var self = this,
                features = this.collection && this.collection.features || [],
                map = this.map;

            // TODO: Switch to features.
            this._points = features.reduce(function (accumlator, feature) {
                var geometry = feature.geometry;
                if (self._isMultiPartGeometry(geometry)) {
                    geometry.coordinates.forEach(function (subcomponent) {
                        if (typeof subcomponent.bounds === "function") {
                            accumlator.push(map.positionToContainerPoint(subcomponent.bounds().center));
                        } else {
                            accumlator.push(map.positionToContainerPoint(subcomponent));
                        }
                    });
                } else {
                    accumlator.push(map.positionToContainerPoint(feature.geometry.bounds().center));
                }
                return accumlator;
            }, []);

        }
    },

    _isMultiPartGeometry: {
        value: function (geometry) {
            return  geometry instanceof MultiLineString ||
                    geometry instanceof MultiPolygon ||
                    geometry instanceof MultiPoint;
        }
    },

    /**************************************************************************
     * Drawing the overlay
     */

    /**
     * @type {Canvas}
     */
    _circle: {
        get: function () {
            if (!this.__circle) {
                this.__circle = this._initializeCircle(this.radius, this.blur);
            }
            return this.__circle;
        }
    },

    _clear: {
        value: function () {
            var element = this.element,
                context = element.getContext("2d");
            context.clearRect(0, 0, element.width, element.height);
        }
    },

    _colorize: {
        value: function (pixels, gradient) {
            var i, j, len;
            for (i = 3, len = pixels.length, j; i < len; i += 4) {
                j = pixels[i] * 4; // get gradient color from opacity value

                if (j) {
                    pixels[i - 3] = gradient[j];
                    pixels[i - 2] = gradient[j + 1];
                    pixels[i - 1] = gradient[j + 2];
                }
            }
        }
    },

    _createGradientWithColorRange: {
        value: function (colorRange) {

            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                gradient = ctx.createLinearGradient(0, 0, 0, 256),
                index;

            canvas.width = 1;
            canvas.height = 256;

            for (index in colorRange) {
                gradient.addColorStop(index, colorRange[index]);
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1, 256);

            return ctx.getImageData(0, 0, 1, 256).data;
        }
    },

    _initializeCircle: {
        value: function (radius, blur) {

            var circle = document.createElement('canvas'),
                context = circle.getContext('2d'),
                blurredRadius = this._radius = radius + blur;

            circle.width = circle.height = blurredRadius * 2;

            context.shadowOffsetX = context.shadowOffsetY = 200;
            context.shadowBlur = blur;
            context.shadowColor = 'black';

            context.beginPath();
            context.arc(blurredRadius - 200, blurredRadius - 200, radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();

            return circle;
        }
    },

    _paint: {
        value: function () {
            var element = this.element,
                context = element.getContext("2d"),
                height = element.height,
                width = element.width,
                circle = this._circle,
                self = this,
                colored;

            this._clear();
            this._points.forEach(function (point) {
                context.globalAlpha = 0.1;
                context.drawImage(circle, point.x - self._radius, point.y - self._radius);
            });

            colored = context.getImageData(0, 0, width, height);
            this._colorize(colored.data, this.gradient);
            context.putImageData(colored, 0, 0);
        }
    },

    /**
     * The array of points to draw on the overlay.  Calculated from the
     * feature's geometry.
     * @type {Point2D[]}
     */
    _points: {
        value: undefined
    }

});
