var Position = require("montage-geo/logic/model/position").Position,
    Component = require("montage/ui/component").Component,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
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

    it("can calculate the midpoint between a position and another", function () {
        var p1 = Position.withCoordinates(0.119, 52.205),
            p2 = Position.withCoordinates(2.351, 48.857),
            mid = p1.midPointTo(p2);
        expect(mid.latitude).toBe(50.53632687827434);
        expect(mid.longitude).toBe(1.2746141006781915);
    });

    // Needs serialization changes...
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

    it("can convert to MGRS", function (){
        var p1 = Position.withCoordinates([-156.6825, 20.8783]),
            p2 = Position.withCoordinates([0, 0]);

        expect(p1.mgrs()).toBe("4QGJ4109910417");
        expect(p2.mgrs()).toBe("31NAA6602100000");
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
