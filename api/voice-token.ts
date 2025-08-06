import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors';
import type { 
  VoiceTokenResponse, 
  ApiErrorResponse, 
  VoiceTokenPayload 
} from './types/voice';
import { validateVoiceEnvironment, isValidSessionId } from './types/voice';

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
    if (!envValidation.isValid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Voice service not configured',
        details: envValidation.errors.join(', '),
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
      return;
    }
    
    // Get session ID from query or generate new one using bracket notation
    const querySessionId = req.query['sessionId'];
    const sessionId = (isValidSessionId(querySessionId) ? querySessionId : null) || 
                     `voice_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Generate a simple token without JWT if JWT_SECRET is not available
    const now = Math.floor(Date.now() / 1000);
    let token: string;
    
    if (envValidation.env.JWT_SECRET) {
      const tokenPayload: VoiceTokenPayload = {
        sessionId,
        voiceId: envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!,
        type: 'voice_session',
        iat: now,
        exp: now + (5 * 60), // 5 minutes expiry
      };
      token = jwt.sign(tokenPayload, envValidation.env.JWT_SECRET);
    } else {
      // Fallback to simple base64 encoded token if JWT_SECRET not available
      const simplePayload = {
        sessionId,
        voiceId: envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!,
        type: 'voice_session',
        iat: now,
        exp: now + (5 * 60),
      };
      token = Buffer.from(JSON.stringify(simplePayload)).toString('base64');
    }

    // Return token and configuration (but NOT the actual API key)
    const response: VoiceTokenResponse = {
      success: true,
      token,
      sessionId,
      config: {
        voiceId: envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!,
        modelId: envValidation.env.ELEVENLABS_MODEL_ID!,
        wsUrl: 'wss://api.elevenlabs.io/v1',
        optimizeStreamingLatency: 2,
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      },
    };
    
    res.status(200).json(response);
  } catch (error) {
    // Log error without exposing sensitive details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Voice token generation failed:', errorMessage);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to generate voice token',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}