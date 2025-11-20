const ItemSelector = ({ items, selectedId, onChange, loading, disabled }) => {
  return (
    <section className="panel">
      <h2>Imagenes disponibles</h2>
      {disabled && <p className="muted">Selecciona primero una coleccion.</p>}
      {loading && <p className="muted">Cargando imagenes...</p>}
      {!loading && !disabled && (
        <select
          value={selectedId || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="select"
        >
          <option value="">Selecciona una imagen</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.datetime ? new Date(item.datetime).toLocaleDateString() : item.id}
            </option>
          ))}
        </select>
      )}
      {!loading && !disabled && !items.length && (
        <p className="muted">No hay imagenes para esta coleccion.</p>
      )}
    </section>
  );
};

export default ItemSelector;
