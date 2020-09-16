var Component = require("montage/ui/component").Component,
    Feature = require("montage-geo/logic/model/feature").Feature,
    LineString = require("montage-geo/logic/model/line-string").LineString,
    Point = require("montage-geo/logic/model/point").Point,
    Style = require("montage-geo/logic/model/style").Style,
    StyleType = require("montage-geo/logic/model/style").StyleType;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    constructor: {
        value: function Main() {
            this.application.delegate = this;
        }
    },

    enterDocument: {
        value: function (firstTime) {
            var lineStringFeature, labelFeature;
            if (!firstTime) {
                return;
            }

            lineStringFeature = Feature.withMembers(1, {}, LineString.withCoordinates([[-159.51684,22.04075],[-155.34881,19.57096]]));
            lineStringFeature.style = new Style(StyleType.LINE_STRING);
            lineStringFeature.style.strokeColor = "#FF0000";
            this.featureCollection.features.push(lineStringFeature);

            labelFeature = Feature.withMembers(2, {}, Point.withCoordinates(-157.43283, 20.81091));
            labelFeature.style = new Style(StyleType.POINT);
            labelFeature.style.dataURL = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20width%3D%22144.28125%22%20height%3D%2249%22%3E%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%22138.28125%22%20height%3D%2243%22%20style%3D%22fill%3Awhite%3Bstroke%3A%23ff00ff%3Bstroke-width%3A6%3Bstroke-opacity%3A0.5%22%3E%3C%2Frect%3E%3Ctext%20style%3D%22font-size%3A23%3Bfill%3A%230000FF%3Bfont-family%3A%26quot%3BProxima%20Nova%26quot%3B%2Csans-serif%22%20x%3D%2213%22%20y%3D%2236%22%3E512.900%20km%3C%2Ftext%3E%3C%2Fsvg%3E";
            this.featureCollection.features.push(labelFeature);
        }
    }
});
