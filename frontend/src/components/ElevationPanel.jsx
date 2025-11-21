const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(0);
};

const ElevationPanel = ({ dem, clouds }) => {
  return (
    <section className="panel">
      <h2>Alturas y nubosidad</h2>
      <div className="analysis-grid">
        <div>
          <p className="metric-label">Altura min (msnm)</p>
          <p className="metric-value">{formatNumber(dem?.minElevation)}</p>
        </div>
        <div>
          <p className="metric-label">Altura media (msnm)</p>
          <p className="metric-value">{formatNumber(dem?.meanElevation)}</p>
        </div>
        <div>
          <p className="metric-label">Altura max (msnm)</p>
          <p className="metric-value">{formatNumber(dem?.maxElevation)}</p>
        </div>
        <div>
          <p className="metric-label">Nubosidad (%)</p>
          <p className="metric-value">
            {clouds && clouds.cloudPercent !== undefined ? `${clouds.cloudPercent}%` : '—'}
          </p>
        </div>
      </div>
      <p className="muted small-note">
        Nubosidad segun mascara SCL; alturas tomadas del DEM recortado al poligono.
      </p>
    </section>
  );
};

export default ElevationPanel;
