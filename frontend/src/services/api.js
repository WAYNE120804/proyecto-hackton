const API_BASE = 'http://localhost:4000/api';
const COLLECTION_ID = 'caldas-sentinel2';

async function request(path, options = {}) {
  const { method = 'GET', query, body } = options;
  const url = new URL(`${API_BASE}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error al comunicarse con el backend.');
  }

  return response.json();
}

export function analyzeArea(aoi) {
  return request('/analyze-area', {
    method: 'POST',
    body: {
      collectionId: COLLECTION_ID,
      aoi: aoi || null
    }
  });
}

export function getCoffeePercentage(polygon) {
  return request('/coffee-percentage', {
    method: 'POST',
    body: {
      polygon
    }
  });
}
