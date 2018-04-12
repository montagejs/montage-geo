var Enumeration = require("montage/data/model/enumeration").Enumeration;

/**
 * @class
 * @extends external:Montage
 */
exports.Units = Enumeration.specialize(/** @lends Units */ "id", "realID", "name", "localizationKey", {

    unitsForSystem: {
        value: function (measurementSystem) {
            var unit;
            if (exports.MeasurementSystem.METRIC === measurementSystem) {
                unit = this.metricUnit;
            } else if (exports.MeasurementSystem.IMPERIAL === measurementSystem) {
                unit = this.imperialUnit;
            } else {
                unit = this;
            }
            return unit;
        }
    },

    imperialUnit: {
        get: function () {
            return this;
        }
    },

    metricUnit: {
        get: function () {
            return this;
        }
    },

    toImperial: {
        value: function (value) {
            return value;
        }
    },

    toMetric: {
        value: function (value) {
            return value;
        }
    }

},{

    /*********************
     * Distance
     */

    CENTIMETERS: ["centimeters", "CENTIMETERS", "cm", "cm", {

        imperialUnit: {
            get: function () {
                return this.constructor.INCHES;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 2.54;
            }
        }

    }],

    DECIMAL_DEGREES: ["decimal degrees", "DECIMAL_DEGREES"],

    FEET: ["feet", "FEET", "ft", "ft",{

        metricUnit: {
            get: function () {
                return this.constructor.METERS;
            }
        },

        toMetric: {
            value: function (value) {
                return value * .3048;
            }
        }

    }],

    INCHES: ["inches", "INCHES", "in", "in",{

        metricUnit: {
            get: function () {
                return this.constructor.CENTIMETERS;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 2.54;
            }
        }

    }],

    KILOMETERS: ["kilometers", "KILOMETERS", "km", "km", {

        imperialUnit: {
            get: function () {
                return this.constructor.MILES;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 1.609347;
            }
        }

    }],

    METERS: ["meters", "METERS", "m", "m", {

        imperialUnit: {
            get: function () {
                return this.constructor.FEET;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.3048;
            }
        }

    }],

    MILES: ["miles", "MILES", "mi", "mi", {

        metricUnit: {
            get: function () {
                return this.constructor.KILOMETERS;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 1.609347;
            }
        }

    }],

    /*********************
     * Area
     */

    ACRES: ["acres", "ACRES", "ac", "ac", {

        metricUnit: {
            get: function () {
                return this.constructor.HECTARE;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 0.404686;
            }
        }

    }],

    CENTIMETERS_SQUARED: ["centimetersSquared", "SQUARE_CENTIMETERS", "cm*cm", "cm^2",{

        imperialUnit: {
            get: function () {
                return this.constructor.INCHES_SQUARED;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 6.4516;
            }
        }

    }],

    FEET_SQUARED: ["feetSquared", "SQUARE_FEET", "ft*ft", "ft^2", {

        metricUnit: {
            get: function () {
                return this.constructor.METERS_SQUARED;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 0.092903;
            }
        }

    }],

    HECTARE: ["hectare", "HECTARES", "ha", "ha", {

        imperialUnit: {
            get: function () {
                return this.constructor.ACRES;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.404686;
            }
        }

    }],

    INCHES_SQUARED: ["inchesSquared", "SQUARE_INCHES", "in*in", "in^2", {

        metricUnit: {
            get: function () {
                return this.constructor.CENTIMETERS_SQUARED;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 6.4516;
            }
        }

    }],

    KILOMETERS_SQUARED: ["kilometersSquared", "SQUARE_KILOMETERS", "km*km", "km^2", {

        imperialUnit: {
            get: function () {
                return this.constructor.MILES_SQUARED;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 2.58999;
            }
        }

    }],

    METERS_SQUARED: ["metersSquared", "SQUARE_METERS", "m*m", "m^2", {

        imperialUnit: {
            get: function () {
                return this.constructor.FEET_SQUARED;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.092903;
            }
        }

    }],

    MILES_SQUARED: ["milesSquared", "SQUARE_MILES", "mi*mi", "mi^2", {

        metricUnit: {
            get: function () {
                return this.constructor.KILOMETERS_SQUARED;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 2.58999;
            }
        }

    }],

    /*********************
     * Speed
     */

    FEET_PER_SECOND: ["feetPerSecond", "FEET_PER_SECOND", "fps", "fps", {

        metricUnit: {
            get: function () {
                return this.constructor.METERS_PER_SECOND;
            }
        },

        toMetric: {
            value: function (value) {
                return value * .3048;
            }
        }

    }],

    KILOMETERS_PER_HOUR: ["kilometersPerHour", "KILOMETERS_PER_HOUR", "kmph", "kmph", {

        imperialUnit: {
            get: function () {
                return this.constructor.MILES_PER_HOUR;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 1.609347;
            }
        }

    }],

    KNOTS: ["knots", "KNOTS", "kt", "kt", {

        imperialUnit: {
            get: function () {
                return this.constructor.MILES_PER_HOUR;
            }
        },

        metricUnit: {
            get: function () {
                return this.constructor.KILOMETERS_PER_HOUR;
            }
        },

        toImperial: {
            value: function (value) {
                return value * 1.15078;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 1.852;
            }
        }

    }],

    METERS_PER_SECOND: ["metersPerSecond", "METERS_PER_SECOND", "mps", "mps", {

        imperialUnit: {
            get: function () {
                return this.constructor.FEET_PER_SECOND;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.3048;
            }
        }

    }],

    MILES_PER_HOUR: ["milesPerHour", "MILES_PER_HOUR", "mph", "mph", {

        metricUnit: {
            get: function () {
                return this.constructor.KILOMETERS_PER_HOUR;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 1.609347;
            }
        }

    }],

    /*********************
     * Temperature
     */

    CELSIUS: ["celsius", "DEGREES_CELSIUS", "c", "c", {

        imperialUnit: {
            get: function () {
                return this.constructor.FAHRENHEIT;
            }
        },

        toImperial: {
            value: function (value) {
                return (value * 1.8) + 32;
            }
        }

    }],

    FAHRENHEIT: ["fahrenheit", "DEGREES_FAHRENHEIT", "f", "f", {

        metricUnit: {
            get: function () {
                return this.constructor.CELSIUS;
            }
        },

        toMetric: {
            value: function (value) {
                return (value - 32) / 1.8;
            }
        }

    }],

    /*********************
     * Weight
     */

    GRAMS: ["grams", "GRAMS", "g", "g", {

        imperialUnit: {
            get: function () {
                return this.constructor.OUNCES;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.035274;
            }
        }

    }],

    KILOGRAMS: ["kilograms", "KILOGRAMS", "kg", "kg", {

        imperialUnit: {
            get: function () {
                return this.constructor.POUNDS;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.453592;
            }
        }

    }],

    METRIC_TONS: ["metricTons", "METRIC_TONS", "t", "t", {

        imperialUnit: {
            get: function () {
                return this.constructor.TONS;
            }
        },

        toImperial: {
            value: function (value) {
                return value / 0.907185;
            }
        }

    }],

    OUNCES: ["ounces", "OUNCES", "oz", "oz", {

        metricUnit: {
            get: function () {
                return this.constructor.GRAMS;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 0.035274;
            }
        }

    }],

    POUNDS: ["pounds", "POUNDS", "lbs", "lbs", {

        metricUnit: {
            get: function () {
                return this.constructor.POUNDS;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 0.453592;
            }
        }

    }],

    TONS: ["tons", "SHORT_TONS", "t", "t", {

        metricUnit: {
            get: function () {
                return this.constructor.TONS;
            }
        },

        toMetric: {
            value: function (value) {
                return value * 0.907185;
            }
        }

    }]

});

exports.MeasurementSystem = Enumeration.specialize(/** @lends MeasurementSystem */ "id", "name", {

    IMPERIAL: ["imperial", "Imperial"],

    METRIC: ["metric", "Metric"]

});
