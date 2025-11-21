const COLLECTION_ID = 'caldas-sentinel2';

const MUNICIPALITY_CENTERS = {
  manizales: { name: 'Manizales', coords: [5.0703, -75.5138] },
  villamaria: { name: 'Villamaría', coords: [5.043, -75.517] },
  neira: { name: 'Neira', coords: [5.1669, -75.5203] },
  chinchina: { name: 'Chinchiná', coords: [4.9851, -75.6073] },
  palestina: { name: 'Palestina', coords: [5.0163, -75.6452] }
};

const CALDAS_BOUNDS = {
  north: 5.32,
  south: 4.88,
  east: -75.35,
  west: -75.78
};

const assetHref = (filename) =>
  `${process.env.ASSET_BASE_URL || 'http://localhost:4000'}/data/sentinel2/${filename}`;

const sentinelItem = {
  id: 'sentinel2-caldas-2023-04-23',
  datetime: '2023-04-23T15:26:41Z',
  title: 'Sentinel-2 Caldas (Manizales, Villamaría, Chinchiná, Neira, Palestina)',
  assets: {
    B02_10m: {
      href: assetHref('B02_10m.tif'),
      title: 'Banda azul (10m)',
      type: 'image/tiff; application=geotiff',
      roles: ['data']
    },
    B03_10m: {
      href: assetHref('B03_10m.tif'),
      title: 'Banda verde (10m)',
      type: 'image/tiff; application=geotiff',
      roles: ['data']
    },
    B04_10m: {
      href: assetHref('B04_10m.tif'),
      title: 'Banda roja (10m)',
      type: 'image/tiff; application=geotiff',
      roles: ['data']
    },
    B08_10m: {
      href: assetHref('B08_10m.tif'),
      title: 'NIR (10m)',
      type: 'image/tiff; application=geotiff',
      roles: ['data']
    },
    B11_20m: {
      href: assetHref('B11_20m.tif'),
      title: 'SWIR (20m)',
      type: 'image/tiff; application=geotiff',
      roles: ['data']
    },
    B12_20m: {
      href: assetHref('B12_20m.tif'),
      title: 'SWIR2 (20m)',
      type: 'image/tiff; application=geotiff',
      roles: ['data']
    },
    SCL_20m: {
      href: assetHref('SCL_20m.tif'),
      title: 'Clasificacion de escena (20m)',
      type: 'image/tiff; application=geotiff',
      roles: ['classification']
    },
    NDVI: {
      href: assetHref(
        'S2A_MSIL2A_20230423T152641_N0509_R025_T18NVL_20230424T041558.SAFE_NDVI.tif'
      ),
      title: 'NDVI generado',
      type: 'image/tiff; application=geotiff',
      roles: ['visual']
    }
  }
};

function listCollections() {
  return [
    {
      id: COLLECTION_ID,
      title: 'Sentinel-2 Caldas',
      description:
        'Imagen Sentinel-2 de abril de 2023 para Caldas (Manizales, Villamaría, Chinchiná, Neira y Palestina).'
    }
  ];
}

function listItems(collectionId) {
  if (collectionId !== COLLECTION_ID) {
    return [];
  }

  return [
    {
      id: sentinelItem.id,
      datetime: sentinelItem.datetime,
      assets: formatAssets(sentinelItem.assets)
    }
  ];
}

function getItem(collectionId, itemId) {
  if (collectionId !== COLLECTION_ID) {
    return null;
  }

  if (itemId && itemId !== sentinelItem.id) {
    return null;
  }

  return sentinelItem;
}

function formatAssets(assets) {
  return Object.entries(assets).map(([key, asset]) => ({
    key,
    href: asset.href,
    title: asset.title,
    type: asset.type,
    roles: asset.roles
  }));
}

function geometryWithinCaldas(geometry) {
  if (!geometry) return true;

  const coords = extractCoordinates(geometry);
  if (!coords.length) {
    return false;
  }

  return coords.every(([lng, lat]) => {
    return (
      lat <= CALDAS_BOUNDS.north &&
      lat >= CALDAS_BOUNDS.south &&
      lng <= CALDAS_BOUNDS.east &&
      lng >= CALDAS_BOUNDS.west
    );
  });
}

function extractCoordinates(geometry) {
  if (!geometry || !geometry.type) return [];

  const { type, coordinates } = geometry;

  switch (type) {
    case 'Point':
      return [coordinates];
    case 'Polygon':
      return coordinates.flat();
    case 'MultiPolygon':
      return coordinates.flat(2);
    case 'LineString':
      return coordinates;
    default:
      return [];
  }
}

module.exports = {
  COLLECTION_ID,
  listCollections,
  listItems,
  getItem,
  geometryWithinCaldas,
  bounds: CALDAS_BOUNDS,
  municipalityCenters: Object.values(MUNICIPALITY_CENTERS)
};
