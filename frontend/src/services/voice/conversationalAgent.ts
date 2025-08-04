import { EventEmitter } from 'events';

export interface ConversationalAgentConfig {
  voiceId: string;
  agentPrompt?: string;
  firstMessage?: string;
  language?: string;
  maxDurationSeconds?: number;
  llmConfig?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };
  ttsConfig?: {
    voiceSettings?: {
      stability: number;
      similarity_boost: number;
      style?: number;
      use_speaker_boost?: boolean;
    };
    model?: string;
  };
  transcriptionConfig?: {
    model?: string;
  };
}

export interface AgentSession {
  agentId: string;
  sessionId: string;
  status: 'idle' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'error';
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  conversationId?: string;
}

export interface ConversationContext {
  userProfile?: {
    walletAddress?: string;
    preferences?: Record<string, any>;
    riskTolerance?: 'low' | 'moderate' | 'high';
    experience?: 'beginner' | 'intermediate' | 'advanced';
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentStep?: string;
  memoryContext?: string;
  defiCapabilities?: {
    canExecuteSwaps: boolean;
    connectedChain?: number;
    availableTokens?: string[];
  };
}

export interface AudioChunk {
  audio: string; // base64 encoded audio
  isFinal: boolean;
  normalizedAlignment?: any;
}

export interface TranscriptionChunk {
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

export class ConversationalAgent extends EventEmitter {
  private apiKey: string | null = null;
  private ws: WebSocket | null = null;
  private currentSession: AgentSession | null = null;
  private config: ConversationalAgentConfig;
  private audioContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying: boolean = false;
  private conversationContext: ConversationContext = {};

  constructor(config: ConversationalAgentConfig) {
    super();
    this.config = {
      language: 'en',
      maxDurationSeconds: 1800, // 30 minutes
      llmConfig: {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 150,
      },
      ttsConfig: {
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
        model: 'eleven_turbo_v2_5',
      },
      transcriptionConfig: {
        model: 'nova-2',
      },
      ...config,
    };
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
  }

  async createAgent(context?: ConversationContext): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    // Note: Direct ElevenLabs API calls from frontend are not secure
    // This should be implemented via backend API endpoints
    throw new Error('Conversational agent creation should be handled by backend API');

    this.conversationContext = context || {};

    // Build agent prompt with context
    const agentPrompt = this.buildAgentPrompt();

