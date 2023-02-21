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
    const startingPoint = findStartingPoint(_polygon.coordinates[0], angleType);

    // Draw the first layer, make sure to cover all polygon
    const firstLayer = generateFirstLayer(startingPoint, spacing, initialDepth);

    if (!firstLayer) {
        return false;
    }

    const layers = [firstLayer];

    // Draw the rest of the layers based on the first layer
    layerVerticalOffset.forEach((verticalOffset, idx) => {
        const previousLayer = layers[idx];

        const newLayer = generateLayer(idx + 1, previousLayer, spacing, leftLateralOffset, rightLateralOffset, verticalOffset);

        if (newLayer && newLayer.length) {
            layers.push(newLayer);
        }
    });

    return toWKTString(layers)
}

function generateFirstLayer(startingPoint, spacing, initialDepth) {
    const lineCrossedPolygon = drawLineUntilIntersectWithPolygon(startingPoint, _azimuth, _polygon, 2);

    if (!lineCrossedPolygon) {
        console.log("We got issue with drawing the very first well, either polygon is irregular and will not be supported, or there are errors on the calculation.")
        return false;
    }

    let firstLayer = [];

    const firstWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[1], lineCrossedPolygon.geometry.coordinates[2]], _maxLength);

    firstLayer.push(firstWell);

    // generate wells to the left side of the first well
    let wells = drawFollowingWellsFromFirstWell(firstWell, spacing * -1);

    if (wells.length) {
        // inswer the wells into start of array
        firstLayer = wells.concat(firstLayer);
    }

    // generate wells to the right side of the first well
    wells = drawFollowingWellsFromFirstWell(firstWell, spacing);

    if (wells.length) {
        // inswer the well into end of array
        firstLayer = firstLayer.concat(wells);
    }

    // Add depth data to each wells line
    firstLayer.forEach(well => {
        well[0].push(initialDepth);
        well[1].push(initialDepth);
    });

    return firstLayer;
}

function generateLayer(level, previousLayer, spacing, leftLateralOffset, rightLateralOffset, verticalOffset) {
    // Grab the first well from the previous layer
    const firstWellOnPreviousLayer = previousLayer[0];

    let layer = [];

    if (level % 2 != 0) {
        // If this is odd level layer, try to see if we have one well to the left of the firstWellOnPreviousLayer
        let possibleFirstWell = drawNextWellFromExistingWell(firstWellOnPreviousLayer, leftLateralOffset * -1);

        if (possibleFirstWell) {
            layer.push(possibleFirstWell);
        }
    }

    if (!layer.length) {
        // If we have no well on the layer at this point, try to draw the first well to the right of the firstWellOnPreviousLayer
        let possibleFirstWell = drawNextWellFromExistingWell(firstWellOnPreviousLayer, rightLateralOffset);

        if (possibleFirstWell) {
            layer.push(possibleFirstWell);
        }
    }

    // Grab the first well of this layer, and start drawing
    const firstWell = layer[0];

    if (!firstWell) {
        console.log(`We got issue with drawing first well on layer ${level + 1}. If we have wells on first layer, possible there are errors with the calculation.`)
        return layer;
    }

    // Continue to draw wells to the right side of the first well
    const wells = drawFollowingWellsFromFirstWell(firstWell, spacing);

    if (wells.length) {
        // inswer the well into end of array
        layer = layer.concat(wells);
    }

    // Current depth gonna be the previous layer depth + vertical offset
    const currentDepth = firstWellOnPreviousLayer[0][2] + verticalOffset;

    // Add depth data to each wells line
    layer.forEach(well => {
        well[0].push(currentDepth);
        well[1].push(currentDepth);
    });

    return layer;
}

function drawFollowingWellsFromFirstWell(firstWell, spacing) {
    const layer = [];

    let nextWell = firstWell;

    while (nextWell != null) {

        // Create new well parallel from the last well
        nextWell = drawLineParallelOffsetFromALine(nextWell, spacing);

        // Make sure well intersect with the polygon twice
        const lineCrossedPolygon = extendLineUntilIntersectTwiceWithPolygon(nextWell.geometry.coordinates, _azimuth, _polygon);

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
            layer.push(nextWell);
        }
    }

    return layer;
}

function drawNextWellFromExistingWell(well, spacing) {
    // Create new well parallel from the last well
    let possibleWell = drawLineParallelOffsetFromALine(well, spacing);

    // Make sure well intersect with the polygon twice
    const lineCrossedPolygon = extendLineUntilIntersectTwiceWithPolygon(possibleWell.geometry.coordinates, _azimuth, _polygon);

    if (lineCrossedPolygon) {
        // If line indeed intersect with the polygon, shorten the well by max length
        possibleWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[0], lineCrossedPolygon.geometry.coordinates[1]], _maxLength);

        return possibleWell;
    }

    return null;
}

module.exports = { generateHorizontalWells }