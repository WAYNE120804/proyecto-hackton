const CollectionSelector = ({ collections, selectedId, onChange, loading }) => {
  return (
    <section className="panel">
      <h2>Colecciones</h2>
      {loading && <p className="muted">Cargando colecciones...</p>}
      {!loading && (
        <select
          value={selectedId || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="select"
        >
          <option value="">Selecciona una coleccion</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.title || collection.id}
            </option>
          ))}
        </select>
      )}
      {!loading && !collections.length && <p className="muted">No hay colecciones disponibles.</p>}
    </section>
  );
};

export default CollectionSelector;
