import { useEffect, useState } from 'react';
import CollectionSelector from './components/CollectionSelector.jsx';
import ItemSelector from './components/ItemSelector.jsx';
import AnalysisSummary from './components/AnalysisSummary.jsx';
import VegetationChart from './components/VegetationChart.jsx';
import { getCollections, getItems, analyzeItem } from './services/api.js';

const App = () => {
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState('');

  const [selectedCollection, setSelectedCollection] = useState(null);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Obtiene el catalogo inicial de colecciones apenas carga la app
  useEffect(() => {
    async function loadCollections() {
      setCollectionsLoading(true);
      setCollectionsError('');
      try {
        const response = await getCollections();
        setCollections(response);
      } catch (error) {
        setCollectionsError('No se pudieron cargar las colecciones.');
        console.error(error);
      } finally {
        setCollectionsLoading(false);
      }
    }

    loadCollections();
  }, []);

  // Reacciona al cambio de coleccion para refrescar los items disponibles
  useEffect(() => {
    if (!selectedCollection) {
      setItems([]);
      setSelectedItem(null);
      setAnalysis(null);
      return;
    }

    async function loadItems() {
      setItemsLoading(true);
      setItemsError('');
      setSelectedItem(null);
      setAnalysis(null);
      try {
        const response = await getItems(selectedCollection);
        setItems(response);
      } catch (error) {
        setItemsError('No se pudieron cargar las imagenes de la coleccion.');
        console.error(error);
      } finally {
        setItemsLoading(false);
      }
    }

    loadItems();
  }, [selectedCollection]);

  // Pide el analisis para la escena seleccionada en el backend de Express
  useEffect(() => {
    if (!selectedCollection || !selectedItem) {
      setAnalysis(null);
      setAnalysisError('');
      return;
    }

    async function loadAnalysis() {
      setAnalysisLoading(true);
      setAnalysisError('');
      try {
        const response = await analyzeItem(selectedCollection, selectedItem);
        setAnalysis(response);
      } catch (error) {
        setAnalysisError('Ocurrio un error al obtener el analisis.');
        console.error(error);
      } finally {
        setAnalysisLoading(false);
      }
    }

    loadAnalysis();
  }, [selectedCollection, selectedItem]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Hackathon Cafetera</p>
          <h1>Monitor Satelital</h1>
        </div>
        <p className="muted">Conectado a http://localhost:4000</p>
      </header>

      <main className="layout">
        <div className="sidebar">
          <CollectionSelector
            collections={collections}
            selectedId={selectedCollection}
            onChange={setSelectedCollection}
            loading={collectionsLoading}
          />
          {collectionsError && <p className="error">{collectionsError}</p>}
          <ItemSelector
            items={items}
            selectedId={selectedItem}
            onChange={setSelectedItem}
            loading={itemsLoading}
            disabled={!selectedCollection}
          />
          {itemsError && <p className="error">{itemsError}</p>}
        </div>

        <div className="content">
          <AnalysisSummary analysis={analysis} loading={analysisLoading} error={analysisError} />
          <VegetationChart coverage={analysis?.coverage} />
        </div>
      </main>
    </div>
  );
};

export default App;
