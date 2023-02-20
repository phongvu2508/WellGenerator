'use strict'

const { findStartingPoint,
    findTopLeftPoint,
    findTopRightPoint,
    findBottomLeftPoint,
    findBottomRightPoint,
    drawLineUntilIntersectWithPolygon,
    shortenLineWithMaxLength,
    drawLineParallelOffsetFromALine,
    extendLineUntilIntersectTwiceWithPolygon } = require('./helpers/geometryHelper')
const { findAngleType } = require('./helpers/angleHelper')
const { toWKTString } = require('./helpers/wktHelper');

let _polygon;
let _topLeftPoint;
let _topRightPoint;
let _bottomLeftPoint;
let _bottomRightPoint;

let _maxLength;
let _azimuth;

function generateHorizontalWells(polygon, azimuth, numberOfLayers, maxLength, spacing, initialDepth, leftLateralOffset, rightLateralOffset, layerVerticalOffset) {

    // Catch current polygon and determind which is the most outline points for the polygon
    _polygon = polygon;
    _topLeftPoint = findTopLeftPoint(polygon.coordinates[0]);
    _topRightPoint = findTopRightPoint(polygon.coordinates[0]);
    _bottomLeftPoint = findBottomLeftPoint(polygon.coordinates[0]);
    _bottomRightPoint = findBottomRightPoint(polygon.coordinates[0]);

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
    const lineCrossedPolygon = drawLineUntilIntersectWithPolygon(startingPoint, _azimuth, polygon, 2);

    if (!lineCrossedPolygon) {
        console.log("We got issue with drawing first well, either polygon is irregular and will not be supported, or there is some error on my calculation.")
        return false;
    }

    const firstLayer = [];

    const firstWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[1], lineCrossedPolygon.geometry.coordinates[2]], _maxLength);

    firstLayer.push(firstWell);

    // Draw wells to the left side of the first well
    let nextWell = firstWell;
    while(nextWell != null){
        nextWell = drawLineParallelOffsetFromALine(nextWell, spacing*-1);
        lineCrossedPolygon = extendLineUntilIntersectTwiceWithPolygon(nextWell.geometry.coordinates, _azimuth, _polygon);

        if (!lineCrossedPolygon) {
            // If the well not intersect with the pylogon at all, we're out of the covering area
            nextWell = null;
        }

        nextWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[1], lineCrossedPolygon.geometry.coordinates[2]], _maxLength);
        firstLayer.push(firstWell);
    }

    // Draw wells to the right side of the first well
    nextWell = firstWell;
    while(nextWell != null){
        nextWell = drawLineParallelOffsetFromALine(nextWell, spacing);
        lineCrossedPolygon = extendLineUntilIntersectTwiceWithPolygon(nextWell.geometry.coordinates, _azimuth, _polygon);

        if (!lineCrossedPolygon) {
            // If the well not intersect with the pylogon at all, we're out of the covering area
            nextWell = null;
        }

        nextWell = shortenLineWithMaxLength([lineCrossedPolygon.geometry.coordinates[1], lineCrossedPolygon.geometry.coordinates[2]], _maxLength);
        firstLayer.push(firstWell);
    }

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

module.exports = { generateHorizontalWells }