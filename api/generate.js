// api/generate.js - Pollinations.ai (NO API KEY NEEDED!)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { prompt, width = 1024, height = 1024 } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt required' });
  }

  try {
    console.log('🌸 Pollinations generating:', prompt);
    
    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Pollinations.ai direct image URL - completely free, no API key!
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=flux`;
    
    console.log('Fetching from:', imageUrl);
    
    // Fetch the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return res.json({ 
        success: false,
        error: `Failed to generate: ${response.status}`
      });
    }

    // Convert to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    console.log('✅ Image generated successfully');
    
    return res.json({ 
      success: true, 
      imageUrl: `data:image/jpeg;base64,${base64Image}`
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

// WHY POLLINATIONS IS PERFECT:
// ✅ NO API KEY - Zero setup
// ✅ FREE - No billing, no limits
// ✅ FAST - 2-3 second generation
// ✅ GOOD QUALITY - Uses FLUX model
// ✅ NO ACCOUNT - Just works
//
// Just replace your api/generate.js with this code and deploy.
// That's it. No environment variables, no API keys, nothing.
