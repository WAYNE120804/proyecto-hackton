import RiskBadge from './RiskBadge.jsx';

const AnalysisSummary = ({ analysis, loading, error }) => {
  if (loading) {
    return (
      <section className="panel">
        <h2>Resultado</h2>
        <p className="muted">Calculando analisis...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Resultado</h2>
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="panel">
        <h2>Resultado</h2>
        <p className="muted">Selecciona una coleccion e imagen para ver el analisis.</p>
      </section>
    );
  }

  const { indices, risk, coverage, datetime, assetUrl } = analysis;

  return (
    <section className="panel">
      <h2>Resumen del analisis</h2>
      <div className="analysis-grid">
        <div>
          <p className="metric-label">NDVI</p>
          <p className="metric-value">{indices?.ndvi?.toFixed(2)}</p>
        </div>
        <div>
          <p className="metric-label">NDWI</p>
          <p className="metric-value">{indices?.ndwi?.toFixed(2)}</p>
        </div>
        <div>
          <p className="metric-label">Riesgo</p>
          <RiskBadge level={risk?.level} />
        </div>
        <div>
          <p className="metric-label">Fecha</p>
          <p className="metric-value">
            {datetime ? new Date(datetime).toLocaleString() : 'Sin fecha'}
          </p>
        </div>
      </div>
      <p className="risk-description">{risk?.description}</p>
      {assetUrl && (
        <a href={assetUrl} target="_blank" rel="noreferrer" className="button">
          Ver imagen
        </a>
      )}
      {coverage && (
        <ul className="coverage-list">
          <li>Vegetacion alta: {coverage.highVegetation}%</li>
          <li>Vegetacion media: {coverage.mediumVegetation}%</li>
          <li>Vegetacion baja: {coverage.lowVegetation}%</li>
        </ul>
      )}
    </section>
  );
};

export default AnalysisSummary;
