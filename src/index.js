'use strict'

const readline = require('readline');

const { generateHorizontalWells } = require('./wellGenerator')

let geometry; // Geojson file path - the path to the geojson file.
let azimuth; // angle degree - the direction of the well.
let numberOfLayers; // integer - number of layers.
let maxLength; // number - max length of the well in meters
let spacing; // number - the spacing between the wells.
let initialDepth; // number - the initial depth of the first layer in meters
let leftLateralOffset; // number - the left lateral offset between the layers
let rightLateralOffset; // number - the right lateral offset between layers
let layerVerticalOffset; // array of number equal to n - 1 layers - the vertical offset between layers For example, if we have a 3 layer pad, an input of[100, 200] means that layer 1 -> layer 2 should have a vertical spacing of 100m, layer 2 -> layer 3 will have a vertical spacing of 200m

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getGeometry = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the geometry file path: ', (answer) => {
            // TODO: validate input
            geometry = answer;
            resolve()
        })
    })
}

const getAzimuth = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the angle degree of the well: ', (answer) => {
            // TODO: validate input
            azimuth = answer;
            resolve()
        })
    })
}

const getNumberOfLayers = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the number of layers: ', (answer) => {
            // TODO: validate input
            numberOfLayers = answer;
            resolve()
        })
    })
}

const getMaxLength = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the max length of the well in meters: ', (answer) => {
            // TODO: validate input
            maxLength = answer;
            resolve()
        })
    })
}

const getSpacing = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the spacing between the wells:', (answer) => {
            // TODO: validate input
            spacing = answer;
            resolve()
        })
    })
}

const getInitialDepth = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the initial depth of the first layer in meters:', (answer) => {
            // TODO: validate input
            initialDepth = answer;
            resolve()
        })
    })
}

const getLeftLateralOffset = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the left lateral offset between the layers:', (answer) => {
            // TODO: validate input
            leftLateralOffset = answer;
            resolve()
        })
    })
}

const getRightLateralOffset = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the right lateral offset between the layers:', (answer) => {
            // TODO: validate input
            rightLateralOffset = answer;
            resolve()
        })
    })
}

const getLayerVerticalOffset = () => {
    return new Promise((resolve, reject) => {
        rl.question('Please enter the vertical offsets between layers:', (answer) => {
            // TODO: validate input
            // TODO: foreach to read each offset
            layerVerticalOffset = answer.split(",");
            resolve()
        })
    })
}


const app = async () => {
    await getGeometry();
    await getAzimuth();
    await getNumberOfLayers();
    await getMaxLength();
    await getSpacing();
    await getInitialDepth();
    await getLeftLateralOffset();
    await getRightLateralOffset();
    await getLayerVerticalOffset();

    rl.close()

    // TODO: run validate on overall inputs

    console.log(geometry);
    console.log(azimuth);
    console.log(numberOfLayers);
    console.log(maxLength);
    console.log(spacing);
    console.log(initialDepth);
    console.log(leftLateralOffset);
    console.log(rightLateralOffset);
    console.log(layerVerticalOffset);

    const wells = generateHorizontalWells(geometry, azimuth, numberOfLayers, maxLength, spacing, initialDepth, leftLateralOffset, rightLateralOffset, layerVerticalOffset);

    console.log(`Here are the most optimized wells we can have within specified polygon: ${wells}`);
}

app();