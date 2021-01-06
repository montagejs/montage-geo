var Point2D = require("montage-geo/logic/model/point-2d").Point2D,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Rect = require("montage-geo/logic/model/rect").Rect,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer,
    Size = require("montage-geo/logic/model/size").Size;

describe("Rect", function () {

    var X = 10,
        Y = 20,
        HEIGHT = 100,
        WIDTH = 200,
        origin, rect, size;

    beforeEach(function () {
        origin = Point2D.withCoordinates(X, Y);
        size = Size.withHeightAndWidth(HEIGHT, WIDTH);
        rect = Rect.withOriginAndSize(origin, size);
    });

    it("can be created", function () {
        expect(rect).toBeDefined();
        expect(rect.origin).toBeDefined();
        expect(rect.size).toBeDefined();
    });

    it("can calculate its derived properties", function () {
        expect(rect.height).toBe(HEIGHT);
        expect(rect.width).toBe(WIDTH);
        expect(rect.xMin).toBe(X);
        expect(rect.xMid).toBe(110);
        expect(rect.xMax).toBe(210);
        expect(rect.yMax).toBe(Y);
        expect(rect.yMid).toBe(-30);
        expect(rect.yMin).toBe(-80);
    });

    it("calcuates bounds with a zero size", function () {
        rect = Rect.withOriginAndSize(origin, Size.withHeightAndWidth(0, 0));
        expect(rect.xMin).toBe(X);
        expect(rect.xMid).toBe(X);
        expect(rect.xMax).toBe(X);
        expect(rect.yMin).toBe(Y);
        expect(rect.yMid).toBe(Y);
        expect(rect.yMax).toBe(Y);
    });

    it("can clone itself", function () {
        var clone = rect.clone();
        expect(clone).toBeDefined();
        expect(clone.origin).toBeDefined();
        expect(clone.size).toBeDefined();
        expect(clone.origin).not.toBe(origin);
        expect(clone.size).not.toBe(size);
        expect(clone.xMin).toBe(X);
        expect(clone.yMax).toBe(Y);
        expect(clone.height).toBe(HEIGHT);
        expect(clone.width).toBe(WIDTH);
    });

    it("can be serialized", function () {
        var serializer = new Serializer().initWithRequire(require),
            serializedRect = serializer.serializeObject(rect);
        expect(serializedRect).not.toBeNull();
    });

    it("can be deserialized", function (done) {
        var serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(rect);

        new Deserializer().init(serialized, require).deserializeObject()
            .then(function (deserialized) {
                    expect(deserialized.height).toBe(HEIGHT);
                    expect(deserialized.width).toBe(WIDTH);
                    expect(deserialized.xMin).toBe(X);
                    expect(deserialized.yMax).toBe(Y);
                    done();
                }
            );
    });

});
