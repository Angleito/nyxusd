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

// Conversational agent schemas
const createAgentSchema = z.object({
  voiceId: z.string(),
  agentPrompt: z.string().optional(),
  firstMessage: z.string().optional(),
  language: z.string().optional(),
  maxDurationSeconds: z.number().optional(),
  conversationContext: z.object({
    userProfile: z.object({
      walletAddress: z.string().optional(),
      preferences: z.record(z.any()).optional(),
      riskTolerance: z.enum(['low', 'moderate', 'high']).optional(),
      experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }).optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string(),
    })).optional(),
    currentStep: z.string().optional(),
    memoryContext: z.string().optional(),
  }).optional(),
});

const startConversationSchema = z.object({
  agentId: z.string(),
  conversationContext: z.object({
    userProfile: z.object({
      walletAddress: z.string().optional(),
      preferences: z.record(z.any()).optional(),
      riskTolerance: z.enum(['low', 'moderate', 'high']).optional(),
      experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }).optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string(),
    })).optional(),
    currentStep: z.string().optional(),
    memoryContext: z.string().optional(),
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
  mode?: 'tts' | 'conversational';
  agentId?: string;
}>();

// Store conversational agents
const conversationalAgents = new Map<string, {
  id: string;
  voiceId: string;
  agentPrompt?: string;
  firstMessage?: string;
  language?: string;
  maxDurationSeconds?: number;
  conversationContext?: any;
  createdAt: Date;
  lastUsed?: Date;
}>();

// Store active conversations
const activeConversations = new Map<string, {
  id: string;
  agentId: string;
  sessionId?: string;
  status: 'idle' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'error';
  startTime: Date;
  lastActivity: Date;
  conversationContext?: any;
}>();

// Clean up expired sessions (older than 30 minutes)
setInterval(() => {
  const now = new Date();
  const expirationTime = 30 * 60 * 1000; // 30 minutes
  const agentExpirationTime = 2 * 60 * 60 * 1000; // 2 hours for agents
  
  // Clean up voice sessions
  for (const [sessionId, session] of voiceSessions.entries()) {
    if (now.getTime() - session.lastActivity.getTime() > expirationTime) {
      voiceSessions.delete(sessionId);
    }
  }
  
  // Clean up active conversations
  for (const [conversationId, conversation] of activeConversations.entries()) {
    if (now.getTime() - conversation.lastActivity.getTime() > expirationTime) {
      activeConversations.delete(conversationId);
    }
  }
  
  // Clean up unused agents (older than 2 hours)
  for (const [agentId, agent] of conversationalAgents.entries()) {
    const lastUsed = agent.lastUsed || agent.createdAt;
    if (now.getTime() - lastUsed.getTime() > agentExpirationTime) {
      conversationalAgents.delete(agentId);
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

// Create a conversational agent
router.post('/agent/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createAgentSchema.parse(req.body);
    const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
    
    if (!elevenLabsApiKey) {
      return res.status(500).json({
        success: false,
        error: 'ElevenLabs API key not configured',
      });
    }

    // Build agent prompt with context
    let agentPrompt = data.agentPrompt || `
You are a knowledgeable crypto and DeFi assistant for NYXUSD, a sophisticated stablecoin protocol. 
You help users with portfolio analysis, yield farming strategies, and DeFi operations.

Key traits:
- Professional but conversational
- Expert in crypto, DeFi, and blockchain technology
- Patient and educational with beginners
- Direct and efficient with advanced users
- Always prioritize user security and risk management

Keep responses concise (under 150 words) and conversational. Ask follow-up questions to better assist the user.
    `.trim();

    // Add user context if available
    if (data.conversationContext?.userProfile) {
      const profile = data.conversationContext.userProfile;
      agentPrompt += `\n\nUser Profile:`;
      
      if (profile.experience) {
        agentPrompt += `\n- Experience level: ${profile.experience}`;
      }
      
      if (profile.riskTolerance) {
        agentPrompt += `\n- Risk tolerance: ${profile.riskTolerance}`;
      }

      if (profile.walletAddress) {
        agentPrompt += `\n- Connected wallet: ${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`;
      }
    }

    // Add conversation history context
    if (data.conversationContext?.conversationHistory?.length) {
      agentPrompt += `\n\nRecent conversation context:`;
      const recentMessages = data.conversationContext.conversationHistory.slice(-3);
      recentMessages.forEach(msg => {
        const content = msg.content.slice(0, 100) + (msg.content.length > 100 ? '...' : '');
        agentPrompt += `\n${msg.role}: ${content}`;
      });
    }

    // Add memory context if available
    if (data.conversationContext?.memoryContext) {
      agentPrompt += `\n\nUser interaction history: ${data.conversationContext.memoryContext}`;
    }

    // Create agent configuration for ElevenLabs
    const agentConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: agentPrompt,
          },
          first_message: data.firstMessage || "Hello! I'm your AI crypto assistant. I can help you analyze your portfolio, find yield opportunities, and navigate DeFi. What would you like to explore today?",
          language: data.language || 'en',
          max_duration_seconds: data.maxDurationSeconds || 1800,
          llm: {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            max_tokens: 150,
          },
          tts: {
            voice_id: data.voiceId,
            model: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
            },
          },
          stt: {
            model: 'nova-2',
          },
        },
      },
    };

    // Make request to ElevenLabs to create agent
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentConfig),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs agent creation error:', errorData);
      return res.status(response.status).json({
        success: false,
        error: 'Failed to create conversational agent',
        details: errorData,
      });
    }

    const result = await response.json();
    const agentId = result.agent_id;

    // Store agent locally
    const agent = {
      id: agentId,
      voiceId: data.voiceId,
      agentPrompt: agentPrompt,
      firstMessage: data.firstMessage,
      language: data.language,
      maxDurationSeconds: data.maxDurationSeconds,
      conversationContext: data.conversationContext,
      createdAt: new Date(),
    };

    conversationalAgents.set(agentId, agent);

    res.json({
      success: true,
      agentId,
      message: 'Conversational agent created successfully',
    });
  } catch (error: any) {
    console.error('Error creating conversational agent:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create conversational agent',
    });
  }
});

