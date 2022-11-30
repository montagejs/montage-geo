var Component = require("montage/ui/component").Component,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Enum = require("montage/core/enum").Enum,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    L = require("leaflet"),
    GeometryCollection = require("logic/model/geometry-collection").GeometryCollection,
    LineString = require("logic/model/line-string").LineString,
    Map = require("montage/collections/map"),
    MapPane = require("logic/model/map-pane").MapPane,
    MultiLineString = require("logic/model/multi-line-string").MultiLineString,
    MultiPoint = require("logic/model/multi-point").MultiPoint,
    MultiPolygon = require("logic/model/multi-polygon").MultiPolygon,
    Point = require("logic/model/point").Point,
    Point2D = require("logic/model/point-2d").Point2D,
    Polygon = require("logic/model/polygon").Polygon,
    Position = require("logic/model/position").Position,
    Set = require("montage/collections/set"),
    Size = require("logic/model/size").Size,
    Tile = require("logic/model/tile").Tile,
    WeakMap = require("montage/collections/weak-map"),
    DEFAULT_ZOOM = 4;

var DRAW_QUEUE_COMMANDS = new Enum().initWithMembers("DRAW", "ERASE", "REDRAW");
var GEOMETRY_CONSTRUCTOR_TYPE_MAP = new Map();
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(GeometryCollection, "GeometryCollection");
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(LineString, "LineString");
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(MultiLineString, "MultiLineString");
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(MultiPoint, "MultiPoint");
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(MultiPolygon, "MultiPolygon");
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(Point, "Point");
GEOMETRY_CONSTRUCTOR_TYPE_MAP.set(Polygon, "Polygon");

/**
 * @class LeafletEngine
 * @extends Component
 */
