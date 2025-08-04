import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import type {
  ApiErrorResponse,
  TTSRequestBody,
  VoiceTokenPayload,
} from '../types/voice.js';
import { isValidTTSRequest } from '../types/voice.js';

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute
  
  let record = rateLimitStore.get(clientId);
  
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(clientId, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

function validateToken(token: string): { valid: boolean; payload?: VoiceTokenPayload } {
  try {
    const payload = jwt.verify(
      token,
      process.env['JWT_SECRET'] || 'default-secret-change-in-production'
    );
    if (typeof payload === 'object' && payload && 'sessionId' in payload && 'type' in payload) {
      return { valid: true, payload: payload as VoiceTokenPayload };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if ElevenLabs API key is configured
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    if (!elevenLabsApiKey) {
      res.status(500).json({
        success: false,
        error: 'Voice service not configured (ElevenLabs API key missing)'
      });
      return;
    }

    // Validate JWT token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
      return;
    }

    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid || !tokenValidation.payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Rate limiting based on IP or session
    const clientId = tokenValidation.payload.sessionId ||
                    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
                    // @ts-expect-error Node types may not include connection on Vercel's request type
                    (req.connection?.remoteAddress as string | undefined) ||
                    'unknown';

    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Try again later.',
        retryAfter: 60
      });
      return;
    }

    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());

    // Parse and validate request
    const body = req.body as unknown;
    if (!isValidTTSRequest(body)) {
      const err: ApiErrorResponse = {
        success: false,
        error: 'Invalid request body',
        details: 'Request must include valid text (1-5000 chars) and token',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(err);
      return;
    }

    const {
      text,
      voiceId = process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
      modelId = process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
      // per ElevenLabs API, voice_settings fields are optional; default below:
      // eslint-disable-next-line @typescript-eslint/naming-convention
      voiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true
      },
      outputFormat = 'mp3_44100_128',
      optimizeStreamingLatency = 2
    } = body as TTSRequestBody;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long. Maximum 5000 characters allowed.'
      });
    }

    // Clean text for better TTS
    const cleanText = text
      .replace(/[^\w\s.,!?;:()-]/g, '') // Remove special characters
      .trim();

    if (!cleanText) {
      return res.status(400).json({
        success: false,
        error: 'Text contains no valid content after cleaning'
      });
    }

    // Call ElevenLabs TTS API
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const elevenLabsResponse = await (globalThis as any).fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: cleanText,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        model_id: modelId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        voice_settings: voiceSettings,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        output_format: outputFormat,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        optimize_streaming_latency: optimizeStreamingLatency,
      }),
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs TTS API error:', {
        status: elevenLabsResponse.status,
        statusText: elevenLabsResponse.statusText,
        error: errorText
      });

      return res.status(elevenLabsResponse.status).json({
        success: false,
        error: 'Failed to generate speech',
        details: `ElevenLabs API returned ${elevenLabsResponse.status}`,
        elevenlabsError: errorText
      });
    }

    // Get audio data
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    // eslint-disable-next-line no-undef
    const audioData = Buffer.from(audioBuffer as ArrayBuffer);

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioData.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Audio-Format', outputFormat);
    res.setHeader('X-Voice-Id', voiceId);
    res.setHeader('X-Model-Id', modelId);
    res.setHeader('X-Text-Length', text.length.toString());

    // Return audio data
    res.status(200).send(audioData);

  } catch (error) {
    console.error('TTS endpoint error:', error);
    const err: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(err);
  }
}