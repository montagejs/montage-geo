var Position = require("montage-geo/logic/model/position").Position,
    Component = require("montage/ui/component").Component,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Projection = require("montage-geo/logic/model/projection").Projection,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer,
    Set = require("montage/collections/set").Set;

describe("A Position", function () {

    it("can be created", function () {
        var p1 = Position.withCoordinates([-156.6825, 20.8783]);
        var p2 = Position.withCoordinates(-156.6825, 20.8783);
        expect(p1.longitude === p2.longitude).toBe(true);
        expect(p1.latitude === p2.latitude).toBe(true);
        expect(p1.altitude === p2.altitude).toBe(true);
    });

    it ("can project a point during intialization", function () {
        var projection = Projection.forSrid("3857"),
            position = Position.withCoordinates(12803799.48217668, 545681.180577986, projection);

        expect(position).toBeDefined();
    });

    it("can calculate the midpoint between a position and another", function () {
        var p1 = Position.withCoordinates(0.119, 52.205),
            p2 = Position.withCoordinates(2.351, 48.857),
            mid = p1.midPointTo(p2);
        expect(mid.latitude).toBe(50.53633);
        expect(mid.longitude).toBe(1.27461);
    });

    it("can calculate destination with distance and bearing", function () {
        var p1 = Position.withCoordinates(0, 0),
            p2 = Position.withCoordinates(2.351, 48.857),
            dest1 = p1.destination(25000, 225),
            dest2 = p1.destination(40000, 270),
            dest5 = p1.destination(804673.5, 270),
            dest3 = p2.destination(10000, 90),
            dest4 = p2.destination(15000, 30);

        expect(dest1).toBeDefined();
        expect(isNaN(dest1.latitude)).toBe(false);
        expect(isNaN(dest1.longitude)).toBe(false);
        expect(dest2).toBeDefined();
        expect(isNaN(dest2.latitude)).toBe(false);
        expect(isNaN(dest2.longitude)).toBe(false);
        expect(dest3).toBeDefined();
        expect(isNaN(dest3.latitude)).toBe(false);
        expect(isNaN(dest3.longitude)).toBe(false);
        expect(dest4).toBeDefined();
        expect(isNaN(dest4.latitude)).toBe(false);
        expect(isNaN(dest4.longitude)).toBe(false);

        expect(dest5).toBeDefined();
        expect(isNaN(dest5.latitude)).toBe(false);
        expect(isNaN(dest5.longitude)).toBe(false);
    });

    it("can serialize", function () {
        var p1 = Position.withCoordinates([-156.6825, 20.8783]),
            serializer = new Serializer().initWithRequire(require),
            serializedPosition = serializer.serializeObject(p1);
        expect(serializedPosition).not.toBeNull();
    });

    it("can deserialize", function (done) {
        var p1 = Position.withCoordinates([-156.6825, 20.8783]),
            serializedPosition = new Serializer().initWithRequire(require).serializeObject(p1);
        new Deserializer().init(serializedPosition, require).deserializeObject().then(function (position) {
            expect(position.constructor.name).toBe("Position");
            expect(position.longitude).toBe(-156.6825);
            expect(position.latitude).toBe(20.8783);
            expect(position.altitude).toBe(0);
            done();
        });
    });

    it("can properly monitor a set", function () {

        var MyComponent = Component.specialize({
                inSet: {
                    value: false
                },
                aSet: {
                    value: new Set()
                },
                foo: {
                    value: {}
                }
            }),
            c = new MyComponent();
        c.aSet.add(c.foo);
        c.defineBinding("inSet", {"<-": "aSet.has(foo)"});
        expect(c.inSet).toBe(true);
        c.aSet.delete(c.foo);
        expect(c.inSet).toBe(false);

    });

    it ("can use regex in an expression", function () {

        var MyComponent = Component.specialize({
                isImageFile: {
                    value: false
                },
                filenameExtension: {
                    value: "jpg"
                },
                matchExpression: {
                    value: new RegExp("jpg|jpeg|png|gif", "i")
                }
            }),
            c = new MyComponent();

        c.defineBinding("isImageFile", {"<-": "matchExpression.test(filenameExtension)"});
        expect(c.isImageFile).toBe(true);
        c.filenameExtension = "docx";
        expect(c.isImageFile).toBe(false);
        c.filenameExtension = "png";
        expect(c.isImageFile).toBe(true);

    });




});
