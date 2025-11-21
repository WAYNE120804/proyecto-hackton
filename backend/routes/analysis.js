const express = require('express');
const { getItem, geometryWithinCaldas } = require('../services/localDataService');
const { simulateAnalysis, analyzeAreaFromAsset } = require('../services/analysisService');
const { analyzePolygon } = require('../services/coffeeAnalysis');

const analyzeItemRouter = express.Router();
const analyzeAreaRouter = express.Router();
const coffeeRouter = express.Router();

/**
 * GET /api/analyze?collectionId=caldas&itemId=<item-id>
 * Ejemplo: curl "http://localhost:4000/api/analyze?collectionId=caldas&itemId=2021-01-03"
 */
analyzeItemRouter.get('/', async (req, res, next) => {
  const { collectionId, itemId } = req.query;

  if (!collectionId || !itemId) {
    return res
      .status(400)
      .json({ error: 'collectionId e itemId son requeridos para analizar una escena.' });
  }

  const item = getItem(collectionId, itemId);

  if (!item) {
    return res.json({
      hasData: false,
      message: 'No encontramos datos locales para esa imagen.'
    });
  }

  const assetUrl = selectPrimaryAsset(item.assets || {});
  const datetime = item.datetime;

  const analysis = simulateAnalysis({
    collectionId,
    itemId,
    datetime,
    assetUrl
  });

  res.json({ hasData: true, ...analysis });
});

/**
 * POST /api/coffee-percentage
 * Body: { "polygon": { ...GeoJSON Polygon... } }
 */
coffeeRouter.post('/coffee-percentage', async (req, res) => {
  const { polygon } = req.body || {};

  if (!polygon) {
    return res.status(400).json({ error: 'polygon es requerido' });
  }

  try {
    const result = await analyzePolygon(polygon);
    res.json(result);
  } catch (error) {
    console.error('Error en coffee-percentage:', error);
    res.status(500).json({ error: 'No se pudo calcular el porcentaje de cafe.' });
  }
});

/**
 * POST /api/analyze-area
 * Body:
 * {
 *   "collectionId": "caldas",
 *   "itemId": "opcional",
 *   "aoi": { ...GeoJSON... }
 * }
 */
analyzeAreaRouter.post('/', async (req, res, next) => {
  const { collectionId, itemId, aoi } = req.body || {};

  if (!collectionId) {
    return res.status(400).json({
      error:
        'collectionId es requerido y puedes enviar un poligono AOI para analizar una zona especifica.'
    });
  }

  try {
    if (aoi && !geometryWithinCaldas(aoi)) {
      return res.json({
        hasData: false,
        message:
          'La zona dibujada esta fuera del area disponible (Caldas: Manizales, Villamaría, Neira, Chinchiná y Palestina).'
      });
    }

    const item = getItem(collectionId, itemId);

    if (!item) {
      return res.json({
        hasData: false,
        message: 'De esta zona no tenemos informacion aun.'
      });
    }

    const assetUrl = selectPrimaryAsset(item.assets || {});

    if (!assetUrl) {
      return res.json({
        hasData: false,
        message: 'No encontramos assets disponibles para esta escena.'
      });
    }

    const analysis = analyzeAreaFromAsset({
      collectionId,
      itemId: item.id,
      datetime: item.datetime,
      assetUrl,
      aoi: aoi || null,
      areaLabel: aoi ? 'Poligono seleccionado' : 'Cobertura general Caldas'
    });

    res.json({
      ...analysis,
      hasData: true
    });
  } catch (error) {
    next(buildHttpError(error, 'No se pudo analizar la zona seleccionada.'));
  }
});

function selectPrimaryAsset(assets) {
  const entries = Object.entries(assets);

  if (!entries.length) {
    return null;
  }

  const ndvi =
    entries.find(([key]) => key.toLowerCase().includes('ndvi')) ||
    entries.find(([, asset]) => (asset.title || '').toLowerCase().includes('ndvi'));

  if (ndvi) {
    return ndvi[1]?.href;
  }

  const geotiff =
    entries.find(([, asset]) => (asset.type || '').toLowerCase().includes('tiff')) || entries[0];

  return geotiff[1]?.href;
}

function buildHttpError(error, fallbackMessage) {
  const err = new Error(error.response?.data?.message || fallbackMessage);
  err.status = error.response?.status || 500;
  return err;
}

module.exports = {
  analyzeItemRouter,
  analyzeAreaRouter,
  coffeeRouter
};
