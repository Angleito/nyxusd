import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors.js';
import type { 
  VoiceHealthResponse, 
  ApiErrorResponse, 
  ElevenLabsUser,
  ElevenLabsSubscription 
} from './types/voice.js';
import { validateVoiceEnvironment } from './types/voice.js';

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
    let subscription: ElevenLabsSubscription | null = null;
    
    if (isConfigured && envValidation.env.ELEVENLABS_API_KEY) {
      try {
        // Check ElevenLabs API status with proper typing
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': envValidation.env.ELEVENLABS_API_KEY,
          },
        });
        
        if (response.ok) {
          apiStatus = 'connected';
          const userData: ElevenLabsUser = await response.json();
          
          // Get subscription info from user data first
          if (userData.subscription) {
            subscription = userData.subscription;
          } else {
            // Fallback to subscription endpoint if not in user data
            const subResponse = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
              headers: {
                'xi-api-key': envValidation.env.ELEVENLABS_API_KEY,
              },
            });
            
            if (subResponse.ok) {
              subscription = await subResponse.json();
            }
          }
        } else {
          apiStatus = 'error';
        }
      } catch (error) {
        console.error('ElevenLabs API check failed:', error);
        apiStatus = 'error';
      }
    }
    
    const response: VoiceHealthResponse = {
      success: true,
      status: 'healthy',
      elevenLabs: {
        configured: isConfigured,
        apiStatus,
        subscription,
      },
      serverless: {
        platform: 'vercel',
        region: process.env['VERCEL_REGION'] || 'unknown',
        environment: process.env['VERCEL_ENV'] || 'development',
      },
      timestamp: new Date().toISOString(),
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Health check error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}