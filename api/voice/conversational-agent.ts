import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from '../utils/cors.js';
import type { 
  ApiErrorResponse
} from '../types/voice.js';
import { validateVoiceEnvironment } from '../types/voice.js';

interface ConversationalAgentRequest {
  readonly sessionId?: string;
  readonly userId?: string;
  readonly context?: {
    readonly userProfile?: any;
    readonly conversationHistory?: ReadonlyArray<any>;
    readonly memoryContext?: string;
    readonly defiCapabilities?: any;
  };
  readonly config?: {
    readonly voiceId?: string;
    readonly modelId?: string;
    readonly language?: string;
    readonly firstMessage?: string;
  };
}

interface ConversationalAgentResponse {
  readonly success: true;
  readonly agentId: string;
  readonly sessionId: string;
  readonly websocketUrl: string;
  readonly signedUrl?: string;
  readonly expiresAt: string;
  readonly config: {
    readonly voiceId: string;
    readonly modelId: string;
    readonly language: string;
    readonly firstMessage: string;
  };
  readonly timestamp: string;
}

// Store active conversational agents (use Redis in production)
const activeAgents = new Map<string, {
  id: string;
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  context?: any;
  config: any;
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
function buildAgentPrompt(context?: ConversationalAgentRequest['context']): string {
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
    const profile = context.userProfile;
    contextAddition += `\n\nUser Profile:
- Experience Level: ${profile.preferences?.experience || 'intermediate'}
- Risk Tolerance: ${profile.preferences?.riskTolerance || 'moderate'}
- Interests: ${profile.preferences?.interests?.join(', ') || 'general DeFi'}`;
  }

  return basePrompt + contextAddition;
}

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

    const requestBody = req.body as ConversationalAgentRequest;
    const { sessionId, userId, context, config } = requestBody;

    // Generate unique agent ID
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build agent configuration
    const agentConfig = {
      voiceId: config?.voiceId || envValidation.env.ELEVENLABS_DEFAULT_VOICE_ID!,
      modelId: config?.modelId || envValidation.env.ELEVENLABS_MODEL_ID!,
      language: config?.language || 'en',
      firstMessage: config?.firstMessage || "Hello! I'm NyxUSD, your AI crypto assistant. How can I help you with DeFi today?",
    };

    // Build agent prompt with context
    const agentPrompt = buildAgentPrompt(context);

    try {
      // Test ElevenLabs API connectivity
      const testResponse = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': envValidation.env.ELEVENLABS_API_KEY!,
        },
      });

      if (!testResponse.ok) {
        throw new Error(`ElevenLabs API error: ${testResponse.status}`);
      }

      // Create conversational agent on ElevenLabs
      const createAgentResponse = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
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
                  type: "websocket",
                  url: "wss://api.elevenlabs.io/v1/convai/conversation",
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
                  provider: "elevenlabs",
                  model: "en_v1",
                },
              },
            },
          },
        }),
      });

      if (!createAgentResponse.ok) {
        const errorText = await createAgentResponse.text();
        throw new Error(`Failed to create conversational agent: ${createAgentResponse.status} - ${errorText}`);
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

      const response: ConversationalAgentResponse = {
        success: true,
        agentId,
        sessionId: finalSessionId,
        websocketUrl: agentData.conversation_config?.conversation?.conversation_config_override?.tti_config?.url || 'wss://api.elevenlabs.io/v1/convai/conversation',
        signedUrl: agentData.signed_url,
        expiresAt: new Date(Date.now() + (30 * 60 * 1000)).toISOString(), // 30 minutes
        config: agentConfig,
        timestamp: new Date().toISOString(),
      };
      
      res.status(200).json(response);

    } catch (apiError) {
      console.error('ElevenLabs conversational agent creation failed:', apiError);
      
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Failed to create conversational agent',
        details: apiError instanceof Error ? apiError.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }

  } catch (error) {
    console.error('Conversational agent endpoint error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
}