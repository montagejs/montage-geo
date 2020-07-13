var HttpService = require("montage/data/service/http-service").HttpService;

/**
 * Provide data about stories.
 *
 * @class
 * @extends external:HttpService
 */
exports.StoryService = HttpService.specialize(/* @lends CountryService */ {

    /***************************************************************************
     * Fetching data
     */

    fetchRawData: {
        value: function (stream) {
            var self = this;
            this.fetchHttpRawData("data/stories.json").then(function (rawData) {
                self.addRawData(stream, rawData.content);
                self.rawDataDone(stream);
                return null;
            });
        }
    }

});
