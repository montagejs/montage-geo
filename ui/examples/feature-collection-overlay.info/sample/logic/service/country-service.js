var HttpService = require("montage/data/service/http-service").HttpService,
    Country = require("../model/country").Country,
    Feature = require("montage-geo/logic/model/feature").Feature,
    DataSelector = require("montage/data/service/data-selector").DataSelector,
    DataStream = require("montage/data/service/data-stream").DataStream,
    Promise = require("montage/core/promise").Promise;

/**
 * Provide data about countries.
 *
 * @class
 * @extends external:HttpService
 */
exports.CountryService = HttpService.specialize(/* @lends CountryService */ {

    /***************************************************************************
     * Basic property
     */

    types: {
        value: [Country.TYPE]
    },

    /***************************************************************************
     * Fetching data
     */

    fetchRawData: {
        value: function (stream) {
            this._fetchCountries().then(function (countries) {
                stream.addData(countries);
                stream.dataDone();
                return null;
            });
        }
    },

    _fetchCountries: {
        value: function () {
            return this._cache ?    Promise.resolve(this._cache) :
                                    this._fetchCountryData();
        }
    },

    _fetchCountryData: {
        value: function () {
            var self = this;
            return this.fetchHttpRawData("data/countries.geo.json").then(function (rawData) {
                var stream = new DataStream();
                stream.selector = DataSelector.withTypeAndCriteria(Country.TYPE);
                self.addRawData(stream, rawData.features);
                self.rawDataDone(stream);
                self._cache = stream.data;
                return self._cache;
            });
        }
    },

    _cache: {
        value: undefined
    },

    /***************************************************************************
     * Mapping data
     */

    mapFromRawData: {
        value: function (country, data) {
            var feature = Feature.withGeoJSON(data);
            country.geometry = feature.geometry;
            country.name = data.properties.name;
            country.id = data.id;
        }
    }


});
