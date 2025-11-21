const express = require('express');
const { listItems } = require('../services/localDataService');

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

  const items = listItems(collectionId);
  res.json(items);
});

function buildHttpError(error, fallbackMessage) {
  const err = new Error(error.response?.data?.message || fallbackMessage);
  err.status = error.response?.status || 500;
  return err;
}

module.exports = router;
