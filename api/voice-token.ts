import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

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
    // Get session ID from query or generate new one
    const sessionId = (req.query.sessionId as string) || `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if ElevenLabs API key is configured
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    if (!elevenLabsApiKey) {
      return res.status(500).json({ 
        success: false,
        error: 'Voice service not configured' 
      });
    }

    // Generate a short-lived token with session info
    const token = jwt.sign(
      {
        sessionId,
        voiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
        type: 'voice_session',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (5 * 60), // 5 minutes expiry
      },
      process.env['JWT_SECRET'] || 'default-secret-change-in-production'
    );

    // Return token and configuration (but NOT the actual API key)
    res.status(200).json({
      success: true,
      token,
      sessionId,
      config: {
        voiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
        modelId: process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
        wsUrl: 'wss://api.elevenlabs.io/v1',
        optimizeStreamingLatency: 2,
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      },
    });
  } catch (error) {
    console.error('Error generating voice token:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate voice token' 
    });
  }
}