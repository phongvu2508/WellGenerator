'use strict'

const { AngleType } = require('../models')
const turf = require('@turf/turf');

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

function drawLineUntilIntersectWithPolygon(startPoint, azimuth, polygon, numberOfIntersects = 2) {
  // We only try to draw the line 10 times to find both intersections with polygon.
  // After that either the line will never cross the polygon, or considered myself defeated for now.
  var options = { units: 'meters' };
  const lineLength = 100000; // Choose a line length that is long enough to cross the polygon

  const formattedPolygon = {
    "type": "Feature",
    "properties": {},
    "geometry": polygon
  }

  let endCoords = turf.destination(startPoint, lineLength, azimuth, options).geometry.coordinates;

  const line = turf.lineString([startPoint, endCoords]);
  const intersections = turf.lineIntersect(line, formattedPolygon);

  let numberOfTry = 1;
  while (intersections.features.length < numberOfIntersects && numberOfTry < 10) {
    const newEndCoords = turf.destination(endCoords, lineLength, azimuth, options).geometry.coordinates;
    const newLine = turf.lineString([endCoords, newEndCoords]);
    intersections.features = intersections.features.concat(turf.lineIntersect(newLine, formattedPolygon).features);
    endCoords = newEndCoords;
    numberOfTry++;
  }

  if (intersections.features.length < numberOfIntersects) {
    return false;
  }

  var points = [startPoint]

  intersections.features.forEach(intersection => {
    points.push(intersection.geometry.coordinates);
  });

  return turf.multiPoint(points);
}

function extendLineUntilIntersectTwiceWithPolygon(line, azimuth, polygon) {
  // We only try to draw the line 10 times to find both intersections with polygon.
  // After that either the line will never cross the polygon, or considered myself defeated for now.
  const formattedPolygon = {
    "type": "Feature",
    "properties": {},
    "geometry": polygon
  }

  const startPoint = turf.point(line[0]);
  const endPoint = turf.point(line[1]);

  const isStartPointInPolygon = turf.booleanPointInPolygon(startPoint, formattedPolygon);
  const isEndPointInPolygon = turf.booleanPointInPolygon(endPoint, formattedPolygon);

  if (!isStartPointInPolygon) {
    // If Start Point is outside Polygon, draw to the right until we intersect twice with polygon
    var newLine = drawLineUntilIntersectWithPolygon(line[0], azimuth, polygon, 2);

    if (newLine) {
      return turf.lineString([newLine.geometry.coordinates[1], newLine.geometry.coordinates[2]]);
    }
  }

  if (!isEndPointInPolygon) {
    // If End Point is outside Polygon, draw to the left until we intersect twice with polygon
    var newLine = drawLineUntilIntersectWithPolygon(line[1], azimuth - 180, polygon, 2);

    if (newLine) {
      return turf.lineString([newLine.geometry.coordinates[1], newLine.geometry.coordinates[2]]);
    }
  }

  // If we're here, this mean both start and end point are inside Polygon, just grab the start point and draw to left and right, we will have both intersections.
  let leftLine = drawLineUntilIntersectWithPolygon(line[0], azimuth - 180, polygon, 1);
  let rightLine = drawLineUntilIntersectWithPolygon(line[0], azimuth, polygon, 1);

  if (leftLine && rightLine) {
    return turf.lineString([leftLine.geometry.coordinates[1], rightLine.geometry.coordinates[1]]);
  }

  return false;
}

function drawLineParallelOffsetFromALine(line, distance) {
  const turfLine = turf.lineString(line);

  return turf.lineOffset(turfLine, distance, { units: 'meters' });
}

function shortenLineWithMaxLength(line, maxLength) {
  // Return original line if line length less than maxLength
  // Return new line with startPoint + newEndPoint if line length longer than maxLength
  const [startPoint, endPoint] = line;

  const R = 6371e3; // Earth's radius in meters
  const lat1 = toRadians(startPoint[1]);
  const lat2 = toRadians(endPoint[1]);
  const deltaLat = toRadians(endPoint[1] - startPoint[1]);
  const deltaLon = toRadians(endPoint[0] - startPoint[0]);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // The distance between the two points in meters

  if (distance <= maxLength) {
    // If distance is less than maxLength, just return the original line
    return line;
  }

  const initialBearing = Math.atan2(Math.sin(deltaLon) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon));
  const newEndpoint = calculateNewEndpoint(startPoint, initialBearing, maxLength);

  return [startPoint, newEndpoint];
}

// Helper function to calculate the new endpoint of a line given the initial bearing and distance
function calculateNewEndpoint(startPoint, initialBearing, distance) {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = toRadians(startPoint[1]);
  const lon1 = toRadians(startPoint[0]);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(initialBearing));
  const lon2 = lon1 + Math.atan2(Math.sin(initialBearing) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  return [toDegrees(lon2), toDegrees(lat2)];
}

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Helper function to convert radians to degrees
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

module.exports = { findStartingPoint,
                    findTopLeftPoint, 
                    findTopRightPoint, 
                    findBottomLeftPoint, 
                    findBottomRightPoint, 
                    drawLineUntilIntersectWithPolygon, 
                    shortenLineWithMaxLength, 
                    drawLineParallelOffsetFromALine, 
                    extendLineUntilIntersectTwiceWithPolygon }