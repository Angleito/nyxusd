import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface VoiceSessionRequest {
  action: 'start' | 'end';
  sessionId?: string;
  userId?: string;
  context?: {
    userProfile?: any;
    conversationHistory?: any[];
    memoryContext?: string;
    defiCapabilities?: any;
  };
}

// Session storage (in production, use Redis or database)
const activeSessions = new Map<string, {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  context?: any;
}>();

// Clean up old sessions
setInterval(() => {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > thirtyMinutes) {
      activeSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

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

    const { action, sessionId, userId, context }: VoiceSessionRequest = req.body || {};

    if (!action || !['start', 'end'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "start" or "end"'
      });
    }

    if (action === 'start') {
      // Generate new session ID
      const newSessionId = sessionId || `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create session record
      const session = {
        id: newSessionId,
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        context
      };
      
      activeSessions.set(newSessionId, session);

      // Generate JWT token for secure voice communication
      const token = jwt.sign(
        {
          sessionId: newSessionId,
          userId,
          voiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
          type: 'voice_session',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
        },
        process.env['JWT_SECRET'] || 'default-secret-change-in-production'
      );

      // Test ElevenLabs API connectivity
      try {
        const testResponse = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': elevenLabsApiKey,
          },
        });

        if (!testResponse.ok) {
          throw new Error(`ElevenLabs API error: ${testResponse.status}`);
        }

        const userData = await testResponse.json();
        
        return res.status(200).json({
          success: true,
          sessionId: newSessionId,
          token,
          expiresAt: new Date(Date.now() + (30 * 60 * 1000)).toISOString(),
          elevenlabs: {
            connected: true,
            subscription: userData.subscription || null
          },
          config: {
            voiceId: process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL',
            modelId: process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5',
            wsUrl: 'wss://api.elevenlabs.io/v1/text-to-speech',
            voiceSettings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
            },
          }
        });

      } catch (apiError) {
        console.error('ElevenLabs API test failed:', apiError);
        
        // Clean up session since API is not working
        activeSessions.delete(newSessionId);
        
        return res.status(500).json({
          success: false,
          error: 'Failed to connect to ElevenLabs API',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        });
      }

    } else if (action === 'end') {
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID required for ending session'
        });
      }

      const session = activeSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found or already expired'
        });
      }

      // Remove session
      activeSessions.delete(sessionId);
      
      const duration = Date.now() - session.startTime;
      
      return res.status(200).json({
        success: true,
        sessionId,
        ended: true,
        duration,
        summary: {
          startTime: new Date(session.startTime).toISOString(),
          endTime: new Date().toISOString(),
          durationMs: duration
        }
      });
    }

  } catch (error) {
    console.error('Voice session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}