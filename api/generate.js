export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const hfToken = process.env.HUGGINGFACE_API_KEY;
  if (!hfToken) {
    return res.status(500).json({ 
      success: false, 
      error: 'HUGGINGFACE_API_KEY not configured. Add it in Vercel/Netlify environment variables.' 
    });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt required' });
  }

  try {
    console.log('Generating with prompt:', prompt);
    
    // Using Stable Diffusion XL - free on HuggingFace
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: "blurry, bad quality, distorted, ugly, deformed",
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API Error:', response.status, errorText);
      
      // Model might be loading (common on first use)
      if (response.status === 503) {
        return res.json({ 
          success: false,
          error: 'Model is loading, please try again in 20 seconds',
          details: errorText
        });
      }
      
      return res.json({ 
        success: false,
        error: `API Error ${response.status}`,
        details: errorText
      });
    }

    // Response is the image blob
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    console.log('Image generated successfully');
    
    return res.json({ 
      success: true, 
      imageUrl: `data:image/png;base64,${base64Image}`
    });
    
  } catch (error) {
    console.error('Generation Error:', error);
    return res.json({ 
      success: false, 
      error: 'Request failed', 
      details: error.message 
    });
  }
}