import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const VegetationChart = ({ coverage }) => {
  const hasData =
    coverage &&
    ['highVegetation', 'mediumVegetation', 'lowVegetation'].some(
      (key) => typeof coverage[key] === 'number'
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
        backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
        borderWidth: 1
      }
    ]
  };

  return (
    <section className="panel">
      <h2>Distribucion de vegetacion</h2>
      {hasData ? (
        <div className="chart-container">
          <Doughnut data={data} />
        </div>
      ) : (
        <p className="muted">Selecciona una imagen para visualizar la cobertura.</p>
      )}
    </section>
  );
};

export default VegetationChart;
