// Types for emitted events to provide strong typing for consumers and tests
export interface AgentCreatedEvent {
  agentId: string;
  sessionId: string;
  websocketUrl: string;
  config?: unknown;
}

export interface ConversationStartedEvent {
  agentId: string;
  sessionId: string;
  status: AgentSession['status'];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  conversationId?: string;
}

export interface UserTranscriptEvent {
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

export interface AgentResponseEvent {
  text: string;
  timestamp: Date;
}

export interface AgentSpeakingEvent {
  isFinal: boolean;
}

export interface ConversationEndedEvent {
  reason?: string;
  session: AgentSession | null;
}

export interface WebsocketClosedEvent {
  code: number;
  reason: string;
  wasClean: boolean;
}

export interface ContextUpdatedEvent extends ConversationContext {}

export type ConversationalAgentEvents =
  | { type: 'agentCreated'; payload: AgentCreatedEvent }
  | { type: 'conversationStarted'; payload: ConversationStartedEvent }
  | { type: 'userTranscript'; payload: UserTranscriptEvent }
  | { type: 'agentResponse'; payload: AgentResponseEvent }
  | { type: 'agentSpeaking'; payload: AgentSpeakingEvent }
  | { type: 'agentFinishedSpeaking'; payload: undefined }
  | { type: 'conversationEnded'; payload: ConversationEndedEvent }
  | { type: 'websocketClosed'; payload: WebsocketClosedEvent }
  | { type: 'contextUpdated'; payload: ContextUpdatedEvent }
  | { type: 'reconnecting'; payload: { agentId: string } }
  | { type: 'reconnected'; payload: { agentId: string; sessionId: string } }
  | { type: 'reconnectFailed'; payload: { agentId: string; error: unknown } }
  | { type: 'error'; payload: { type: string; error: unknown } };

// Discriminated union for inbound WebSocket messages
/**
 * Discriminated union for inbound WebSocket messages
 * Exported for reuse across voice modules and tests.
 */
export type InboundWsMessage =
  | { type: 'audio'; audio: string; isFinal?: boolean; normalizedAlignment?: unknown }
  | { type: 'transcription'; text: string; isFinal: boolean; timestamp?: string | number | Date }
  | { type: 'user_transcript'; text: string; is_final: boolean }
  | { type: 'agent_response'; text: string }
  | { type: 'conversation_end'; reason?: string }
  | { type: 'error'; error: unknown };

/**
 * Runtime guards for inbound messages
 */
function isAudioMessage(m: unknown): m is Extract<InboundWsMessage, { type: 'audio' }> {
  return !!m && typeof m === 'object' && (m as any).type === 'audio' && typeof (m as any).audio === 'string';
}
function isTranscriptionMessage(m: unknown): m is Extract<InboundWsMessage, { type: 'transcription' }> {
  return !!m && typeof m === 'object' && (m as any).type === 'transcription' && typeof (m as any).text === 'string' && typeof (m as any).isFinal === 'boolean';
}
function isUserTranscriptMessage(m: unknown): m is Extract<InboundWsMessage, { type: 'user_transcript' }> {
  return !!m && typeof m === 'object' && (m as any).type === 'user_transcript' && typeof (m as any).text === 'string' && typeof (m as any).is_final === 'boolean';
}
function isAgentResponseMessage(m: unknown): m is Extract<InboundWsMessage, { type: 'agent_response' }> {
  return !!m && typeof m === 'object' && (m as any).type === 'agent_response' && typeof (m as any).text === 'string';
}
function isConversationEndMessage(m: unknown): m is Extract<InboundWsMessage, { type: 'conversation_end' }> {
  return !!m && typeof m === 'object' && (m as any).type === 'conversation_end';
}
function isErrorMessage(m: unknown): m is Extract<InboundWsMessage, { type: 'error' }> {
  return !!m && typeof m === 'object' && (m as any).type === 'error';
}

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
  private agentId: string | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private websocketUrl: string | null = null;

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
    this.conversationContext = context || {};

    // Call backend API to create conversational agent securely
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const apiUrl = `${baseUrl}/api/voice/conversational-agent`;

