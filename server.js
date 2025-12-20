import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import handler from './api/generate.js';

// Ensure global.fetch is available for modules that expect it
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Mount the existing handler for both GET and POST
app.get('/api/generate', (req, res) => handler(req, res));
app.post('/api/generate', (req, res) => handler(req, res));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
