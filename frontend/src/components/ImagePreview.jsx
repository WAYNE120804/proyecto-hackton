const ImagePreview = ({ imageUrl, fallbackText }) => {
  return (
    <section className="panel">
      <h2>Vista previa </h2>
      {imageUrl ? (
        <div className="preview-wrapper">
          <img src={imageUrl} alt="Vista previa NDVI" className="preview-image" />
        </div>
      ) : (
        <p className="muted">{fallbackText || 'No hay vista previa disponible.'}</p>
      )}
    </section>
  );
};

export default ImagePreview;
