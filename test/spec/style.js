var Icon = require("montage-geo/logic/model/icon").Icon,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Point2D = require("montage-geo/logic/model/point-2d").Point2D,
    Serializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer,
    Size = require("montage-geo/logic/model/size").Size,
    Style = require("montage-geo/logic/model/style").Style;

describe("Style", function () {
    
    var DEFAULT_MARKER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAoCAYAAADkDTpVAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAA6hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0wOS0wN1QxNDowOTo1MjwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAzLjcuNDwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpDb21wcmVzc2lvbj4wPC90aWZmOkNvbXByZXNzaW9uPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4yNDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NDA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KE+zJYgAABulJREFUSA2VVltsHNUZ/ua2uzOzu06cTeJNCAnmkqKINqVCqlrair5UrYQqEEWqqCqhCOWhKe0DjaI2tNtUiFYND+AGiahAUUXvKqh1xRMq8BJEKYE+BIhMvIljx3bW3vvM7FzO9Dt7sTfOruMc6cyZOef/v//+n1EwZGR+8dreOoyHEwq+E8XxzqSiuGlDC8thpEUiNjVFWdRF/MdIhC/6ha//bwgMlKsOCgUV6hcPq0pc2JNJI2unkxkziaTGbZILxPCFQMPzUak7/kytpgRx9Ev8O3kMb9wTrsW7UkBhctxQjb9kde32T+Xzlm4YaEQCfhSjKWK0OJOqApszoSmwKFREAc7NLTilIPwkUNxv4fFvftwvZFXATye/BkV79ZbRTdquLaNGLYix6EeI+qkHvOcSGkbpx/nScvhRuRxR4rdx7N5XeqQdAYV/5lShTe3fkR9J2TZm3bCtcY/oWqu0KJ/S4bccnJ6ZbY5GYu/SE/fOSj5VPhKR8rs9WStlmhamGj6aoQDojv7JgMImrVz79+W7pC+Sz0yYGB/J6hVV+b3ElUPTfvL3hwxN/eFtO3anLnoCdTJIt/TmZl3FLmq3jTOtAbmkgSz3GBbU+OjRBeQJ+JHPpvVabXnMu/uBRbz15/cUHH21+Zmdu63ASKHoSfLVMU7QjCZQXb6MSrOOkh8io2vYbqeRHt0GHxqm6U4J3ht7UhqMwMMHs9MedGOLPqJAMU0bH9YDEq7GfDyhwohaOHexiO/ecQMOfGE/xremcbHs4OV3pnHinSlsH7sRY4kUzrbo0u6YcgXuzNgYUTXRdIM7dcuy0KAP/Zg2dwezD1sMBaVLs/j5V2/HwS/d2jvCTbk0jn7jDuzLj+AHkx8gd8OtSDPj6l3jfVJKPMs0Fd8v36VaCdt0ZFAlfnduZ443GjXkacUjd9+yAt7/ct9nb8T+URvNahmjUqM+fokncYNY+7KaSppYkvUnrexOk8nVarn4ys05qMqq2/oFyPd7btsO4blgG1nhlRgST+JGsfi8HvMwkCnR56K2OlGINIO83rBooRIzcm3t5aMzAmZiTC/EEKbquQ4sFkq/iVXpT2bVqU8WezwD17fPLSLQzI7/+1yUJZ7EVUR8WvWcRmDLcusjKAUCKWsEb18q4/Uz7YK8SsDpYgn/OjsPK70Zc2timCRew2n4bItvql6z4httCyhBuklOMixEKjKju/DQS2/iD6fO0o0yQCxAdtLJ94u47+TrsLfsRJ21wG64ykt+iRc2qj7C+D963W+aWyMSyECF0ozOKDmMgb0ZVt7A4cn3ceBvp7BvcxZTlQZMQ4eVG4dqZdkiyNuR3WHUFagiQqXlmKztd/VAKP+tVkt3ZextqAd97Zx8xVoAjf3p5l2fhh20WMketmaTUFlcC60Y1WoffVexjKGhWrkcs37fxdOPLOhaHByvlWZezI+MWXVJtGpEmyVyIpzlBLWGmqE7SOCwOayhaxPTCdvYp2YvX3ARt34l99TIi1/xQt933CrbqiwYcg6a0s8eNZar7KiDaMjvNMvwQ79x/zOb/tEWgJMHAz0Kn3WW5twczevPput6J9oOXj6VpRlXxOFTf8WD1KR7H/hxOOE0ljS91WTDp5BuRV/XSuV8p46wWWOFBc9LcDlkBQDPfm+efwoTpdK0O5Jax02D3CL3aGqO7qmUii7Rn8KJQ0ttXD46Avgi0HoydCuIPYaapl6Xe0gfujUoXk3Yvvh1D1yuKwKkVEvgeL103s3w0miPjnLrCyNhJqkhuDzt8PflyfLJg8yW1bEqgHspxT2ue9UoaGfUBq1I6oiaFTSDZggRPr0K3Xm7QsDyxKMsLTzhLU27ei9lZUoOm8SweDE5S+ccM4qOMZaNdQXIwx2+eEYN3JZOrUDt1o0Ffe81l9liPM89kzixFlx+X2GB3Jg7edBBHP6sVS267cKTPWpQLOQ+rRSV86xa8TjeeNiT/GvHVQIkATPquTjwGrR9eHXLntzkeeTVkNv027XAve+BAjDxaItWHMUwK6T2Bn+Gea7F4scoPCjv+oFjsABJmrv0AgK/DKfUqYv+6mZayn0RBqX7Jza9NBC5uzlcQKEQGrE4otYYC2rL25+x4JQrO6ZRKdLn4ZFezxkmZLgAcgRb514WYTgPZ4EZRVLZFtraz/NmC2dp5Z+GAff21xWAQkHwl+GwUb/A30BqzpwHM1evz3iC++3zHtKQlRzXGvTLoRfOIL17L+wxBc1L/J2+8CEmDuy7Fqc8X9+CNoISJ5XwMdM57yPyYTszAYT40UbAJc0GLOhCff/593gZ76eQ0/jNgc9tVMAGLOhA6bF4LCE8RcfGtd+oEit0+qHnjqx8bPDl/8bgwiRbZ4JPAAAAAElFTkSuQmCC",
        FILL_COLOR = "rgba(255, 0, 0, 0)",
        STROKE_COLOR = "rgba(255, 255, 0, 0)",
        FILL_OPACITY = 0.75,
        STROKE_OPACITY = 0.25,
        STROKE_WEIGHT = 2.0,
        HEIGHT = 40,
        WIDTH = 24,
        icon, anchor, size;
    
    beforeEach(function () {
        anchor = Point2D.withCoordinates(WIDTH / 2, HEIGHT / 2);
        size = Size.withHeightAndWidth(HEIGHT, WIDTH);
        icon = Icon.withSymbolAnchorAndSize(DEFAULT_MARKER, anchor, size);
    });

    it("can create style objects for points", function () {
        var style = Style.withValues(icon);
        expect(style.icon).toBeDefined();
        expect(style.icon.symbol).toBe(DEFAULT_MARKER);
        expect(style.icon.width).toBe(WIDTH);
        expect(style.icon.height).toBe(HEIGHT);
    });
    
    it("can create style objects for lines", function () {
        var style = Style.withValues(STROKE_COLOR, STROKE_OPACITY, STROKE_WEIGHT);
        expect(style.strokeColor).toBe(STROKE_COLOR);
        expect(style.strokeWeight).toBe(STROKE_WEIGHT);
        expect(style.strokeOpacity).toBe(STROKE_OPACITY);
    });
    
    it("can create style objects for polygons", function () {
        var style = Style.withValues(FILL_COLOR, FILL_OPACITY, STROKE_COLOR, STROKE_OPACITY, STROKE_WEIGHT);
        expect(style.fillColor).toBe(FILL_COLOR);
        expect(style.fillOpacity).toBe(FILL_OPACITY);
        expect(style.strokeColor).toBe(STROKE_COLOR);
        expect(style.strokeOpacity).toBe(STROKE_OPACITY);
        expect(style.strokeWeight).toBe(STROKE_WEIGHT);
    });
    
    it("can serialize marker styles", function () {
        var style = Style.withValues(icon),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(style);
        expect(serialized).not.toBeNull();
    });
    
    it("can deserialize marker styles", function (done) {
        
        var style = Style.withValues(icon),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(style);
        
        new Deserializer().init(serialized, require).deserializeObject()
            .then(function (deserialized) {
                    expect(deserialized.icon).toBeDefined();
                    expect(deserialized.icon.symbol).toBe(DEFAULT_MARKER);
                    done();
                }
            );
    });
    
    it("can serialize line styles", function () {
        var style = Style.withValues(STROKE_COLOR, STROKE_OPACITY, STROKE_WEIGHT),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(style);
        expect(serialized).not.toBeNull();
    });
    
    it("can deserialize line styles", function (done) {
        
        var style = Style.withValues(STROKE_COLOR, STROKE_OPACITY, STROKE_WEIGHT),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(style);
        
        new Deserializer().init(serialized, require).deserializeObject()
            .then(function (deserialized) {
                    expect(deserialized.strokeColor).toBe(STROKE_COLOR);
                    expect(deserialized.strokeOpacity).toBe(STROKE_OPACITY);
                    expect(deserialized.strokeWeight).toBe(STROKE_WEIGHT);
                    done();
                }
            );
    });
    
    it("can serialize polygon styles", function () {
        var style = Style.withValues(FILL_COLOR, FILL_OPACITY, STROKE_COLOR, STROKE_OPACITY, STROKE_WEIGHT),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(style);
        expect(serialized).not.toBeNull();
    });
    
    it("can deserialize polygon styles", function (done) {
        
        var style = Style.withValues(FILL_COLOR, FILL_OPACITY, STROKE_COLOR, STROKE_OPACITY, STROKE_WEIGHT),
            serializer = new Serializer().initWithRequire(require),
            serialized = serializer.serializeObject(style);
        
        new Deserializer().init(serialized, require).deserializeObject()
            .then(function (deserialized) {
                    expect(deserialized.fillColor).toBe(FILL_COLOR);
                    expect(deserialized.fillOpacity).toBe(FILL_OPACITY);
                    expect(deserialized.strokeColor).toBe(STROKE_COLOR);
                    expect(deserialized.strokeOpacity).toBe(STROKE_OPACITY);
                    expect(deserialized.strokeWeight).toBe(STROKE_WEIGHT);
                    done();
                }
            );
    });
    
    
});
