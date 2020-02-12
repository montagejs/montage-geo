var Enumeration = require("montage/data/model/enumeration").Enumeration,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Position = require("logic/model/position").Position,
    Promise = require("montage/core/promise").Promise,
    Units = require("logic/model/units").Units,
    proj4 = require("proj4");


proj4.defs('EPSG:102100', "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
proj4.defs('EPSG:900913', "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
proj4.defs["EPSG:27700"] = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";
proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');

/**
 * @class
 * @extends external:Enumeration
 */
exports.Projection = Enumeration.specialize("", /** @lends Projection.prototype */ {

    isMGRS: {
        value: false
    },

    /**
     * Spatial Reference System Identifier (SRID).
     *
     * @type {string}
     */
    srid: {
        value: undefined
    },

    /**
     * @type {Units}
     */
    units: {
        value: undefined
    },

    projectPoint: {
        value: function (point) {
            var degrees = this.units === Units.DECIMAL_DEGREES;
            return degrees     ? point :
                this.isMGRS ? proj4.mgrs.forward(point, this._mgrsAccuracy) :
                    proj4(this._proj4Reference, point);
        }
    },


    inverseProjectPoint: {
        value: function (point) {
            var degrees = this.units === Units.DECIMAL_DEGREES;
            return degrees ? point :
                this.isMGRS     ? Position.withCoordinates(proj4.mgrs.toPoint(point)) :
                    proj4(this._proj4Reference).inverse(point);
        }
    },

    projectBounds: {
        value: function (bounds) {
            var yMax = Math.min(bounds.yMax, 85.06),
                yMin = Math.max(bounds.yMin, -85.06);
            var minimums = this.projectPoint([bounds.xMin, yMin]),
                maximums = this.projectPoint([bounds.xMax, yMax]);
            return BoundingBox.withCoordinates(minimums[0], minimums[1], maximums[0], maximums[1]);
        }
    },

    _mgrsAccuracy: {
        value: 5
    },

    _proj4Reference: {
        get: function () {
            var reference, identifier;
            if (!this.__proj4Reference) {
                identifier = "EPSG:" + this.srid;
                reference = proj4.defs[identifier];
                if (!reference) {
                    identifier = "ESRI:" + this.srid;
                    reference = proj4.defs[identifier];
                }
                this.__proj4Reference = reference || identifier;
            }
            return this.__proj4Reference;
        }
    }

}, /** @lends Projection */ {

    /**
     * @method
     */
    forSridAndUnits: {
        value: function (srid, units) {
            if (!this._bySrid[srid]) {
                this._bySrid[srid] = this._createWithSridAndUnits(srid, units);
            }
            return this._bySrid[srid];
        }
    },

    _createWithSridAndUnits: {
        value: function (srid, units) {
            var projection = new this();
            projection.srid = srid;
            projection.units = units;

            return projection;
        }
    },

    /**
     * @method
     */
    forSrid: {
        value: function (srid) {
            return this._bySrid[srid] || null;
        }
    },

    _bySrid: {
        get: function () {
            if (!this.__bySrid) {
                this.__bySrid = {};
                this.__bySrid["3395"] = this.forSridAndUnits("3395", Units.METERS);
                this.__bySrid["3857"] = this.forSridAndUnits("3857", Units.METERS);
                this.__bySrid["4326"] = this.forSridAndUnits("4326", Units.DECIMAL_DEGREES);
                this.__bySrid["4269"] = this.forSridAndUnits("4269", Units.DECIMAL_DEGREES);
                this.__bySrid["32718"] = this.forSridAndUnits("32718", Units.DECIMAL_DEGREES);
                this.__bySrid["27700"] = this.forSridAndUnits("27700", Units.METERS);
                this.__bySrid["102100"] = this.forSridAndUnits("102100", Units.METERS);
                this.__bySrid["900913"] = this.forSridAndUnits("900913", Units.METERS);
                this.__bySrid["MGRS"] = this.forSridAndUnits("MGRS", Units.METERS);
                this.__bySrid["MGRS"].isMGRS = true;
            }
            return this.__bySrid;
        }
    },

    _spatialReferenceBaseURL: {
        value: "https://epsg.io/"
    },

    fetchProjectionByID: {
        value: function (srid) {
            var self = this,
                url = this._spatialReferenceBaseURL + srid + ".js",
                units;
            return this._fetch(url).then(function (response) {
                eval(response);
                units = self._unitsForDefinition(response);
                return self.forSridAndUnits(srid, units);
            }).catch(function (e) {
                console.warn(e);
            });
        }
    },

    _metersRegExp: {
        value: /\+units=m/
    },

    _ftRegExp: {
        value: /\+units=us-ft/
    },

    _unitsForDefinition: {
        value: function (definition) {
            return this._metersRegExp.test(definition) ? Units.METERS :
                this._ftRegExp.test(definition)     ? Units.FEET :
                    Units.DECIMAL_DEGREES;
        }
    },

    _fetch: {
        //TODO Make Projection a first level montage-data type and perform the fetch in a service
        value: function (url) {
            var self = this,
                xhr;

            return new Promise(function (resolve, reject) {
                xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error("SRID request failed with status " + xhr.status));
                    }
                };
                xhr.onerror = function (e) {
                    reject(e);
                };
                xhr.send(null);
            });
        }
    }

}, {});
