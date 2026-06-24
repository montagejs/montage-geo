var Component = require("mod/ui/component").Component,
    Country = require("../../logic/model/country").Country,
    CountryService = require("../../logic/service/country-service").CountryService,
    DataSelector = require("mod/data/service/data-selector").DataSelector,
    DataService = require("mod/data/service/data-service").DataService,
    Set = require("mod/core/collections/set");

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    _map: {
        value: undefined
    },

    _selectedCountries: {
        get: function () {
            if (!this.__selectedCountries) {
                this.__selectedCountries = new Set();
            }
            return this.__selectedCountries;
        }
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
                    countries.forEach(function (country) {
                        self._map.drawFeature(country);
                    });
                });
            }
        }
    },

    handleFeatureMouseover: {
        value: function (event) {
            var country = event.detail.feature;
            if (country) {
                country.style.strokeColor = "#FF0000";
                this._map.redrawFeature(country, true);
            }
        }
    },

    handleFeatureMouseout: {
        value: function (event) {
            var country = event.detail.feature;
            if (country) {
                country.style.strokeColor = country.style.fillColor;
                this._map.redrawFeature(country, true);
            }
        }
    },

    handleFeatureSelection: {
        value: function (event) {
            var country = event.detail.feature;
            if (this._selectedCountries.has(country)) {
                country.style.fillOpacity = 0.5;
                this._selectedCountries.delete(country);
            } else {
                country.style.fillOpacity = 1.0;
                this._selectedCountries.add(country);
            }
            this._map.redrawFeature(country, true);
        }
    }

});
