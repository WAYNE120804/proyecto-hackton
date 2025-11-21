const express = require('express');
const { listCollections } = require('../services/localDataService');

const router = express.Router();

/**
 * GET /api/collections
 * Ejemplo: curl "http://localhost:4000/api/collections"
 */
router.get('/', async (req, res, next) => {
  try {
    const collections = listCollections();

    res.json(collections);
  } catch (error) {
    next(buildHttpError(error, 'No se pudieron obtener las colecciones locales.'));
  }
});

function buildHttpError(error, fallbackMessage) {
  const err = new Error(error.response?.data?.message || fallbackMessage);
  err.status = error.response?.status || 500;
  return err;
}

module.exports = router;
