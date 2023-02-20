'use strict'

const { AngleType } = require('../models')

function findAngleType(azimuth) {
    // Based on the azimuthl, determind the area we should draw the first well
    if (azimuth <= 90) {
        return AngleType.BOTTOM_LEFT;
    } else if (azimuth <= 180) {
        return AngleType.TOP_LEFT;
    } else if (azimuth <= 270) {
        return AngleType.TOP_RIGHT;
    } else {
        return AngleType.BOTTOM_RIGHT;
    }
}

module.exports = { findAngleType }