import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  const isDevelopment = process.env['NODE_ENV'] === 'development' || 
                       process.env['VERCEL_ENV'] === 'development';
  
  const allowedOrigins = [
    'https://nyxusd.com',
    'https://www.nyxusd.com',
    ...(isDevelopment ? [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080'
    ] : [])
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (isDevelopment) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    const isConfigured = !!elevenLabsApiKey;
    
    let apiStatus = 'not_configured';
    let availableVoices: any[] = [];
    let subscription = null;
    let errorDetails = null;

    if (isConfigured) {
      try {
        // Test ElevenLabs API connection
        const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': elevenLabsApiKey,
          },
        });

        if (userResponse.ok) {
          apiStatus = 'connected';
          const userData = await userResponse.json();
          subscription = userData.subscription;

          // Get available voices
          const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
              'xi-api-key': elevenLabsApiKey,
            },
          });

          if (voicesResponse.ok) {
            const voicesData = await voicesResponse.json();
            availableVoices = voicesData.voices?.map((voice: any) => ({
              id: voice.voice_id,
              name: voice.name,
              description: voice.description || `${voice.labels?.gender || 'Unknown'} voice`,
              category: voice.category || 'general',
              preview_url: voice.preview_url
            })) || [];
          }
        } else {
          apiStatus = 'error';
          const errorText = await userResponse.text();
          errorDetails = `API returned ${userResponse.status}: ${errorText}`;
        }
      } catch (error) {
        console.error('ElevenLabs API check failed:', error);
        apiStatus = 'error';
        errorDetails = error instanceof Error ? error.message : 'Connection failed';
      }
    }

    // Fallback voices if API call fails
    if (availableVoices.length === 0) {
      availableVoices = [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Young female voice', category: 'general' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Young male voice', category: 'general' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young female voice', category: 'general' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young male voice', category: 'general' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Middle-aged male voice', category: 'general' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Middle-aged male voice', category: 'general' },
        { id: 'Yko7PKHZNXotIFUBG7I9', name: 'Sam', description: 'Young male voice', category: 'general' },
      ];
    }
    
    res.status(200).json({
      success: true,
      configured: isConfigured,
      apiStatus,
      errorDetails,
      config: {
        defaultVoiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
        modelId: process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
        availableVoices,
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
          textToSpeech: isConfigured && apiStatus === 'connected',
          conversationalMode: isConfigured && apiStatus === 'connected',
          streaming: true,
          voiceCloning: false, // Requires higher tier
        },
        endpoints: {
          session: '/api/voice/session',
          tts: '/api/voice/tts',
          health: '/api/voice-health',
          token: '/api/voice-token'
        }
      },
      subscription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting voice config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voice configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}