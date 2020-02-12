var Converter = require("montage/core/converter/converter").Converter,
    StyleType = require("logic/model/style").StyleType;

/**
 * @class KmlStyleToStyleConverter
 * @classdesc Converts an KML style to a MontageGeo style object.
 * @extends Converter
 */
exports.KmlStyleToStyleConverter = Converter.specialize( /** @lends KmlStyleToStyleConverter# */ {

    /**
     * Converts a KML Style object to a Montage Geo style object.
     * TODO: Implement
     * @param {object}
     */
    convert: {
        value: function (object) {

        }
    },

    /**
     * Reverts a MontageGeo Style object to a KML style object
     * @param {object}
     */
    revert: {
        value: function (style) {
            var type = style.type;
            return  type === StyleType.POINT ?          this._revertPointStyle(style) :
                    type === StyleType.LINE_STRING ?    this._revertLineStyle(style) :
                    type === StyleType.POLYGON ?        this._revertPolygonStyle(style) :
                                                        null;
        }
    },

    /**
     * An optional location to use for building URLs to images.  For example,
     * when used with styles from Esri Renderers.
     */
    imagesLocation: {
        value: undefined
    },

    _revertPointStyle: {
        value: function (style) {
            var icon = style.icon,
                url = this._urlForIcon(icon),
                reverted = {
                    Icon: {
                        href: url
                    },
                    scale: 1 // TODO use scaledSize
                },
                anchor;
            if ((anchor = icon.anchor)) {
                reverted.hotSpot = {
                    x: anchor.x,
                    y: anchor.y
                };
            }
            return {
                "IconStyle": reverted
            };
        }
    },

    _urlForIcon: {
        value: function (icon) {
            var url = "", imagesLocation;
            if ((imagesLocation = this.imagesLocation)) {
                url += imagesLocation;
            }
            url += icon.properties && icon.properties.src || icon.symbol;
            return url;
        }
    },

    _revertPolygonStyle: {
        value: function (style) {
            return {
                "PolyStyle": {
                    color: this._convertColorToKMLColor(style.fillColor, style.fillOpacity),
                    colorMode: "normal",
                    fill: true,
                    outline: !!(style.strokeWeight && style.strokeWeight > 0)
                }
            };
        }
    },

    _revertLineStyle: {
        value: function (style) {
            return {
                "LineStyle": {
                    color: this._convertColorToKMLColor(style.strokeColor, 1),
                    colorMode: "normal",
                    width: parseInt(style.strokeWeight || 1)
                }
            };
        }
    },

    _convertColorToKMLColor: {
        value: function (color, opacity) {
            return color.startsWith("rgb") ? this._convertRgbToColor(color, opacity) : this._convertHexToColor(color, opacity);
        }
    },

    _convertRgbToColor: {
        value: function (value, opacity) {
            var components = this._componentsFromRgbString(value);
            return this._componentsToHex(components, opacity);
        }
    },

    _convertHexToColor: {
        value: function (hex, opacity) {
            var color = isNaN(opacity) ? "ff" : this._componentToHex(opacity * 255);
            color = color.length === 1 ? "0" + color : color;
            hex = this._stripHash(hex);
            color += hex.substr(4, 2);
            color += hex.substr(2, 2);
            color += hex.substr(0, 2);
            return color;
        }
    },

    _componentsFromRgbString: {
        value: function (value) {
            var openParenthesisIndex = value.indexOf("(") + 1,
                closeParenthesisIndex = value.lastIndexOf(")");
            value = value.substr(openParenthesisIndex, closeParenthesisIndex - openParenthesisIndex);
            return value.split(",").map(function (component) { return parseInt(component.trim()); });
        }
    },

    _componentsToHex: {
        value: function (components, opacity) {
            var opacity = isNaN(opacity) ? 1 : opacity,
                hex = components.length === 4 ? this._componentToHex(components[3] * 255) : this._componentToHex(opacity * 255),
                i;
            for (i = 2; i >= 0; i -= 1) {
                hex += this._componentToHex(components[i]).toLowerCase();
            }
            return hex;
        }
    },

    _componentToHex: {
        value: function (component) {
            var hex = parseInt(component).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
    },

    _stripHash: {
        value: function (value) {
            return value && value.charAt(0) === "#" ? value.substr(1, Infinity) : value;
        }
    }

});
