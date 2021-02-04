var Component = require("montage/ui/component").Component,
    Point = require("logic/model/point").Point,
    Position = require("logic/model/position").Position,
    METRIC_SYSTEM_SET = [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000],
    IMPERIAL_SET = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5280, 10560, 26400, 52800, 105600, 264000, 528000, 1056000, 2640000, 5280000, 10560000],
    FEET_PER_MILE = 5280,
    METERS_PER_KILOMETER = 1000,
    CENTIMETERS_PER_INCH = 2.54;

/**
 * @class ScaleOverlay
 * @extends Component
 */
exports.ScaleOverlay = Component.specialize(/** @lends ScaleOverlay.prototype */{

    constructor: {
        value: function ScaleOverlay() {
            this.addOwnPropertyChangeListener("position", this);
            this.addOwnPropertyChangeListener("zoom", this);
        }
    },

    /**************************************************************************
     * Properties
     */

    /**
     * The position the scale overlay is meant to describe.
     * Set by owner.
     * @type {Position}
     */
    position: {
        value: undefined
    },

    /**
     * The current zoom level of the map.
     * Set by owner.
     * @type {number}
     */
    zoom: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {string}
     */
    _feetAbbreviation: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {Element}
     */
    _imperialTab: {
        value: undefined
    },

    /**
     * Used in serialization
     * @type {string}
     */
    _imperialDistanceValue: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {string}
     */
    _kilometersAbbreviation: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {Element}
     */
    _line: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {string}
     */
    _metersAbbreviation: {
        value: undefined
    },

    /**
     * Used in serialization
     * @type {string}
     */
    _metricDistanceValue: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {Element}
     */
    _metricTab: {
        value: undefined
    },

    /**
     * Set in serialization
     * @type {string}
     */
    _milesAbbreviation: {
        value: undefined
    },

    /**
     * Used in serialization
     * @type {Point}
     */
    _point: {
        get: function () {
            if (!this.__point) {
                this.__point = new Point();
                this.__point.defineBinding("coordinates", {"<-": "position", source: this});
            }
            return this.__point;
        }
    },

    /**
     * Set in serialization
     * @type {Element}
     */
    _scale: {
        value: undefined
    },

    /**
     * Used in serialization
     * @type {string}
     */
    _scaleValue: {
        value: undefined
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
        value: function() {
            if (!this.position || this.zoom === undefined) {
                return;
            }
            this._drawScale();
        }
    },

    _drawScale: {
        value: function () {
            var metersPerInch = this._metersPerPixel * this._pixelsPerInch,
                feetPerInch = metersPerInch / 0.3048,
                metricScale = this._scaleForValueInSet(metersPerInch, METRIC_SYSTEM_SET),
                metricScaleLengthInPixels = Math.floor(((metricScale / metersPerInch) * this._pixelsPerInch)),
                imperialScale = this._scaleForValueInSet(feetPerInch, IMPERIAL_SET),
                imperialScaleLengthInPixels = Math.floor(((imperialScale / feetPerInch) * this._pixelsPerInch)),
                scaleWidth = Math.max(metricScaleLengthInPixels, imperialScaleLengthInPixels) + 2;

            this._metricDistanceValue = metricScale >= METERS_PER_KILOMETER ? Math.floor((metricScale / METERS_PER_KILOMETER)) + " " + this._kilometersAbbreviation : metricScale + " " + this._metersAbbreviation;
            this._imperialDistanceValue = imperialScale >= FEET_PER_MILE ? Math.floor((imperialScale / FEET_PER_MILE)) + " " + this._milesAbbreviation : imperialScale + " " + this._feetAbbreviation;
            this._scaleValue = "1 : " + this._groupNumbers(Math.floor((100 * metricScale / (metricScaleLengthInPixels * CENTIMETERS_PER_INCH / this._pixelsPerInch))));
            this._line.style.width = scaleWidth + "px";
            this._scale.style.flexBasis = (scaleWidth + 8) + "px";
            this._metricTab.style.left = metricScaleLengthInPixels + "px";
            this._imperialTab.style.left = imperialScaleLengthInPixels + "px";
        }
    },

    /**************************************************************************
     * Utility Methods
     */

    _coordinateConverter: {
        get: function () {
            if (!this.__coordinateConverter) {
                this.__coordinateConverter = {
                    convert: function (value) {
                        return Math.round(value * 1000) / 1000;
                    }
                };
            }
            return this.__coordinateConverter;
        }
    },

    _groupNumbers: {
        value: function (value) {

            var groupLength = 3,
                stringValue = value.toString(),
                result = "";

            while (stringValue.length >= groupLength) {
                var length = stringValue.length - groupLength,
                    chain = stringValue.substr(length);
                stringValue = stringValue.substr(0, length);
                result = chain + " " + result;
            }

            result = result.substr(0, result.length - 1);
            if (stringValue.length) {
                result = stringValue + " " + result;
            }

            return result;
        }
    },

    _metersPerPixel: {
        get: function () {
            var latitude = this.position.latitude,
                zoom = this.zoom;
            return 156543.03392 * Math.cos(Position.toRadians(latitude)) / Math.pow(2, zoom);
        }
    },

    _pixelsPerInch: {
        get: function () {
            if (!this.__pixelsPerInch) {
                this.__pixelsPerInch = this._calculatePPI();
            }
            return this.__pixelsPerInch;
        }
    },

    _scaleForValueInSet: {
        value: function (size, scaleSet) {
            var value, i;
            for (i = scaleSet.length - 1; i >= 0 && !value; i--) {
                if (scaleSet[i] <= size) {
                    value = scaleSet[i];
                }
            }
            return value;
        }
    },

    _calculatePPI: {
        value: function () {
            var element = document.createElement("DIV"),
                ppi;
            element.style.width = "1in";
            element.style.padding = "0";
            window.document.body.appendChild(element);
            ppi = element.offsetWidth;
            window.document.body.removeChild(element);
            return ppi;
        }
    }

});