exports.LeafletEngine = Component.specialize(/** @lends LeafletEngine# */ {

    constructor: {
        value: function LeafletEngine() {
            this.addOwnPropertyChangeListener("baseMap", this);
        }
    },

    /**************************************************************************
     * Properties
     */

    baseMap: {
        value: undefined
    },

    /**
     * The current bounds of the map.
     *
     * @public
     * @type {BoundingBox}
     */
    bounds: {
        get: function () {
            if (!this._bounds) {
                this._bounds = BoundingBox.withCoordinates(0, 0, 0, 0);
            }
            return this._bounds;
        },
        set: function (value) {
            var xMax;
            if (this._map) {
                xMax = value.xMax;
                if (xMax < value.xMin) {
                    xMax += 360;
                }
                this._map.fitBounds([
                    [value.yMin, value.xMin],
                    [value.yMax, value.xMax]
                ]);
            }
        }
    },

    /**
     * The current center of the map.
     *
     * @public
     * @type {Point}
     */
    center: {
        get: function () {
            return this._center;
        },
        set: function (value) {
            var isPoint = value instanceof Position;
            if (isPoint && this._map) {
                this._setCenter(value.longitude, value.latitude);
            } else if (isPoint) {
                this._center = value;
            }
        }
    },

    map: {
        value: undefined
    },

    /**
     * The maximum bounds for the map.  The user is prevented from travelling
     * outside the maximum bounds.
     *
     * @public
     * @type {BoundingBox}
     */
    maxBounds: {
        value: undefined
    },

    /**
     * @type {}
     */
    mode: {
        value: undefined
    },

    /**
     * The current pixel origin of the map.  Overlays may need to adjust their
     * position based upon the pixel origin.
     *
     * @public
     * @type {montage-maps/logic/model/Point}
     * @readonly
     */
    pixelOrigin: {
        get: function () {
            if (!this._pixelOrigin) {
                this._pixelOrigin = Point2D.withCoordinates(0, 0);
            }
            return this._pixelOrigin;
        }
    },

    /**
     * The pixel dimensions of the map.
     * @type {Size}
     */
    size: {
        value: undefined
    },

    /**
     * The current zoom level of the map.
     *
     * @public
     * @type {Number}
     * @readonly
     */
    zoom: {
        get: function () {
            return this._zoom;
        },
        set: function (value) {
            var zoomChanged = value !== this._zoom;
            if (zoomChanged && this._map) {
                this._setZoom(value);
            } else if (zoomChanged) {
                this._zoom = value;
            }
        }
    },

    _leafletLayers: {
        get: function () {
            if (!this.__leafletLayers) {
                this.__leafletLayers = new Map();
            }
            return this.__leafletLayers;
        }
    },

    _setCenter: {
        value: function (longitude, latitude) {
            this._map && this._map.setView({
                lng: longitude,
                lat: latitude
            });
        }
    },

    _setZoom: {
        value: function (zoom) {
            this._map && this._map.setZoom(zoom);
        }
    },

    /**************************************************************************
     * Coordinate Projection
     */

    getOriginForZoom: {
        value: function (zoom) {
            var map = this._map;
            return map.project(map.unproject(map.getPixelOrigin()), zoom).round();
        }
    },

    /**
     * Returns the geographic coordinate associated with this pixel location.
     * If a position is passed as the second argument it will be used instead
     * of creating a new position.
     * @param {Point2D}
     * @returns {Position}
     */
    pointToPosition: {
        value: function (point, position) {
            var coordinate = this._map.layerPointToLatLng([point.x, point.y]);
            coordinate.lng = this._normalizedLongitude(coordinate.lng);
            position = position || new Position();
            position.longitude = coordinate.lng;
            position.latitude = coordinate.lat;
            return position;
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
            var longitude = this._normalizedLongitude(position.longitude),
                point = this._map.latLngToLayerPoint([position.latitude, longitude]);
            return Point2D.withCoordinates(point.x, point.y);
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
            var longitude = this._normalizedLongitude(position.longitude),
                point = this._map.latLngToContainerPoint([position.latitude, longitude]);
            return Point2D.withCoordinates(point.x, point.y);
        }
    },

    // Note: Original version of this function supported passing an array or
    // a position.  Maybe legacy baggage?  Removing for now.
    _normalizedLongitude: {
        value: function (longitude) {
            var currentCenter = this._map.getCenter(),
                centerLng = currentCenter.lng,
                latitude = currentCenter.lat,
                distance = this._distanceBetweenPoints([longitude, latitude], [centerLng, latitude]),
                i = 0;
            while (distance > 180) {
                distance -= 360;
                i++;
            }
            return longitude + i * (centerLng > longitude ? 360 : -360);
        }
    },

    _distanceBetweenPoints: {
        value: function (point1, point2) {
            var distanceX = point1[0] - point2[0],
                distanceY = point1[1] - point2[1];
            return Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
        }
    },

    /**************************************************************************
     * Add / Remove Features
     */

    drawFeature: {
        value: function (feature, processImmediately) {
            this._prepareFeatureForDrawing(feature);
            if (processImmediately && this._map) {
                this._drawFeature(feature);
            } else {
                this._featureQueue.set(feature, DRAW_QUEUE_COMMANDS["DRAW"]);
                this.needsDraw = true;
            }
        }
    },

    eraseFeature: {
        value: function (feature, processImmediately) {
            if (processImmediately && this._map) {
                this._eraseFeature(feature);
            } else {
                this._featureQueue.set(feature, DRAW_QUEUE_COMMANDS["ERASE"]);
                this.needsDraw = true;
            }
        }
    },

    redrawFeature: {
        value: function (feature, processImmediately) {
            this._prepareFeatureForDrawing(feature);
            if (processImmediately && this._map) {
                this._redrawFeature(feature)
            } else {
                this._featureQueue.set(feature, DRAW_QUEUE_COMMANDS["REDRAW"]);
                this.needsDraw = true;
            }
        }
    },

    _drawFeature: {
        value: function (feature) {
            var self;
            if (!this._features.has(feature)) {
                self = this;
                this._symbols.forEach(function (featureSymbolMap, identifier) {
                    var symbol = self._drawSymbol(feature, identifier * 360);
                    featureSymbolMap.set(feature, symbol);
                });
                this._features.add(feature);
            }
        }
    },

    _eraseFeature: {
        value: function (feature, willRedraw) {
            var self = this;
            this._symbols.forEach(function (featureSymbolMap) {
                var symbol = featureSymbolMap.get(feature);
                if (symbol) {
                    self._removeSymbol(symbol);
                    featureSymbolMap.delete(feature);
                }
            });
            if (this._features.has(feature)) {
                this._features.delete(feature);
            }
            if (this._processedCoordinates.has(feature) && !willRedraw) {
                this._processedCoordinates.delete(feature);
            }
        }
    },

    _redrawFeature: {
        value: function (feature) {
            var self = this;
            this._symbols.forEach(function (featureSymbolMap, identifier) {
                var symbol = featureSymbolMap.get(feature);
                self._removeSymbol(symbol);
                symbol = self._drawSymbol(feature, identifier * 360);
                featureSymbolMap.set(feature, symbol);
            });
        }
    },

    _prepareFeatureForDrawing: {
        value: function (feature) {
            var processedCoordinates = this._processCoordinates(feature.geometry);
            this._processedCoordinates.set(feature, processedCoordinates);
        }
    },

    _processCoordinates: {
        value: function (geometry) {
            var symbolId = GEOMETRY_CONSTRUCTOR_TYPE_MAP.get(geometry.constructor),
                symbolizer = Symbolizer.forId(symbolId);
            return symbolizer.project(geometry.coordinates || geometry.geometries);
        }
    },

    _featureQueue: {
        get: function () {
            if (!this.__featureQueue) {
                this.__featureQueue = new Map();
            }
            return this.__featureQueue;
        }
    },

    /**************************************************************************
     * Panes & Overlay Registration
     */

    /**
     * Adds an overlay to the map to the specified pane.
     * @param {Component} - The overlay to add.
     */
    addOverlay: {
        value: function (component) {
            var overlays = this._overlays;

            if (overlays.has(component)) {
                return;
            }

            overlays.push(component);
            this._queuedOverlays.push({
                overlay: component,
                action: "add"
            });
            this.needsDraw = true;
        }
    },

    /**
     * Adds an overlay to the map to the specified pane.
     * @param {Component} - The overlay to add.
     */
    removeOverlay: {
        value: function (component) {
            var overlays = this._overlays,
                index = overlays.indexOf(component);

            if (index === -1) {
                return;
            }

            overlays.splice(index, 1);
            this._queuedOverlays.push({
                overlay: component,
                action: "remove"
            });
            this.needsDraw = true;
        }
    },

    /**
     *
     * Returns a pane i.e. element to embed an overlay.  Because different
     * engines have different names for the panes, this method normalizes
     * the id to be used for the panes.
     * @public
     * @override
     * @param {string}
     * @returns {Element} the pane
     */
    elementForPane: {
        value: function (pane) {
            var map, element;
            if (map = this._map) {
                switch (pane) {
                    case MapPane.Drawing:
                    case MapPane.Overlay:
                        element = map.getPanes()["overlayPane"];
                        break;
                    case MapPane.PopUp:
                        element = map.getPanes()["popupPane"];
                        break;
                    case MapPane.Raster:
                        element = map.getPanes()["tilePane"];
                        break;
                }
            }
            return element;
        }
    },

    _queuedOverlays: {
        get: function () {
            if (!this.__queuedOverlays) {
                this.__queuedOverlays = [];
            }
            return this.__queuedOverlays;
        }
    },

    _overlays: {
        get: function () {
            if (!this.__overlays) {
                this.__overlays = [];
            }
            return this.__overlays;
        }
    },

    _processOverlayQueue: {
        value: function () {
            var queue = this._queuedOverlays,
                queuedItem;
            while (queuedItem = queue.shift()) {
                if (queuedItem.action === "add") {
                    this._addQueueItemToMap(queuedItem);
                } else if (queuedItem.action === "remove") {
                    this._removeQueueItemFromMap(queuedItem);
                }
            }
        }
    },

    _addQueueItemToMap: {
        value: function (queuedItem) {
            var component = queuedItem.overlay,
                pane = component.pane || MapPane.Overlay,
                container = this.elementForPane(pane),
                element = component.element;
            if (element && container) {
                container.appendChild(component.element);
            }
            component.didAdd(this);

            // if (pane === MapPane.Raster || pane == MapPane.Overlay) {
            //     this._resizeOverlay(component);
            // }

        }
    },

    _removeQueueItemFromMap: {
        value: function (queuedItem) {
            var component = queuedItem.overlay,
                pane = component.pane || MapPane.Overlay,
                container = this.elementForPane(pane);
            if (container) {
                container.removeChild(component.element);
            }
            component.didRemove(this);
        }
    },

    /**************************************************************************
     * Feature Events
     */

    _onSymbolClick: {
        value: function (event) {
            var coordinate = exports.LeafletEngine.Position.withCoordinates(event.latlng.lng, event.latlng.lat),
                feature = this._symbolFeatureMap.get(event.target);
            if (feature) {
                this._handleFeatureClick(feature, coordinate);
            }
        }
    },

    _onSymbolMouseover: {
        value: function (event) {
            var coordinate = exports.LeafletEngine.Position.withCoordinates(event.latlng.lng, event.latlng.lat),
                feature = this._symbolFeatureMap.get(event.target);

            if (feature) {
                this._handleFeatureMouseover(feature, coordinate);
            }
        }
    },

    _onSymbolMouseout: {
        value: function (event) {
            var coordinate = exports.LeafletEngine.Position.withCoordinates(event.latlng.lng, event.latlng.lat),
                feature = this._symbolFeatureMap.get(event.target);

            if (feature) {
                this._handleFeatureMouseout(feature, coordinate);
            }
        }
    },

    _handleFeatureClick: {
        value: function (feature, coordinate) {
            var isHidden = this._isCoordinateHidden(coordinate);
            if (this._inPanMode && !isHidden) {
                this.dispatchEventNamed("featureSelection", true, true, {
                    coordinate: coordinate,
                    feature: feature
                });
            }
        }
    },

    _handleFeatureMouseover: {
        value: function (feature, coordinate) {
            var isHidden = this._isCoordinateHidden(coordinate),
                timer = this._mousedOverFeatureEvents.get(feature),
                mouseOutTimer = this._mousedOutFeatureEvents.get(feature),
                self = this;

            if (mouseOutTimer) {
                this._mousedOutFeatureEvents.delete(feature);
                clearTimeout(mouseOutTimer);
            }
            if (this._inPanMode && !timer && !isHidden) {
                timer = setTimeout(function () {
                    self.dispatchEventNamed("featureMouseover", true, true, {
                        coordinate: coordinate,
                        feature: feature
                    });
                    self._mousedOverFeatureEvents.delete(feature);
                }, 250);
                this._mousedOverFeatureEvents.set(feature, timer);
            }
        }
    },

    _handleFeatureMouseout: {
        value: function (feature, coordinate) {
            var mousedOverTimer = this._mousedOverFeatureEvents.get(feature),
                mouseOutTimer,
                self;
            if (mousedOverTimer) {
                this._mousedOverFeatureEvents.delete(feature);
                clearTimeout(mousedOverTimer);
            }
            self = this;
            mouseOutTimer = setTimeout(function () {
                self.dispatchEventNamed("featureMouseout", true, true, {
                    coordinate: coordinate,
                    feature: feature
                });
                self._mousedOutFeatureEvents.delete(feature);
            }, 250);
            this._mousedOutFeatureEvents.set(feature, mouseOutTimer);
        }
    },

    _mousedOverFeatureEvents: {
        get: function () {
            if (!this.__mousedOverFeatureEvents) {
                this.__mousedOverFeatureEvents = new Map();
            }
            return this.__mousedOverFeatureEvents;
        }
    },

    _mousedOutFeatureEvents: {
        get: function () {
            if (!this.__mousedOutFeatureEvents) {
                this.__mousedOutFeatureEvents = new Map();
            }
            return this.__mousedOutFeatureEvents;
        }
    },

    _inPanMode: {
        get: function () {
            return true;
            // return this.mapComponent.currentMode === Mode["Pan"];
        }
    },

    _isCoordinateHidden: {
        value: function (coordinate) {
            return false;
            // return this._isHiddenBehindMapTip(coordinate) || this._isHiddenBehindFigure(coordinate);
        }
    },

    /**************************************************************************
     * Draw Cycle
     */

    draw: {
        value: function () {
            var self = this,
                worlds;

            if (this._map && this._worldsDidChange) {
                worlds = this._worlds;
                worlds.forEach(function (identifier) {
                    if (!self._symbols.get(identifier)) {
                        self._initializeWorldSymbols(identifier);
                    }
                });
                this._symbols.forEach(function (featureSymbolMap, key) {
                    if (!worlds.has(key)) {
                        featureSymbolMap.forEach(function (symbol) {
                            self._removeSymbol(symbol);
                        });
                        self._symbols.delete(key);
                    }
                });
                this._worldsDidChange = false;
            }

            if (this._map) {
                this._processOverlayQueue();
            }

            if (this._map) {
                this._processFeatureQueue();
            }

            if (this._featureQueue.size || this._worldsDidChange || this._queuedOverlays.length) {
                setTimeout(function () {
                    self.needsDraw = true;
                }, 100);
            }
        }
    },

    willDraw: {
        value: function () {
            var size,
                mapDimensions,
                elementSize,
                mapSize;
            if (this._map) {
                elementSize = Size.withHeightAndWidth(this.element.offsetHeight, this.element.offsetWidth);
                size = this.size;
                mapDimensions = this._map.getSize();
                mapSize = Size.withHeightAndWidth(mapDimensions.y, mapDimensions.x);
                if (elementSize && mapSize && !elementSize.equals(mapSize)) {
                    this._map.invalidateSize();
                    this.size = elementSize;
                } else if (!size || !size.equals(mapSize)) {
                    this.size = mapSize;
                }
            }
        }
    },

    didDraw: {
        value: function () {
            var mapDimensions,
                elementSize,
                mapSize;
            if (this._map) {
                elementSize = Size.withHeightAndWidth(this.element.offsetHeight, this.element.offsetWidth);
                mapDimensions = this._map.getSize();
                mapSize = Size.withHeightAndWidth(mapDimensions.y, mapDimensions.x);
                if (elementSize && mapSize && !elementSize.equals(mapSize)) {
                    this.needsDraw = true;
                }
            }
        }
    },

    _processFeatureQueue: {
        value: function () {
            var queueIterator = this._featureQueue.keys(),
                feature, action;
            while (this._map && (feature = queueIterator.next().value)) {
                action = this._featureQueue.get(feature);
                if (action === DRAW_QUEUE_COMMANDS["DRAW"]) {
                    this._drawFeature(feature);
                } else if (action === DRAW_QUEUE_COMMANDS["ERASE"]) {
                    this._eraseFeature(feature);
                } else if (action === DRAW_QUEUE_COMMANDS["REDRAW"]) {
                    this._eraseFeature(feature, true);
                    this._drawFeature(feature);
                }
            }
            this._featureQueue.clear();
        }
    },

    _initializeWorldSymbols: {
        value: function (identifier) {
            var offset = identifier * 360,
                featureSymbolsMap = new Map(),
                symbol,
                self = this;
            this._features.forEach(function (feature) {
                symbol = self._drawSymbol(feature, offset);
                featureSymbolsMap.set(feature, symbol);
            });
            this._symbols.set(identifier, featureSymbolsMap);
        }
    },

    _worldsDidChange: {
        value: false
    },

    /**************************************************************************
     * Drawing Features / Symbols
     */

    // TODO: Determine should this be drawSymbols?
    _drawSymbols: {
        value: function (features) {
            var self = this,
                feature, i, n;
            for (i = 0, n = features.length; i < n; i += 1) {
                feature = features[i];
                this._symbols.forEach(function (featureSymbolMap, identifier) {
                    var symbol = self._drawSymbol(feature, identifier * 360);
                    featureSymbolMap.set(feature, symbol);
                });
            }
        }
    },

    // TODO: Determine should this be drawSymbol?
    _drawSymbol: {
        value: function (feature, offset) {
            var geometry = feature.geometry,
                symbolId = GEOMETRY_CONSTRUCTOR_TYPE_MAP.get(geometry.constructor),
                symbolizer = Symbolizer.forId(symbolId),
                coordinates = this._processedCoordinates.get(feature),
                symbols = symbolizer.draw(coordinates, offset, feature.style),
                symbolFeatureMap = this._symbolFeatureMap,
                map = this._map;

            if (symbolizer.isMultiGeometry) {
                symbols.forEach(function (symbol) {
                    symbol.addTo(map);
                    symbolFeatureMap.set(symbol, feature);
                    symbol.on("click", this._onSymbolClick.bind(this));
                    symbol.on("mouseout", this._onSymbolMouseout.bind(this));
                    symbol.on("mouseover", this._onSymbolMouseover.bind(this));
                }, this);
            } else {
                symbols.addTo(map);
                symbolFeatureMap.set(symbols, feature);
                symbols.on("click", this._onSymbolClick.bind(this));
                symbols.on("mouseout", this._onSymbolMouseout.bind(this));
                symbols.on("mouseover", this._onSymbolMouseover.bind(this));
            }

            return symbols;
        }
    },

    _removeSymbols: {
        value: function (symbols) {
            var i, n;
            for (i = 0, n = symbols.length; i < n; i += 1) {
                this._removeSymbol(symbols[i]);
            }
        }
    },

    _removeSymbol: {
        value: function (symbols) {
            var map = this._map,
                symbolFeatureMap = this._symbolFeatureMap;
            if (Array.isArray(symbols)) {
                symbols.forEach(function (symbol) {
                    map.removeLayer(symbol);
                    symbolFeatureMap.delete(symbol);
                });
            } else {
                map.removeLayer(symbols);
                symbolFeatureMap.delete(symbols);
            }
        }
    },

    _processedCoordinates: {
        get: function () {
            if (!this.__processedCoordinates) {
                this.__processedCoordinates = new Map();
            }
            return this.__processedCoordinates;
        }
    },

    /**************************************************************************
     * Internal Variables
     */

    /**
     * @private
     * @type {Leaflet.Map}
     */
    _map: {
        value: undefined
    },

    /**
     *
     * The current set of visible "Worlds".  To compensate for a limitation
     * with Leaflet the leaflet engine needs to keep track of which copy (or
     * copies) of the world is currently visible.  Crossing the anti-meridian
     * by travelling West or East will result in going to a new world.  Worlds
     * are identified by the number of times the World has rotated East (posi-
     * tive) or West (negative).
     *
     * @private
     * @type {Set<number>}
     */
    _worlds: {
        get: function () {
            var self;
            if (!this.__worlds) {
                self = this;
                this.__worlds = new Set();
                this.__worlds.addRangeChangeListener(function () {
                    self._worldsDidChange = true;
                    self.needsDraw = true;
                });
            }
            return this.__worlds;
        }
    },

    /**
     * The set of all features that have been added to the engine.  The engine
     * needs this set to keep track of which features have been added so that
     * it can redraw them when the map rotates to a copy of the world.
     * @private
     * @type {Set<Feature>}
     */
    _features: {
        get: function () {
            if (!this.__features) {
                this.__features = new Set();
            }
            return this.__features;
        }
    },

    /**
     * A map whose key is a World identifier and whose value is a map of features
     * to symbols that exist for that copy of the World.
     *
     * @private
     * @type {Map<Number, Map<Feature, Symbol|Array<Symbol>>}
     */
    _symbols: {
        get: function () {
            if (!this.__symbols) {
                this.__symbols = new Map();
            }
            return this.__symbols;
        }
    },

    _symbolFeatureMap: {
        get: function () {
            if (!this.__symbolFeatureMap) {
                this.__symbolFeatureMap = new Map();
            }
            return this.__symbolFeatureMap;
        }
    },

    /*****************************************************
     * Component Delegate methods
     */

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this._initialize();
            } else if (this._map) {
                this._map.invalidateSize();
            }
        }
    },

    /*****************************************************
     * Initialization
     */

    /**
     * Responsible for various stages of map initialization.
     * @private
     * @method
     */
    _initialize: {
        value: function () {
            this._loadLeafletCSS();
            this._initializeMap();
        }
    },

    /**
     * Responsible for initializing the Leaflet map and setting the default
     * options as well as location.
     * @private
     * @method
     */
    _initializeMap: {
        value: function () {
            var width = this.element.offsetWidth,
                height = this.element.offsetHeight,
                position = this.center,
                zoom = isNaN(this.zoom) ? DEFAULT_ZOOM : this.zoom,
                minZoom = this._minZoomForDimensions(width, height),
                center = [position.latitude, position.longitude],
                map = L.map(this.element, {
                    doubleClickZoom: true,
                    dragging: true,
                    minZoom: minZoom,
                    zoomControl: false
                });
            this._map = map;
            map.whenReady(this._completeInitialization.bind(this));
            map.setView(center, (minZoom > zoom ? minZoom : zoom));
            this._updateWorlds();
        }
    },

    _completeInitialization: {
        value: function () {
            this._initializeEvents();
            this._initializeBaseMap();
            this.needsDraw = true;
        }
    },

    // TODO - remove this method.  The base map should be added via a layer.
    _initializeBaseMap: {
        value: function () {
            var map = this._map;
            if (map) {
                new L.BingLayer("", {
                    minZoom: 0,
                    maxZoom: 18
                }).addTo(map);
            }
        }
    },

    /**
     * Responsible for initializing event listeners on the Leaflet Map
     *
     * @private
     * @method
     */
    _initializeEvents: {
        value: function () {
            this._map.addEventListener("click", this._handleMapClick.bind(this));
            this._map.addEventListener("move", this._handleMapMove.bind(this));
            this._map.addEventListener("moveend", this._handleMapDidMove.bind(this));
            this._map.addEventListener("resize", this._handleResize.bind(this));
            this._map.addEventListener("viewreset", this._handleViewReset.bind(this));
            this._map.addEventListener("zoomanim", this._handleZoomAnimation.bind(this));
            this._map.addEventListener("zoom", this._handleZoom.bind(this));
            this._map.addEventListener("zoomstart", this._handleZoomStart.bind(this));
            this._map.addEventListener("zoomend", this._handleZoomEnd.bind(this));
        }
    },

    _getLeafletPackageLocation: {
        value: function () {
            var descriptor = require.getModuleDescriptor("leaflet"),
                mainRequire = descriptor.require,
                mappingRequire = descriptor.mappingRequire;

            return mappingRequire ? mappingRequire.location :
                                    mainRequire.config.packagesDirectory + descriptor.id
        }
    },

    _loadLeafletCSS: {
        value: function () {
            var packageLocation = this._getLeafletPackageLocation(),
                cssLocation = packageLocation + "dist/leaflet.css",
                linkEl = document.createElement("link");

            linkEl.setAttribute("rel", "stylesheet");
            linkEl.setAttribute("href", cssLocation);
            document.querySelector("head").appendChild(linkEl);
        }
    },

    _handleMapClick: {
        value: function (event) {
            var latlng = event.latlng,
                containerPoint = event.containerPoint,
                point = Point.withCoordinates([latlng.lng, latlng.lat]),
                point2d = Point2D.withCoordinates(containerPoint.x, containerPoint.y);

            this.dispatchEventNamed("press", this, this, {
                point: point,
                containerPoint: point2d
            });
        }
    },

    _handleMapDidMove: {
        value: function () {
            var mapBounds = this._map.getBounds(),
                mapCenter = this._map.getCenter(),
                center = Position.withCoordinates([mapCenter.lng, mapCenter.lat]);

            this.dispatchBeforeOwnPropertyChange("bounds", this.bounds);
            this._bounds = BoundingBox.withCoordinates(
                this._normalizeLongitude(mapBounds.getWest()), mapBounds.getSouth(),
                this._normalizeLongitude(mapBounds.getEast()), mapBounds.getNorth()
            );
            // this._logBoundingBox(this._bounds);
            this.dispatchOwnPropertyChange("bounds", this.bounds);
            this.dispatchBeforeOwnPropertyChange("center", this.center);
            this._center = center;
            this.dispatchOwnPropertyChange("center", this.center);
            if (this.maxBounds) {
                this._validateBounds();
            }
            this._overlays.forEach(function (overlay) {
                overlay.didMove(center);
            });
        }
    },

    /*****************************************************
     * Event handlers
     */

    handleBaseMapChange: {
        value: function (value) {

        }
    },

    _handleMapMove: {
        value: function () {
            this._updateWorlds();
        }
    },

    _updateWorlds: {
        value: function () {
            var mapCenter = this._map.getCenter(),
                mapSize = this._map.getSize(),
                pixelCenter = this._map.project(mapCenter),
                halfWidth = mapSize.x / 2,
                leftEdge = L.point(pixelCenter.x - halfWidth, pixelCenter.y),
                rightEdge = L.point(pixelCenter.x + halfWidth, pixelCenter.y),
                trueWest = this._map.unproject(leftEdge),
                trueEast = this._map.unproject(rightEdge),
                westWorld = this._worldIdentifierForLongitude(trueWest.lng),
                eastWorld = this._worldIdentifierForLongitude(trueEast.lng),
                worlds = this._worlds,
                i, n;

            for (i = westWorld, n = eastWorld; i <= n; i += 1) {
                if (!worlds.has(i)) {
                    worlds.add(i);
                }
            }

            worlds.forEach(function (identifier) {
                if (identifier < westWorld || identifier > eastWorld) {
                    worlds.delete(identifier);
                }
            });

        }
    },

    _worldIdentifierForLongitude: {
        value: function (longitude) {
            var identifier = 0;
            while(longitude > 180) {
                longitude -= 360;
                identifier += 1;
            }
            while(longitude < -180) {
                longitude += 360;
                identifier -= 1;
            }
            return identifier;
        }
    },

    _handleResize: {
        value: function () {
            var mapSize = this._map.getSize(),
                newSize = Size.withHeightAndWidth(mapSize.y, mapSize.x);
            this._updateMinZoomLevelIfNecessary();
            this._overlays.forEach(function (overlay) {
                overlay.resize(newSize);
            });
            // this._resizeOverlays();
        }
    },

    _updateMinZoomLevelIfNecessary: {
        value: function () {
            var map = this._map,
                size = map.getSize(),
                minZoom = this._minZoomForDimensions(size.x, size.y);
            if (map.options.minZoom !== minZoom) {
                map.options.minZoom = minZoom;
                if(map.getZoom() < minZoom) {
                    map.setZoom(minZoom);
                }
            }
        }
    },

    _handleViewReset: {
        value: function () {
            var map = this._map,
                center = map.getCenter(),
                newPosition = Position.withCoordinates([center.lng, center.lat]),
                zoom = map.getZoom();
            this.center = newPosition;
            this.zoom = zoom;
            this._resetOverlays();
            console.log("View did reset");
        }
    },

    _handleZoom: {
        value: function (event) {
            this._resetOverlays();
        }
    },

    _resetOverlays: {
        value: function() {
            var map = this._map,
                center = map.getCenter(),
                newPosition = Position.withCoordinates([center.lng, center.lat]),
                zoom = map.getZoom();
            this._overlays.forEach(function (overlay) {
                overlay.reset(newPosition, zoom);
            });
        }
    },

    _handleZoomAnimation: {
        value: function () {
            // var center = event.center;
            // this.dispatchBeforeOwnPropertyChange("zoom", this.zoom);
            // this._zoom = event.zoom;
            // this.dispatchOwnPropertyChange("zoom", this.zoom);
            // this.dispatchBeforeOwnPropertyChange("center", this.center);
            // this._center = Point.withCoordinates([center.lat, center.lng]);
            // this.dispatchOwnPropertyChange("center", this.center);
            // TODO: Implement some delegate method on each of the overlays e.g.
            // TODO (cont'd): viewReset
            // this._resetOverlays();
        }
    },

    _handleZoomEnd: {
        value: function (event) {
            this.dispatchBeforeOwnPropertyChange("zoom", this.zoom);
            this._zoom = this._map.getZoom();
            this.dispatchOwnPropertyChange("zoom", this.zoom);
            this._overlays.forEach(function (overlay) {
                overlay.didReset();
            }, this);

            // TODO: Implement some delegate method on each of the overlays e.g.
            // TODO (cont'd): viewDidChange
        }
    },

    _handleZoomStart: {
        value: function (event) {
            // console.log("Handle zoom start (", event, ") current zoom (", this._map.getZoom(), ")");
            this.zoom = this._map.getZoom();
            this._overlays.forEach(function (overlay) {
                overlay.willReset();
            }, this);

            // TODO: Implement some delegate method on each of the overlays e.g.
            // TODO (cont'd): viewWillReset
        }
    },

    _mapSizeForZoom: {
        value: function (zoom) {
            return Math.pow(2, zoom) * 256;
        }
    },

    /*****************************************************
     * Minimum Zoom Levels
     */

    _minZoomForDimensions: {
        value: function (width, height) {
            var minZoom = 0,
                totalSize = this._mapSizeForZoom(minZoom),
                widthPercentage = this._maxBoundsWidthPercentage(),
                mapWidth = totalSize * widthPercentage,
                heightPercentage = this._maxBoundsWidthPercentage(),
                mapHeight = totalSize * heightPercentage;
            while (mapWidth < width || mapHeight < height) {
                minZoom += 1;
                totalSize = this._mapSizeForZoom(minZoom);
                mapWidth = totalSize * widthPercentage;
                mapHeight = totalSize * heightPercentage;
            }
            return minZoom;
        }
    },

    _maxBoundsWidthPercentage: {
        value: function () {
            var bounds = this.maxBounds,
                xMax = bounds ? bounds.xMax : 180,
                xMin = bounds ? bounds.xMin : -180;
            if (xMax > 180) xMax = 180;
            if (xMin < -180) xMin = -180;
            return (xMax - xMin) / 360;
        }
    },

    _maxBoundsHeightPercentage: {
        value: function () {
            var bounds = this.maxBounds,
                yMax = bounds && bounds.yMax || 85.05112878,
                yMin = bounds && bounds.yMin || -85.05112878;
            return (yMax - yMin) / 170.10225756;
        }
    },

    /*****************************************************
     * Maximum Bounds
     */

    _validateBounds: {
        value: function () {
            if (this._isLatitudeInvalid()) {
                this._fixLatitude();
            } else if (this._isLongitudeInvalid()) {
                this._fixLongitude();
            }
        }
    },

    _isLatitudeInvalid: {
        value: function () {
            var north = this.bounds.yMax,
                south = this.bounds.yMin,
                maxNorth = this.maxBounds.yMax,
                maxSouth = this.maxBounds.yMin,
                isTooFarNorth = north > maxNorth,
                isTooFarSouth = south < maxSouth;
            return isTooFarNorth || isTooFarSouth;
        }
    },

    _isLongitudeInvalid: {
        value: function () {
            var west = this.bounds.xMin,
                east = this.bounds.xMax,
                maxEast = this.maxBounds.xMax,
                maxWest = this.maxBounds.xMin,
                isTooFarEast = east > maxEast,
                isTooFarWest = west < maxWest;
            return isTooFarWest || isTooFarEast;
        }
    },

    _fixLatitude: {
        value: function () {
            var north = this.bounds.yMax,
                south = this.bounds.yMin,
                maxNorth = this.maxBounds.yMax,
                maxSouth = this.maxBounds.yMin,
                isTooFarNorth = north > maxNorth,
                isTooFarSouth = south < maxSouth,
                position = (isTooFarNorth || isTooFarSouth) && this._center.coordinates,
                latitude = position && position.latitude,
                delta;
            if (isTooFarNorth) {
                delta = maxNorth - (north - latitude) * 1.1;
            } else if (isTooFarSouth) {
                delta = -(Math.abs(maxSouth) - (Math.abs(south) - Math.abs(latitude)) * 1.1);
            }
            if (delta) {
                this._setCenter(position.longitude, delta);
            }
        }
    },

    _fixLongitude: {
        value: function () {
            var west = this.bounds.xMin,
                east = this.bounds.xMax,
                maxEast = this.maxBounds.xMax,
                maxWest = this.maxBounds.xMin,
                isTooFarEast = east > maxEast,
                isTooFarWest = west < maxWest,
                position = (isTooFarWest || isTooFarEast) && this._center.coordinates,
                longitude = position && position.longitude,
                delta;

            if (isTooFarEast) {
                delta = maxEast - (east - longitude) * 1.1;
            } else if (isTooFarWest) {
                delta = -(Math.abs(maxWest) - (Math.abs(west) - Math.abs(longitude)) * 1.1);
            }
            if (delta) {
                this._setCenter(delta, position.latitude);
            }
        }
    },

    /*****************************************************
     * Image Overlays
     */

    registerImageOverlay: {
        value: function (component) {
            var mapImageLayer = new L.TileLayer.MontageGeoMapImageLayer(component);
            this.componentMapImageLayerMap.set(component, mapImageLayer);
            mapImageLayer.addTo(this._map);
        }
    },

    unregisterImageOverlay: {
        value: function (component) {
            var map = this.componentMapImageLayerMap;
            if (map.has(component)) {
                map.get(component).removeFrom(this._map);
                map.delete(component);
            }
        }
    },

    componentMapImageLayerMap: {
        get: function () {
            if (!this._componentMapImageLayerMap) {
                this._componentMapImageLayerMap = new WeakMap();
            }
            return this._componentMapImageLayerMap;
        }
    },

    /*****************************************************
     * Background Layers
     */

    // TODO: Implment
    // _backgroundOverlayWithLayer: {
    //     value: function (layer) {
    //         if (!this._leafletLayers.has(layer)) {
    //             this._leafletLayers.set(layer, this._createBackgroundOverlayWithLayer(layer));
    //         }
    //         return this._leafletLayers.get(layer);
    //     }
    // },
    //
    // _createBackgroundOverlayWithLayer: {
    //     value: function (layer) {
    //         var self = this,
    //             service = this.application.delegate.service;
    //         return new L.TileLayer.Functional(function (view) {
    //             var tile = self._baseMapTileWithId([view.tile.column, view.tile.row, view.zoom].join(":")),
    //                 expression = "$tile == tile && $layer == layer",
    //                 criteria = new Criteria().initWithExpression(expression, {
    //                     tile: tile,
    //                     layer: layer
    //                 }),
    //                 query = DataQuery.withTypeAndCriteria(Tile, criteria);
    //
    //             return service.fetchData(query);
    //             // return BackgroundTileService.fetchTileImage(layer, tile);
    //         }, {
    //             minZoom: layer && layer.minZoom !== undefined ? layer.minZoom : 0,
    //             maxZoom: layer && layer.maxZoom !== undefined ? layer.maxZoom : 18
    //         });
    //     }
    // },

    /*****************************************************
     * Base Maps
     */

    _createBackgroundOverlayWithLayer: {
        value: function (layer) {
            var self = this,
                service = this.application.delegate.service;
            return new L.TileLayer.Functional(function (view) {
                var tile = self._baseMapTileWithId([view.tile.column, view.tile.row, view.zoom].join(":")),
                    expression = "$tile == tile && $layer == layer",
                    criteria = new Criteria().initWithExpression(expression, {
                        tile: tile,
                        layer: layer
                    }),
                    query = DataQuery.withTypeAndCriteria(Tile, criteria);

                return service.fetchData(query);
            }, {
                minZoom: layer && layer.minZoom !== undefined ? layer.minZoom : 0,
                maxZoom: layer && layer.maxZoom !== undefined ? layer.maxZoom : 18
            });
        }
    },

    /*****************************************************
     * Logging
     */

    _logBoundingBox: {
        value: function (boundingBox) {
            var rawWest = boundingBox.xMin,
                rawEast = boundingBox.xMax,
                normalizedWest = this._normalizeLongitude(rawWest),
                normalizedEast = this._normalizeLongitude(rawEast);
            console.log("Bounds Min (", rawWest, "), Max (", rawEast, ")");
            console.log("Normalized Bounds (", normalizedWest, ") Max (", normalizedEast, ")");
        }
    },

    _logLatLng: {
        value: function (message, coordinate) {
            console.log(message, " lng (", coordinate.lng, ") lat (", coordinate.lat, ")");
        }
    },

    _logPoint: {
        value: function (point) {
            var position = point.coordinates,
                rawLongitude = position.longitude,
                normalizedLongitude = this._normalizeLongitude(rawLongitude);
            console.log("Raw Point Longitude (", rawLongitude, ")");
            console.log("Normalized Point Longitude (", normalizedLongitude, ")");
        }
    },

    _normalizeLongitude: {
        value: function (longitude) {
            while (longitude > 180) {
                longitude -= 360;
            }
            while (longitude < -180) {
                longitude += 360;
            }
            return longitude;
        }
    }

}, {

    // Solve cyclic dependency
    Position: {
        get: function () {
            return require("logic/model/position").Position;
        }
    }

});

