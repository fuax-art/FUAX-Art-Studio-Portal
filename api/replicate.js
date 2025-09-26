
// /api/replicate.js
// Vercel serverless function to proxy Replicate API securely
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const replicateApiKey = process.env.REPLICATE_API_KEY;
  if (!replicateApiKey) {
    res.status(500).json({ error: 'API key not set in environment' });
    return;
  }

  // Forward the request to Replicate
  const { endpoint, ...rest } = req.body;
  const url = endpoint || 'https://api.replicate.com/v1/predictions';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rest),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Replicate API error', details: err.message });
  }
}