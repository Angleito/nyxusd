import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env['FRONTEND_URL'] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if voice service is configured
    const isConfigured = !!process.env['ELEVENLABS_API_KEY'];
    
    res.status(200).json({
      success: true,
      configured: isConfigured,
      config: {
        defaultVoiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
        modelId: process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
        availableVoices: [
          { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Young female voice' },
          { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Young male voice' },
          { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young female voice' },
          { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young male voice' },
          { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Middle-aged male voice' },
          { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Middle-aged male voice' },
          { id: 'Yko7PKHZNXotIFUBG7I9', name: 'Sam', description: 'Young male voice' },
        ],
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
        limits: {
          maxCharactersPerRequest: 5000,
          maxRequestsPerMinute: 20,
          sessionTimeout: 300000, // 5 minutes
        },
        features: {
          textToSpeech: true,
          conversationalMode: isConfigured, // Only if API key is configured
          streaming: true,
          voiceCloning: false, // Requires higher tier
        }
      },
    });
  } catch (error) {
    console.error('Error getting voice config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voice configuration',
    });
  }
}