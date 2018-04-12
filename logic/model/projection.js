var Enumeration = require("montage/data/model/enumeration").Enumeration,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Position = require("logic/model/position").Position,
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
            var areUnitsMeters = this.units === Units.METERS;
            return !areUnitsMeters ? point :
                this.isMGRS ? proj4.mgrs.forward(point, this._mgrsAccuracy) :
                    proj4(this._proj4Reference, point);
        }
    },


    inverseProjectPoint: {
        value: function (point) {
            var areUnitsMeters = this.units === Units.METERS;
            return !areUnitsMeters ? point :
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
            var identifier;
            if (!this.__proj4Reference) {
                identifier = "EPSG:" + this.srid;
                this.__proj4Reference = proj4.defs[identifier] || identifier;
            }

            return this.__proj4Reference;
        }
    }

}, /** @lends Projection */ {

    /**
     * @method
     */
    withSridAndUnits: {
        value: function (srid, units) {
            var projection = new this();
            projection.srid = srid;
            projection.units = units;
            this._bySrid[srid] = this._bySrid[srid] || {};
            this._bySrid[srid][units ? units.id : ""] = projection;
            return projection;
        }
    },

    /**
     * @method
     */
    forSridAndUnits: {
        value: function (srid, units) {
            return this._bySrid && this._bySrid[srid] && this._bySrid[srid][units ? units.id : ""];
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
                this.__bySrid["3395"] = this.withSridAndUnits("3395", Units.METERS);
                this.__bySrid["3857"] = this.withSridAndUnits("3857", Units.METERS);
                this.__bySrid["4326"] = this.withSridAndUnits("4326", Units.DECIMAL_DEGREES);
                this.__bySrid["4269"] = this.withSridAndUnits("4269", Units.DECIMAL_DEGREES);
                this.__bySrid["32718"] = this.withSridAndUnits("32718", Units.DECIMAL_DEGREES);
                this.__bySrid["27700"] = this.withSridAndUnits("27700", Units.METERS);
                this.__bySrid["102100"] = this.withSridAndUnits("102100", Units.METERS);
                this.__bySrid["900913"] = this.withSridAndUnits("900913", Units.DECIMAL_DEGREES);
                this.__bySrid["MGRS"] = this.withSridAndUnits("MGRS", Units.METERS);
                this.__bySrid["MGRS"].isMGRS = true;
            }
            return this.__bySrid;
        }
    }

}, {});
