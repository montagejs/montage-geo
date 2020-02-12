var KmlStyleToStyleConverter = require("montage-geo/logic/converter/kml-style-to-style-converter").KmlStyleToStyleConverter,
    EsriSymbolToStyleConverter = require("montage-geo/logic/converter/esri-symbol-to-style-converter").EsriSymbolToStyleConverter;

var POLYLINE_SYMBOL = {type: "esriSLS",
    style: "esriSLSSolid",
    color: [255, 0, 0, 255],
    width: 1.2
};

describe("A KML To Style Converter", function () {

    xit("can convert KML IconStyle to style", function () {

    });

    xit("can convert KML LineStyle to style", function () {

    });

    xit("can convert KML PolyStyle to style", function () {

    });

    xit("can revert Style to KML IconStyle", function () {

    });

    it("can revert Style to KML LineStyle", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(POLYLINE_SYMBOL).then(function (style) {
            var kmlConverter = new KmlStyleToStyleConverter(),
                kmlStyle = kmlConverter.revert(style);
            expect(kmlStyle).toBeDefined();
            done();
        });
    });

    xit("can revert Style to KML PolyStyle", function () {

    });

});
