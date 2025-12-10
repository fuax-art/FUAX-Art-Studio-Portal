// api/generate.js - Pollinations.ai (NO API KEY NEEDED!)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });    // For each image in batch, adds unique variations:
const variations = [
  'front view, centered composition',
  'side profile, dramatic lighting',
  'three quarter view, dynamic pose',
  'close up portrait, detailed features',
  'full body shot, action pose',
  // ... etc
];

const colorVariations = [
  'vibrant colors',
  'muted tones',
  'high contrast',
  // ... etc
];

const styleVariations = [
  'sharp details',
  'soft focus',
  'high definition',
  // ... etc
];

// Each prompt gets: basePrompt + variation + colorVar + styleVar + randomSeed
    const appState = {
  collectionName: 'FUAX_Collection',    // Collection name
  artworkCount: 3,                       // Number to generate
  prompt: 'cyberpunk character...',      // Base prompt
  metadataFile: null,                    // Uploaded CSV/JSON
  selectedTraits: {},                    // {background: 'neon', character: 'robot'}
  csvData: null,                         // Parsed CSV array
  isGenerating: false,                   // Lock during generation
  generatedImages: []                    // Array of base64 image URLs
};
  }

  const { prompt, width = 1024, height = 1024 } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt required' });
  }

  try {
    console.log('🌸 Pollinations generating:', prompt);
    
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=flux`;
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return res.json({ 
        success: false,
        error: `Failed to generate: ${response.status}`
      });
    }
        // For each image in batch, adds unique variations:
const variations = [
  'front view, centered composition',
  'side profile, dramatic lighting',
  'three quarter view, dynamic pose',
  'close up portrait, detailed features',
  'full body shot, action pose',
  // ... etc
];

const colorVariations = [
  'vibrant colors',
  'muted tones',
  'high contrast',
  // ... etc
];

const styleVariations = [
  'sharp details',
  'soft focus',
  'high definition',
  // ... etc
];

// Each prompt gets: basePrompt + variation + colorVar + styleVar + randomSeed
    const appState = {
  collectionName: 'FUAX_Collection',    // Collection name
  artworkCount: 3,                       // Number to generate
  prompt: 'cyberpunk character...',      // Base prompt
  metadataFile: null,                    // Uploaded CSV/JSON
  selectedTraits: {},                    // {background: 'neon', character: 'robot'}
  csvData: null,                         // Parsed CSV array
  isGenerating: false,                   // Lock during generation
  generatedImages: []                    // Array of base64 image URLs
};

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
