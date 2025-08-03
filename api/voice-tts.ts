import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors';
import type { 
  TTSRequestBody, 
  ApiErrorResponse, 
  VoiceTokenPayload 
} from './types/voice';
import { validateVoiceEnvironment, isValidTTSRequest } from './types/voice';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  setCorsHeaders(res, { methods: 'POST,OPTIONS' });
  
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  if (!validateMethod(req.method, ['POST'])) {
    sendMethodNotAllowed(res, ['POST']);
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
    
    // Validate request body structure
    if (!isValidTTSRequest(req.body)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid request format',
        details: 'Request must include valid text (1-5000 chars) and token',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    const { text, voiceId, modelId, token } = req.body as TTSRequestBody;
    
    // Comprehensive JWT token validation with proper typing
    let tokenPayload: VoiceTokenPayload;
    try {
      const decoded = jwt.verify(token, envValidation.env.JWT_SECRET!);
      
      // Ensure decoded token has the expected structure
      if (typeof decoded === 'object' && decoded !== null && 
          'sessionId' in decoded && 'voiceId' in decoded && 'type' in decoded) {
        tokenPayload = decoded as VoiceTokenPayload;
        
        // Verify token type
        if (tokenPayload.type !== 'voice_session') {
          const errorResponse: ApiErrorResponse = {
            success: false,
            error: 'Invalid token type',
            timestamp: new Date().toISOString(),
          };
          res.status(401).json(errorResponse);
          return;
        }
      } else {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: 'Malformed token payload',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(errorResponse);
        return;
      }
    } catch (err) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid or expired token',
        details: err instanceof Error ? err.message : 'Token verification failed',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Use validated environment values and token payload for voice selection
    const selectedVoiceId = voiceId || tokenPayload.voiceId || envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!;
    const selectedModelId = modelId || envValidation.env.ELEVENLABS_MODEL_ID!;

    // Make request to ElevenLabs API with validated parameters
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?optimize_streaming_latency=2&output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': envValidation.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: selectedModelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        sessionId: tokenPayload.sessionId
      });
      
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Failed to generate speech',
        details: `ElevenLabs API returned ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
      res.status(response.status).json(errorResponse);
      return;
    }

    // Stream the audio response back to the client
    const audioBuffer = await response.arrayBuffer();
    
    // Set proper audio headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error in TTS endpoint:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to process text-to-speech request',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}