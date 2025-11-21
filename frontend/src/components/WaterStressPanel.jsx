const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2);
};

const WaterStressPanel = ({ indices }) => {
  return (
    <section className="panel">
      <h2>Agua y estres</h2>
      <div className="analysis-grid">
        <div>
          <p className="metric-label" title="Contenido de humedad del cultivo y suelo">
            NDWI
          </p>
          <p className="metric-value">{formatNumber(indices?.ndwi)}</p>
        </div>
        <div>
          <p className="metric-label" title="Mide estres hidrico usando bandas SWIR">
            Stress Index
          </p>
          <p className="metric-value">{formatNumber(indices?.stressIndex)}</p>
        </div>
      </div>
      <p className="muted small-note">
        NDWI alto indica buena humedad; el indice de estres alerta por falta de agua.
      </p>
    </section>
  );
};

export default WaterStressPanel;