    const agentConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: agentPrompt,
          },
          first_message: this.config.firstMessage || "Hello! I'm your AI crypto assistant. How can I help you today?",
          language: this.config.language,
          max_duration_seconds: this.config.maxDurationSeconds,
          llm: this.config.llmConfig,
          tts: {
            voice_id: this.config.voiceId,
            model: this.config.ttsConfig?.model,
            voice_settings: this.config.ttsConfig?.voiceSettings,
          },
          stt: this.config.transcriptionConfig,
        },
      },
    };

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentConfig),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create agent: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      this.emit('agentCreated', { agentId: data.agent_id });
      return data.agent_id;
    } catch (error) {
      console.error('Error creating conversational agent:', error);
      this.emit('error', { type: 'agent_creation', error });
      throw error;
    }
  }

  private buildAgentPrompt(): string {
    const basePrompt = this.config.agentPrompt || `
You are a knowledgeable crypto and DeFi assistant for NYXUSD, a sophisticated stablecoin protocol. 
You help users with portfolio analysis, yield farming strategies, and DeFi operations.

Key traits:
- Professional but conversational
- Expert in crypto, DeFi, and blockchain technology
- Patient and educational with beginners
- Direct and efficient with advanced users
- Always prioritize user security and risk management
    `.trim();

    // Add user context if available
    let contextualPrompt = basePrompt;

    if (this.conversationContext.userProfile) {
      const profile = this.conversationContext.userProfile;
      contextualPrompt += `\n\nUser Profile:`;
      
      if (profile.experience) {
        contextualPrompt += `\n- Experience level: ${profile.experience}`;
      }
      
      if (profile.riskTolerance) {
        contextualPrompt += `\n- Risk tolerance: ${profile.riskTolerance}`;
      }

      if (profile.walletAddress) {
        contextualPrompt += `\n- Connected wallet: ${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`;
      }
    }

    // Add DeFi capabilities context
    if (this.conversationContext.defiCapabilities) {
      const defi = this.conversationContext.defiCapabilities;
      contextualPrompt += `\n\nDeFi Capabilities:`;
      
      if (defi.canExecuteSwaps) {
        contextualPrompt += `\n- Can execute token swaps via Odos`;
        contextualPrompt += `\n- Connected to chain ID: ${defi.connectedChain || 'Base (8453)'}`;
        
        if (defi.availableTokens?.length) {
          contextualPrompt += `\n- Available tokens: ${defi.availableTokens.slice(0, 5).join(', ')}${defi.availableTokens.length > 5 ? '...' : ''}`;
        }
        
        contextualPrompt += `\n\nWhen users mention swapping tokens:
- Help them specify the tokens and amounts
- Confirm the swap details before execution
- Explain gas costs and price impact
- Guide them through the confirmation process`;
      } else {
        contextualPrompt += `\n- Wallet not connected for swaps. Inform users to connect their wallet to execute trades.`;
      }
    }

    // Add conversation history context
    if (this.conversationContext.conversationHistory?.length) {
      contextualPrompt += `\n\nRecent conversation context:`;
      const recentMessages = this.conversationContext.conversationHistory.slice(-3);
      recentMessages.forEach(msg => {
        contextualPrompt += `\n${msg.role}: ${msg.content.slice(0, 100)}${msg.content.length > 100 ? '...' : ''}`;
      });
    }

    // Add memory context if available
    if (this.conversationContext.memoryContext) {
      contextualPrompt += `\n\nUser interaction history: ${this.conversationContext.memoryContext}`;
    }

    contextualPrompt += `\n\nKeep responses concise (under 150 words) and conversational. Ask follow-up questions to better assist the user.`;

    return contextualPrompt;
  }

  async startConversation(agentId: string, context?: ConversationContext): Promise<string> {
    if (this.currentSession?.isActive) {
      throw new Error('Conversation already active');
    }

    if (context) {
      this.conversationContext = { ...this.conversationContext, ...context };
    }

    const sessionId = `convai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      agentId,
      sessionId,
      status: 'connecting',
      isActive: true,
      startTime: new Date(),
    };

    try {
      await this.connectWebSocket(agentId);
      this.currentSession.status = 'connected';
      this.emit('conversationStarted', this.currentSession);
      return sessionId;
    } catch (error) {
      this.currentSession.status = 'error';
      this.emit('error', { type: 'connection', error });
      throw error;
    }
  }

  private async connectWebSocket(agentId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    const wsUrl = `wss://api.elevenlabs.io/v1/convai/agents/${agentId}/conversation`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Conversational AI WebSocket connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('Conversational AI WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.ws.onclose = (event) => {
        console.log('Conversational AI WebSocket closed:', event.code, event.reason);
        this.handleWebSocketClose(event);
      };
    });
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'audio':
          this.handleAudioChunk(data as AudioChunk);
          break;
        
        case 'transcription':
          this.handleTranscriptionChunk(data as TranscriptionChunk);
          break;
          
        case 'user_transcript':
          this.emit('userTranscript', {
            text: data.text,
            isFinal: data.is_final,
            timestamp: new Date(),
          });
          break;

        case 'agent_response':
          this.emit('agentResponse', {
            text: data.text,
            timestamp: new Date(),
          });
          break;

        case 'conversation_end':
          this.handleConversationEnd(data);
          break;

        case 'error':
          this.emit('error', { type: 'websocket', error: data.error });
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private async handleAudioChunk(chunk: AudioChunk): Promise<void> {
    try {
      // Update session status
      if (this.currentSession && chunk.audio) {
        this.currentSession.status = 'speaking';
        this.emit('agentSpeaking', { isFinal: chunk.isFinal });
      }

      // Decode and play audio
      const audioData = atob(chunk.audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      await this.playAudio(audioArray.buffer);

      if (chunk.isFinal) {
        this.emit('agentFinishedSpeaking');
        if (this.currentSession) {
          this.currentSession.status = 'listening';
        }
      }
    } catch (error) {
      console.error('Error handling audio chunk:', error);
      this.emit('error', { type: 'audio_playback', error });
    }
  }

  private handleTranscriptionChunk(chunk: TranscriptionChunk): void {
    if (this.currentSession) {
      this.currentSession.status = chunk.isFinal ? 'thinking' : 'listening';
    }

    this.emit('transcription', {
      text: chunk.text,
      isFinal: chunk.isFinal,
      timestamp: chunk.timestamp,
    });
  }

  private handleConversationEnd(data: any): void {
    if (this.currentSession) {
      this.currentSession.status = 'idle';
      this.currentSession.isActive = false;
      this.currentSession.endTime = new Date();
    }

    this.emit('conversationEnded', {
      reason: data.reason,
      session: this.currentSession,
    });

    this.cleanup();
  }

  private handleWebSocketClose(event: CloseEvent): void {
    if (this.currentSession) {
      this.currentSession.status = event.wasClean ? 'idle' : 'error';
      this.currentSession.isActive = false;
      this.currentSession.endTime = new Date();
    }

    this.emit('websocketClosed', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    });

    this.cleanup();
  }

  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) return;

    this.audioQueue.push(audioData);
    
    if (!this.isPlaying) {
      this.processAudioQueue();
    }
  }

  private async processAudioQueue(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift()!;

    try {
      const audioBuffer = await this.audioContext!.decodeAudioData(audioData);
      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext!.destination);
      
      source.onended = () => {
        this.processAudioQueue();
      };
      
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.processAudioQueue(); // Continue with next chunk
    }
  }

  async endConversation(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'User ended conversation');
    }
    
    this.cleanup();
  }

  updateContext(context: Partial<ConversationContext>): void {
    this.conversationContext = { ...this.conversationContext, ...context };
    this.emit('contextUpdated', this.conversationContext);
  }

  getCurrentSession(): AgentSession | null {
    return this.currentSession;
  }

  isConversationActive(): boolean {
    return this.currentSession?.isActive || false;
  }

  getConversationStatus(): string {
    if (!this.currentSession) {
      return 'idle';
    }
    
    // Check WebSocket connection health
    if (this.ws) {
      switch (this.ws.readyState) {
        case WebSocket.CONNECTING:
          return 'connecting';
        case WebSocket.OPEN:
          return this.currentSession.status;
        case WebSocket.CLOSING:
          return 'disconnecting';
        case WebSocket.CLOSED:
          return 'disconnected';
        default:
          return 'error';
      }
    }
    
    return this.currentSession.status;
  }

  private cleanup(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.ws) {
      this.ws = null;
    }
    
    this.currentSession = null;
  }

  async reconnect(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session to reconnect');
    }

    const agentId = this.currentSession.agentId;
    const context = this.conversationContext;
    
    console.log('Attempting to reconnect conversational agent...');
    
    try {
      // Close existing connection
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      // Update session status
      this.currentSession.status = 'connecting';
      this.emit('reconnecting', { agentId });
      
      // Reconnect WebSocket
      await this.connectWebSocket(agentId);
      
      this.currentSession.status = 'connected';
      this.emit('reconnected', { agentId, sessionId: this.currentSession.sessionId });
    } catch (error) {
      this.currentSession.status = 'error';
      this.emit('reconnectFailed', { agentId, error });
      throw error;
    }
  }

  isHealthy(): boolean {
    if (!this.currentSession?.isActive) {
      return true; // Not active is considered healthy
    }
    
    const status = this.getConversationStatus();
    return status !== 'error' && status !== 'disconnected';
  }

  getConnectionInfo(): { status: string; isActive: boolean; agentId?: string; sessionId?: string } {
    const result: { status: string; isActive: boolean; agentId?: string; sessionId?: string } = {
      status: this.getConversationStatus(),
      isActive: this.currentSession?.isActive || false,
    };
    
    if (this.currentSession?.agentId) {
      result.agentId = this.currentSession.agentId;
    }
    
    if (this.currentSession?.sessionId) {
      result.sessionId = this.currentSession.sessionId;
    }
    
    return result;
  }

  dispose(): void {
    this.endConversation();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.removeAllListeners();
  }
}

// Factory function for creating agents with different configurations
export function createConversationalAgent(config: ConversationalAgentConfig): ConversationalAgent {
  return new ConversationalAgent(config);
}

// Singleton instance for default crypto assistant
export const cryptoAgent = createConversationalAgent({
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default voice
  agentPrompt: `
You are a knowledgeable crypto and DeFi assistant for NYXUSD, a sophisticated stablecoin protocol. 
You help users with portfolio analysis, yield farming strategies, and DeFi operations.

Key traits:
- Professional but conversational
- Expert in crypto, DeFi, and blockchain technology  
- Patient and educational with beginners
- Direct and efficient with advanced users
- Always prioritize user security and risk management

Keep responses concise (under 150 words) and conversational. Ask follow-up questions to better assist the user.
  `.trim(),
  firstMessage: "Hello! I'm your AI crypto assistant. I can help you analyze your portfolio, find yield opportunities, and navigate DeFi. What would you like to explore today?",
});