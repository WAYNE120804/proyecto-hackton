const API_BASE = 'http://localhost:4000/api';

async function request(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);

  if (params.query) {
    Object.entries(params.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error al comunicarse con el backend.');
  }

  return response.json();
}

export function getCollections() {
  return request('/collections');
}

export function getItems(collectionId) {
  return request('/items', { query: { collectionId } });
}

export function analyzeItem(collectionId, itemId) {
  return request('/analyze', { query: { collectionId, itemId } });
}
