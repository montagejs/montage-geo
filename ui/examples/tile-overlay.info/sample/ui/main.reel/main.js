var Component = require("montage/ui/component").Component,
    defaultLocalizer = require("montage/core/localizer").defaultLocalizer,
    Service = require("data/montage-data.mjson").montageObject; // Keep.  Used to load the main service.

defaultLocalizer.locale = "en-US";

/**
 * @class Main
 * @extends Component
 */
exports.Main = Component.specialize(/** @lends Main.prototype */ {

});