    // Build payload omitting nulls to satisfy server validator
    const payload: any = {
      context: {
        userProfile: context?.userProfile,
        conversationHistory: context?.conversationHistory,
        memoryContext: context?.memoryContext,
        defiCapabilities: context?.defiCapabilities,
      },
      config: {
        voiceId: this.config.voiceId,
        modelId: this.config.ttsConfig?.model,
        language: this.config.language,
        firstMessage:
          this.config.firstMessage ||
          "Hello! I'm NyxUSD, your AI crypto assistant. How can I help you with DeFi today?",
      },
    };
    if (typeof this.sessionId === 'string' && this.sessionId.length > 0) {
      payload.sessionId = this.sessionId;
    }
    if (typeof this.userId === 'string' && this.userId.length > 0) {
      payload.userId = this.userId;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try parse JSON error first; fall back to text
        let details = 'Unknown error';
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.details === 'string') {
            details = errorData.details;
          } else if (typeof (errorData?.error) === 'string') {
            details = errorData.error;
          }
        } catch {
          try {
            const text = await response.text();
            details = text.slice(0, 200);
          } catch {
            // ignore
          }
        }
        throw new Error(`Failed to create conversational agent: ${response.status} ${response.statusText} - ${details}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`Backend error: ${data.error || 'Unknown error'}`);
      }

      // Store agent information
      this.agentId = data.agentId;
      this.sessionId = data.sessionId;
      this.websocketUrl = data.websocketUrl;
      
      // Initialize session for reconnection capability
      this.currentSession = {
        agentId: data.agentId,
        sessionId: data.sessionId,
        status: 'idle',
        isActive: false,
        startTime: new Date(),
      };
      
      this.emit('agentCreated', { 
        agentId: data.agentId,
        sessionId: data.sessionId,
        websocketUrl: data.websocketUrl,
        config: data.config
      });
      
      return data.agentId;
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

    // If we have an existing session from agent creation, use it
    if (this.currentSession && this.currentSession.agentId === agentId) {
      this.currentSession.status = 'connecting';
      this.currentSession.isActive = true;
    } else {
      // Create new session if none exists
      const sessionId = `convai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.currentSession = {
        agentId,
        sessionId,
        status: 'connecting',
        isActive: true,
        startTime: new Date(),
      };
    }

    try {
      await this.connectWebSocket(agentId);
      this.currentSession.status = 'connected';
      this.emit('conversationStarted', this.currentSession);
      return this.currentSession.sessionId;
    } catch (error) {
      this.currentSession.status = 'error';
      this.emit('error', { type: 'connection', error });
      throw error;
    }
  }

  private async connectWebSocket(agentId: string): Promise<void> {
    // Use websocket URL from backend API response if available
    const wsUrl = this.websocketUrl || `wss://api.elevenlabs.io/v1/convai/agents/${agentId}/conversation`;

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
    let data: unknown;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      return;
    }

    // Discriminated handling with guards and exhaustiveness
    if (isAudioMessage(data)) {
      const chunk: AudioChunk = {
        audio: data.audio,
        isFinal: !!data.isFinal,
        normalizedAlignment: (data as any).normalizedAlignment,
      };
      this.handleAudioChunk(chunk);
      return;
    }

    if (isTranscriptionMessage(data)) {
      const chunk: TranscriptionChunk = {
        text: data.text,
        isFinal: data.isFinal,
        timestamp: new Date(
          typeof data.timestamp === 'string' || typeof data.timestamp === 'number'
            ? new Date(data.timestamp).getTime()
            : Date.now()
        ),
      };
      this.handleTranscriptionChunk(chunk);
      return;
    }

    if (isUserTranscriptMessage(data)) {
      this.emit('userTranscript', {
        text: data.text,
        isFinal: data.is_final,
        timestamp: new Date(),
      });
      return;
    }

    if (isAgentResponseMessage(data)) {
      this.emit('agentResponse', {
        text: data.text,
        timestamp: new Date(),
      });
      return;
    }

    if (isConversationEndMessage(data)) {
      this.handleConversationEnd(data);
      return;
    }

    if (isErrorMessage(data)) {
      this.emit('error', { type: 'websocket', error: (data as any).error });
      return;
    }

    // Unknown message shape - ignore safely
    console.log('Unknown WebSocket message payload', data);
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

  private handleConversationEnd(data: { reason?: string } | unknown): void {
    if (this.currentSession) {
      this.currentSession.status = 'idle';
      this.currentSession.isActive = false;
      this.currentSession.endTime = new Date();
    }

    const reason = data && typeof data === 'object' && 'reason' in data ? (data as any).reason : undefined;

    this.emit('conversationEnded', {
      reason,
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
      void this.processAudioQueue();
    }
  }

  private async processAudioQueue(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift();
    if (!audioData || !this.audioContext) {
      this.isPlaying = false;
      return;
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        void this.processAudioQueue();
      };
      
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      // Continue with next chunk; ensure loop advances
      void this.processAudioQueue();
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