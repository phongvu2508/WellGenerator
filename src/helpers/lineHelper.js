'use strict'

function drawLine(startingPoint, azimuth, distance) {

    // Convert the azimuth angle to radians
    const azimuthRad = (azimuth * Math.PI) / 180;

    // Convert the distance from meters to kilometers
    const distanceKm = distance / 1000;

    // Convert the latitude and longitude to radians
    const latRad = (startingPoint[1] * Math.PI) / 180;
    const longRad = (startingPoint[0] * Math.PI) / 180;

    // Earth radius in kilometers
    const earthRadiusKm = 6371;

    // Calculate the new latitude using the Haversine formula
    const newLat = Math.asin(
        Math.sin(latRad) * Math.cos(distanceKm / earthRadiusKm) +
        Math.cos(latRad) *
        Math.sin(distanceKm / earthRadiusKm) *
        Math.cos(azimuthRad)
    );

    // Calculate the new longitude using the Haversine formula
    const newLong =
        longRad +
        Math.atan2(
            Math.sin(azimuthRad) *
            Math.sin(distanceKm / earthRadiusKm) *
            Math.cos(latRad),
            Math.cos(distanceKm / earthRadiusKm) -
            Math.sin(latRad) * Math.sin(newLat)
        );

    // Convert the new latitude and longitude to degrees
    const newLatDeg = (newLat * 180) / Math.PI;
    const newLongDeg = (newLong * 180) / Math.PI;

    // Return the new point as an object with longitude and latitude properties
    return [startingPoint, [newLongDeg, newLatDeg]];
}

module.exports = { drawLine }