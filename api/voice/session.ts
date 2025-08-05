import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import type {
  SessionRequest,
  SessionCreateRequest,
  SessionEndRequest,
  SessionCreateResponse,
  SessionEndResponse,
  ApiErrorResponse,
  VoiceTokenPayload,
  ElevenLabsSubscription,
} from '../types/voice.js';
import { withRateLimit, rateLimiters } from '../utils/rateLimit.js';

// Session storage (in production, use Redis or database)
const activeSessions = new Map<string, {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  context?: unknown;
}>();

// Clean up old sessions
setInterval((): void => {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > thirtyMinutes) {
      activeSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

async function sessionHandler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if ElevenLabs API key is configured
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      res.status(500).json({
        success: false,
        error: 'Voice service not configured (ElevenLabs API key missing)'
      });
      return;
    }

    const body = (req.body ?? {}) as Partial<SessionRequest>;
    const action = body.action;
    const sessionId = (body as Partial<SessionEndRequest>)?.sessionId;
    const userId = (body as Partial<SessionCreateRequest>)?.userId;
    const context = (body as Partial<SessionCreateRequest>)?.context;

    if (action !== 'start' && action !== 'end') {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "start" or "end"'
      });
      return;
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
      const now = Math.floor(Date.now() / 1000);
      const tokenPayload: VoiceTokenPayload = {
        sessionId: newSessionId,
        voiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID!,
        type: 'voice_session',
        iat: now,
        exp: now + (30 * 60),
      };
      // JWT secret is required for secure token generation
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({
          success: false,
          error: 'Voice service not configured (JWT secret missing)'
        });
        return;
      }
      
      const token = jwt.sign(
        tokenPayload,
        jwtSecret
      );

      // Test ElevenLabs API connectivity
      try {
        const testResponse = await (globalThis as any).fetch('https://api.elevenlabs.io/v1/user', {
          headers: {
            'xi-api-key': elevenLabsApiKey,
          },
        });

        if (!testResponse.ok) {
          throw new Error(`ElevenLabs API error: ${testResponse.status}`);
        }

        const userData = (await testResponse.json()) as { subscription?: ElevenLabsSubscription | null };

        const successResp: SessionCreateResponse = {
          success: true,
          sessionId: newSessionId,
          token,
          expiresAt: new Date(Date.now() + (30 * 60 * 1000)).toISOString(),
          elevenlabs: {
            connected: true,
            subscription: userData.subscription || null
          },
          config: {
            voiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID!,
            modelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5',
            wsUrl: 'wss://api.elevenlabs.io/v1/text-to-speech',
            voiceSettings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
            },
          }
        };
        res.status(200).json(successResp);
        return;

      } catch (apiError) {
        console.error('ElevenLabs API test failed:', apiError);

        // Clean up session since API is not working
        activeSessions.delete(newSessionId);

        const errResp: ApiErrorResponse = {
          success: false,
          error: 'Failed to connect to ElevenLabs API',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
        res.status(500).json(errResp);
        return;
      }

    } else if (action === 'end') {
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID required for ending session'
        });
        return;
      }

      const session = activeSessions.get(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found or already expired'
        });
        return;
      }

      // Remove session
      activeSessions.delete(sessionId);

      const duration = Date.now() - session.startTime;

      const endResp: SessionEndResponse = {
        success: true,
        sessionId,
        ended: true,
        duration,
        summary: {
          startTime: new Date(session.startTime).toISOString(),
          endTime: new Date().toISOString(),
          durationMs: duration
        }
      };
      res.status(200).json(endResp);
      return;
    }

  } catch (error) {
    console.error('Voice session error:', error);
    const errResp: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errResp);
  }
}

// Export with rate limiting applied
export default withRateLimit(sessionHandler, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 session creations per minute per IP
  message: 'Too many session creation attempts, please try again later.'
});