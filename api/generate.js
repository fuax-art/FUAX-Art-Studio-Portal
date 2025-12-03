export default async function handler(req, res) {
 // CORS (keeps browser happy)
 res.setHeader('Access-Control-Allow-Origin', '');
 res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
 res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

if (req.method === 'OPTIONS') return res.status(200).end();
 if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

// Support either name: HF_TOKEN or HUGGINGFACE_API_KEY
 const HF = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
 console.log('HF token present?', !!HF);
 if (!HF) return res.status(500).json({ success: false, error: 'Missing HF token. Add HF_TOKEN in Vercel Environment Variables.' });

// Make sure body has JSON and a prompt
 let prompt = '';
 try {
 prompt = (req.body && req.body.prompt) ? req.body.prompt : '';
 } catch (e) {
 prompt = '';
 }
 if (!prompt || prompt.trim() === '') return res.status(400).json({ success: false, error: 'Prompt required' });

try {
 // Tongyi-MAI model endpoint
 const url = 'https://api-inference.huggingface.co/models/Tongyi-MAI/Z-Image-Turbo';

const resp = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${HF}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: prompt,
    // you can add parameters here if desired; keep minimal to start
  })
});

// Read raw text first to capture error messages (HF often returns JSON text)
const text = await resp.text();

if (!resp.ok) {
  // Forward HF status and message so the front-end can show it
  console.error('HF Error', resp.status, text);
  // Try to parse JSON error message for clarity
  let msg = text;
  try { msg = JSON.parse(text); } catch(e) { /* keep raw text */ }
  return res.status(resp.status).json({ success: false, error: msg });
}

// Success: response is binary image data. Convert to base64.
const buffer = Buffer.from(text, 'binary'); // text is raw binary from resp.text(), but typically arrayBuffer would be better
// If the above doesn't work for a given model, you can switch to resp.arrayBuffer()
const base64 = buffer.toString('base64');

return res.json({ success: true, imageUrl: `data:image/png;base64,${base64}` });

} catch (err) {
 console.error('Server error', err);
 return res.status(500).json({ success: false, error: 'Server error: ' + (err.message || err.toString()) });
 }
}