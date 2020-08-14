var Component = require("montage/ui/component").Component,
    Size = require("logic/model/size").Size,
    Point2D = require("logic/model/point-2d").Point2D;

/**
 * @class TileLevel
 * @extends Component
 */
exports.TileLevel = Component.specialize(/** @lends TileLevel.prototype */{

    constructor: {
        value: function TileLevel() {
            this.addOwnPropertyChangeListener("center", this);
            this.addOwnPropertyChangeListener("zoom", this);
            this.addOwnPropertyChangeListener("isZooming", this);
            this.addOwnPropertyChangeListener("tileBounds", this);
            this.addOwnPropertyChangeListener("zoomLevel", this);
        }
    },

    /**
     * Indicates whether or not this tile level is current being zoomed.
     * Set by owner
     * @type {boolean}
     */
    isZooming: {
        value: false
    },

    /**
     * The tile bounds to display at this level.
     * Set by owner
     * @type {TileBounds}
     */
    tileBounds: {
        value: undefined
    },

    /**
     * The zoom factor for this level.
     * Set by owner
     * @type {number}
     */
    zoomLevel: {
        value: 0
    },

    _origin: {
        get: function () {
            if (!this.__origin) {
                this.__origin = Point2D.withCoordinates(0, 0);
            }
            return this.__origin;
        },
        set: function (value) {
            this.__origin = value;
        }
    },

    _size: {
        get: function () {
            if (!this.__size) {
                this.__size = Size.withHeightAndWidth(0, 0);
            }
            return this.__size;
        },
        set: function (value) {
            this.__size = value;
        }
    },

    handleTileBoundsChange: {
        value: function () {
            this._positionElement();
        }
    },

    _positionElement: {
        value: function () {
            var map = this.map,
                bounds = this.bounds,
                tileBounds = this.tileBounds,
                element = this.element,
                zoomScale = Math.pow(2, this.zoom),
                zoomLevelScale = Math.pow(2, this.zoomLevel),
                scale = zoomScale / zoomLevelScale,
                firstTileBounds, size, nw, zIndex;

            if (bounds && tileBounds && scale > 0) {
                firstTileBounds = tileBounds.tiles[0].bounds;
                nw = map.positionToPoint({longitude: firstTileBounds.xMin, latitude: firstTileBounds.yMax});
                size = Size.withHeightAndWidth(
                    (1 + tileBounds.maxY - tileBounds.minY) * 256,
                    (1 + tileBounds.maxX - tileBounds.minX) * 256
                );
                zIndex = this.zoom === this.zoomLevel ? 2 : 1;
                if (!nw.equals(this._origin) || scale !== this._scale) {
                    this._origin = nw;
                    this._scale = scale;
                    element.style.transform = "translate3d(" + (nw.x) + "px, " + (nw.y) + "px, 0) scale(" + scale + ")";
                    console.log("Positioning...");
                }
                if (!size.equals(this._size)) {
                    this._size = size;
                    element.style.width = size.width  + "px";
                    element.style.height = size.height + "px";
                }
                if (zIndex !== Number(element.style.zIndex)) {
                    element.style.zIndex = zIndex;
                }
            }
        }
    },

    handlePropertyChange: {
        value: function () {
            if (this.map) {
                this._positionElement();
            }
        }
    },

    handleIsZoomingChange: {
        value: function () {
            if (this.isZooming) {
                this.element.classList.add("montageGeo-TileLevel--isAnimatedTransitionEnabled");
            } else {
                this.element.classList.remove("montageGeo-TileLevel--isAnimatedTransitionEnabled");
            }
        }
    },

    handleZoomLevelChange: {
        value: function (value) {
            this._positionElement();
        }
    }

});
