const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2);
};

const VegetationHealthPanel = ({ indices }) => {
  return (
    <section className="panel">
      <h2>Salud vegetal</h2>
      <div className="analysis-grid">
        <div>
          <p className="metric-label" title="Salud general de la vegetacion">
            NDVI
          </p>
          <p className="metric-value">{formatNumber(indices?.ndvi)}</p>
        </div>
        <div>
          <p className="metric-label" title="Indice mejorado para zonas densas">
            EVI
          </p>
          <p className="metric-value">{formatNumber(indices?.evi)}</p>
        </div>
      </div>
      <p className="muted small-note">
        NDVI mide vigor; EVI corrige saturacion en cultivos densos.
      </p>
    </section>
  );
};

export default VegetationHealthPanel;
