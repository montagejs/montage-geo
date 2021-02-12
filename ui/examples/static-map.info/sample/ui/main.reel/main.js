var BoundingBox = require("montage-geo/logic/model/bounding-box").BoundingBox,
    Component = require("montage/ui/component").Component,
    Point = require("montage-geo/logic/model/point").Point,
    Point2D = require("montage-geo/logic/model/point-2d").Point2D,
    Rect = require("montage-geo/logic/model/rect").Rect,
    Size = require("montage-geo/logic/model/size").Size,
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

    dpr: {
        value: 1
    },

    enterDocument: {
        value: function (firstTime) {
            var center, center2d, rect, lineStringFeature;
            if (!firstTime) {
                return;
            }

            center = Point.withCoordinates(179.06738, -3.91511);
            center2d = Point2D.withPosition(center.coordinates, 4);
            rect = Rect.withOriginAndSize(
                Point2D.withCoordinates(center2d.x - 512, center2d.y - 512),
                Size.withHeightAndWidth(1024, 1024)
            );
            this.map.bounds = BoundingBox.withRectAtZoomLevel(rect, 4);

            lineStringFeature = Feature.withMembers(1, {}, Point.withCoordinates([178.25671,-4.67183]));
            lineStringFeature.style = new Style(StyleType.POINT);
            lineStringFeature.style.dataURL = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20data-montage-id%3D%22owner%22%20class%3D%22contour-PolylineOverlay%20contour-PolylineOverlay--visible%20contour-PolylineOverlay--persisted%20contour-PolylineOverlay--isDisabled%22%20width%3D%22599.0429866666673%22%20height%3D%22585.1288405257621%22%20style%3D%22left%3A%20-298.154px%3B%20top%3A%20-284.92px%3B%20z-index%3A%205300%3B%20touch-action%3A%20auto%3B%22%3E%3Cpolyline%20points%3D%2210%2C575.1288405257621%20589.0429866666673%2C10%22%20fill%3D%22none%22%20stroke%3D%22%2300FF00%22%20stroke-opacity%3D%221%22%20stroke-width%3D%224%22%3E%3C%2Fpolyline%3E%3Crect%20class%3D%22contour-FigureOverlay-rect-LabelBox%22%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%221%22%20stroke%3D%22%23000000%22%20stroke-opacity%3D%221%22%20stroke-width%3D%221%22%20x%3D%22251.23243083333364%22%20y%3D%22278.5566077628811%22%20width%3D%2296.578125%22%20height%3D%2228.015625%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22299.52149333333364%22%20y%3D%22292.5644202628811%22%20style%3D%22fill%3A%20rgb(0%2C%200%2C%200)%3B%20font-family%3A%20%26quot%3BProxima%20Nova%26quot%3B%2C%20sans-serif%3B%20font-size%3A%2014px%3B%20stroke%3A%20none%3B%20text-anchor%3A%20middle%3B%20dominant-baseline%3A%20central%3B%22%3E7%2C644.096%20km%3C%2Ftext%3E%3C%2Fsvg%3E";
            this.featureCollection.features.push(lineStringFeature);

            var hazardFeature = Feature.withMembers(2, {}, Point.withCoordinates([-156.5, 21.5]));
            hazardFeature.style = new Style(StyleType.POINT);
            hazardFeature.style.icon = {
                anchor: Point2D.withCoordinates(16, 16),
                size: Size.withHeightAndWidth(32, 32),
                symbol: "data:image/png;base64,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"
            }
            this.featureCollection.features.push(hazardFeature);

            var hazardFeature = Feature.withMembers(3, {}, Point.withCoordinates([138.633, -34.793]));
            hazardFeature.style = new Style(StyleType.POINT);
            hazardFeature.style.icon = {
                anchor: Point2D.withCoordinates(16, 16),
                size: Size.withHeightAndWidth(32, 32),
                symbol: "data:image/png;base64,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"
            }
            this.featureCollection.features.push(hazardFeature);
        }
    }
});
