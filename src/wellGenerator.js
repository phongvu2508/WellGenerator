'use strict'

const { findStartingPoint } = require('./helpers/polygonHelper')
const { findAngleType } = require('./helpers/angleHelper')

function generateHorizontalWells(polygon, azimuth, numberOfLayers, maxLength, spacing, initialDepth, leftLateralOffset, rightLateralOffset, layerVerticalOffset) {

    // Based on azimuth, we can choose out strategy to start drawing well
    const angleType = findAngleType(azimuth);

    // Based on angleType, get the best starting point (within polygon to draw the first well)
    const startingPoint = findStartingPoint(polygon, angleType);

    // Draw the first layer, make sure to cover all polygon
    const firstLayer = generateFirstLayer(polygon, startingPoint, azimuth, maxLength, spacing, initialDepth);

    const layers = [firstLayer];

    // Draw the rest of the layers based on the first layer
    layerVerticalOffset.forEach((verticalOffset, idx) => {
        const previousLayer = layers[idx];

        const newLayer = generateLayer(polygon, previousLayer, azimuth, maxLength, leftLateralOffset, rightLateralOffset, verticalOffset);

        layers.push(newLayer);
    });

    // TODO: convert all layers to WKT MULTILINESTRING, and then return

    return 'MULTILINESTRING Z((10 10 1, 20 20 3, 10 40 4),(40 40 4, 30 30 1, 40 20 4, 30 10 4))';
}

function generateFirstLayer(polygon, startingPoint, azimuth, maxLength, spacing, initialDepth) {
    //TODO
}

function generateLayer(polygon, previousLayer, azimuth, maxLength, leftLateralOffset, rightLateralOffset, verticalOffset) {
    //TODO
}

module.exports = { generateHorizontalWells }