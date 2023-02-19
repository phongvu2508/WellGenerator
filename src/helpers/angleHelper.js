'use strict'

const { AngleType } = require('../models')

function findAngleType(azimuthl) {
    // Based on the azimuthl, determind the area we should draw the first well
    if(azimuthl <= 90){
        return AngleType.BOTTOM_LEFT;
    }else if (azimuthl <= 180){
        return AngleType.TOP_LEFT;
    }else if (azimuthl <= 270){
        return AngleType.TOP_RIGHT;
    }else{
        return AngleType.BOTTOM_RIGHT;
    }
  }
  
  module.exports = { findAngleType}