const COLORS = {
  bajo: '#3fb950',
  medio: '#e3b341',
  alto: '#f85149'
};

const LABELS = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto'
};

const RiskBadge = ({ level = 'bajo' }) => {
  const color = COLORS[level] || COLORS.bajo;
  const label = LABELS[level] || LABELS.bajo;

  return (
    <span className="risk-badge" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
};

export default RiskBadge;
