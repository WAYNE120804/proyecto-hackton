/**
 * Placeholder service for NDVI/NDWI and risk analytics.
 * Replace the random value generation with real GeoTIFF processing logic.
 */
function simulateAnalysis({ collectionId, itemId, datetime, assetUrl }) {
  const ndvi = randomBetween(0.2, 0.9);
  const ndwi = randomBetween(0.1, 0.6);
  const coverage = randomCoverage();
  const risk = computeRisk(ndvi, ndwi);

  return {
    collectionId,
    itemId,
    datetime,
    indices: {
      ndvi,
      ndwi
    },
    risk,
    coverage,
    assetUrl
  };
}

/**
 * Here is where the real raster analysis would go:
 * 1. Download the GeoTIFF (assetUrl) to a temp directory or stream it.
 * 2. Use a raster processing library (e.g., geotiff.js, GDAL bindings, or rasterio via a Python service).
 * 3. Extract the NIR and RED bands to calculate NDVI = (NIR - RED) / (NIR + RED).
 * 4. Extract the GREEN/NIR bands to derive NDWI.
 * 5. Aggregate per-pixel results to obtain coverage percentages and risk levels.
 */

function analyzeAreaFromAsset({ collectionId, itemId, datetime, assetUrl, aoi, areaLabel }) {
  // Future hook: replace simulateAnalysis with real raster statistics clipped by AOI polygon.
  const simulation = simulateAnalysis({ collectionId, itemId, datetime, assetUrl });
  return {
    hasData: true,
    ...simulation,
    aoi,
    areaLabel: areaLabel || 'Cobertura general'
  };
}

function randomBetween(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function randomCoverage() {
  const high = Math.floor(Math.random() * 41) + 40; // 40-80%
  const medium = Math.floor(Math.random() * (100 - high));
  const low = 100 - high - medium;

  return {
    highVegetation: high,
    mediumVegetation: medium,
    lowVegetation: low
  };
}

function computeRisk(ndvi, ndwi) {
  let level = 'bajo';
  let description = 'Vegetacion saludable y buen nivel hidrico.';

  if (ndvi < 0.45 || ndwi < 0.2) {
    level = 'alto';
    description = 'Riesgo elevado de estres por baja vegetacion o humedad.';
  } else if (ndvi < 0.65 || ndwi < 0.35) {
    level = 'medio';
    description = 'Vegetacion moderada con senales de vigilancia.';
  }

  return {
    level,
    description
  };
}

module.exports = {
  simulateAnalysis,
  analyzeAreaFromAsset
};
