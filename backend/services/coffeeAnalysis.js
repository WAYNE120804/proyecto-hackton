const path = require('path');
const fs = require('fs');
const GeoTIFF = require('geotiff');
const { loadModel, predictSample } = require('./coffeeModel');

const TIF_PATH = path.join(
  __dirname,
  '..',
  'data',
  'sentinel2',
  'S2A_MSIL2A_20230423T152641_N0509_R025_T18NVL_20230424T041558.SAFE_NDVI.tif'
);

let cachedTiff = null;
let cachedImage = null;

/**
 * Abre el GeoTIFF de banda única y lo deja en caché.
 * @returns {Promise<Object>} GeoTIFF image object
 * @throws {Error} Si el archivo TIFF no existe o no se puede leer
 */
async function getImage() {
  if (cachedImage) return cachedImage;

  // Validate file exists before attempting to read
  if (!fs.existsSync(TIF_PATH)) {
    throw new Error(`GeoTIFF file not found at path: ${TIF_PATH}`);
  }

  try {
    const tiff = await GeoTIFF.fromFile(TIF_PATH);
    cachedTiff = tiff;
    const image = await tiff.getImage();
    cachedImage = image;
    return image;
  } catch (error) {
    throw new Error(`Failed to load GeoTIFF file: ${error.message}`);
  }
}

/**
 * Calcula porcentaje de café dentro de un polígono GeoJSON (EPSG:4326).
 * - Convierte coords geográficas a índice de píxel usando la geotransformación del TIFF.
 * - Itera por la ventana bounding del polígono y cuenta probabilidad>0.5 como café.
 * - Para polígonos grandes se puede muestrear usando sampleStep (ej. 2) para acelerar.
 * 
 * @param {Object} geojsonPolygon - Polígono en formato GeoJSON (Polygon o Feature con geometry Polygon)
 * @param {Object} options - Opciones de análisis
 * @param {number} [options.sampleStep=1] - Paso de muestreo (1=todos los píxeles, 2=cada 2 píxeles, etc.)
 * @returns {Promise<Object>} Objeto con totalPixels, coffeePixels, y coffeePercentage
 * @throws {Error} Si el polígono es inválido o está fuera de los límites de la imagen
 */
async function analyzePolygon(geojsonPolygon, options = {}) {
  if (!geojsonPolygon || !geojsonPolygon.type) {
    throw new Error('Polygon GeoJSON is required');
  }

  try {
    await loadModel(); // asegura que el modelo esté cargado
    const image = await getImage();
  } catch (error) {
    throw new Error(`Failed to initialize analysis: ${error.message}`);
  }

  const image = await getImage();
  const resolution = image.getResolution();
  const origin = image.getOrigin();
  const width = image.getWidth();
  const height = image.getHeight();

  const sampleStep = options.sampleStep || 1; // subir a 2 o 3 si el polígono es enorme

  const ring = extractFirstRing(geojsonPolygon);
  if (!ring || !ring.length) {
    throw new Error('Polygon has no coordinates or is invalid. Please provide a valid Polygon or Feature with Polygon geometry.');
  }

  // Validate minimum polygon size (at least 3 points for a triangle)
  if (ring.length < 3) {
    throw new Error('Polygon must have at least 3 coordinate points');
  }

  const bbox = ring.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat)
    }),
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  );

  const { minX, minY, maxX, maxY } = projectBoundingBoxToPixels(
    bbox,
    origin,
    resolution,
    width,
    height
  );

  const windowWidth = maxX - minX + 1;
  const windowHeight = maxY - minY + 1;

  if (windowWidth <= 0 || windowHeight <= 0) {
    throw new Error(
      `Polygon is outside the image bounds. Image covers origin: [${origin[0]}, ${origin[1]}], ` +
      `resolution: [${resolution[0]}, ${resolution[1]}], size: ${width}x${height} pixels. ` +
      `Your polygon bbox: [${bbox.minLng}, ${bbox.minLat}] to [${bbox.maxLng}, ${bbox.maxLat}]`
    );
  }

  // Leer solo la ventana necesaria de la banda
  const raster = await image.readRasters({
    window: [minX, minY, maxX + 1, maxY + 1],
    width: windowWidth,
    height: windowHeight,
    interleave: true,
    samples: [0] // unica banda
  });

  const data = raster[0] || raster;
  let totalPixels = 0;
  let coffeePixels = 0;

  for (let y = 0; y < windowHeight; y += sampleStep) {
    for (let x = 0; x < windowWidth; x += sampleStep) {
      const idx = y * windowWidth + x;
      const pixelLng = origin[0] + (minX + x + 0.5) * resolution[0];
      const pixelLat = origin[1] + (minY + y + 0.5) * resolution[1];

      if (!pointInPolygon([pixelLng, pixelLat], ring)) continue;

      const bandValue = data[idx];
      if (!Number.isFinite(bandValue)) continue;

      const prob = predictSample(bandValue);
      if (prob > 0.5) coffeePixels += 1;
      totalPixels += 1;
    }
  }

  const coffeePercentage = totalPixels ? (coffeePixels / totalPixels) * 100 : 0;

  return {
    totalPixels,
    coffeePixels,
    coffeePercentage: Number(coffeePercentage.toFixed(2))
  };
}

