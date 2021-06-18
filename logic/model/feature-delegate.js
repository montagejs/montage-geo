var Montage = require("montage/core/core").Montage,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    DataService = require("montage/data/service/data-service").DataService,
    DataStream = require("montage/data/service/data-stream").DataStream,
    Feature = require("logic/model/feature").Feature,
    FeatureCollection = require("logic/model/feature-collection").FeatureCollection,
    Promise = require("montage/core/promise").Promise;


/**
 *
 * The feature-collection-overlay uses this delegate to fetch features to add
 * to the map.  This default implementation fetches features using Montage Data.
 * Implement this delegate if you need an alternative way of supplying features
 *
 * @class
 * @extends external:Montage
 */
var FeatureDelegate = exports.FeatureDelegate = Montage.specialize(/** @lends FeatureDelegate.prototype */ {


    /**
     * @param {Criteria}    - the criteria to use for filtering the result.
     * @param {Layer}       - the data set to use for the source.
     * @returns {Promise}   - a Promise for a feature collection.
     */
    fetchFeaturesWithCriteriaAndLayer: {
        value: function (criteria, layer) {

            var rootService = DataService.mainService;

            if (!rootService || !rootService.childServiceForType(Feature)) {
                return Promise.resolve(FeatureCollection.withFeatures([]));
            }

            if (!(criteria instanceof Criteria)) {
                return Promise.reject("A valid criteria was not provided. (", criteria, ")");
            }

            return this._fetch(criteria, layer);
        }
    },

    _fetch: {
        value: function (criteria, layer) {
            var expression = this._extendCriteriaExpression(criteria.expression, layer),
                parameters = Object.assign({}, criteria.parameters || {}),
                query = DataQuery.withTypeAndCriteria(Feature, criteria);

            parameters.layer = layer;
            return

        }
    }

}, {

    Instance: {
        get: function () {
            if (!this._Instance) {
                this._Instance = new this();
            }
            return this._Instance;
        }
    }

});

exports.defaultFeatureDelegate = FeatureDelegate.Instance;
