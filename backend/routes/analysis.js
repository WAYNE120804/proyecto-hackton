const express = require('express');
const { fetchItem } = require('../services/stacService');
const { simulateAnalysis } = require('../services/analysisService');

const router = express.Router();

/**
 * GET /api/analyze?collectionId=caldas&itemId=<item-id>
 * Ejemplo: curl "http://localhost:4000/api/analyze?collectionId=caldas&itemId=2021-01-03"
 */
router.get('/', async (req, res, next) => {
  const { collectionId, itemId } = req.query;

  if (!collectionId || !itemId) {
    return res
      .status(400)
      .json({ error: 'collectionId e itemId son requeridos para analizar una escena.' });
  }

  try {
    const item = await fetchItem(collectionId, itemId);
    const assetUrl = selectPrimaryAsset(item.assets || {});
    const datetime = item.properties?.datetime;

    const analysis = simulateAnalysis({
      collectionId,
      itemId,
      datetime,
      assetUrl
    });

    res.json(analysis);
  } catch (error) {
    next(buildHttpError(error, 'No se pudo analizar el item solicitado.'));
  }
});

const API_KEY = process.env.STAC_API_KEY;

function selectPrimaryAsset(assets) {
  const entries = Object.entries(assets);

  if (!entries.length) {
    return null;
  }

  const geotiff =
    entries.find(([, asset]) => (asset.type || '').toLowerCase().includes('tiff')) || entries[0];

  return appendApiKey(geotiff[1]?.href);
}

function appendApiKey(href) {
  if (!href || !API_KEY) {
    return href;
  }

  try {
    const url = new URL(href);
    if (!url.searchParams.get('api_key')) {
      url.searchParams.set('api_key', API_KEY);
    }
    return url.toString();
  } catch (error) {
    // Fallback for non-absolute URLs
    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}api_key=${API_KEY}`;
  }
}

function buildHttpError(error, fallbackMessage) {
  const err = new Error(error.response?.data?.message || fallbackMessage);
  err.status = error.response?.status || 500;
  return err;
}

module.exports = router;
