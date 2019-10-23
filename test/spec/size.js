var Size = require("montage-geo/logic/model/size").Size,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

describe("Size", function () {

    var HEIGHT = 100,
        WIDTH = 300,
        size;

    beforeEach(function () {
        size = Size.withHeightAndWidth(HEIGHT, WIDTH);
    });

    it("can be created", function () {
        expect(size).toBeDefined();
        expect(size.height).toBe(HEIGHT);
        expect(size.width).toBe(WIDTH);
    });

    it("can be tested for equality", function () {
        var other = Size.withHeightAndWidth(HEIGHT, WIDTH);
        expect(size.equals(other)).toBe(true);
    });

    it("can be cloned", function () {
        var clone = size.clone();
        expect(clone.height).toBe(size.height);
        expect(clone.width).toBe(size.width);
    });

    it("can be multiplied", function () {
        var tenX = size.multiply(10);
        expect(tenX.height).toBe(1000);
        expect(tenX.width).toBe(3000);
    });

    it("can be divided", function () {
        var tenX = size.multiply(10),
            original = tenX.divide(10);
        expect(original.equals(size)).toBe(true);
    });

    it("can be serialized", function () {
        var serializer = new Serializer().initWithRequire(require),
            serializedPoint = serializer.serializeObject(size);
        expect(serializedPoint).not.toBeNull();
    });

    it("can be deserialized", function (done) {
        var serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(size);

        new Deserializer().init(serialized, require).deserializeObject()
            .then(function (deserialized) {
                expect(deserialized.height).toBe(HEIGHT);
                expect(deserialized.width).toBe(WIDTH);
                done();
            }
        );
    });

});