var Symbolizer = Enumeration.specialize(/** @lends Symbolizer */ "id", {

    id: {
        value: undefined
    },

    draw: {
        value: function (coordinates, offset) {
            return null;
        }
    },

    project: {
        value: function (coordinates) {

        }
    },

    isMultiGeometry: {
        value: false
    },

    _addLongitudeOffsetToPath: {
        value: function (path, offset) {
            return path.map(function (coordinates) {
                var longitude = coordinates[1];
                if (offset !== 0) {
                    longitude += offset;
                }
                return [coordinates[0], longitude];
            });
        }
    },

    _adjustPathForAntiMeridian: {
        value: function (path) {

            var shift = 0,
                previousCoordinate;

            return path.map(function (coordinate) {

                var longitude = coordinate.longitude,
                    previousLongitude,
                    bearing;

                if (previousCoordinate) {
                    previousLongitude = previousCoordinate.longitude;
                    bearing = previousCoordinate.bearing(coordinate);
                    if (bearing > 0 && bearing < 180 &&
                        previousLongitude > 0 && longitude < 0) {
                        shift += 1;
                    } else if (
                        bearing > 180 && bearing < 360 &&
                        previousLongitude < 0 && longitude > 0) {
                        shift -= 1;
                    }
                }

                previousCoordinate = coordinate;
                return [coordinate.latitude, longitude + shift * 360];

            });
        }
    },

    _convertStyle: {
        value: function (style) {
            var convertedStyle = {},
                options = {},
                icon, size;
            if (icon = style.icon) {
                options["iconUrl"] = icon.symbol;
                if ((size = icon.scaledSize) || (size = icon.size)) {
                    options["iconSize"] = [size.width, size.height];
                }
                if (icon.anchor) {
                    options["iconAnchor"] = [icon.anchor.x, icon.anchor.y];
                }
                convertedStyle["icon"] = L.icon(options);
            } else {
                if (style.fillColor) {
                    convertedStyle["fillColor"] = style.fillColor;
                }
                if (style.fillOpacity) {
                    convertedStyle["fillOpacity"] = style.fillOpacity;
                }
                if (style.strokeColor) {
                    convertedStyle["color"] = style.strokeColor;
                }
                if (style.strokeOpacity) {
                    convertedStyle["opacity"] = style.strokeOpacity;
                }
                if (style.strokeWeight) {
                    convertedStyle["stroke"] = true;
                    convertedStyle["weight"] = style.strokeWeight;
                } else {
                    convertedStyle["stroke"] = false;
                }
            }

            return convertedStyle;
        }
    },

    _processPoint: {
        value: function (coordinates) {
            return [coordinates.latitude, coordinates.longitude];
        }
    }

}, {

    POINT: ["Point", {

        draw: {
            value: function (coordinates, offset, style) {
                var longitude = coordinates[1],
                    convertedStyle,
                    options;
                if (style && (convertedStyle = this._convertStyle(style).icon)) {
                    options = {
                        icon: convertedStyle
                    };
                }
                if (offset !== 0) {
                    longitude += offset;
                }
                return L.marker([coordinates[0], longitude], options);
            }
        },

        project: {
            value: function (coordinates) {
                return [coordinates.latitude, coordinates.longitude];
            }
        }

    }],

    MULTI_POINT: ["MultiPoint", {

        draw: {
            value: function (coordinates, offset, style) {
                var convertedStyle,
                    options;
                if (style && (convertedStyle = this._convertStyle(style).icon)) {
                    options = {
                        icon: convertedStyle
                    };
                }
                return coordinates.map(function (coordinate) {
                    var longitude = coordinate[1];
                    if (offset !== 0) {
                        longitude += offset;
                    }
                    return L.marker([coordinate[0], longitude], options);
                });
            }
        },

        isMultiGeometry: {
            value: true
        },

        project: {
            value: function (coordinates) {
                return coordinates.map(this._processPoint);
            }
        }

    }],

    LINE_STRING: ["LineString", {

        draw: {
            value: function (coordinates, offset, style) {
                var convertedStyle = style && this._convertStyle(style);
                return L.polyline(this._addLongitudeOffsetToPath(coordinates, offset), convertedStyle);
            }
        },

        project: {
            value: function (coordinates) {
                return this._adjustPathForAntiMeridian(coordinates);
            }
        }

    }],

    MULTI_LINE_STRING: ["MultiLineString", {

        draw: {
            value: function (coordinates, offset, style) {
                var fn = this._addLongitudeOffsetToPath,
                    convertedStyle = style && this._convertStyle(style);
                return coordinates.map(function (path) {
                    return L.polyline(fn(path, offset), convertedStyle);
                });
            }
        },

        isMultiGeometry: {
            value: true
        },

        project: {
            value: function (multiLineString) {
                return multiLineString.map(function (lineString) {
                    return Symbolizer.LINE_STRING.project(lineString.coordinates);
                });
            }
        }

    }],

    POLYGON: ["Polygon", {

        draw: {
            value: function (coordinates, offset, style) {
                var fn = this._addLongitudeOffsetToPath,
                    convertedStyle = style && this._convertStyle(style),
                    rings = coordinates.map(function (ring) {
                        return fn(ring, offset);
                    });
                return L.polygon(rings, convertedStyle);
            }
        },

        project: {
            value: function (rings) {
                var fn = this._adjustPathForAntiMeridian;
                return rings.map(function (ring) {
                    return fn(ring);
                });
            }
        }

    }],

    MULTI_POLYGON: ["MultiPolygon", {

        draw: {
            value: function (polygons, offset, style) {
                var fn = this._addLongitudeOffsetToPath,
                    convertedStyle = style && this._convertStyle(style);
                return polygons.map(function (polygon) {
                    var coordinates = polygon.map(function (path) {
                        return fn(path, offset);
                    });
                    return L.polygon(coordinates, convertedStyle);
                });
            }
        },

        isMultiGeometry: {
            value: true
        },

        project: {
            value: function (polygons) {
                return polygons.map(function (polygon) {
                    return Symbolizer.POLYGON.project(polygon.coordinates);
                });
            }
        }

    }],

    GEOMETRY_COLLECTION: ["GeometryCollection", {

        draw: {
            value: function (geometries, offset, style) {
                return geometries.map(function (geometry) {
                    var symbolizer = Symbolizer.forId(geometry.type);
                    return symbolizer.draw(geometry.coordinates, offset, style);
                });
            }
        },

        isMultiGeometry: {
            value: true
        },

        project: {
            value: function (geometries) {
                return geometries.map(function (geometry) {
                    var symbolId = GEOMETRY_CONSTRUCTOR_TYPE_MAP.get(geometry.constructor),
                        symbolizer = Symbolizer.forId(symbolId);
                    return {
                        type: symbolId,
                        coordinates: symbolizer.project(geometry.coordinates)
                    }
                });
            }
        }

    }]

});

