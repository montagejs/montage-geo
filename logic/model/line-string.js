var Geometry = require("./geometry").Geometry,
    Position = require("./position").Position;

/**
 *
 * A Geometry whose "coordinates" member is an array of two or more positions.
 *
 * @class
 * @extends external:Geometry
 */
var LineString = exports.LineString = Geometry.specialize(/** @lends LineString.prototype */ {

    /**
     * @type {Array<Position>}
     */
    coordinates: {
        value: undefined
    },


    /**
     * @method
     * @param{LineString|Polygon}
     * @returns boolean
     */
    intersects: {
        value: function (geometry) {

            var segments = geometry.toSegments(),
                positions = this.coordinates,
                doesContain = false, segment,
                point1, point2, point3, point4,
                i, length, j, a, length2;

            outerloop:
            for (i = 0, j = 1, length = positions.length - 1; i < length; i++, j++) {
                point3 = positions[i];
                point4 = positions[j];
                for (a = 0, length2 = segments.length; a < length2; a++) {
                    point1 = segments[a].coordinates[0];
                    point2 = segments[a].coordinates[1];
                    doesContain = this._segmentsIntersect(
                        point1.longitude, point1.latitude,
                        point2.longitude, point2.latitude,
                        point3.longitude, point3.latitude,
                        point4.longitude, point4.latitude
                    );
                    if (doesContain) break outerloop;
                }
            }
            return doesContain;
            //
            //
            // // old code
            // var positions; // was parameter
            // var doesContain, extentPoints,
            //     point1, point2, point3, point4,
            //     i, length, j, a, b;
            //
            // if (!doesContain) {
            //     extentPoints = [
            //         [this.xMax, this.yMin],
            //         [this.xMin, this.yMin],
            //         [this.xMin, this.yMax],
            //         [this.xMax, this.yMax]
            //     ];
            //     for (i = 0, length = positions.length, j = length - 1; i < length; j = i++) {
            //         point3 = positions[i];
            //         point4 = positions[j];
            //         for (a = 0; a < 4; a += 1) {
            //             b = a + 1;
            //             if (b === 4) {
            //                 b = 0;
            //             }
            //             point1 = extentPoints[a];
            //             point2 = extentPoints[b];
            //             doesContain = Geometry.isInteresectingLines(
            //                 point1[0], point1[1],
            //                 point2[0], point2[1],
            //                 point3[0], point3[1],
            //                 point4[0], point4[1]
            //             );
            //         }
            //     }
            // }
            // return doesContain;
        }
    },

    toSegments: {
        value: function () {
            var coordinates = this.coordinates,
                segments = [],
                i, n;
            for (i = 0, n = coordinates.length - 1; i < n; i += 1) {
                segments.push(LineString.withCoordinates([
                    coordinates[i].toArray(), coordinates[i + 1].toArray()
                ]));
            }
            return segments;
        }
    },

    _segmentsIntersect: {
        value: function (x1, y1, x2, y2, x3, y3, x4, y4) {
            return this._orientation(x1, y1, x3, y3, x4, y4) !== this._orientation(x2, y2, x3, y3, x4, y4) &&
                this._orientation(x1, y1, x2, y2, x3, y3) !== this._orientation(x1, y1, x2, y2, x4, y4);
        }
    },

    _orientation: {
        value: function (tx1, ty1, tx2, ty2, tx3, ty3) {
            var clockWise = ((ty3 - ty1) * (tx2 - tx1)) - ((ty2 - ty1) * (tx3 - tx1));
            return clockWise > 0 ? true : clockWise < 0 ? false : true;
        }
    }


}, {

    /**
     * Returns a newly initialized LineString with the specified coordinates.
     *
     * @param {array<array<number>>} coordinates - The position of this point.
     */
    withCoordinates: {
        value: function (coordinates) {
            var self = new this();
            self.coordinates = coordinates.map(function (coordinate) {
                return Position.withCoordinates(coordinate);
            });
            return self;
        }
    }

});
