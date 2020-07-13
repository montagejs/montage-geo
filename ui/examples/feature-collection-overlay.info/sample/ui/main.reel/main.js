var Component = require("montage/ui/component").Component,
    Country = require("../../logic/model/country").Country,
    CountryService = require("../../logic/service/country-service").CountryService,
    DataSelector = require("montage/data/service/data-selector").DataSelector,
    DataService = require("montage/data/service/data-service").DataService;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    _map: {
        value: undefined
    },

    _featureCollection: {
        value: undefined
    },

    mainService: {
        get: function () {
            if (!this._mainService) {
                this._mainService = new DataService();
                this._initializeCountryService(this._mainService);
            }
            return this._mainService;
        }
    },

    _initializeCountryService: {
        value: function (parent) {
            parent.addChildService(new CountryService());
        }
    },

    enterDocument: {
        value: function (firstTime) {
            var selector, self;
            if (firstTime) {
                selector = DataSelector.withTypeAndCriteria(Country.TYPE);
                self = this;
                this.mainService.fetchData(selector).then(function (countries) {
                    self._featureCollection.add.apply(self._featureCollection, countries);
                    // countries.forEach(function (country) {
                    //     self._map.drawFeature(country);
                    // });
                });
            }
        }
    }

});