/*
     https://github.com/ismyrnow/Leaflet.functionaltilelayer
     Copyright 2013 Ishmael Smyrnow

     Permission is hereby granted, free of charge, to any person obtaining
     a copy of this software and associated documentation files (the
     "Software"), to deal in the Software without restriction, including
     without limitation the rights to use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and to
     permit persons to whom the Software is furnished to do so, subject to
     the following conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
     LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
     OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
     WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
L.TileLayer.Functional = L.TileLayer.extend({

    _tileFunction: null,

    initialize: function (tileFunction, options) {
        this._tileFunction = tileFunction;
        L.TileLayer.prototype.initialize.call(this, null, options);
    },

    getTileUrl: function (tilePoint) {
        var map = this._map,
            crs = map.options.crs,
            tileSize = this.options.tileSize,
            zoom = tilePoint.z,
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
            nw = crs.project(map.unproject(nwPoint, zoom)),
            se = crs.project(map.unproject(sePoint, zoom)),
            bbox = [nw.x, se.y, se.x, nw.y].join(',');

        // Setup object to send to tile function.
        var view = {
            bbox: bbox,
            width: tileSize,
            height: tileSize,
            zoom: zoom,
            tile: {
                row: this.options.tms ? this._tileNumBounds.max.y - tilePoint.y : tilePoint.y,
                column: tilePoint.x
            },
            subdomain: this._getSubdomain(tilePoint)
        };

        return this._tileFunction(view).then(function (tiles) {
            var tile = tiles.length > 0 && tiles[0],
                url = tile ? tile.dataUrl || tile.image.src : BackgroundTile.transparentImage;
            // TODO figure out how it is possible an image is returned as undefined
            if (url.endsWith("undefined") || !url) {
                url = BackgroundTile.transparentImage;
            }
            return url;
        });
    },

    // @method createTile(coords: Object, done?: Function): HTMLElement
    // Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
    // to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
    // callback is called when the tile has been loaded.
    createTile: function (coords, done) {
        var tile = document.createElement('img');

        L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));

        if (this.options.crossOrigin) {
            tile.crossOrigin = '';
        }

        /*
         Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
         http://www.w3.org/TR/WCAG20-TECHS/H67
        */
        tile.alt = '';

        /*
         Set role="presentation" to force screen readers to ignore this
         https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
        */
        tile.setAttribute('role', 'presentation');

        this.getTileUrl(coords).then(function (url) {
            tile.src = url;
        });

        return tile;
    }

});

