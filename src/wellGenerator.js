'use strict'

const { findStartingPoint,
    drawLineUntilIntersectWithPolygon,
    shortenLineWithMaxLength,
    drawLineParallelOffsetFromALine,
    extendLineUntilIntersectTwiceWithPolygon } = require('./helpers/geometryHelper')
const { findAngleType } = require('./helpers/angleHelper')
const { toWKTString } = require('./helpers/wktHelper');

let _polygon;

let _maxLength;
let _azimuth;

function generateHorizontalWells(polygon, azimuth, numberOfLayers, maxLength, spacing, initialDepth, leftLateralOffset, rightLateralOffset, layerVerticalOffset) {

    // Catch reuseable value
    _polygon = polygon;
    _maxLength = maxLength;
    _azimuth = azimuth;

    // Based on azimuth, we can choose out strategy to start drawing well
    const angleType = findAngleType(_azimuth);

    // Based on angleType, get the best starting point (within polygon to draw the first well)
    const startingPoint = findStartingPoint(polygon.coordinates[0], angleType);

    // Draw the first layer, make sure to cover all polygon
    const firstLayer = generateFirstLayer(polygon, startingPoint, maxLength, spacing, initialDepth);

    if (!firstLayer) {
        return false;
    }

    const layers = [firstLayer];

    // Draw the rest of the layers based on the first layer
    layerVerticalOffset.forEach((verticalOffset, idx) => {
        const previousLayer = layers[idx];

        const newLayer = generateLayer(polygon, previousLayer, maxLength, leftLateralOffset, rightLateralOffset, verticalOffset);

        layers.push(newLayer);
    });

    return toWKTString(layers)
}

function generateFirstLayer(polygon, startingPoint, spacing, initialDepth) {
    let lineCrossedPolygon = drawLineUntilIntersectWithPolygon(startingPoint, _azimuth, polygon, 2);

    if (!lineCrossedPolygon) {
        console.log("We got issue with drawing first well, either polygon is irregular and will not be supported, or there is some error on my calculation.")
        return false;
    }

    const firstLayer = [];

    const firstWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[1], lineCrossedPolygon.geometry.coordinates[2]], _maxLength);

    firstLayer.push(firstWell);

    // generate wells to the left side of the first well
    let wells = drawFollowingWellsFromFirstWell(firstWell, spacing * -1);
    // inswer the wells into start of array
    firstLayer.unshift(wells);

    // generate wells to the right side of the first well
    wells = drawFollowingWellsFromFirstWell(firstWell, spacing);
    // inswer the well into end of array
    firstLayer.push(wells);

    // Add depth data to each wells line
    firstLayer.forEach(well => {
        well[0].push(initialDepth);
        well[1].push(initialDepth);
    });

    return firstLayer;
}

function generateLayer(polygon, previousLayer, leftLateralOffset, rightLateralOffset, verticalOffset) {
    //TODO
}

function drawFollowingWellsFromFirstWell(firstWell, spacing) {
    const layer = [];

    let nextWell = firstWell;

    while (nextWell != null) {

        // Create new well parallel from the last well
        nextWell = drawLineParallelOffsetFromALine(nextWell, spacing);

        // Make sure well intersect with the polygon twice
        lineCrossedPolygon = extendLineUntilIntersectTwiceWithPolygon(nextWell.geometry.coordinates, _azimuth, _polygon);

        if (!lineCrossedPolygon) {
            // If the well not intersect with the pylogon at all, we're out of the covering area
            nextWell = null;
            break;
        }

        // Then, shorten the well by max length
        nextWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[0], lineCrossedPolygon.geometry.coordinates[1]], _maxLength);

        // If spacing less than 0, we're drawing to the left of the first well
        if (spacing < 0) {
            // inswer the well into start of array
            layer.unshift(nextWell);
        } else {
            // inswer the well into end of array
            firstLayer.push(nextWell);
        }
    }

    return layer;
}

module.exports = { generateHorizontalWells }