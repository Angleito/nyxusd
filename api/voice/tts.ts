import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface TTSRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  outputFormat?: 'mp3_44100_128' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
  optimizeStreamingLatency?: number;
}

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

function validateToken(token: string): { valid: boolean; payload?: any } {
  try {
    const payload = jwt.verify(
      token, 
      process.env['JWT_SECRET'] || 'default-secret-change-in-production'
    );
    return { valid: true, payload };
  } catch (error) {
    return { valid: false };
  }
}

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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if ElevenLabs API key is configured
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    if (!elevenLabsApiKey) {
      return res.status(500).json({ 
        success: false,
        error: 'Voice service not configured (ElevenLabs API key missing)' 
      });
    }

    // Validate JWT token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Rate limiting based on IP or session
    const clientId = tokenValidation.payload.sessionId || 
                    req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                    req.connection.remoteAddress || 
                    'unknown';
    
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Try again later.',
        retryAfter: 60
      });
    }

    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());

    // Parse and validate request
    const {
      text,
      voiceId = process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
      modelId = process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
      voiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true
      },
      outputFormat = 'mp3_44100_128',
      optimizeStreamingLatency = 2
    }: TTSRequest = req.body || {};

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
    
    const elevenLabsResponse = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: modelId,
        voice_settings: voiceSettings,
        output_format: outputFormat,
        optimize_streaming_latency: optimizeStreamingLatency
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
    const audioData = Buffer.from(audioBuffer);

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
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}