L.tileLayer.functional = function (tileFunction, options) {
    return new L.TileLayer.Functional(tileFunction, options);
};

L.TileLayer.MontageGeoMapImageLayer = L.TileLayer.extend({

    component: undefined,

    _tileCache: function () {
        if (!this.__tileCache) {
            this.__tileCache = {};
        }
        return this.__tileCache;
    },


    initialize: function (component, options) {
        this.component = component;
        L.TileLayer.prototype.initialize.call(this, null, options);
    },

    getTileUrl: function (coords) {
        return void 0;
        // In the end this must return a URL for a promise.
    },

    _onTileRemove: function (e) {
        var coords = e.coords,
            tile = this._tileWithIdentifier(coords.x, coords.y, coords.z);
        this.component.releaseTile(tile);
        this._releaseTileFromCache(coords);
        L.TileLayer.prototype._onTileRemove.call(this, e);
    },

    createTile: function (coords, done) {
        var tile = this._tileWithIdentifier(coords.x, coords.y, coords.z),
            element = this.component.elementForTile(tile),
            size = this.getTileSize();

        L.DomEvent.on(element, 'load', L.bind(this._tileOnLoad, this, done, element));
        L.DomEvent.on(element, 'error', L.bind(this._tileOnError, this, done, element));

        if (this.options.crossOrigin) {
            element.crossOrigin = '';
        }

        /*
         Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
         http://www.w3.org/TR/WCAG20-TECHS/H67
        */
        element.alt = '';

        /*
         Set role="presentation" to force screen readers to ignore this
         https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
        */
        element.setAttribute('role', 'presentation');
        element.style.width = size.width + "px";
        element.style.height = size.height + "px";
        return element;
    },

    _tileWithIdentifier: function (x, y, z) {
        var cache = this._tileCache();
        return cache[x] && cache[x][y] && cache[x][y][z] || this._buildTile(x, y, z);
    },

    _buildTile: function (x, y, z) {
        var tile = Tile.withIdentifier(x, y, z);
        this._cacheTile(tile);
        return tile;
    },

    _releaseTileFromCache: function (tile) {
        var cache = this._tileCache(),
            x = tile.x,
            y = tile.y,
            z = tile.z;
        if (cache[x] && cache[x][y] && cache[x][y][z]) {
            delete cache[x][y][z];
        }
    },

    _cacheTile: function (tile) {
        var cache = this._tileCache();
        cache[tile.x] = cache[tile.x] || {};
        cache[tile.x][tile.y] = cache[tile.x][tile.y] || {};
        cache[tile.x][tile.y][tile.z] = tile;
    }

});


L.BingLayer = L.TileLayer.extend({

    initialize: function (tileFunction, options) {
        this._tileFunction = tileFunction;
        L.TileLayer.prototype.initialize.call(this, null, options);
    },

    getTileUrl: function (coords) {
        var x = coords.x,
            y = coords.y,
            s = this._getSubdomain(x, y),
            z = this._getZoomForUrl(),
            url = "https://t";
        url += this._getSubdomain(x, y);
        url += ".ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/";
        url += this._quadKey(x, y, z);
        url += "?mkt=en-en&it=A,G,L";
        return url;
    },

    _getSubdomain: function (x, y) {
        return Math.abs(x + y) % 4;
    },

    _quadKey: function (x, y, z) {
        var quadKey = "",
            digit, mask, i;
        for (i = z; i > 0; i--) {
            digit = 0;
            mask = 1 << (i - 1);
            if ((x & mask) != 0) {
                digit++;
            }
            if ((y & mask) != 0) {
                digit++;
                digit++;
            }
            quadKey += String(digit);
        }
        return quadKey;
    }

});
