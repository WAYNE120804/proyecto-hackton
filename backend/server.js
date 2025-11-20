require('dotenv').config();

const express = require('express');
const cors = require('cors');

const collectionsRouter = require('./routes/collections');
const itemsRouter = require('./routes/items');
const analysisRouter = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Coffee Hackathon Backend is up',
    docs: {
      collections: '/api/collections',
      items: '/api/items?collectionId=caldas',
      analyze: '/api/analyze?collectionId=caldas&itemId=<itemId>'
    }
  });
});

app.use('/api/collections', collectionsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/analyze', analysisRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
