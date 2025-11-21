import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SCLClassificationChart = ({ sclSummary }) => {
  const labels = ['Vegetacion', 'Suelo', 'Agua', 'Construido', 'Nubes', 'Sombras'];
  const keys = ['vegetation', 'bareSoil', 'water', 'builtUp', 'clouds', 'shadows'];

  const hasData = sclSummary && keys.some((k) => typeof sclSummary?.[k] === 'number');

  const data = {
    labels,
    datasets: [
      {
        label: 'Porcentaje (%)',
        data: keys.map((k) => sclSummary?.[k] || 0),
        backgroundColor: ['#16a34a', '#d97706', '#0ea5e9', '#475569', '#facc15', '#334155']
      }
    ]
  };

  return (
    <section className="panel">
      <h2 title="Clasificacion automatica de nubes, suelo, agua, vegetacion...">Clasificacion SCL</h2>
      {hasData ? (
        <div className="chart-container">
          <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      ) : (
        <p className="muted">Sin resumen SCL disponible.</p>
      )}
    </section>
  );
};

export default SCLClassificationChart;
