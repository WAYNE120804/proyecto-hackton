const path = require('path');
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
 */
async function getImage() {
  if (cachedImage) return cachedImage;
  const tiff = await GeoTIFF.fromFile(TIF_PATH);
  cachedTiff = tiff;
  const image = await tiff.getImage();
  cachedImage = image;
  return image;
}

/**
 * Calcula porcentaje de café dentro de un polígono GeoJSON (EPSG:4326).
 * - Convierte coords geográficas a índice de píxel usando la geotransformación del TIFF.
 * - Itera por la ventana bounding del polígono y cuenta probabilidad>0.5 como café.
 * -Para polígonos grandes se puede muestrear usando sampleStep (ej. 2) para acelerar.
 */
async function analyzePolygon(geojsonPolygon, options = {}) {
  if (!geojsonPolygon || !geojsonPolygon.type) {
    throw new Error('Polygon GeoJSON is required');
  }

  await loadModel(); // asegura que el modelo esté cargado
  const image = await getImage();
  const resolution = image.getResolution();
  const origin = image.getOrigin();
  const width = image.getWidth();
  const height = image.getHeight();

  const sampleStep = options.sampleStep || 1; // subir a 2 o 3 si el polígono es enorme

  const ring = extractFirstRing(geojsonPolygon);
  if (!ring.length) {
    throw new Error('Polygon has no coordinates');
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
    return { totalPixels: 0, coffeePixels: 0, coffeePercentage: 0 };
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

function extractFirstRing(geojson) {
  if (geojson.type === 'Polygon') {
    return geojson.coordinates?.[0] || [];
  }
  if (geojson.type === 'Feature' && geojson.geometry?.type === 'Polygon') {
    return geojson.geometry.coordinates?.[0] || [];
  }
  return [];
}

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = {
  analyzePolygon
};
