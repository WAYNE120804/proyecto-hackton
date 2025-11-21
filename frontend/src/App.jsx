import { useEffect, useState } from 'react';
import AnalysisSummary from './components/AnalysisSummary.jsx';
import VegetationHealthPanel from './components/VegetationHealthPanel.jsx';
import WaterStressPanel from './components/WaterStressPanel.jsx';
import BurnIndexPanel from './components/BurnIndexPanel.jsx';
import VegetationCoverageChart from './components/VegetationCoverageChart.jsx';
import SCLClassificationChart from './components/SCLClassificationChart.jsx';
import ElevationPanel from './components/ElevationPanel.jsx';
import ImagePreview from './components/ImagePreview.jsx';
import MapSelector from './components/MapSelector.jsx';
import { analyzeArea, getCoffeePercentage } from './services/api.js';
import CoffeeResultPanel from './components/CoffeeResultPanel.jsx';

const App = () => {
  const [aoi, setAoi] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coffeeResult, setCoffeeResult] = useState(null);
  const [coffeeLoading, setCoffeeLoading] = useState(false);
  const [coffeeError, setCoffeeError] = useState('');

  const handleAoiChange = (geometry) => {
    setAoi(geometry);
    setAnalysis(null);
  };

  const fetchAnalysis = async (currentAoi) => {
    setLoading(true);
    setError('');
    try {
      const response = await analyzeArea(currentAoi);
      setAnalysis(response);
    } catch (err) {
      console.error(err);
      setError('No se pudo obtener el analisis de la zona.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(null);
  }, []);

  const handleAnalyze = () => {
    fetchAnalysis(aoi);
  };

  const handleCoffeeAnalysis = async () => {
    if (!aoi) {
      setCoffeeError('Dibuja un poligono para estimar cafe.');
      return;
    }
    setCoffeeLoading(true);
    setCoffeeError('');
    setCoffeeResult(null);
    try {
      const result = await getCoffeePercentage(aoi);
      setCoffeeResult(result);
    } catch (err) {
      console.error(err);
      setCoffeeError('No se pudo calcular el porcentaje de cafe.');
    } finally {
      setCoffeeLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Hackathon Cafetera</p>
          <h1>Monitor Satelital local (Caldas)</h1>
        </div>
        <p className="muted">Datos locales Sentinel-2</p>
      </header>

      <div className="page">
        <section className="map-section panel">
          <div className="map-header">
            <div>
              <h2>Mapa de Caldas</h2>
              <p className="muted small-note">
                Dibuja un poligono en Manizales, Villamaría, Neira, Chinchiná o Palestina.
              </p>
            </div>
            <button
              type="button"
              className="button analyze-button"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? 'Analizando...' : aoi ? 'Analizar poligono' : 'Ver panorama general'}
            </button>
            <button
              type="button"
              className="button ghost analyze-button"
              onClick={handleCoffeeAnalysis}
              disabled={coffeeLoading}
            >
              {coffeeLoading ? 'Calculando...' : 'Estimacion de cafe'}
            </button>
          </div>
          <MapSelector aoi={aoi} onAoiChange={handleAoiChange} />
        </section>

        <main className="dashboard">
          <div className="content">
            <AnalysisSummary analysis={analysis} loading={loading} error={error} />

            {analysis?.hasData && (
              <>
                <div className="grid-two">
                  <VegetationHealthPanel indices={analysis.indices} />
                  <WaterStressPanel indices={analysis.indices} />
                </div>

                <div className="grid-two">
                  <BurnIndexPanel nbr={analysis.indices?.nbr} />
                  <ElevationPanel dem={analysis.dem} clouds={analysis.clouds} />
                </div>

                <div className="grid-two">
                  <VegetationCoverageChart coverage={analysis.coverage} />
                  <SCLClassificationChart sclSummary={analysis.sclSummary} />
                </div>

                <ImagePreview
                  imageUrl={analysis.imagePreview}
                  fallbackText="No hay vista previa generada para esta zona."
                />
              </>
            )}

            <CoffeeResultPanel
              result={coffeeResult}
              loading={coffeeLoading}
              error={coffeeError}
              aoi={!!aoi}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
