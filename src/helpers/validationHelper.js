'use strict'

function tryParseFileSelection(input) {
    let filePath = './src/data/poly1.json';

    switch (input) {
        case '1':
            break;
        case '2':
            filePath = './src/data/poly2.json';
            break;
        default:
            console.log("Unsupport file provided.");
            return false;
    }

    return filePath;
}

function tryParseAzimuth(input) {
    const value = parseInt(input);

    if (!value || value < 0 || value > 360) {
        console.log("Invalid azimuth provided.");
        return false;
    }

    return value;
}

function tryParsePositiveInt(input) {
    const value = parseInt(input);

    if (!value || value <= 0) {
        console.log("Invalid number provided.");
        return false;
    }

    return value;
}

function tryParseArrayOfPositiveInt(input) {
    if (!input) {
        console.log("Invalid array provided.");
        return false;
    }

    const values = input.split(',');
    let output = [];

    values.forEach(v => {
        const value = parseInt(v.trim());

        if (!value || value <= 0) {
            console.log("Invalid number provided.");
            return false;
        }

        output.push(value);
    });

    return output;
}

function validateSpacing(spacing, leftLateralOffset, rightLateralOffset) {

    if (leftLateralOffset + rightLateralOffset > spacing) {
        console.log(`Spacing between wells is ${spacing} conflicting with left and right lateral offset at ${leftLateralOffset} and ${rightLateralOffset}.`);
        return false;
    }

    return true;
}

function validateLayers(numberOfLayers, layerVerticalOffset) {

    if (layerVerticalOffset.length != numberOfLayers - 1) {
        console.log(`vertical offset value array has ${layerVerticalOffset.length} items, number of layers at ${numberOfLayers}.`);
        return false;
    }
    return true;
}

module.exports = { tryParsePositiveInt, tryParseAzimuth, tryParseFileSelection, tryParseArrayOfPositiveInt, validateSpacing, validateLayers }