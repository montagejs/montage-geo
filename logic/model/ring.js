/** Signed planar area using unwrapped longitudes and a local origin. */
exports.signedArea = function (ring) {
    if (!ring || ring.length < 3) {
        return 0;
    }
    var origin = ring[0],
        previousLongitude = origin[0],
        previousX = 0,
        previousY = 0,
        area = 0,
        longitude, delta, x, y, i;

    for (i = 1; i < ring.length; i += 1) {
        longitude = ring[i][0];
        delta = longitude - previousLongitude;
        if (delta > 180) {
            delta -= 360;
        } else if (delta < -180) {
            delta += 360;
        }
        x = previousX + delta;
        y = ring[i][1] - origin[1];
        area += previousX * y - x * previousY;
        previousLongitude = longitude;
        previousX = x;
        previousY = y;
    }
    return area / 2;
};
