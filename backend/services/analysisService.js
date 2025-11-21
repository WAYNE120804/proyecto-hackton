/**
 * Servicio de análisis simulado para NDVI/NDWI y evaluación de riesgo.
 * NOTA: Esta es una implementación placeholder que genera valores aleatorios.
 * En producción, esto debería reemplazarse con procesamiento real de GeoTIFF.
 * 
 * @param {Object} params - Parámetros de análisis
 * @param {string} params.collectionId - ID de la colección STAC
 * @param {string} params.itemId - ID del item a analizar
 * @param {string} params.datetime - Fecha/hora de la imagen
 * @param {string} params.assetUrl - URL del asset GeoTIFF
 * @returns {Object} Resultados del análisis con índices, riesgo y cobertura
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

/**
 * Analiza un área específica (AOI) de un asset GeoTIFF.
 * Actualmente usa simulación, pero está preparado para integración con análisis real.
 * 
 * @param {Object} params - Parámetros de análisis
 * @param {string} params.collectionId - ID de la colección
 * @param {string} params.itemId - ID del item
 * @param {string} params.datetime - Fecha/hora de la imagen
 * @param {string} params.assetUrl - URL del asset
 * @param {Object} params.aoi - Geometría GeoJSON del área de interés (opcional)
 * @param {string} params.areaLabel - Etiqueta descriptiva del área
 * @returns {Object} Resultados del análisis con flag hasData
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

/**
 * Genera un número aleatorio entre min y max.
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio con 2 decimales
 */
function randomBetween(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Genera porcentajes aleatorios de cobertura vegetal.
 * @returns {Object} Objeto con highVegetation, mediumVegetation, lowVegetation (suman 100%)
 */
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

/**
 * Calcula el nivel de riesgo basado en índices NDVI y NDWI.
 * 
 * @param {number} ndvi - Índice de vegetación normalizado (0-1)
 * @param {number} ndwi - Índice de agua normalizado (0-1)
 * @returns {Object} Objeto con level ('bajo', 'medio', 'alto') y description
 */
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
