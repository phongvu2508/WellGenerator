'use strict'

const _prefix = 'MULTILINESTRING Z(';
const _posfix = ')';

function toWKTString(layers) {
    let wkt = '';

    layers.forEach(layer => {
        layer.forEach(line => {
            if(wkt != ''){
                wkt += ' ,';
            }
            wkt += `(${line[0][0]} ${line[0][1]} ${line[0][2]}, ${line[1][0]} ${line[1][1]} ${line[1][2]})`;
        })
    });

    if(wkt == ''){
        return false;
    }

    return _prefix + wkt + _posfix;
  }
  
  module.exports = { toWKTString }