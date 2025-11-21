import RiskBadge from './RiskBadge.jsx';

const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2);
};

const AnalysisSummary = ({ analysis, loading, error }) => {
  if (loading) {
    return (
      <section className="panel">
        <h2>Resumen general</h2>
        <p className="muted">Procesando las bandas locales...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Resumen general</h2>
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="panel">
        <h2>Resumen general</h2>
        <p className="muted">Esperando un poligono o carga inicial...</p>
      </section>
    );
  }

  if (analysis.hasData === false) {
    return (
      <section className="panel">
        <h2>Resumen general</h2>
        <p className="muted">
          {analysis.message || 'De esta zona no tenemos informacion satelital.'}
        </p>
      </section>
    );
  }

  const { indices, risk, datetime, areaLabel } = analysis;

  return (
    <section className="panel">
      <h2>Resumen general</h2>
      {areaLabel && <p className="eyebrow">Alcance: {areaLabel}</p>}
      <div className="analysis-grid">
        <div>
          <p className="metric-label" title="Salud general de la vegetacion">
            NDVI
          </p>
          <p className="metric-value">{formatNumber(indices?.ndvi)}</p>
        </div>
        <div>
          <p className="metric-label" title="Contenido de humedad del cultivo y suelo">
            NDWI
          </p>
          <p className="metric-value">{formatNumber(indices?.ndwi)}</p>
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
      <p className="risk-description">{risk?.description || 'Sin descripcion'}</p>
    </section>
  );
};

export default AnalysisSummary;
