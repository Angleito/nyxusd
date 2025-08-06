import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Simple CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
    return;
  }

  try {
    // Check if ElevenLabs key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      res.status(503).json({
        success: false,
        error: 'Voice service not configured',
        details: 'ElevenLabs API key is not configured'
      });
      return;
    }

    // Generate simple token
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const token = Buffer.from(JSON.stringify({
      sessionId,
      voiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
      type: 'voice_session',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (5 * 60)
    })).toString('base64');

    res.status(200).json({
      success: true,
      token,
      sessionId,
      config: {
        voiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
        modelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5',
        wsUrl: 'wss://api.elevenlabs.io/v1',
        optimizeStreamingLatency: 2,
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true
        }
      }
    });
  } catch (error) {
    console.error('Voice token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate voice token'
    });
  }
}