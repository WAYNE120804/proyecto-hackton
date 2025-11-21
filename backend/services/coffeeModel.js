const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const MODEL_PATH = path.join(__dirname, '..', 'data', 'model', 'coffee-model.json');
const TRAINING_PATH = path.join(__dirname, '..', 'data', 'entramiento', 'poligonos_cultivos_points.csv');

let cachedModel = null;

/**
 * Entrenamos un clasificador binario con una sola feature numérica (valor_banda).
 * Implementamos un Naive Bayes gaussiano sencillo para evitar dependencias pesadas:
 *  - Calculamos media, varianza y prior para clase cafe y no_cafe.
 *  - Para predecir, estimamos la verosimilitud gaussiana y devolvemos P(cafe|x).
 * Esto se puede extender fácilmente a más bandas sumando más features al cálculo.
 */
async function trainModel() {
  const samples = await readTrainingCsv();
  if (!samples.length) {
    throw new Error('No training data found in entrenamiento_banda_unica.csv');
  }

  const cafeValues = samples.filter((s) => s.label === 1).map((s) => s.value);
  const noCafeValues = samples.filter((s) => s.label === 0).map((s) => s.value);

  // If one class is missing, fall back to a degenerate model that always returns the present class.
  if (!cafeValues.length || !noCafeValues.length) {
    const onlyCafe = cafeValues.length > 0;
    const dominantValues = onlyCafe ? cafeValues : noCafeValues;
    const model = {
      cafe: buildStats(onlyCafe ? dominantValues : [0]),
      noCafe: buildStats(!onlyCafe ? dominantValues : [0]),
      priorCafe: onlyCafe ? 1 : 0,
      priorNoCafe: onlyCafe ? 0 : 1,
      degenerate: true
    };
    await persistModel(model);
    cachedModel = model;
    return model;
  }

  const model = {
    cafe: buildStats(cafeValues),
    noCafe: buildStats(noCafeValues),
    priorCafe: cafeValues.length / samples.length,
    priorNoCafe: noCafeValues.length / samples.length,
    degenerate: false
  };

  await persistModel(model);
  cachedModel = model;
  return model;
}

async function loadModel() {
  if (cachedModel) {
    return cachedModel;
  }

  if (!fs.existsSync(TRAINING_PATH) && !fs.existsSync(MODEL_PATH)) {
    throw new Error(
      `Training file not found at ${TRAINING_PATH}. Add poligonos_cultivos_points.csv to train the model.`
    );
  }

  if (fs.existsSync(MODEL_PATH)) {
    const file = await fs.promises.readFile(MODEL_PATH, 'utf-8');
    cachedModel = JSON.parse(file);
    return cachedModel;
  }

  return trainModel();
}

function predictSample(bandValue) {
  if (cachedModel === null) {
    throw new Error('Model not loaded. Call loadModel() before predicting.');
  }
  const model = cachedModel;

  if (model.degenerate) {
    return model.priorCafe; // always 1 or 0 depending on the only class present
  }

  const likeCafe = gaussianPdf(bandValue, model.cafe.mean, model.cafe.variance) * model.priorCafe;
  const likeNoCafe =
    gaussianPdf(bandValue, model.noCafe.mean, model.noCafe.variance) * model.priorNoCafe;

  const denom = likeCafe + likeNoCafe || 1e-9;
  return likeCafe / denom;
}

async function readTrainingCsv() {
  return new Promise((resolve, reject) => {
    const rows = [];

    const stream = fs.createReadStream(TRAINING_PATH);
    stream.on('error', (err) => reject(err));

    stream
      .pipe(csv())
      .on('data', (data) => {
        const rawClass = `${data.clase || ''}`.trim().toLowerCase();
        const value = extractBandValue(data);
        if (!Number.isFinite(value)) return;

        rows.push({
          value,
          label: rawClass === 'cafe' ? 1 : 0
        });
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

function extractBandValue(row) {
  // Prefer explicit columns if present
  const direct =
    row.valor_banda ?? row.band ?? row.value ?? row.valor ?? row.valor_b ?? row.valor_band ?? null;
  if (direct !== null && direct !== undefined && direct !== '') {
    const v = parseFloat(direct);
    if (Number.isFinite(v)) return v;
  }

  // Otherwise take the first numeric column that is not class/id
  const skipKeys = ['clase', 'class', 'id', 'id_muestra', 'orig_fid'];
  for (const [key, val] of Object.entries(row)) {
    if (skipKeys.includes(key.trim().toLowerCase())) continue;
    const num = parseFloat(val);
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return NaN;
}

function buildStats(values) {
  const mean = values.reduce((sum, v) => sum + v, 0) / Math.max(1, values.length);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, values.length - 1 || 1);
  return { mean, variance: variance || 1e-6 };
}

function gaussianPdf(x, mean, variance) {
  const std = Math.sqrt(variance);
  const exponent = -0.5 * Math.pow((x - mean) / std, 2);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

async function persistModel(model) {
  const dir = path.dirname(MODEL_PATH);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(MODEL_PATH, JSON.stringify(model, null, 2));
}

module.exports = {
  trainModel,
  loadModel,
  predictSample
};
