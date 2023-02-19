'use strict'

const { AngleType } = require('../models')
const { lineIntersect } = require('geojson');

function findTopLeftPoint(polygon) {
  let topLeft = [Infinity, -Infinity]; // init point to most bottom right
  for (let i = 0; i < polygon.length; i++) {
    let [lng, lat] = polygon[i];
    if (lng < topLeft[0]) {
      topLeft[0] = lng;
    }
    if (lat > topLeft[1]) {
      topLeft[1] = lat;
    }
  }
  return topLeft;
}

function findTopRightPoint(polygon) {
  let topRight = [-Infinity, -Infinity]; // init point to most bottom left
  for (let i = 0; i < polygon.length; i++) {
    let [lng, lat] = polygon[i];
    if (lng > topRight[0]) {
      topRight[0] = lng;
    }
    if (lat > topRight[1]) {
      topRight[1] = lat;
    }
  }
  return topRight;
}

function findBottomLeftPoint(polygon) {
  let bottomLeft = [Infinity, Infinity]; // init point to most top right
  for (let i = 0; i < polygon.length; i++) {
    let [lng, lat] = polygon[i];
    if (lng < bottomLeft[0]) {
      bottomLeft[0] = lng;
    }
    if (lat < bottomLeft[1]) {
      bottomLeft[1] = lat;
    }
  }
  return bottomLeft;
}

function findBottomRightPoint(polygon) {
  let bottomRight = [-Infinity, Infinity]; // init point to most top left
  for (let i = 0; i < polygon.length; i++) {
    let [lng, lat] = polygon[i];
    if (lng > bottomRight[0]) {
      bottomRight[0] = lng;
    }
    if (lat < bottomRight[1]) {
      bottomRight[1] = lat;
    }
  }
  return bottomRight;
}

function findStartingPoint(polygon, angleType) {
  switch (angleType) {
    case AngleType.TOP_LEFT:
      return findTopLeftPoint(polygon);
    case AngleType.TOP_RIGHT:
      return findTopRightPoint(polygon);
    case AngleType.BOTTOM_LEFT:
      return findBottomLeftPoint(polygon);
    case AngleType.BOTTOM_RIGHT:
      return findBottomRightPoint(polygon);
  }
}

function findIntersection(polygon, line){
  //TODO: consider if we need to format line and polygon using geojson
  return lineIntersect(line, polygon);
}

module.exports = { findStartingPoint, findIntersection, findTopLeftPoint, findTopRightPoint, findBottomLeftPoint, findBottomRightPoint }