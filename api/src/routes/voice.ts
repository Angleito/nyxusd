import express, { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Validation schemas
const voiceSessionSchema = z.object({
  userId: z.string().optional(),
  walletAddress: z.string().optional(),
});

// Token schema (currently unused but may be used for future validation)
// const voiceTokenSchema = z.object({
//   sessionId: z.string(),
//   voiceId: z.string().optional(),
// });

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional(),
  modelId: z.string().optional(),
  voiceSettings: z.object({
    stability: z.number().min(0).max(1).optional(),
    similarity_boost: z.number().min(0).max(1).optional(),
    style: z.number().min(0).max(1).optional(),
    use_speaker_boost: z.boolean().optional(),
  }).optional(),
});

// Store active voice sessions
const voiceSessions = new Map<string, {
  id: string;
  userId?: string;
  walletAddress?: string;
  startTime: Date;
  lastActivity: Date;
  voiceId?: string;
  characterCount: number;
}>();

// Clean up expired sessions (older than 30 minutes)
setInterval(() => {
  const now = new Date();
  const expirationTime = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId, session] of voiceSessions.entries()) {
    if (now.getTime() - session.lastActivity.getTime() > expirationTime) {
      voiceSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Start a new voice session
router.post('/session/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, walletAddress } = voiceSessionSchema.parse(req.body);
    
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      userId,
      walletAddress,
      startTime: new Date(),
      lastActivity: new Date(),
      voiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
      characterCount: 0,
    };
    
    voiceSessions.set(sessionId, session);
    
    res.json({
      success: true,
      sessionId,
      voiceId: session.voiceId,
      message: 'Voice session started successfully',
    });
  } catch (error: any) {
    console.error('Error starting voice session:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to start voice session',
    });
  }
});

// End a voice session
router.post('/session/end', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !voiceSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    const session = voiceSessions.get(sessionId);
    voiceSessions.delete(sessionId);
    
    res.json({
      success: true,
      message: 'Voice session ended',
      sessionStats: {
        duration: session ? new Date().getTime() - session.startTime.getTime() : 0,
        characterCount: session?.characterCount || 0,
      },
    });
  } catch (error: any) {
    console.error('Error ending voice session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end voice session',
    });
  }
});

// Generate a secure token for client-side ElevenLabs access
router.get('/token', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.query['sessionId'] as string;
    
    if (!sessionId || !voiceSessions.has(sessionId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
      });
    }
    
    const session = voiceSessions.get(sessionId);
    
    // Update last activity
    if (session) {
      session.lastActivity = new Date();
    }
    
    // Generate a short-lived token for ElevenLabs API access
    // In production, you might want to use a more secure method
    const token = jwt.sign(
      {
        sessionId,
        voiceId: session?.voiceId,
        exp: Math.floor(Date.now() / 1000) + (5 * 60), // 5 minutes
      },
      process.env['JWT_SECRET'] || 'your-secret-key'
    );
    
    res.json({
      success: true,
      token,
      apiKey: process.env['ELEVENLABS_API_KEY'], // In production, use a proxy instead
      voiceId: session?.voiceId,
      config: {
        modelId: process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
        optimizeStreamingLatency: 2,
        outputFormat: 'mp3_44100_128',
      },
    });
  } catch (error: any) {
    console.error('Error generating token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate token',
    });
  }
});

// Get voice configuration and available voices
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      config: {
        defaultVoiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
        modelId: process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
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
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting voice config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voice configuration',
    });
  }
});

// Text-to-speech endpoint (proxy to ElevenLabs)
router.post('/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceId, modelId, voiceSettings } = ttsRequestSchema.parse(req.body);
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId || !voiceSessions.has(sessionId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
      });
    }
    
    const session = voiceSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.characterCount += text.length;
    }
    
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    if (!elevenLabsApiKey) {
      return res.status(500).json({
        success: false,
        error: 'ElevenLabs API key not configured',
      });
    }
    
    const selectedVoiceId = voiceId || session?.voiceId || process.env['ELEVENLABS_DEFAULT_VOICE_ID'];
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
          voice_settings: voiceSettings || {
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
        details: error,
      });
    }
    
    // Stream the audio response back to the client
    const audioBuffer = await response.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength.toString(),
    });
    res.send(Buffer.from(audioBuffer));
  } catch (error: any) {
    console.error('Error in TTS endpoint:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to process text-to-speech request',
    });
  }
});

// Get available voices from ElevenLabs
router.get('/voices', async (req: Request, res: Response): Promise<void> => {
  try {
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    if (!elevenLabsApiKey) {
      // Return default voices if API key not configured
      return res.json({
        success: true,
        voices: [
          { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
          { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
          { voice_id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
        ],
      });
    }
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch voices from ElevenLabs');
    }
    
    const data = await response.json();
    res.json({
      success: true,
      voices: data.voices,
    });
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available voices',
    });
  }
});

// Health check endpoint
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    const isConfigured = !!elevenLabsApiKey;
    
    let apiStatus = 'not_configured';
    if (isConfigured) {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': elevenLabsApiKey,
          },
        });
        apiStatus = response.ok ? 'connected' : 'error';
      } catch {
        apiStatus = 'error';
      }
    }
    
    res.json({
      success: true,
      status: 'healthy',
      elevenLabs: {
        configured: isConfigured,
        apiStatus,
      },
      activeSessions: voiceSessions.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      error: error.message,
    });
  }
});

export default router;