var Montage = require("montage/core/core").Montage,
    Promise = require("montage/core/promise").Promise;

exports.ArcgisWorldImageryTileDelegate = Montage.specialize({

    _cache: {
        value: {}
    },

    loadTileImages: {
        value: function (tiles) {
            var self = this;
            return Promise.all(tiles.map(function (tile) {
                var url = self.constructor.WORLD_IMAGERY_SERVICE_URL,
                    imagePromise;
                url += "/tile/";
                url += tile.z;
                url += "/";
                url += tile.y % Math.pow(2, tile.z);
                url += "/";
                url += tile.x % Math.pow(2, tile.z);
                if (self._cache[url]) {
                    imagePromise = Promise.resolve(self._cache[url]);
                } else {
                    imagePromise = self._fetchImage(url).then(function (image) {
                        self._cache[url] = image;
                        return image;
                    });
                }
                return imagePromise.then(function (image) {
                    tile.image = image;
                    return tile;
                });
            }));
        }
    },

    _fetchImage: {
        value: function (url) {
            var image = new Image();
            return new Promise(function (resolve, reject) {
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = function (e) {
                    console.log("error", e);
                    reject(e);
                };
                image.setAttribute("crossOrigin", "anonymous");
                image.src = url;
            });
        }
    }

}, {
    WORLD_IMAGERY_SERVICE_URL: {
        value: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
    }
});
