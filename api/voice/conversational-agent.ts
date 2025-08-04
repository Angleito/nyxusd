import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from '../utils/cors.js';
import type {
  ApiErrorResponse,
  AgentRequest,
  AgentResponse,
} from '../types/voice.js';
import { validateVoiceEnvironment, isAgentRequest } from '../types/voice.js';

// Store active conversational agents (use Redis in production)
const activeAgents = new Map<string, {
  id: string;
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  context?: unknown;
  config: {
    voiceId: string;
    modelId: string;
    language: string;
    firstMessage: string;
  };
}>();

// Clean up old agents
setInterval((): void => {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [agentId, agent] of activeAgents.entries()) {
    if (now - agent.lastActivity > thirtyMinutes) {
      activeAgents.delete(agentId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Build agent prompt with context and DeFi capabilities
 */
function buildAgentPrompt(context?: AgentRequest['context']): string {
  const basePrompt = `You are NyxUSD, an advanced AI assistant specializing in decentralized finance (DeFi), blockchain technology, and digital asset management. You're designed to be helpful, knowledgeable, and conversational in voice interactions.

## Core Capabilities:
- DeFi Operations: Help with swaps, lending, yield farming, liquidity provision
- Cross-chain Trading: Support for Ethereum, Base, Arbitrum, and other chains
- Portfolio Management: Analysis, recommendations, risk assessment
- Market Insights: Real-time data interpretation and trend analysis
- Security Guidance: Best practices for wallet and asset protection

## Voice Communication Style:
- Be conversational and natural, as if speaking to a friend
- Keep responses concise but informative for voice interaction
- Ask clarifying questions when needed
- Use simple language, avoiding technical jargon unless requested
- Provide clear, actionable advice
- Be encouraging and supportive

## Key Principles:
- Always prioritize user security and safety
- Provide educational context with recommendations
- Be transparent about risks and limitations
- Never provide financial advice as investment recommendations
- Focus on helping users understand their options
- Adapt to user's experience level and preferences

## Context Awareness:
- Remember user preferences and past interactions
- Adapt explanations to user experience level
- Consider current market conditions in responses
- Provide relevant, timely information`;

  let contextAddition = '';
  if (context?.memoryContext) {
    contextAddition += `\n\nUser Context: ${context.memoryContext}`;
  }
  if (context?.userProfile) {
    const profile = context.userProfile as Record<string, unknown>;
    // Access via index-signature safe form
    const prefsRaw = (typeof profile === 'object' && profile && ('preferences' in profile))
      ? (profile['preferences'] as unknown)
      : undefined;
    const prefs = (prefsRaw && typeof prefsRaw === 'object')
      ? (prefsRaw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

    const experience = typeof prefs['experience'] === 'string'
      ? (prefs['experience'] as string)
      : 'intermediate';
    const riskTolerance = typeof prefs['riskTolerance'] === 'string'
      ? (prefs['riskTolerance'] as string)
      : 'moderate';
    const interests = Array.isArray(prefs['interests'])
      ? (prefs['interests'] as unknown[]).map((x) => String(x)).join(', ')
      : 'general DeFi';

    contextAddition += `\n\nUser Profile:
 - Experience Level: ${experience}
 - Risk Tolerance: ${riskTolerance}
 - Interests: ${interests}`;
  }

  return basePrompt + contextAddition;
}

function genRequestId(): string {
  try {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).crypto?.randomUUID === 'function') {
      return (globalThis as any).crypto.randomUUID();
    }
  } catch {
    // ignore and fallback
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function redact(value: unknown): unknown {
  if (!value) return value;
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  if (!s) return value;
  // redact obvious token-like values
  return s.replace(/(Bearer\s+)?([A-Za-z0-9_-]{16,})/g, (_m, b) => (b ? `${b}[REDACTED]` : '[REDACTED]'));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // request start log
  const requestId = genRequestId();
  const ts = new Date().toISOString();
  const method = req.method || 'UNKNOWN';
  const path = (req as any).url || '/api/voice/conversational-agent';
  console.info(JSON.stringify({ level: 'info', msg: 'convai:create:start', requestId, method, path, ts }));

  // Set CORS headers
  setCorsHeaders(res, { methods: 'POST,OPTIONS' });
  
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    console.info(JSON.stringify({ level: 'info', msg: 'convai:create:options', requestId, ts: new Date().toISOString() }));
    return;
  }

  if (!validateMethod(req.method, ['POST'])) {
    sendMethodNotAllowed(res, ['POST']);
    console.warn(JSON.stringify({ level: 'warn', msg: 'convai:create:method_not_allowed', requestId, method, allowed: ['POST'] }));
    return;
  }

  try {
    // Validate environment configuration
    const envValidation = validateVoiceEnvironment();
    console.info(JSON.stringify({
      level: 'info',
      msg: 'convai:create:env_validation',
      requestId,
      valid: envValidation.isValid,
      missing: envValidation.isValid ? [] : envValidation.errors
    }));

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

    // Validate inbound JSON
    if (!isAgentRequest(req.body)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid request body',
        details: 'Body must match AgentRequest shape',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(errorResponse);
      return;
    }

    const requestBody = req.body as AgentRequest;
    const { sessionId, userId, context, config } = requestBody;

    // Generate unique IDs
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build agent configuration
    const agentConfig = {
      voiceId: (config?.voiceId && typeof config.voiceId === 'string' ? config.voiceId : envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!)!,
      modelId: (config?.modelId && typeof config.modelId === 'string' ? config.modelId : envValidation.env.ELEVENLABS_MODEL_ID!)!,
      language: (config?.language && typeof config.language === 'string' ? config.language : 'en'),
      firstMessage: (config?.firstMessage && typeof config.firstMessage === 'string'
        ? config.firstMessage
        : "Hello! I'm NyxUSD, your AI crypto assistant. How can I help you with DeFi today?"),
    };

    // Build agent prompt with context
    const agentPrompt = buildAgentPrompt(context);

    // ElevenLabs user check
    const userCheckStart = Date.now();
    console.info(JSON.stringify({
      level: 'info',
      msg: 'convai:create:eleven_user_check:begin',
      requestId,
      agentId,
      sessionId: finalSessionId,
      ts: new Date().toISOString()
    }));
    try {
      const testResponse = await (globalThis as any).fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': envValidation.env.ELEVENLABS_API_KEY!,
        },
      });

      const userCheckDuration = Date.now() - userCheckStart;
      if (!testResponse.ok) {
        console.error(JSON.stringify({
          level: 'error',
          msg: 'convai:create:eleven_user_check:fail',
          requestId,
          agentId,
          status: testResponse.status,
          durationMs: userCheckDuration
        }));
        throw new Error(`ElevenLabs API error: ${testResponse.status}`);
      } else {
        console.info(JSON.stringify({
          level: 'info',
          msg: 'convai:create:eleven_user_check:ok',
          requestId,
          agentId,
          status: testResponse.status,
          durationMs: userCheckDuration
        }));
      }

      // Create conversational agent on ElevenLabs
      const createStart = Date.now();
      console.info(JSON.stringify({
        level: 'info',
        msg: 'convai:create:eleven_conversation:create:begin',
        requestId,
        agentId,
        sessionId: finalSessionId,
        ts: new Date().toISOString()
      }));
      const createAgentResponse = await (globalThis as any).fetch('https://api.elevenlabs.io/v1/convai/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': envValidation.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          agent_id: agentId,
          conversation_config: {
            agent: {
              prompt: {
                prompt: agentPrompt,
              },
              first_message: agentConfig.firstMessage,
              language: agentConfig.language,
            },
            conversation: {
              conversation_config_override: {
                tti_config: {
                  type: 'websocket',
                  url: 'wss://api.elevenlabs.io/v1/convai/conversation',
                },
                tts_config: {
                  voice_id: agentConfig.voiceId,
                  model_id: agentConfig.modelId,
                  voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0,
                    use_speaker_boost: true,
                  },
                },
                asr_config: {
                  provider: 'elevenlabs',
                  model: 'en_v1',
                },
              },
            },
          },
        }),
      });

      const createDuration = Date.now() - createStart;
      if (!createAgentResponse.ok) {
        const errorText = await createAgentResponse.text();
        console.error(JSON.stringify({
          level: 'error',
          msg: 'convai:create:eleven_conversation:create:fail',
          requestId,
          agentId,
          status: createAgentResponse.status,
          durationMs: createDuration,
          errorCode: createAgentResponse.statusText
        }));
        throw new Error(`Failed to create conversational agent: ${createAgentResponse.status} - ${errorText}`);
      } else {
        console.info(JSON.stringify({
          level: 'info',
          msg: 'convai:create:eleven_conversation:create:ok',
          requestId,
          agentId,
          status: createAgentResponse.status,
          durationMs: createDuration
        }));
      }

      const agentData = await createAgentResponse.json();

      // Store agent session
      const agentSession = {
        id: agentId,
        sessionId: finalSessionId,
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        context,
        config: agentConfig,
      };
      
      activeAgents.set(agentId, agentSession);

      const response: AgentResponse = {
        success: true,
        agentId,
        sessionId: finalSessionId,
        websocketUrl: agentData.conversation_config?.conversation?.conversation_config_override?.tti_config?.url || 'wss://api.elevenlabs.io/v1/convai/conversation',
        signedUrl: agentData.signed_url,
        expiresAt: new Date(Date.now() + (30 * 60 * 1000)).toISOString(), // 30 minutes
        config: agentConfig,
        timestamp: new Date().toISOString(),
      };
      
      console.info(JSON.stringify({
        level: 'info',
        msg: 'convai:create:success',
        requestId,
        agentId,
        sessionId: finalSessionId
      }));
      res.status(200).json(response);

    } catch (apiError) {
      const err = apiError as any;
      const safeMessage = err && err.message ? redact(err.message) : 'Unknown error';
      const stack = (process.env['NODE_ENV'] && process.env['NODE_ENV'] !== 'production') ? err?.stack : undefined;
      console.error(JSON.stringify({
        level: 'error',
        msg: 'convai:create:error:elevenlabs',
        requestId,
        error: safeMessage,
        stack
      }));
      
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Failed to create conversational agent',
        details: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }

  } catch (error) {
    const err = error as any;
    const safeMessage = err && err.message ? redact(err.message) : 'Unknown error';
    const stack = (process.env['NODE_ENV'] && process.env['NODE_ENV'] !== 'production') ? err?.stack : undefined;
    console.error(JSON.stringify({
      level: 'error',
      msg: 'convai:create:error',
      requestId,
      error: safeMessage,
      stack
    }));
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}