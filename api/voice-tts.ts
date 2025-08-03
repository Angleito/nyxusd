import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface TTSRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  token: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env['FRONTEND_URL'] || '*');
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
    const { text, voiceId, modelId, token } = req.body as TTSRequest;
    
    // Verify token
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    try {
      jwt.verify(token, process.env['JWT_SECRET'] || 'default-secret-change-in-production');
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }

    // Validate input
    if (!text || text.length > 5000) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid text input' 
      });
    }

    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    if (!elevenLabsApiKey) {
      return res.status(500).json({ 
        success: false,
        error: 'Voice service not configured' 
      });
    }

    const selectedVoiceId = voiceId || process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL';
    const selectedModelId = modelId || process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5';

    // Make request to ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?optimize_streaming_latency=2&output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
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
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return res.status(response.status).json({
        success: false,
        error: 'Failed to generate speech',
      });
    }

    // Stream the audio response back to the client
    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error in TTS endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process text-to-speech request' 
    });
  }
}