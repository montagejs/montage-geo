var Converter = require("montage/core/converter/converter").Converter,
    Enumeration = require("montage/data/model/enumeration").Enumeration,
    Icon = require("logic/model/icon").Icon,
    Point2D = require("logic/model/point-2d").Point2D,
    Promise = require("montage/core/promise").Promise,
    Size = require("logic/model/size").Size,
    Style = require("logic/model/style").Style;

/**
 * @class EsriSymbolToStyleConverter
 * @classdesc Converts an esri symbol to a MontageGeo style object.
 * @extends Converter
 */
exports.EsriSymbolToStyleConverter = Converter.specialize( /** @lends EsriSymbolToStyleConverter# */ {

    /**
     * Converts the specified symbol to a MontageGeo object
     * @function
     * @param {object} v - The value to format.
     * @returns {Style} - The value converted to a Style.
     */
    convert: {
        value: function (value) {
            return EsriSymbol.forType(value.type).convert(value);
        }
    },

    /**
     * Revert is not supported.
     * @function
     * @param {Style} v The Style to revert.
     * @returns null
     */
    revert: {
        value: function (value) {
            return void 0;
        }
    }

});

var Color = new function Color() {};
Object.defineProperties(Color, /** @lends Color */ {

    colorToRgba: {
        value: function (color) {
            var opacity,
                copy = Array.isArray(color) ? color.slice() : [0, 0, 0, 0];
            opacity = copy[3] / 255;
            copy.splice(3, 1, opacity);
            return "rgba(" + copy.join(",") + ")";
        }
    },

    hexToRGB: {
        value: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    },

    rgbToHex: {
        value: function (rgb) {
            var hex = ["#"],
                i, n;
            for (i = 0, n = rgb ? 3 : 0; i < n; i++) {
                var component = rgb[i].toString(16);
                component = component.length == 1 ? "0" + component : component;
                hex[i + 1] = component;
            }
            return hex.join("");
        }
    },

    rgbaToHex: {
        value: function (rgb) {
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
                ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
        }
    }

});

var EsriPoint = new function EsriPoint() {};
Object.defineProperties(EsriPoint, /** @lends EsriPoint */ {

    _coefficient: {
        writable: false,
        enumerable: false,
        value: 16 / 12
    },

    toPixels: {
        value: function (points) {
            return Math.round(points * EsriPoint._coefficient);
        }
    }

});

var EsriSymbol = Enumeration.specialize(/** @lends EsriSymbol */ "type", {

    _convertPointSymbol: {
        value: function (value) {
            return MarkerIcon.forId(value.style || value.type).convert(value)
                .then(function (icon) {
                    return Style.withValues(icon);
                });
        }
    }

}, {

    PICTURE_SYMBOL: ["esriPMS", {

        convert: {
            value: function (value) {
                return MarkerIcon.forId(value.type).convert(value)
                    .then(function (icon) {
                        return Style.withValues(icon);
                    });
            }
        }

    }],

    SIMPLE_MARKER_SYMBOL: ["esriSMS", {

        convert: {
            value: function (value) {
                return MarkerIcon.forId(value.style).convert(value)
                    .then(function (icon) {
                        return Style.withValues(icon);
                    });
            }
        }

    }],

    POLYLINE: ["esriSLS", {

        convert: {
            value: function (symbol) {
                var color = Color.colorToRgba(symbol.color),
                    opacity = symbol.opacity || 1.0,
                    strokeWidth = EsriPoint.toPixels(symbol.width || 0);

                return Promise.resolve(Style.withValues(color, opacity, strokeWidth));
            }
        }

    }],

    POLYGON: ["esriSFS", {

        convert: {
            value: function (symbol) {
                var outline = symbol.outline,
                    color = symbol.color,
                    outlineColor = outline && outline.color,
                    fillColor = Color.colorToRgba(color),
                    strokeColor = Color.colorToRgba(outlineColor),
                    strokeWeight =  EsriPoint.toPixels(outline && outline.width || 0),
                    fillOpacity, strokeOpacity;

                if (color.length === 4) {
                    fillOpacity = color[3] / 255;
                } else {
                    fillOpacity = 1.0;
                }

                if (outlineColor && outlineColor.length === 4) {
                    strokeOpacity = outlineColor[3] / 255;
                } else {
                    strokeOpacity = 1.0;
                }

                return Promise.resolve(Style.withValues(
                    fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWeight
                ));
            }
        }

    }]

});

