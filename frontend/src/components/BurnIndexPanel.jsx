const formatNumber = (value) => {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2);
};

const BurnIndexPanel = ({ nbr }) => {
  return (
    <section className="panel">
      <h2>Degradacion / Quemadas</h2>
      <div className="analysis-grid">
        <div>
          <p className="metric-label" title="Detecta degradacion o quemas">
            NBR
          </p>
          <p className="metric-value">{formatNumber(nbr)}</p>
        </div>
      </div>
      <p className="muted small-note">
        Valores bajos pueden indicar suelo expuesto o degradacion reciente.
      </p>
    </section>
  );
};

export default BurnIndexPanel;