// Start a conversation with an agent
router.post('/conversation/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = startConversationSchema.parse(req.body);
    const { agentId, conversationContext } = data;

    if (!conversationalAgents.has(agentId)) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    const agent = conversationalAgents.get(agentId)!;
    agent.lastUsed = new Date();

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = {
      id: conversationId,
      agentId,
      status: 'connecting' as const,
      startTime: new Date(),
      lastActivity: new Date(),
      conversationContext,
    };

    activeConversations.set(conversationId, conversation);

    res.json({
      success: true,
      conversationId,
      agentId,
      status: 'connecting',
      message: 'Conversation session started',
      websocketUrl: `wss://api.elevenlabs.io/v1/convai/agents/${agentId}/conversation`,
    });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation',
    });
  }
});

// End a conversation
router.post('/conversation/end', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.body;
    
    if (!conversationId || !activeConversations.has(conversationId)) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }
    
    const conversation = activeConversations.get(conversationId)!;
    const duration = new Date().getTime() - conversation.startTime.getTime();
    
    activeConversations.delete(conversationId);
    
    res.json({
      success: true,
      message: 'Conversation ended',
      stats: {
        duration,
        startTime: conversation.startTime,
        endTime: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error ending conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end conversation',
    });
  }
});

// Get conversation status
router.get('/conversation/:conversationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    
    if (!activeConversations.has(conversationId)) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }
    
    const conversation = activeConversations.get(conversationId)!;
    const agent = conversationalAgents.get(conversation.agentId);
    
    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        agentId: conversation.agentId,
        status: conversation.status,
        startTime: conversation.startTime,
        lastActivity: conversation.lastActivity,
        duration: new Date().getTime() - conversation.startTime.getTime(),
      },
      agent: agent ? {
        id: agent.id,
        voiceId: agent.voiceId,
        language: agent.language,
      } : null,
    });
  } catch (error: any) {
    console.error('Error getting conversation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation status',
    });
  }
});

// Update conversation context
router.put('/conversation/:conversationId/context', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { conversationContext } = req.body;
    
    if (!activeConversations.has(conversationId)) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }
    
    const conversation = activeConversations.get(conversationId)!;
    conversation.conversationContext = { ...conversation.conversationContext, ...conversationContext };
    conversation.lastActivity = new Date();
    
    res.json({
      success: true,
      message: 'Conversation context updated',
    });
  } catch (error: any) {
    console.error('Error updating conversation context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation context',
    });
  }
});

// List active conversations
router.get('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const conversations = Array.from(activeConversations.values()).map(conv => ({
      id: conv.id,
      agentId: conv.agentId,
      status: conv.status,
      startTime: conv.startTime,
      lastActivity: conv.lastActivity,
      duration: new Date().getTime() - conv.startTime.getTime(),
    }));
    
    res.json({
      success: true,
      conversations,
      total: conversations.length,
    });
  } catch (error: any) {
    console.error('Error listing conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list conversations',
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
      conversationalAgents: conversationalAgents.size,
      activeConversations: activeConversations.size,
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