var base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var MarkerIcon = Enumeration.specialize(/** @lends MarkerIcon */ "id", {

    _base64Decode: {
        value: function (data) {
            var result = [],
                current = 0,
                i, c;
            for (i = 0, c; c = data.charAt(i); i++) {
                if (c === '=') {
                    if (i !== data.length - 1 && (i !== data.length - 2 || data.charAt(i + 1) !== '=')) {
                        throw new SyntaxError('Unexpected padding character.');
                    }
                    break;
                }
                var index = base64Characters.indexOf(c);
                if (index === -1) {
                    throw new SyntaxError('Invalid Base64 character.');
                }
                current = (current << 6) | index;
                if (i % 4 === 3) {
                    result.push(current >> 16, (current & 0xff00) >> 8, current & 0xff);
                    current = 0;
                }
            }
            if (i % 4 === 1) {
                throw new SyntaxError('Invalid length for a Base64 string.');
            }
            if (i % 4 === 2) {
                result.push(current >> 4);
            } else if (i % 4 === 3) {
                current <<= 6;
                result.push(current >> 16, (current & 0xff00) >> 8);
            }
            return result;
        }
    },

    _canvas: {
        get: function () {
            if (!this.__canvas) {
                this.__canvas = document.createElement("canvas");
            }
            return this.__canvas;
        }
    },

    _context: {
        get: function () {
            if (!this.__context) {
                this.__context = this._canvas.getContext("2d");
            }
            return this.__context;
        }
    },

    _dataUrlWithSymbolAndDimensions: {
        value: function (url, width, height) {
            var self = this;
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve(img);
                };
                img.setAttribute("src", url);
            }).then(function (img) {
                var canvas = self._canvas,
                    context = self._context,
                    scale = window.devicePixelRatio || 1; // Change to 1 on retina screens to see blurry canvas.

                canvas.style.width = width + "px";
                canvas.style.height = width + "px";
                canvas.height = height * scale;
                canvas.width = width * scale;
                context.scale(scale, scale);
                context.drawImage(img, 0, 0, width, height);
                return canvas.toDataURL();
            });
        }
    },

    _dimensionsForUrl: {
        value: function (url) {
            var data = this._base64Decode(url.substring(22));
            return Size.withHeightAndWidth(
                this._toInt32(data.slice(20, 24)),
                this._toInt32(data.slice(16, 20))
            );
        }
    },

    _pointsToPixels: {
        value: function (points) {
            return Math.round(points * 1.33333);
        }
    },

    _toInt32: {
        value: function (bytes) {
            return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
        }
    },

    _urlForSymbol: {
        value: function (symbol) {
            var url = "data:";
            url += symbol.contentType;
            url += ";base64,";
            url += symbol.imageData;
            return url;
        }
    }

}, {

    PICTURE: ["esriPMS", {
        convert: {
            value: function (symbol) {
                var url = this._urlForSymbol(symbol),
                    dimensions = this._dimensionsForUrl(url),
                    width = symbol.width ? EsriPoint.toPixels(symbol.width) : dimensions.width,
                    height = symbol.height ? EsriPoint.toPixels(symbol.height) : dimensions.height;

                return this._dataUrlWithSymbolAndDimensions(url, width, height)
                    .then(function (newUrl) {
                        var anchor = Point2D.withCoordinates(width / 2, height / 2),
                            scaledSize = Size.withHeightAndWidth(height, width),
                            size = Size.withHeightAndWidth(height * 2, width * 2);
                        return Icon.withSymbolAnchorAndSize(newUrl, anchor, size, scaledSize);
                    });
            }
        }
    }],

    CIRCLE: ["esriSMSCircle", {
        convert: {
            value: function (symbol) {
                var canvas = this._canvas,
                    context = this._context,
                    outline = symbol.outline,
                    outlineWidth = EsriPoint.toPixels(outline && outline.width || 0),
                    symbolSize = EsriPoint.toPixels(symbol.size),
                    diameter = EsriPoint.toPixels(symbolSize + outlineWidth * 2),
                    radius = diameter / 2,
                    url, size, anchor;

                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = diameter;
                canvas.height = diameter;
                context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
                context.closePath();
                context.lineWidth = outlineWidth;
                context.fillStyle = Color.rgbToHex(symbol.color);
                context.fill();
                if (outlineWidth) {
                    context.strokeStyle = Color.rgbToHex(symbol.outline.color);
                    context.stroke();
                }
                url = canvas.toDataURL();
                size = this._dimensionsForUrl(url);
                anchor = Point2D.withCoordinates(size.width / 2, size.height / 2);
                return Promise.resolve(Icon.withSymbolAnchorAndSize(url, anchor, size));
            }
        }
    }],

    DIAMOND: ["esriSMSDiamond", {
        convert: {
            value: function (symbol) {
                var canvas = this._canvas,
                    context = this._context,
                    size = EsriPoint.toPixels(symbol.size),
                    outline = symbol.outline,
                    outlineWidth = EsriPoint.toPixels(outline && outline.width || 0),
                    url, dimensions, anchor;

                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = Math.sqrt((size * size) + (size * size)) + outlineWidth;
                canvas.height = canvas.width;
                context.beginPath();
                context.moveTo(canvas.width / 2, outlineWidth);
                context.lineTo(canvas.width - outlineWidth, canvas.height / 2);
                context.lineTo(canvas.width / 2, canvas.height - outlineWidth);
                context.lineTo(outlineWidth, canvas.height / 2);
                context.closePath();
                context.lineWidth = outlineWidth;
                context.fillStyle = Color.rgbToHex(symbol.color);
                context.fill();
                if (outline) {
                    context.strokeStyle = Color.rgbToHex(outline.color);
                    context.stroke();
                }
                url = canvas.toDataURL();
                dimensions = this._dimensionsForUrl(url);
                anchor = Point2D.withCoordinates(dimensions.width / 2, dimensions.height / 2);
                return Promise.resolve(Icon.withSymbolAnchorAndSize(url, anchor, dimensions));
            }
        }
    }],

    SQUARE: ["esriSMSSquare", {
        convert: {
            value: function (symbol) {
                var canvas = this._canvas,
                    context = this._context,
                    symbolSize = EsriPoint.toPixels(symbol.size),
                    outline = symbol.outline,
                    outlineWidth = EsriPoint.toPixels(outline && outline.width || 0),
                    size = symbolSize + outlineWidth * 2,
                    url, dimensions, anchor;

                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = size;
                canvas.height = size;
                context.rect(0, 0, size, size);
                context.lineWidth = outlineWidth;
                context.fillStyle = Color.rgbToHex(symbol.color);
                context.fill();
                if (outlineWidth) {
                    context.strokeStyle = Color.rgbToHex(symbol.outline.color);
                    context.stroke();
                }
                url = canvas.toDataURL();
                dimensions = this._dimensionsForUrl(url);
                anchor = Point2D.withCoordinates(dimensions.width / 2, dimensions.height / 2);
                return Promise.resolve(Icon.withSymbolAnchorAndSize(url, anchor, dimensions));
            }
        }
    }]

});
