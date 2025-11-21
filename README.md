# 🌿☕ Monitor Satelital de Café - Caldas

Aplicación web para análisis de cultivos de café en la región de Caldas, Colombia, utilizando imágenes satelitales Sentinel-2 y Machine Learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Descripción

Este proyecto permite analizar cultivos de café en los municipios de Manizales, Villamaría, Neira, Chinchiná y Palestina (Caldas) mediante:

- **Análisis de índices vegetales** (NDVI, NDWI)
- **Detección de café** usando Machine Learning (Naive Bayes)
- **Procesamiento de imágenes** Sentinel-2 en formato GeoTIFF
- **Interfaz interactiva** con mapas de Leaflet

## 🚀 Características

- ✅ Análisis de vegetación con índices NDVI/NDWI
- ✅ Detección automática de cultivos de café
- ✅ Evaluación de riesgo por estrés hídrico
- ✅ Visualización de cobertura vegetal
- ✅ Clasificación de escena (nubes, vegetación, suelo)
- ✅ Análisis de áreas personalizadas (polígonos)
- ✅ Procesamiento de imágenes GeoTIFF

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- GeoTIFF.js (procesamiento de imágenes satelitales)
- Naive Bayes (clasificador ML personalizado)
- CSV Parser (datos de entrenamiento)

### Frontend
- React 18
- Vite
- Leaflet + React-Leaflet (mapas interactivos)
- Chart.js (visualización de datos)

## 📦 Requisitos Previos

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git**

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/WAYNE120804/proyecto-hackton
cd proyecto-hackton
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

#### Backend

Crea un archivo `.env` en la carpeta `backend/` basándote en `.env.example`:

```bash
cd backend
cp .env.example .env
```

Contenido del `.env`:
```env
STAC_BASE_URL=https://comunidad-project.eu/eo-api/stac
STAC_API_KEY=eo-api-key-dev
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
ASSET_BASE_URL=http://localhost:4000
```

#### Frontend (Opcional)

Para desarrollo local no es necesario crear `.env` en el frontend, ya que usa valores por defecto. Si necesitas personalizar:

```bash
cd frontend
cp .env.example .env
```

Contenido del `.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 🚀 Ejecución

### Desarrollo Local

Necesitas **2 terminales** corriendo simultáneamente:

#### Terminal 1 - Backend

```bash
cd backend
npm start
```

El servidor backend estará disponible en: **http://localhost:4000**

Deberías ver:
```
Server listening on port 4000
Coffee model loaded from file
Coffee model ready
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

Deberías ver:
```
VITE v5.4.21  ready in 2158 ms

➜  Local:   http://localhost:5173/
```

### 🌐 Acceder a la aplicación

Abre tu navegador en: **http://localhost:5173**

## 📖 Uso de la Aplicación

### 1. Análisis General de Caldas

1. Al cargar la página, verás el mapa de la región de Caldas
2. Haz clic en **"Ver panorama general"** (sin dibujar polígono)
3. Visualiza los índices NDVI/NDWI y el nivel de riesgo

### 2. Análisis de Área Específica

1. Usa las herramientas de dibujo en el mapa (esquina superior izquierda)
2. Dibuja un **polígono** sobre el área que deseas analizar
3. Haz clic en **"Analizar polígono"**
4. Revisa los resultados específicos de esa zona

### 3. Estimación de Café

1. Dibuja un polígono en el mapa
2. Haz clic en **"Estimación de café"**
3. El sistema procesará la imagen Sentinel-2 y mostrará:
   - Total de píxeles analizados
   - Píxeles identificados como café
   - Porcentaje de café en el área

## 📁 Estructura del Proyecto

