import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const VegetationCoverageChart = ({ coverage }) => {
  const hasData =
    coverage &&
    ['highVegetation', 'mediumVegetation', 'lowVegetation'].some(
      (key) => typeof coverage?.[key] === 'number'
    );

  const safeCoverage = coverage || {
    highVegetation: 0,
    mediumVegetation: 0,
    lowVegetation: 0
  };

  const data = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [
      {
        label: 'Cobertura (%)',
        data: [
          safeCoverage.highVegetation || 0,
          safeCoverage.mediumVegetation || 0,
          safeCoverage.lowVegetation || 0
        ],
        backgroundColor: ['#16a34a', '#fbbf24', '#ef4444'],
        borderWidth: 1
      }
    ]
  };

  return (
    <section className="panel">
      <h2>Cobertura de vegetacion</h2>
      {hasData ? (
        <div className="chart-container">
          <Doughnut data={data} />
        </div>
      ) : (
        <p className="muted">Sin porcentajes de vegetacion disponibles.</p>
      )}
    </section>
  );
};

export default VegetationCoverageChart;
