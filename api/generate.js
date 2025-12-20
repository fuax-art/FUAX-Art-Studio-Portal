// api/generate.js - Pollinations.ai Serverless Function
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET or POST' 
    });
  }

  let prompt, width, height;

  try {
    // Parse parameters based on method
    if (req.method === 'POST') {
      const body = req.body || {};
      prompt = body.prompt;
      width = parseInt(body.width) || 1024;
      height = parseInt(body.height) || 1024;
    } else {
      // GET method - parse query params
      prompt = req.query.prompt;
      width = parseInt(req.query.width) || 1024;
      height = parseInt(req.query.height) || 1024;
    }

    // Validate prompt
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    console.log('🌸 Generating with Pollinations.ai:', { prompt, width, height });

    // Build Pollinations.ai URL
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=flux`;

    console.log('📡 Fetching from:', pollinationsUrl);

    // Fetch image from Pollinations
    const imageResponse = await fetch(pollinationsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'FUAX-Generator/1.0'
      }
    });

    if (!imageResponse.ok) {
      console.error('❌ Pollinations API error:', imageResponse.status, imageResponse.statusText);
      return res.status(500).json({
        success: false,
        error: `Image generation failed: ${imageResponse.status} ${imageResponse.statusText}`
      });
    }

    // Get image as ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Convert to base64 using Uint8Array (works in all environments)
    const uint8Array = new Uint8Array(imageBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binary);

    console.log('✅ Image generated successfully, size:', imageBuffer.byteLength, 'bytes');

    // Return base64 data URL
    return res.status(200).json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
      prompt: prompt,
      dimensions: { width, height }
    });

  } catch (error) {
    console.error('💥 Generation Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Image generation failed',
      details: error.message
    });
  }
}