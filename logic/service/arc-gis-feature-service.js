var FeatureService = require("logic/service/feature-service").FeatureService,
    BoundingBox = require("logic/model/bounding-box").BoundingBox,
    Criteria = require("montage/core/criteria").Criteria,
    Map = require("montage/collections/map"),
    Promise = require("montage/core/promise").Promise,
    Protocol = require("logic/model/protocol").Protocol;

/**
 * Returns Feature objects from services and files in various formats.
 * @type {FeatureService}
 */
var ArcGisFeatureService = exports.ArcGisFeatureService = FeatureService.specialize(/** @lends FeatureService.prototype */ {

    protocol: {
        writable: false,
        value: Protocol.ARCGIS
    },

    fetchLayerFeaturesMatchingCriteria: {
        value: function (layer, criteria) {
            var parameters = criteria.parameters,
                geometry = parameters.geometry;

            if (geometry && geometry instanceof BoundingBox) {
                promise = this._fetchFeaturesForLayerCriteriaAndBoundingBox(layer, criteria, geometry);
            } else {
                promise = this._fetchFeaturesForLayerAndCriteria(layer, criteria);
            }

            return promise.then(function (features) {
                return [features, {
                    layer: layer
                }];
            })
        }
    },

    _fetchFeaturesForLayerCriteriaAndBoundingBox: {
        value: function (layer, criteria, geometry) {
            var self = this,
                parameters = criteria.parameters;
            return Promise.all(geometry.splitAlongAntimeridian().map(function (bounds) {
                var splitParameters = Object.assign({}, parameters),
                    splitCriteria;
                splitParameters.geometry = bounds;
                splitCriteria = new Criteria().initWithExpression(criteria.expression, splitParameters);
                return self._fetchFeaturesForLayerAndCriteria(layer, splitCriteria);
            })).then(function (values) {
                var added = new Set();
                console.log("_fetchFeaturesForLayerCriteriaAndBoundingBox", values);
                //[TJ] This was previously aggregating into a Map for an unknown reason
                // May need to reevaluate if functionality was lost
                return values.reduce(function (aggregator, value) {
                        if (Array.isArray(value)) {
                            value.forEach(function (item) {
                                if (!added.has(item)) {
                                    added.add(item);
                                    aggregator.push(item);
                                }
                            });
                        } else {
                            console.warn("ArcGisFeatureService expected results as an array, but received", value);
                        }
                        return aggregator;
                }, []);
            });
        }
    },

    _fetchFeaturesForLayerAndCriteria: {
        value: function (layer, criteria) {
            var url = this._urlForLayerAndCriteria(layer, criteria);
            console.log("_fetchFeaturesForLayerAndCriteria", criteria);
            return this.fetchHttpRawData(url.toString()).then(function (response) {
                if (response.error) {
                    throw new Error("Failed to fetch ArcGISFeatures with URL");
                }
                return response && response.features;
            });
        }
    },

    mapRawDataToObject: {
        value: function (record, object, context) {
            var renderer = context.layer && context.layer.renderer;
            if (renderer) {
                object.style = renderer.convert(record);
            }
        }
    },


    /**************************************************************************
     * Url Generation
     */

    _urlForLayerAndCriteria: {
        value: function (layer, criteria) {
            var url = new URL(layer.url + "/" + layer.mapServiceLayerIndex + "/query"),
                parameters = criteria.parameters,
                geometry = parameters.geometry,
                projected;
                // filters = parameters.filters; TODO: Move Filters to Project

            url.searchParams.append("f", "json");
            url.searchParams.append("outSR", "4326");
            url.searchParams.append("returnGeometry", "true");
            url.searchParams.append("outFields", "*");
            if (geometry && geometry instanceof BoundingBox) {
                console.log("_urlForLayerAndCriteria", layer);
                url.searchParams.append("geometryType", "esriGeometryEnvelope");
                projected = layer.projection.projectBounds(geometry);
                url.searchParams.append("geometry", this._makeBoundsCriteria(projected, layer.projection.srid));
            } else if (geometry) {
                //TODO Implement polygon filtering
            }

            if (parameters.hasOwnProperty("returnCountOnly") && parameters.returnCountOnly) {
                url.searchParams.append("returnCountOnly", "true");
            }

            if (parameters.hasOwnProperty("returnGeometry") && !parameters.returnGeometry) {
                url.searchParams.append("returnGeometry", "false");
            }

            return url;

        }
    },



    _makeGeometryCriteria: {
        value: function (geometry, srid) {
            var criteria = "{\"rings\":[";
            geometry.rings.forEach(function (ring) {
                criteria += "[";
                ring.forEach(function (coordinate, index) {
                    if (index > 0) {
                        criteria += ","
                    }
                    criteria += "[";
                    criteria += coordinate[0];
                    criteria += ",";
                    criteria += coordinate[1];
                    criteria += "]";
                });
                criteria += "]";
            });
            criteria += "],\"spatialReference\":{\"wkid\":";
            criteria += srid;
            criteria += "}}";
            return encodeURIComponent(criteria);
        }
    },

    _makeBoundsCriteria: {
        value: function (bounds, srid) {
            var criteria = "{\"xmin\":";
            criteria += bounds.xMin;
            criteria += ",\"ymin\":";
            criteria += bounds.yMin;
            criteria += ",\"xmax\":";
            criteria += bounds.xMax;
            criteria += ",\"ymax\":";
            criteria += bounds.yMax;
            criteria += ",\"spatialReference\":{\"wkid\":";
            criteria += srid;
            criteria += "}}";
            return encodeURIComponent(criteria);
        }
    },

    //Not used
    _makeBody: {
        value: function (parameters, whereClause) {
            var mapService = parameters.layer.mapService,
                projection = mapService.projection,
                geometryType = parameters.hasOwnProperty("bounds") ? "esriGeometryEnvelope" : "esriGeometryPolygon",
                format = parameters.format || "json",
                body = "",
                projected, converter;

            // body.append("f", "json");
            body += "f=";
            body += format;
            body += "&";

            // body.append("geometryType", "esriGeometryEnvelope");
            body += "geometryType=";
            body += geometryType;
            body += "&";

            // body.append("outSR", projection.srid);
            body += "outSR=4326&";

            if (!parameters.hasOwnProperty("requestGeometry") || parameters["requestGeometry"] === true) {
                body += "returnGeometry=true&";
            } else {
                body += "returnGeometry=false&";
            }

            if (geometryType === "esriGeometryEnvelope") {
                projected = projection.projectBounds(parameters.bounds);
                body += "geometry=";
                body += this._makeBoundsCriteria(projected, projection.srid);
                body += "&";
            } else {
                converter = new EsriJsonToGeometryConverter();
                converter.projection = projection;
                projected = converter.revert(parameters.geometry);
                body += "geometry=";
                body += this._makeGeometryCriteria(projected, projection.srid);
                body += "&";
            }

            // body.append("outFields", "*");
            body += "outFields=*";

            if (parameters.isForTotalFeatureCount) {
                body += "&returnCountOnly=true";
            }

            if (whereClause && whereClause.length > 0) {
                // body.append("where", whereClause);
                body += "&where=" + whereClause;
            }

            return body;
        }
    },

    _makeWhereClause: {
        value: function (layer) {
            var where = "",
                filters = layer.featureCriteria.filters.copy(),
                activeFilters = filters.activeFilters(),
                keys = Object.keys(activeFilters),
                filter, key, i, n;

            for (i = 0, n = keys.length; i < n; i += 1) {
                key = keys[i];
                filter = filters.filterForKey(key);
                // where += where ? " AND " : "";
                // where += filter.toSQLString();

                if (filter.minimum !== undefined) {
                    where += where ? " AND " : "";
                    where += key.toLowerCase();
                    where += " >= ";
                    where += filter.type === "date" ? "date '" : "";
                    where += filter.minimum;
                    where += filter.type === "date" ? "'" : "";
                }
                if (filter.maximum !== undefined) {
                    where += where ? " AND " : "";
                    where += key.toLowerCase();
                    where += " <= ";
                    where += filter.type === "date" ? "date '" : "";
                    where += filter.maximum;
                    where += filter.type === "date" ? "'" : "";
                }
                if (filter.string) {
                    where += where ? " AND " : "";
                    where += "UPPER(";
                    where += key.toLowerCase();
                    where += ") LIKE '%25";
                    where += filter.string.toUpperCase();
                    where += "%25'";
                }
            }
            return where;
        }
    }

});
