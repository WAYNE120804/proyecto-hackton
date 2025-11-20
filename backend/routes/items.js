const express = require('express');
const { fetchCollectionItems } = require('../services/stacService');

const router = express.Router();

/**
 * GET /api/items?collectionId=caldas
 * Ejemplo: curl "http://localhost:4000/api/items?collectionId=caldas"
 */
router.get('/', async (req, res, next) => {
  const { collectionId } = req.query;

  if (!collectionId) {
    return res.status(400).json({ error: 'collectionId es requerido' });
  }

  try {
    const data = await fetchCollectionItems(collectionId);
    const items = (data.features || []).map(mapItem);

    res.json(items);
  } catch (error) {
    next(buildHttpError(error, 'No se pudieron obtener los items de la coleccion.'));
  }
});

function mapItem(feature) {
  const assets = getRelevantAssets(feature.assets || {});

  return {
    id: feature.id,
    datetime: feature.properties?.datetime,
    assets
  };
}

function getRelevantAssets(assets) {
  const entries = Object.entries(assets);
  const geotiffAssets = entries.filter(([, asset]) => {
    const assetType = (asset.type || '').toLowerCase();
    return assetType.includes('tiff') || assetType.includes('geotiff');
  });

  const targetAssets = geotiffAssets.length ? geotiffAssets : entries;

  return targetAssets.map(([key, asset]) => ({
    key,
    href: asset.href,
    title: asset.title,
    type: asset.type,
    roles: asset.roles
  }));
}

function buildHttpError(error, fallbackMessage) {
  const err = new Error(error.response?.data?.message || fallbackMessage);
  err.status = error.response?.status || 500;
  return err;
}

module.exports = router;
