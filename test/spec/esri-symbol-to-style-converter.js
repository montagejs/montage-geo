var EsriSymbolToStyleConverter = require("montage-geo/logic/converter/esri-symbol-to-style-converter").EsriSymbolToStyleConverter;

describe("A Esri Symbol To Style Converter", function () {

    var EARTHQUAKE_SYMBOL = {
        "type": "esriPMS",
        "url": "ff974a66e72ffc726d96fb4c86e30ed8",
        "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARdJREFUGJV90DFLw2AQxvF/y5tMlRaEYMAhS0kGpUMFCSIoRHHoJ3BJ6C4OgqX4FYqTH8IxQ3ah2GyFdBVCh4SmSMWWF7dQXKyEWvtMB/e7gzvB35SBKrAAlsWGKNRV3/c79Xr9rFar7UopP8fjcb/b7T5GUTQt4p0wDJ9t274qbjJN81jX9SPP866jKJoKgCAIOutwlUajcd7r9R4cx7kRAIZhXG6CqxiGcQGUBYCqqvo2XKlU9oCqAMjzfA7s/4ellHNgIQCyLOtblnVQKpU24slk8gosBUCapvfD4fC02Wwerg+MRqO3OI7v4Od1rut+BUFwMhgMnjRNcxRF0fI8/5jNZi9Jkty22+33XwzQarUk4G479Bski1p+Rt2hTgAAAABJRU5ErkJggg==",
        "contentType": "image/png",
        "width": 8,
        "height": 8,
        "angle": 0,
        "xoffset": 0,
        "yoffset": 0
    };

    var CIRCLE_SYMBOL = {
        type: "esriSMS",
        style: "esriSMSCircle",
        color: [
            230,
            0,
            0,
            255
        ],
        size: 4,
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        outline: null
    };

    var SQUARE_SYMBOL = {
        "type": "esriSMS",
        "style": "esriSMSSquare",
        "color": [
            76,
            115,
            0,
            255
        ],
        "size": 8,
        "angle": 0,
        "xoffset": 0,
        "yoffset": 0,
        "outline": {
            "color": [
                152,
                230,
                0,
                255
            ],
            "width": 1
        }
    };

    var DIAMOND_SYMBOL = {
        type: "esriSMS",
        style: "esriSMSDiamond",
        color: [
            255,
            255,
            0,
            255
        ],
        size: 7,
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        outline: {
            color: [
                0,
                0,
                0,
                255
            ],
            width: 1
        }
    };

    var POLYLINE_SYMBOL = {type: "esriSLS",
        style: "esriSLSSolid",
        color: [255, 0, 0, 255],
        width: 1.2
    };

    var POLYGON_SYMBOL = {
        type: "esriSFS",
        style: "esriSFSSolid",
        color: [255, 102, 51, 255],
        outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            color: [0, 0, 0, 0],
            width: 0.4
        }
    };

    it("can convert a point picture symbol to style", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(EARTHQUAKE_SYMBOL).then(function (style) {
            expect(style).toBeDefined();
            expect(style.icon).toBeDefined();
            expect(style.icon.scaledSize).toBeDefined();
            expect(style.icon.anchor).toBeDefined();
            expect(style.icon.size).toBeDefined();
            expect(style.icon.scaledSize.width).toBeDefined(11);
            expect(style.icon.size.width).toBeDefined(22);
            expect(style.icon.symbol).toBeDefined("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEWElEQVRIS5WUy28bVRTG79zxHc9cx3HGHmcSp3GqNkAxIRHgNA8aYYtFFwghsahYsGKFhBT+Be+y8KoSC6RKqLtsUBaVKqurOqQ0JUqqisrGmKImJDhubZyx5+E7nhe6Qw2lgjQ5m9FI3/mdT+ecexjw8mAAAAgAEHwmNQEAFgDAOy6VJj0f9B/m83n+zJkzkXg8PhAOhwXXdflut8tT4eDgIIEQEkVRiK7rWrlc7hQKhW6xWHSeL/YimKXucrlcIpVKTYmieD4ajY5gjIeCwaDgeR5j2zYhhHKVuqIojyuVSunGjRs1hBCF232XfTD9MisrK9TlWCKRuBCLxWZDodBrGOMRjuOGEEJBhmGAZVm9Xq/XJoQ8MQzjl2azuXN4eFjpdDq/ra2tHfWd98GQOr1+/frk+Ph4VpKki6OjoymM8SjDMDyEEEEIqQZ4nue6rmu5rmsSQurNZrPabDa3Hz16dPvatWvVvnMfnM/nQ7Ztx9Pp9NsjIyMfiaI4K0nSWDAYHDxuQKZpau12+1BRlPt7e3s3S6XSNsuyvy8vL3d88OrqagIh9M7Zs2ffnZiYeD8cDr+KEBKo0+PAruvalmXRIf66t7e3Ua/X77Ase/fy5cv7Pnh9ff0V13U/kGU5k0wmaW8TL9/CfxSGYTw5ODh42Gq1igCAtYWFhZ988M7OzjSE8NNIJJKRZfk8xjh6GjAhpNNoNA40TSvatv3N9PT0fR9cqVTSrut+PjAwkInH4zLP8wOnAZumSffvSNO07xRF+SqdTm/54Gq1OgcAWBYEISNJksjzvHAacK/Xs1RV1TVNu7O/v391aWnpBx9cLpfnWZb9EmNMwUM8z/uv7KRBwZ1Op2sYxgYFX7p06Z4PLpVKFyGEX9BWxGIxSRAEfFIo1ZmmaR4dHamGYaxrmnZ1ZmbmL8cPHjx4CwDwWSQSeW94eDiJMY6cBkwI0RqNxhNVVdc9z/t6ampq2wdvbm6+7rrux5IkZcbGxt7EGMv0+Z40dF3/o1arVRVFoVuxuri4+NDPvnXr1jiEcEGW5aVEIpHBGE9yHIdYlqVH6X/DcRzXsizLMIzdWq129+nTpxsQwtvZbHa3Dw6xLCtHo9E5jPEnoVBoNhaL0e3gj3NOCKG97ei6fr/dbn9br9fvGYaxf+XKlbYPzuVyMJVKBZLJ5AWGYT6MRCJzkiRN8jw/DCGkG8IBANhnRRzP8yzP8+j5bLZarceqqm7pun6zWq2Wz507181ms/bfZzOXyzHz8/NDoiiOI4SmeZ5fQgi9gRBKsCwr0gIU7Hme6TiOYllW3bbtMiHke13Xf1RVdZfjuFYmk3EYhvH+NSHP82ChUEChUCgJIZznef4CxjjBcZzIsixPD73jOKZt20q32z00TfNn0zS3Go3GbjweJ9RpfyAvgv2DXywWMcdxMY7jwoIgCIFAgOM4Dtq2zUAIHdM0LdoHTdPUXq/XCgQCet/pf4JPul4n0f0JvY8eXU99ibsAAAAASUVORK5CYII=");
            done();
        });
    });

    it("can convert a point circle symbol to style", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(CIRCLE_SYMBOL).then(function (style) {
            expect(style).toBeDefined();
            expect(style.icon).toBeDefined();
            expect(style.icon.anchor).toBeDefined();
            expect(style.icon.size).toBeDefined();
            expect(style.icon.size.width).toBeDefined(5);
            // expect(style.icon.symbol).toBeDefined("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEWElEQVRIS5WUy28bVRTG79zxHc9cx3HGHmcSp3GqNkAxIRHgNA8aYYtFFwghsahYsGKFhBT+Be+y8KoSC6RKqLtsUBaVKqurOqQ0JUqqisrGmKImJDhubZyx5+E7nhe6Qw2lgjQ5m9FI3/mdT+ecexjw8mAAAAgAEHwmNQEAFgDAOy6VJj0f9B/m83n+zJkzkXg8PhAOhwXXdflut8tT4eDgIIEQEkVRiK7rWrlc7hQKhW6xWHSeL/YimKXucrlcIpVKTYmieD4ajY5gjIeCwaDgeR5j2zYhhHKVuqIojyuVSunGjRs1hBCF232XfTD9MisrK9TlWCKRuBCLxWZDodBrGOMRjuOGEEJBhmGAZVm9Xq/XJoQ8MQzjl2azuXN4eFjpdDq/ra2tHfWd98GQOr1+/frk+Ph4VpKki6OjoymM8SjDMDyEEEEIqQZ4nue6rmu5rmsSQurNZrPabDa3Hz16dPvatWvVvnMfnM/nQ7Ztx9Pp9NsjIyMfiaI4K0nSWDAYHDxuQKZpau12+1BRlPt7e3s3S6XSNsuyvy8vL3d88OrqagIh9M7Zs2ffnZiYeD8cDr+KEBKo0+PAruvalmXRIf66t7e3Ua/X77Ase/fy5cv7Pnh9ff0V13U/kGU5k0wmaW8TL9/CfxSGYTw5ODh42Gq1igCAtYWFhZ988M7OzjSE8NNIJJKRZfk8xjh6GjAhpNNoNA40TSvatv3N9PT0fR9cqVTSrut+PjAwkInH4zLP8wOnAZumSffvSNO07xRF+SqdTm/54Gq1OgcAWBYEISNJksjzvHAacK/Xs1RV1TVNu7O/v391aWnpBx9cLpfnWZb9EmNMwUM8z/uv7KRBwZ1Op2sYxgYFX7p06Z4PLpVKFyGEX9BWxGIxSRAEfFIo1ZmmaR4dHamGYaxrmnZ1ZmbmL8cPHjx4CwDwWSQSeW94eDiJMY6cBkwI0RqNxhNVVdc9z/t6ampq2wdvbm6+7rrux5IkZcbGxt7EGMv0+Z40dF3/o1arVRVFoVuxuri4+NDPvnXr1jiEcEGW5aVEIpHBGE9yHIdYlqVH6X/DcRzXsizLMIzdWq129+nTpxsQwtvZbHa3Dw6xLCtHo9E5jPEnoVBoNhaL0e3gj3NOCKG97ei6fr/dbn9br9fvGYaxf+XKlbYPzuVyMJVKBZLJ5AWGYT6MRCJzkiRN8jw/DCGkG8IBANhnRRzP8yzP8+j5bLZarceqqm7pun6zWq2Wz507181ms/bfZzOXyzHz8/NDoiiOI4SmeZ5fQgi9gRBKsCwr0gIU7Hme6TiOYllW3bbtMiHke13Xf1RVdZfjuFYmk3EYhvH+NSHP82ChUEChUCgJIZznef4CxjjBcZzIsixPD73jOKZt20q32z00TfNn0zS3Go3GbjweJ9RpfyAvgv2DXywWMcdxMY7jwoIgCIFAgOM4Dtq2zUAIHdM0LdoHTdPUXq/XCgQCet/pf4JPul4n0f0JvY8eXU99ibsAAAAASUVORK5CYII=");
            done();
        });
    });

    it("can convert a point diamond symbol to style", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(DIAMOND_SYMBOL).then(function (style) {
            expect(style).toBeDefined();
            expect(style.icon).toBeDefined();
            expect(style.icon.anchor).toBeDefined();
            expect(style.icon.size).toBeDefined();
            expect(style.icon.size.width).toBeDefined(13);

            // expect(style.icon.symbol).toBeDefined("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEWElEQVRIS5WUy28bVRTG79zxHc9cx3HGHmcSp3GqNkAxIRHgNA8aYYtFFwghsahYsGKFhBT+Be+y8KoSC6RKqLtsUBaVKqurOqQ0JUqqisrGmKImJDhubZyx5+E7nhe6Qw2lgjQ5m9FI3/mdT+ecexjw8mAAAAgAEHwmNQEAFgDAOy6VJj0f9B/m83n+zJkzkXg8PhAOhwXXdflut8tT4eDgIIEQEkVRiK7rWrlc7hQKhW6xWHSeL/YimKXucrlcIpVKTYmieD4ajY5gjIeCwaDgeR5j2zYhhHKVuqIojyuVSunGjRs1hBCF232XfTD9MisrK9TlWCKRuBCLxWZDodBrGOMRjuOGEEJBhmGAZVm9Xq/XJoQ8MQzjl2azuXN4eFjpdDq/ra2tHfWd98GQOr1+/frk+Ph4VpKki6OjoymM8SjDMDyEEEEIqQZ4nue6rmu5rmsSQurNZrPabDa3Hz16dPvatWvVvnMfnM/nQ7Ztx9Pp9NsjIyMfiaI4K0nSWDAYHDxuQKZpau12+1BRlPt7e3s3S6XSNsuyvy8vL3d88OrqagIh9M7Zs2ffnZiYeD8cDr+KEBKo0+PAruvalmXRIf66t7e3Ua/X77Ase/fy5cv7Pnh9ff0V13U/kGU5k0wmaW8TL9/CfxSGYTw5ODh42Gq1igCAtYWFhZ988M7OzjSE8NNIJJKRZfk8xjh6GjAhpNNoNA40TSvatv3N9PT0fR9cqVTSrut+PjAwkInH4zLP8wOnAZumSffvSNO07xRF+SqdTm/54Gq1OgcAWBYEISNJksjzvHAacK/Xs1RV1TVNu7O/v391aWnpBx9cLpfnWZb9EmNMwUM8z/uv7KRBwZ1Op2sYxgYFX7p06Z4PLpVKFyGEX9BWxGIxSRAEfFIo1ZmmaR4dHamGYaxrmnZ1ZmbmL8cPHjx4CwDwWSQSeW94eDiJMY6cBkwI0RqNxhNVVdc9z/t6ampq2wdvbm6+7rrux5IkZcbGxt7EGMv0+Z40dF3/o1arVRVFoVuxuri4+NDPvnXr1jiEcEGW5aVEIpHBGE9yHIdYlqVH6X/DcRzXsizLMIzdWq129+nTpxsQwtvZbHa3Dw6xLCtHo9E5jPEnoVBoNhaL0e3gj3NOCKG97ei6fr/dbn9br9fvGYaxf+XKlbYPzuVyMJVKBZLJ5AWGYT6MRCJzkiRN8jw/DCGkG8IBANhnRRzP8yzP8+j5bLZarceqqm7pun6zWq2Wz507181ms/bfZzOXyzHz8/NDoiiOI4SmeZ5fQgi9gRBKsCwr0gIU7Hme6TiOYllW3bbtMiHke13Xf1RVdZfjuFYmk3EYhvH+NSHP82ChUEChUCgJIZznef4CxjjBcZzIsixPD73jOKZt20q32z00TfNn0zS3Go3GbjweJ9RpfyAvgv2DXywWMcdxMY7jwoIgCIFAgOM4Dtq2zUAIHdM0LdoHTdPUXq/XCgQCet/pf4JPul4n0f0JvY8eXU99ibsAAAAASUVORK5CYII=");
            done();
        });
    });

    it("can convert a point square symbol to style", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(SQUARE_SYMBOL).then(function (style) {
            expect(style).toBeDefined();
            expect(style.icon).toBeDefined();
            expect(style.icon.anchor).toBeDefined();
            expect(style.icon.size).toBeDefined();
            expect(style.icon.size.width).toBeDefined(12);
            // expect(style.icon.symbol).toBeDefined("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEWElEQVRIS5WUy28bVRTG79zxHc9cx3HGHmcSp3GqNkAxIRHgNA8aYYtFFwghsahYsGKFhBT+Be+y8KoSC6RKqLtsUBaVKqurOqQ0JUqqisrGmKImJDhubZyx5+E7nhe6Qw2lgjQ5m9FI3/mdT+ecexjw8mAAAAgAEHwmNQEAFgDAOy6VJj0f9B/m83n+zJkzkXg8PhAOhwXXdflut8tT4eDgIIEQEkVRiK7rWrlc7hQKhW6xWHSeL/YimKXucrlcIpVKTYmieD4ajY5gjIeCwaDgeR5j2zYhhHKVuqIojyuVSunGjRs1hBCF232XfTD9MisrK9TlWCKRuBCLxWZDodBrGOMRjuOGEEJBhmGAZVm9Xq/XJoQ8MQzjl2azuXN4eFjpdDq/ra2tHfWd98GQOr1+/frk+Ph4VpKki6OjoymM8SjDMDyEEEEIqQZ4nue6rmu5rmsSQurNZrPabDa3Hz16dPvatWvVvnMfnM/nQ7Ztx9Pp9NsjIyMfiaI4K0nSWDAYHDxuQKZpau12+1BRlPt7e3s3S6XSNsuyvy8vL3d88OrqagIh9M7Zs2ffnZiYeD8cDr+KEBKo0+PAruvalmXRIf66t7e3Ua/X77Ase/fy5cv7Pnh9ff0V13U/kGU5k0wmaW8TL9/CfxSGYTw5ODh42Gq1igCAtYWFhZ988M7OzjSE8NNIJJKRZfk8xjh6GjAhpNNoNA40TSvatv3N9PT0fR9cqVTSrut+PjAwkInH4zLP8wOnAZumSffvSNO07xRF+SqdTm/54Gq1OgcAWBYEISNJksjzvHAacK/Xs1RV1TVNu7O/v391aWnpBx9cLpfnWZb9EmNMwUM8z/uv7KRBwZ1Op2sYxgYFX7p06Z4PLpVKFyGEX9BWxGIxSRAEfFIo1ZmmaR4dHamGYaxrmnZ1ZmbmL8cPHjx4CwDwWSQSeW94eDiJMY6cBkwI0RqNxhNVVdc9z/t6ampq2wdvbm6+7rrux5IkZcbGxt7EGMv0+Z40dF3/o1arVRVFoVuxuri4+NDPvnXr1jiEcEGW5aVEIpHBGE9yHIdYlqVH6X/DcRzXsizLMIzdWq129+nTpxsQwtvZbHa3Dw6xLCtHo9E5jPEnoVBoNhaL0e3gj3NOCKG97ei6fr/dbn9br9fvGYaxf+XKlbYPzuVyMJVKBZLJ5AWGYT6MRCJzkiRN8jw/DCGkG8IBANhnRRzP8yzP8+j5bLZarceqqm7pun6zWq2Wz507181ms/bfZzOXyzHz8/NDoiiOI4SmeZ5fQgi9gRBKsCwr0gIU7Hme6TiOYllW3bbtMiHke13Xf1RVdZfjuFYmk3EYhvH+NSHP82ChUEChUCgJIZznef4CxjjBcZzIsixPD73jOKZt20q32z00TfNn0zS3Go3GbjweJ9RpfyAvgv2DXywWMcdxMY7jwoIgCIFAgOM4Dtq2zUAIHdM0LdoHTdPUXq/XCgQCet/pf4JPul4n0f0JvY8eXU99ibsAAAAASUVORK5CYII=");
            done();
        });
    });

    it("can convert a line symbol to style", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(POLYLINE_SYMBOL).then(function (style) {
            expect(style).toBeDefined();
            expect(style.strokeColor).toBe("rgba(255,0,0,1)");
            expect(style.strokeOpacity).toBe(1.0);
            expect(style.strokeWeight).toBe(2);
            done();
        });
    });

    it("can convert a polygon symbol to style", function (done) {
        var converter = new EsriSymbolToStyleConverter();
        converter.convert(POLYGON_SYMBOL).then(function (style) {
            expect(style).toBeDefined();
            expect(style.fillColor).toBe("rgba(255,102,51,1)");
            expect(style.fillOpacity).toBe(1.0);
            expect(style.strokeColor).toBe("rgba(0,0,0,0)");
            expect(style.strokeOpacity).toBe(0);
            expect(style.strokeWeight).toBe(1);
            done();
        });
    });

});
