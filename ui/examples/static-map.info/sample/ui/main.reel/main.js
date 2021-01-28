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
            var lineStringFeature;
            if (!firstTime) {
                return;
            }

            lineStringFeature = Feature.withMembers(1, {}, Point.withCoordinates([178.25671,-4.67183]));
            lineStringFeature.style = new Style(StyleType.POINT);
            lineStringFeature.style.dataURL = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20data-montage-id%3D%22owner%22%20class%3D%22contour-PolylineOverlay%20contour-PolylineOverlay--visible%20contour-PolylineOverlay--persisted%20contour-PolylineOverlay--isDisabled%22%20width%3D%22599.0429866666673%22%20height%3D%22585.1288405257621%22%20style%3D%22left%3A%20-298.154px%3B%20top%3A%20-284.92px%3B%20z-index%3A%205300%3B%20touch-action%3A%20auto%3B%22%3E%3Cpolyline%20points%3D%2210%2C575.1288405257621%20589.0429866666673%2C10%22%20fill%3D%22none%22%20stroke%3D%22%2300FF00%22%20stroke-opacity%3D%221%22%20stroke-width%3D%224%22%3E%3C%2Fpolyline%3E%3Crect%20class%3D%22contour-FigureOverlay-rect-LabelBox%22%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%221%22%20stroke%3D%22%23000000%22%20stroke-opacity%3D%221%22%20stroke-width%3D%221%22%20x%3D%22251.23243083333364%22%20y%3D%22278.5566077628811%22%20width%3D%2296.578125%22%20height%3D%2228.015625%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22299.52149333333364%22%20y%3D%22292.5644202628811%22%20style%3D%22fill%3A%20rgb(0%2C%200%2C%200)%3B%20font-family%3A%20%26quot%3BProxima%20Nova%26quot%3B%2C%20sans-serif%3B%20font-size%3A%2014px%3B%20stroke%3A%20none%3B%20text-anchor%3A%20middle%3B%20dominant-baseline%3A%20central%3B%22%3E7%2C644.096%20km%3C%2Ftext%3E%3C%2Fsvg%3E";
            this.featureCollection.features.push(lineStringFeature);
        }
    }
});
