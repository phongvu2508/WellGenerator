function findTopLeftPoint(polygon) {
  let topLeft = [Infinity, -Infinity];
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

function findBottomLeftPoint(polygon) {
  let bottomLeft = [Infinity, Infinity];
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

module.exports = { findTopLeftPoint, findBottomLeftPoint }