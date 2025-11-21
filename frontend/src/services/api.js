const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const COLLECTION_ID = 'caldas-sentinel2';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Realiza una petición HTTP al backend.
 * @param {string} path - Ruta del endpoint (ej. '/analyze-area')
 * @param {Object} options - Opciones de la petición
 * @param {string} [options.method='GET'] - Método HTTP
 * @param {Object} [options.query] - Parámetros de query string
 * @param {Object} [options.body] - Cuerpo de la petición (para POST/PUT)
 * @returns {Promise<Object>} Respuesta JSON del servidor
 * @throws {Error} Si la petición falla o el servidor retorna error
 */
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
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorMessage = 'Error al comunicarse con el backend.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La petición tardó demasiado tiempo. Por favor intenta de nuevo.');
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }
    throw error;
  }
}

/**
 * Analiza un área de interés (AOI) o toda la región de Caldas.
 * @param {Object|null} aoi - Geometría GeoJSON del área a analizar (null para análisis general)
 * @returns {Promise<Object>} Resultados del análisis con índices NDVI/NDWI y riesgo
 */
export function analyzeArea(aoi) {
  return request('/analyze-area', {
    method: 'POST',
    body: {
      collectionId: COLLECTION_ID,
      aoi: aoi || null
    }
  });
}

/**
 * Calcula el porcentaje de café en un polígono usando ML.
 * @param {Object} polygon - Polígono GeoJSON
 * @returns {Promise<Object>} Objeto con totalPixels, coffeePixels, y coffeePercentage
 */
export function getCoffeePercentage(polygon) {
  if (!polygon) {
    throw new Error('Se requiere un polígono para calcular el porcentaje de café');
  }

  return request('/coffee-percentage', {
    method: 'POST',
    body: {
      polygon
    }
  });
}

