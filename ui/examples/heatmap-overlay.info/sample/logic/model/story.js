var Montage = require("montage").Montage;

/**
 *
 * Represents a news article or other form of media related to topics pertinent
 * to DisasterAWARE
 *
 * @class
 * @extends external:Montage
 */
var Story = exports.Story = Montage.specialize(/** @lends Story.prototype */ {

    /**************************************************************************
     * Properties
     */

    /**
     * The unique identifier for this story.
     * @type {number}
     */
    id: {
        value: undefined
    },

    /**
     * The text content of this story.
     * @type {string}
     */
    body: {
        value: undefined
    },

    /**
     * The locations that are associated to this story.
     * @type {geometry}
     */
    geometry: {
        value: undefined
    },

    /**
     * A short description for this story.
     * @type {string}
     */
    title: {
        value: undefined
    },

    /**
     * The url to the story's source on the web.
     * @type {string}
     */
    url: {
        value: undefined
    }

});
