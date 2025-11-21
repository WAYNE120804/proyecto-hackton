const CoffeeResultPanel = ({ result, loading, error, aoi }) => {
  if (loading) {
    return (
      <section className="panel">
        <h2>Porcentaje de cafe</h2>
        <p className="muted">Calculando sobre el poligono...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Porcentaje de cafe</h2>
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="panel">
        <h2>Porcentaje de cafe</h2>
        <p className="muted">
          {aoi
            ? 'Haz clic en "Estimacion de cafe" para procesar el poligono.'
            : 'Dibuja un poligono para estimar la presencia de cafe.'}
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Porcentaje de cafe</h2>
      <div className="analysis-grid">
        <div>
          <p className="metric-label">Pixeles analizados</p>
          <p className="metric-value">{result.totalPixels}</p>
        </div>
        <div>
          <p className="metric-label">Pixeles cafe</p>
          <p className="metric-value">{result.coffeePixels}</p>
        </div>
        <div>
          <p className="metric-label">Porcentaje estimado</p>
          <p className="metric-value">{result.coffeePercentage}%</p>
        </div>
      </div>
      <p className="muted small-note">
        Modelo entrenado con una sola banda (valor_banda). Umbral de probabilidad 0.5 para contar
        cafe.
      </p>
    </section>
  );
};

export default CoffeeResultPanel;
