import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, CircleMarker, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const WORKING_BOUNDS = {
  north: 5.32,
  south: 4.88,
  east: -75.35,
  west: -75.78
};

const MUNICIPALITIES = [
  { name: 'Manizales', coords: [5.0703, -75.5138] },
  { name: 'Villamaría', coords: [5.043, -75.517] },
  { name: 'Neira', coords: [5.1669, -75.5203] },
  { name: 'Chinchiná', coords: [4.9851, -75.6073] },
  { name: 'Palestina', coords: [5.0163, -75.6452] }
];

const BOUNDS_RECT = [
  [WORKING_BOUNDS.north, WORKING_BOUNDS.west],
  [WORKING_BOUNDS.south, WORKING_BOUNDS.west],
  [WORKING_BOUNDS.south, WORKING_BOUNDS.east],
  [WORKING_BOUNDS.north, WORKING_BOUNDS.east]
];

const MapSelector = ({ aoi, onAoiChange }) => {
  const mapRef = useRef(null);
  const featureGroupRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const group = featureGroupRef.current;
    if (!group) {
      return;
    }
    group.clearLayers();
    if (aoi) {
      const geoJsonLayer = L.geoJSON(aoi);
      geoJsonLayer.eachLayer((layer) => {
        group.addLayer(layer);
      });
    }
  }, [aoi]);

  const handleFlyTo = () => {
    if (!mapRef.current) return;
    const preset = municipalyPreset(searchValue.trim()) || parseLatLng(searchValue);
    if (preset) {
      mapRef.current.flyTo(preset, 11, { duration: 1.2 });
    }
  };

  const municipalyPreset = (value) => {
    if (!value) return null;
    const lower = value.toLowerCase();
    const match = MUNICIPALITIES.find((m) => m.name.toLowerCase().startsWith(lower));
    return match?.coords || null;
  };

  const parseLatLng = (value) => {
    const parts = value.split(',').map((part) => parseFloat(part.trim()));
    if (parts.length === 2 && parts.every((num) => !Number.isNaN(num))) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  const handleCreated = (event) => {
    const layer = event.layer;
    resetLayers(layer);
    emitGeometry(layer);
  };

  const handleEdited = (event) => {
    const layers = event.layers;
    layers.eachLayer((layer) => {
      emitGeometry(layer);
    });
  };

  const handleDeleted = () => {
    resetLayers();
    onAoiChange(null);
  };

  const emitGeometry = (layer) => {
    const geojson = layer.toGeoJSON();
    onAoiChange(geojson.geometry || geojson);
  };

  const resetLayers = (layer) => {
    const group = featureGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (layer) {
      group.addLayer(layer);
    }
  };

  const handleClear = () => {
    resetLayers();
    onAoiChange(null);
  };

  return (
    <div className="map-selector">
      <div className="map-controls">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Municipio de Caldas o lat,lng (5.05,-75.5)"
        />
        <button type="button" onClick={handleFlyTo}>
          Ir
        </button>
        <button type="button" className="ghost" onClick={handleClear}>
          Limpiar zona
        </button>
      </div>
      <MapContainer
        center={[5.07, -75.52]}
        zoom={11}
        minZoom={10}
        maxBounds={[
          [WORKING_BOUNDS.south, WORKING_BOUNDS.west],
          [WORKING_BOUNDS.north, WORKING_BOUNDS.east]
        ]}
        maxBoundsViscosity={0.8}
        className="leaflet-map"
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon
          positions={BOUNDS_RECT}
          pathOptions={{ color: '#16a34a', weight: 2, dashArray: '6 6', fillOpacity: 0.08 }}
        />
        {MUNICIPALITIES.map((municipality) => (
          <CircleMarker
            center={municipality.coords}
            key={municipality.name}
            radius={5}
            pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.8 }}
          >
            <Tooltip direction="top" offset={[0, -2]} opacity={0.9} permanent>
              {municipality.name}
            </Tooltip>
          </CircleMarker>
        ))}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                shapeOptions: {
                  color: '#2563eb'
                }
              }
            }}
          />
        </FeatureGroup>
      </MapContainer>
      <p className="muted map-hint">
        Trabajamos solo sobre Caldas (Manizales, Villamaría, Neira, Chinchiná y Palestina). Dibuja
        un poligono dentro del recuadro verde para ver el detalle.
      </p>
    </div>
  );
};

export default MapSelector;
