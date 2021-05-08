var Enumeration = require("montage/data/model/enumeration").Enumeration,
    Set = require("montage/collections/set"),
    Tile = require("logic/model/tile").Tile;

/**
 * One of the protocols used by map services.
 *
 * @class
 * @extends external:Enumeration
 */
exports.Protocol = Enumeration.specialize("id", "realID", "name", /** @lends Protocol.prototype */ {

    _supportedImageFormats: {
        value: new Set()
    },

    isSupportedImageFormat: {
        value: function (format) {
            return this._supportedImageFormats.has(format);
        }
    },

    /**
     * Indicates whether the protocol supports fetching the data as features.
     * @type {boolean}
     */
    supportsFeatureRequests: {
        value: false
    },

    /**
     * Indicates whether the protocol supports fetching images for Tile objects.
     * @type {boolean}
     */
    supportsTileImageRequests: {
        value: false
    },

    /**
     * Indicates whether the protocol supports fetching images for MapImage
     * objects with arbitrary geographic bounds.
     * @type {boolean}
     */
    supportsGenericMapImageRequests: {
        value: false
    }

}, /** @lends Protocol */ {

    forUrl: {
        value: function (url) {
            var extension = this._getFileExtension(url),
                protocol = this._getProtocolForFileExtension(extension);
            return protocol || null;
        }
    },

    _getFileExtension: {
        value: function (url) {
            var parts = url.split(".");
            return parts && parts.length >= 1 ? parts.pop() : null;
        }
    },

    _getProtocolForFileExtension: {
        value: function (extension) {
            var found = false,
                protocol, i, n;
            for (i = 0, n = this._fileProtocols.length; i < n && !found; ++i) {
                protocol = this._fileProtocols[i];
                found = protocol.fileExtensions.has(extension);
            }

            return found ? protocol : null;
        }
    },

    _fileProtocols: {
        get: function () {
            if (!this.__fileProtocols) {
                this.__fileProtocols = [
                    this.GEOJSON,
                    this.GPX,
                    this.KML,
                    this.KMZ,
                    this.SHP,
                    this.WFS,
                    this.WKT
                ];
            }
            return this.__fileProtocols;
        }
    }

}, /** @lends Protocol */ {

    // /** @type {Protocol} */
    // ARCGIS: ["ArcGIS Server REST", "ARCGIS", "ArcGIS", {
    //
    //     defaultImageFormat: {
    //         value: "png32"
    //     },
    //
    //     _supportedImageFormats: {
    //         get: function () {
    //             if (!this.__supportedImageFormats) {
    //                 this.__supportedImageFormats = new Set(["png32", "png"]);
    //             }
    //             return this.__supportedImageFormats;
    //         }
    //     },
    //
    //     isForMapService: {
    //         value: true
    //     },
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     supportsGenericMapImageRequests: {
    //         value: true
    //     },
    //
    //     makeUrlWithLayerAndMapImage: {
    //         value: function (layer, mapImage) {
    //             var bounds = layer.projection.projectBounds(mapImage.bounds),
    //                 url = layer.url;
    //             url += "/export";
    //             url += "?format=";
    //             url += layer.imageType;
    //             url += "&bboxSR=";
    //             url += layer.projection.srid;
    //             url += "&SRS=EPSG:";
    //             url += layer.projection.srid;
    //             url += "&version=";
    //             url += layer.protocolVersion;
    //             url += "&BBOX=";
    //             url += bounds.xMin;
    //             url += ",";
    //             url += bounds.yMin;
    //             url += ",";
    //             url += bounds.xMax;
    //             url += ",";
    //             url += bounds.yMax;
    //             url += "&layers=show:";
    //             url += layer.mapServiceLayerIndex;
    //             url += "&size=";
    //             url += mapImage.size.width;
    //             url += ",";
    //             url += mapImage.size.height;
    //             url += "&transparent=true";
    //             url += "&f=image";
    //             url += "&dpi=";
    //             url += mapImage.dpi;
    //             url += "&imageSR=";
    //             url += layer.projection.srid;
    //             return url;
    //         }
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // BING: ["Microsoft VirtualEarth", "BING", "Bing", {
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     makeUrlWithLayerAndTile: {
    //         value: function (layer, tile) {
    //             var url;
    //             if (tile.y < 0) {
    //                 url = Tile.transparentImage;
    //             } else if (layer.name === "Bing Imagery") {
    //                 url = "https://t";
    //                 url += this._subdomain(tile.x, tile.y);
    //                 url += ".ssl.ak.dynamic.tiles.virtualearth.net/comp/CompositionHandler/";
    //                 url += this._quadkey(tile.x, tile.y, tile.z);
    //                 url += "?mkt=en-US&it=A,G,RL&shading=hill";
    //             } else if (layer.name === "Bing Hybrid") {
    //                 url = "https://t";
    //                 url += this._subdomain(tile.x, tile.y);
    //                 url += ".ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/";
    //                 url += this._quadkey(tile.x, tile.y, tile.z);
    //                 url += "?mkt=en-US&it=A,G,L";
    //             } else if (layer.name === "Bing Roads") {
    //                 url = "https://t";
    //                 url += this._subdomain(tile.x, tile.y);
    //                 url += ".ssl.ak.dynamic.tiles.virtualearth.net/comp/CompositionHandler/";
    //                 url += this._quadkey(tile.x, tile.y, tile.z);
    //                 url += "?mkt=en-US&it=G,VE,BX,L,LA";
    //             }
    //             return url;
    //         }
    //     },
    //
    //     _subdomain: {
    //         value: function (x, y) {
    //             return Math.abs(x + y) % 4;
    //         }
    //     },
    //
    //     _quadkey: {
    //         value: function (x, y, z) {
    //             var quadKey = "",
    //                 digit, mask, i;
    //
    //             for (i = z; i > 0; i--) {
    //                 digit = 0;
    //                 mask = 1 << (i - 1);
    //                 if ((x & mask) != 0) {
    //                     digit++;
    //                 }
    //                 if ((y & mask) != 0) {
    //                     digit++;
    //                     digit++;
    //                 }
    //                 quadKey += String(digit);
    //             }
    //             return quadKey;
    //         }
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // BSP_DOCUMENT: ["BSP Groups & Documents", "BSP_DOCUMENT", "BSP Document", {
    //     spiderClusterFeatures: {
    //         value: true
    //     }
    // }],
    //
    // /** @type {Protocol} */
    // CAMERA: ["Live Camera Service", "CAMERA", "Camera", {
    //
    //     isForMapService: {
    //         value: true
    //     }
    // }],
    //
    // GEOJSON: ["GeoJSON", "GEOJSON", "GeoJSON", {
    //     fileExtensions: {
    //         value: new Set(["geojson"])
    //     }
    // }],
    //
    // /** @type {Protocol} */
    // GFS: ["GFS Weather Model", "GFS", "GFS Weather Model"],
    //
    // /** @type {Protocol} */
    // GOOGLE: ["Google", "GOOGLE", "Google", {
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     makeUrlWithLayerAndTile: {
    //         value: function (layer, tile) {
    //             var id = layer.id,
    //                 name =  id === "Google_Hybrid" ?    "Bing Hybrid" :
    //                     id === "Google_Street" ?    "Bing Roads" :
    //                         "Bing Imagery";
    //             return exports.Protocol.BING.makeUrlWithLayerAndTile({name: name}, tile);
    //         }
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // GPX: ["GPX", "GPX", "GPX", {
    //     fileExtensions: {
    //         value: new Set(["gpx"])
    //     }
    // }],
    //
    // /** @type {Protocol} */
    // HAZARD: ["PDC HP REST Service", "HAZARD", "Hazard", {
    //     spiderClusterFeatures: {
    //         value: true
    //     }
    // }],
    //
    // /**
    //  * Slightly different HAZARD protocol used for
    //  * [Disaster Alert]{@link http://www.pdc.org/solutions/tools/disaster-alert-app/}
    //  * deployments instead of
    //  * [DisasterAWARE]{@link http://www.pdc.org/solutions/products/disasteraware/}
    //  * ones.
    //  *
    //  * @type {Protocol}
    //  */
    // HAZARD_ATLAS: ["PDC HP Public XML", "HAZARD_ATLAS", "Atlas Hazard", {
    //     spiderClusterFeatures: {
    //         value: true
    //     }
    // }],
    //
    // /** @type {Protocol} */
    // IMAGE_SERVER: ["ArcGIS ImageServer REST", "ArcGIS ImageServer", "ArcGIS ImageServer", {
    //
    //     isForMapService: {
    //         value: true
    //     },
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     supportsGenericMapImageRequests: {
    //         value: true
    //     },
    //
    //     // http://inarisk.bnpb.go.id:6080/arcgis/rest/services/inaRISK/layer_bahaya_letusan_gunungapi/ImageServer/exportImage?f=image&bbox=10742218.833565192%2C-1230841.769472031%2C14354938.538434801%2C855583.3545995
    //
    //     makeUrlWithLayerAndMapImage: {
    //         value: function (layer, mapImage) {
    //             var bounds = layer.projection.projectBounds(mapImage.bounds),
    //                 url = layer.url;
    //             url += "/exportImage";
    //             url += "?f=image";
    //             url += "&bbox=";
    //             url += bounds.xMin;
    //             url += ",";
    //             url += bounds.yMin;
    //             url += ",";
    //             url += bounds.xMax;
    //             url += ",";
    //             url += bounds.yMax;
    //             return url;
    //         }
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // IMPORT: ["Import", "IMPORT", "Import"],
    //
    // KML: ["KML", "KML", "Keyhole Markup Language", {
    //
    //     fileExtensions: {
    //         value: new Set(["kml"])
    //     }
    //
    // }],
    //
    // KMZ: ["KMZ", "KMZ", "Compressed Keyhole Markup Language File",{
    //
    //     fileExtensions: {
    //         value: new Set(["kmz"])
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // OSM: ["OSM", "OSM", "OSM", {
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     makeUrlWithLayerAndTile: {
    //         value: function (layer, tile) {
    //             var x = this._normalize(tile.x, tile.z),
    //                 url = layer.url;
    //             return url + [tile.z, x, tile.y].join("/") + ".png";
    //         }
    //     },
    //
    //     _normalize: {
    //         value: function (x, z) {
    //             var numberTiles = Math.pow(2, z);
    //             x = Number(x);
    //             while (x < 0) {
    //                 x += numberTiles;
    //             }
    //             return x % numberTiles;
    //         }
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // OSM_IMAGERY_HYBRID: ["OSM_IMAGERY_HYBRID", "OSM_IMAGERY_HYBRID", "OSM Imagery Hybrid", {
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     makeUrlWithLayerAndTile: {
    //         value: function (layer, tile) {
    //             var x = this._normalize(tile.x, tile.z),
    //                 url = layer.url;
    //             return url + [tile.z, x, tile.y].join("/");
    //         }
    //     },
    //
    //     _normalize: {
    //         value: function (x, z) {
    //             var numberTiles = Math.pow(2, z);
    //             x = Number(x);
    //             while (x < 0) {
    //                 x += numberTiles;
    //             }
    //             return x % numberTiles;
    //         }
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // OWF: ["OWF", "OWF", "OWF"],
    //
    // /** @type {Protocol} */
    // OZP: ["OZP", "OZP", "OZP"],
    //
    // /** @type {Protocol} */
    // POST_MESSAGE: ["POST_MESSAGE", "POST_MESSAGE", "Post Message"],
    //
    // /** @type {Protocol} */
    // PRODUCT: ["Product", "PRODUCT", "Product", {
    //     spiderClusterFeatures: {
    //         value: true
    //     }
    // }],
    //
    // /** @type {Protocol} */
    // SHP: ["SHP", "SHAPE_FILE", "Shape File", {
    //
    //     fileExtensions: {
    //         value: new Set(["shp", "zip"])
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // SOCIAL: ["SocialFeed", "SOCIAL", "Social", {
    //
    //     isForMapService: {
    //         value: true
    //     }
    // }],
    //
    // /** @type {Protocol} */
    // WFS: ["WFS", "WFS", "Web Feature Service", {
    //
    //     isForMapService: {
    //         value: true
    //     },
    //
    //     fileExtensions: {
    //         value: new Set(["wfs"])
    //     }
    // }],
    //
    // WINDMAP: ["WindmapFeed", "WINDMAP", "Windmap"],
    //
    // /** @type {Protocol} */
    // WKT: ["WKT", "WKT", "Well Known Text", {
    //
    //     fileExtensions: {
    //         value: new Set(["wkt"])
    //     }
    //
    // }],
    //
    // /** @type {Protocol} */
    // WMS: ["WMS", "WMS", "WMS", {
    //
    //     defaultImageFormat: {
    //         value: "image/png"
    //     },
    //
    //     _supportedImageFormats: {
    //         get: function () {
    //             if (!this.__supportedImageFormats) {
    //                 this.__supportedImageFormats = new Set(["image/png", "image/jpeg"]);
    //             }
    //             return this.__supportedImageFormats;
    //         }
    //     },
    //
    //     isForMapService: {
    //         value: true
    //     },
    //
    //     supportsTileImageRequests: {
    //         value: true
    //     },
    //
    //     makeUrlWithLayerAndTile: {
    //         value: function (layer, tile) {
    //             var bounds = layer.projection.projectBounds(tile.bounds),
    //                 url = layer.url;
    //             url += "LAYERS=";
    //             url += layer.mapServiceLayerId;
    //             url += "&format=";
    //             url += layer.imageType;
    //             url += "&version=";
    //             url += layer.protocolVersion;
    //             url += "&service=WMS";
    //             url += "&TRANSPARENT=true";
    //             url += "&request=GetMap";
    //             url += "&bboxSR=";
    //             url += layer.projection.srid;
    //             if (parseFloat(layer.protocolVersion) >= 1.3) {
    //                 url += "&CRS=EPSG:";
    //             } else {
    //                 url += "&SRS=EPSG:";
    //             }
    //             url += layer.projection.srid;
    //             url += "&WIDTH=256";
    //             url += "&HEIGHT=256";
    //             url += "&BBOX=";
    //             url += bounds.xMin;
    //             url += ",";
    //             url += bounds.yMin;
    //             url += ",";
    //             url += bounds.xMax;
    //             url += ",";
    //             url += bounds.yMax;
    //             url += "&STYLES=";
    //             if (layer.animationTime) {
    //                 url += "&TIME=";
    //                 url += layer.animationTime.utc().format("YYYY-MM-DDTHH:mm:ss");
    //                 url += ".000Z";
    //             }
    //             return url;
    //         }
    //     }
    //
    // }],

    /** @type {Protocol} */
    WMTS: ["WMTS", "WMTS", "WMTS", {

        isForMapService: {
            value: true
        },

        supportsTileImageRequests: {
            value: true
        },

        makeUrlWithLayerAndTile: {
            value: function (layer, tile) {
                return layer.tileUrlTemplate ?  this._makeUrlFromTemplateForLayerAndTile(layer, tile) :
                    this._makeDefaultUrlForLayerAndTile(layer, tile);
            }
        },

        _makeDefaultUrlForLayerAndTile: {
            value: function (layer, tile) {
                var url = layer.url;
                url += "/WMTS?";
                url += "service=WMTS";
                url += "&version=" + (layer.protocolVersion || "1.0.0");
                url += "&request=GetTile";
                url += "&format=" + (layer.imageFormat || "image/png");
                url += "&tileMatrix=" + tile.z;
                url += "&TileRow=" + tile.y;
                url += "&TileCol=" + this._normalizeTileColumn(tile.x, tile.y, tile.z);
                url += "&style=default";
                url += "&tileMatrixSet=" + (layer.tileMatrixSet || "default028mm");
                url += "&layer=" + layer.mapServiceLayerId;
                return url;
            }
        },

        //"http://gibs.earthdata.nasa.gov/wmts/epsg3857/best/AMSR2_Snow_Water_Equivalent/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"

        _makeUrlFromTemplateForLayerAndTile: {
            value: function (layer, tile) {
                return layer.tileUrlTemplate
                    .replace("/{Time}/", "/")
                    .replace("{Style}", "default")
                    .replace("{TileMatrixSet}", (layer.tileMatrixSet || "default028mm"))
                    .replace("{TileMatrix}", tile.z)
                    .replace("{TileRow}", tile.y)
                    .replace("{TileCol}", this._normalizeTileColumn(tile.x, tile.y, tile.z));
            }
        },

        _normalizeTileColumn: {
            value: function (x, y, z) {
                var numberTiles = Math.pow(2, z);
                x = Number(x);
                while (x < 0) {
                    x += numberTiles;
                }
                return x % numberTiles;
            }
        }

    }]

});