```
proyecto-hackton/
├── backend/
│   ├── data/
│   │   ├── entramiento/          # Datos de entrenamiento del modelo
│   │   │   └── poligonos_cultivos_points.csv
│   │   ├── model/                # Modelo ML entrenado
│   │   │   └── coffee-model.json
│   │   └── sentinel2/            # Imágenes Sentinel-2
│   │       ├── B02_10m.tif       # Banda azul
│   │       ├── B03_10m.tif       # Banda verde
│   │       ├── B04_10m.tif       # Banda roja
│   │       ├── B08_10m.tif       # NIR
│   │       ├── B11_20m.tif       # SWIR
│   │       ├── B12_20m.tif       # SWIR2
│   │       ├── SCL_20m.tif       # Clasificación de escena
│   │       └── S2A_MSIL2A_...NDVI.tif  # NDVI calculado
│   ├── routes/
│   │   ├── analysis.js           # Rutas de análisis
│   │   ├── collections.js        # Rutas de colecciones
│   │   └── items.js              # Rutas de items
│   ├── services/
│   │   ├── analysisService.js    # Servicio de análisis NDVI/NDWI
│   │   ├── coffeeAnalysis.js     # Análisis de café con GeoTIFF
│   │   ├── coffeeModel.js        # Modelo ML Naive Bayes
│   │   ├── localDataService.js   # Datos locales de Caldas
│   │   └── stacService.js        # Cliente STAC API
│   ├── .env.example              # Ejemplo de variables de entorno
│   ├── package.json
│   └── server.js                 # Servidor Express
├── frontend/
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   │   ├── AnalysisSummary.jsx
│   │   │   ├── CoffeeResultPanel.jsx
│   │   │   ├── MapSelector.jsx
│   │   │   ├── VegetationHealthPanel.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js            # Cliente API
│   │   ├── App.jsx               # Componente principal
│   │   ├── index.css             # Estilos globales
│   │   └── main.jsx              # Punto de entrada
│   ├── .env.example              # Ejemplo de variables de entorno
│   ├── package.json
│   └── vite.config.js            # Configuración Vite
└── README.md
```

## 🔌 API Endpoints

### GET `/`
Información general de la API

### POST `/api/analyze-area`
Analiza un área específica o toda la región de Caldas

**Body:**
```json
{
  "collectionId": "caldas-sentinel2",
  "aoi": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

**Response:**
```json
{
  "hasData": true,
  "indices": {
    "ndvi": 0.75,
    "ndwi": 0.42
  },
  "risk": {
    "level": "bajo",
    "description": "Vegetacion saludable..."
  },
  "coverage": {
    "highVegetation": 65,
    "mediumVegetation": 25,
    "lowVegetation": 10
  }
}
```

### POST `/api/coffee-percentage`
Calcula el porcentaje de café en un polígono

**Body:**
```json
{
  "polygon": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

**Response:**
```json
{
  "totalPixels": 1250,
  "coffeePixels": 875,
  "coffeePercentage": 70.00
}
```

## 🧪 Datos de Prueba

La aplicación incluye:
- **Imagen Sentinel-2:** Caldas, 23 de abril de 2023
- **Municipios:** Manizales, Villamaría, Neira, Chinchiná, Palestina
- **Modelo ML:** Entrenado con datos de cultivos de café de la región

## 🐛 Solución de Problemas

### El backend no inicia

```bash
# Verifica que las dependencias estén instaladas
cd backend
npm install

# Verifica que el archivo .env exista
ls .env

# Revisa los logs para errores específicos
npm start
```

### El frontend no se conecta al backend

1. Verifica que el backend esté corriendo en puerto 4000
2. Revisa la consola del navegador para errores
3. Confirma que `VITE_API_BASE_URL` apunte a `http://localhost:4000/api`

### Error "GeoTIFF file not found"

Verifica que los archivos `.tif` existan en `backend/data/sentinel2/`

### Error "Training file not found"

Verifica que exista `backend/data/entramiento/poligonos_cultivos_points.csv`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- Tu Nombre - [GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Datos satelitales: [Copernicus Sentinel-2](https://sentinel.esa.int/web/sentinel/missions/sentinel-2)
- API STAC: [Comunidad Project](https://comunidad-project.eu/)
- Región de estudio: Caldas, Colombia

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Desarrollado con ❤️ para la región cafetera de Caldas**