/**
 * Extrae el primer anillo de coordenadas de un objeto GeoJSON.
 * @param {Object} geojson - Objeto GeoJSON (Polygon o Feature)
 * @returns {Array<Array<number>>} Array de coordenadas [lng, lat]
 */
function extractFirstRing(geojson) {
  if (geojson.type === 'Polygon') {
    return geojson.coordinates?.[0] || [];
  }
  if (geojson.type === 'Feature' && geojson.geometry?.type === 'Polygon') {
    return geojson.geometry.coordinates?.[0] || [];
  }
  return [];
}

/**
 * Proyecta un bounding box geográfico a coordenadas de píxel.
 * @param {Object} bbox - Bounding box con minLng, maxLng, minLat, maxLat
 * @param {Array<number>} origin - Origen del GeoTIFF [x, y]
 * @param {Array<number>} resolution - Resolución del GeoTIFF [resX, resY]
 * @param {number} width - Ancho de la imagen en píxeles
 * @param {number} height - Alto de la imagen en píxeles
 * @returns {Object} Objeto con minX, minY, maxX, maxY en coordenadas de píxel
 */
function projectBoundingBoxToPixels(bbox, origin, resolution, width, height) {
  const resX = resolution[0];
  const resY = resolution[1];
  // Suponemos north-up; resY suele ser negativo. Usamos abs para asegurar conteo correcto.
  const pixelX = (lng) => Math.floor((lng - origin[0]) / resX);
  const pixelY = (lat) => Math.floor((lat - origin[1]) / resY);

  const minX = clamp(Math.min(pixelX(bbox.minLng), pixelX(bbox.maxLng)), 0, width - 1);
  const maxX = clamp(Math.max(pixelX(bbox.minLng), pixelX(bbox.maxLng)), 0, width - 1);
  const minY = clamp(Math.min(pixelY(bbox.minLat), pixelY(bbox.maxLat)), 0, height - 1);
  const maxY = clamp(Math.max(pixelY(bbox.minLat), pixelY(bbox.maxLat)), 0, height - 1);

  return { minX, minY, maxX, maxY };
}

/**
 * Determina si un punto está dentro de un polígono usando ray-casting.
 * @param {Array<number>} point - Punto [x, y] en coordenadas geográficas
 * @param {Array<Array<number>>} ring - Anillo del polígono como array de [lng, lat]
 * @returns {boolean} true si el punto está dentro del polígono
 */
function pointInPolygon([x, y], ring) {
  // Implementación ray-casting 2D estándar en coords geográficas.
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Limita un valor entre un mínimo y un máximo.
 * @param {number} value - Valor a limitar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor limitado
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = {
  analyzePolygon
};
