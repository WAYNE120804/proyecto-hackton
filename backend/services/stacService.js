const axios = require('axios');

const baseURL = process.env.STAC_BASE_URL;
const apiKey = process.env.STAC_API_KEY;

if (!baseURL || !apiKey) {
  throw new Error('STAC_BASE_URL and STAC_API_KEY must be defined in the environment.');
}

const stacClient = axios.create({
  baseURL
});

const withKey = (params = {}) => ({
  ...params,
  api_key: apiKey
});

async function fetchCollections() {
  const response = await stacClient.get('/collections', {
    params: withKey()
  });
  return response.data;
}

async function fetchCollectionItems(collectionId, params = {}) {
  if (!collectionId) {
    throw new Error('collectionId is required to fetch items.');
  }

  const response = await stacClient.get(`/collections/${collectionId}/items`, {
    params: withKey(params)
  });

  return response.data;
}

async function fetchItem(collectionId, itemId) {
  if (!collectionId || !itemId) {
    throw new Error('collectionId and itemId are required to fetch a specific item.');
  }

  const response = await stacClient.get(`/collections/${collectionId}/items/${itemId}`, {
    params: withKey()
  });

  return response.data;
}

module.exports = {
  fetchCollections,
  fetchCollectionItems,
  fetchItem
};
