/**
 *
 * An object that stores color data and sometimes transparency.
 *
 * @class
 * @extends Object
 */
var Color = exports.Color = new function Color() {};

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

