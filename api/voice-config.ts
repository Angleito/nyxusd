import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors';
import type { 
  VoiceConfigResponse, 
  ApiErrorResponse, 
  ElevenLabsUser
} from './types/voice';
import { validateVoiceEnvironment } from './types/voice';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  setCorsHeaders(res, { methods: 'GET,OPTIONS' });
  
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  if (!validateMethod(req.method, ['GET'])) {
    sendMethodNotAllowed(res, ['GET']);
    return;
  }

  try {
    // Validate environment configuration
    const envValidation = validateVoiceEnvironment();
    const isConfigured = envValidation.isValid;
    
    let apiStatus: 'not_configured' | 'connected' | 'error' = 'not_configured';
    let errorDetails: string | null = null;

    if (!isConfigured) {
      errorDetails = envValidation.errors.join(', ');
    } else {
      try {
        // Test ElevenLabs API connection with proper types
        const testResponse = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': envValidation.env.ELEVENLABS_API_KEY!,
          },
        });

        if (testResponse.ok) {
          apiStatus = 'connected';
          // Validate response structure 
          await testResponse.json() as ElevenLabsUser;
        } else {
          apiStatus = 'error';
          errorDetails = `API returned ${testResponse.status}: ${testResponse.statusText}`;
        }
      } catch (error) {
        console.error('ElevenLabs API test failed:', error);
        apiStatus = 'error';
        errorDetails = error instanceof Error ? error.message : 'Connection failed';
      }
    }
    
    const response: VoiceConfigResponse = {
      success: true,
      configured: isConfigured,
      apiStatus,
      errorDetails,
      config: {
        defaultVoiceId: envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!,
        modelId: envValidation.env.ELEVENLABS_MODEL_ID!,
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
          textToSpeech: isConfigured && apiStatus === 'connected',
          conversationalMode: isConfigured && apiStatus === 'connected',
          streaming: true,
          voiceCloning: false, // Requires higher tier
        },
        endpoints: {
          session: '/api/voice/session',
          tts: '/api/voice/tts',
          config: '/api/voice/config',
          health: '/api/voice-health',
          token: '/api/voice-token'
        }
      },
      timestamp: new Date().toISOString(),
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting voice config:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to get voice configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}