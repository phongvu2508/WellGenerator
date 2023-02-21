'use strict'

const readline = require('readline');
const fs = require('fs');

const { generateHorizontalWells } = require('./wellGenerator');
const { tryParsePositiveInt, tryParseAzimuth, tryParseFileSelection, tryParseArrayOfPositiveInt, validateSpacing, validateLayers } = require('./helpers/validationHelper');

let _geometry; // Geojson file content.
let _azimuth; // angle degree - the direction of the well.
let _numberOfLayers; // integer - number of layers.
let _maxLength; // number - max length of the well in meters
let _spacing; // number - the spacing between the wells.
let _initialDepth; // number - the initial depth of the first layer in meters
let _leftLateralOffset; // number - the left lateral offset between the layers
let _rightLateralOffset; // number - the right lateral offset between layers
let _layerVerticalOffset; // array of number equal to n - 1 layers - the vertical offset between layers For example, if we have a 3 layer pad, an input of[100, 200] means that layer 1 -> layer 2 should have a vertical spacing of 100m, layer 2 -> layer 3 will have a vertical spacing of 200m

let _validation = true;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getGeometry = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the geometry file you want to use (1 or 2): ', (answer) => {
            const filePath = tryParseFileSelection(answer);

            if (!filePath) {
                _validation = false;
                resolve();
                return;
            }

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    _validation = false;
                    resolve();
                    return;
                }

                _geometry = JSON.parse(data);
                resolve();
            });
        })
    })
}

const getAzimuth = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the angle degree of the well (we only support 0 to 180 for now): ', (answer) => {
            const value = tryParseAzimuth(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _azimuth = value;
            resolve()
            return;
        })
    })
}

const getNumberOfLayers = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the number of layers: ', (answer) => {
            const value = tryParsePositiveInt(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _numberOfLayers = value;
            resolve()
            return;
        })
    })
}

const getMaxLength = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the max length of the well in meters: ', (answer) => {
            const value = tryParsePositiveInt(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _maxLength = value;
            resolve()
            return;
        })
    })
}

const getSpacing = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the spacing between the wells in meters:', (answer) => {
            const value = tryParsePositiveInt(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _spacing = value;
            resolve()
        })
    })
}

const getInitialDepth = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the initial depth of the first layer in meters:', (answer) => {
            const value = tryParsePositiveInt(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _initialDepth = value;
            resolve()
        })
    })
}

const getLeftLateralOffset = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the left lateral offset between the layers:', (answer) => {
            const value = tryParsePositiveInt(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _leftLateralOffset = value;
            resolve()
        })
    })
}

const getRightLateralOffset = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the right lateral offset between the layers:', (answer) => {
            const value = tryParsePositiveInt(answer);

            if (!value) {
                _validation = false;
                resolve();
                return;
            }

            _rightLateralOffset = value;
            resolve()
        })
    })
}

const getLayerVerticalOffset = () => {
    return new Promise((resolve, reject) => {
        if (!_validation) {
            resolve()
            return;
        }

        rl.question('Please enter the vertical offsets between layers, each value separate by a comma:', (answer) => {
            if (!answer) {
                _layerVerticalOffset = [];
                resolve();
                return;
            }

            const values = tryParseArrayOfPositiveInt(answer);

            if (!values) {
                _validation = false;
                resolve();
                return;
            }

            _layerVerticalOffset = values;
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

    if (!_validation
        || !validateSpacing(_spacing, _leftLateralOffset, _rightLateralOffset)
        || !validateLayers(_numberOfLayers, _layerVerticalOffset)) {
        console.log(`Can't process further with invalid input, please try again.`);
        return;
    }

    console.log("geometry : " + _geometry);
    console.log("azimuth : " + _azimuth);
    console.log("numberOfLayers : " + _numberOfLayers);
    console.log("maxLength : " + _maxLength);
    console.log("spacing : " + _spacing);
    console.log("initialDepth : " + _initialDepth);
    console.log("leftLateralOffset : " + _leftLateralOffset);
    console.log("rightLateralOffset : " + _rightLateralOffset);
    console.log(`layerVerticalOffset : ${_layerVerticalOffset}`);

    const wells = generateHorizontalWells(_geometry, _azimuth, _numberOfLayers, _maxLength, _spacing, _initialDepth, _leftLateralOffset, _rightLateralOffset, _layerVerticalOffset);

    console.log(`Here are the most optimized wells we can have within specified polygon: ${wells}`);
}

app();