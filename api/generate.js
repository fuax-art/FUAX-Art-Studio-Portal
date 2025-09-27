export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stabilityKey = process.env.STABILITY_API_KEY;
  if (!stabilityKey) {
    return res.status(500).json({ error: 'Stability API key not configured' });
  }

  const { prompt, width = 512, height = 512, steps = 20, cfg_scale = 7 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: cfg_scale,
        height: height,
        width: width,
        steps: steps,
        samples: 1,
        style_preset: 'digital-art'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ 
        error: 'Stability API request failed',
        details: errorData 
      });
    }

    const data = await response.json();
    
    if (data.artifacts && data.artifacts[0]) {
      const base64Image = data.artifacts[0].base64;
      const dataUrl = `data:image/png;base64,${base64Image}`;
      
      return res.json({ 
        success: true, 
        imageUrl: dataUrl,
        seed: data.artifacts[0].seed
      });
    } else {
      return res.status(500).json({ error: 'No image generated from Stability AI' });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'Image generation failed', 
      details: error.message 
    });
  }
}