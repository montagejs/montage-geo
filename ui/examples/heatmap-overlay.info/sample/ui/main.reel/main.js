var Component = require("montage/ui/component").Component,
    DataService = require("data/montage-data.mjson").montageObject,
    Story = require("logic/model/story").Story;

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

    _collection: {
        value: undefined
    },

    _map: {
        value: undefined
    },

    enterDocument: {
        value: function (firstTime) {
            var collection;
            if (firstTime) {
                collection = this._collection;
                DataService.fetchData(Story).then(function (stories) {
                    collection.features.splice.apply(collection.features, stories);
                    return null;
                });
            }
        }
    }

});
