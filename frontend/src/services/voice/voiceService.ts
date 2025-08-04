import { EventEmitter } from 'events';
import { ConversationalAgent, ConversationContext, createConversationalAgent } from './conversationalAgent';

export interface VoiceConfig {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  optimizeStreamingLatency?: number;
  enableSsmlParsing?: boolean;
  conversationalMode?: boolean;
}

export interface VoiceSession {
  id: string;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'connecting' | 'connected' | 'thinking';
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  mode?: 'tts' | 'conversational';
  agentId?: string;
}

export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence?: number;
  timestamp: Date;
}

export class VoiceService extends EventEmitter {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: any = null; // SpeechRecognition API
  private currentSession: VoiceSession | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying: boolean = false;
  private config: VoiceConfig;
  private apiKey: string | null = null;
  private conversationalAgent: ConversationalAgent | null = null;
  
  // Dual-mode architecture and fallback support
  private fallbackMode: 'tts' | 'conversational' | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private fallbackTimeout: number = 15000; // 15 seconds
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionState: 'healthy' | 'degraded' | 'failed' = 'healthy';
  private lastError: Error | null = null;

  constructor(config?: VoiceConfig) {
    super();
    this.config = config || {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default voice (Sarah)
      modelId: 'eleven_turbo_v2_5',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0,
      useSpeakerBoost: true,
      optimizeStreamingLatency: 2,
      enableSsmlParsing: false,
      conversationalMode: false,
    };
    this.initializeAudioContext();
    this.initializeSpeechRecognition();
    this.startHealthMonitoring();
  }

  // Dual-mode architecture and fallback mechanisms
  private startHealthMonitoring(): void {
    // Monitor connection health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.currentSession?.isActive) return;

    try {
      // Check if conversational mode is working
      if (this.config.conversationalMode && this.conversationalAgent) {
        const status = this.conversationalAgent.getConversationStatus();
        if (status === 'error' || status === 'disconnected') {
          await this.handleConversationalModeFailure('health_check_failed');
        }
      }

      // Check WebSocket connection for TTS mode
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        await this.handleTTSConnectionFailure('websocket_disconnected');
      }

      // Reset connection state if no recent errors
      const errorTime = this.lastError ? Date.now() - new Date().getTime() : 0;
      if (this.connectionState !== 'healthy' && errorTime > 60000) {
        this.connectionState = 'healthy';
        this.retryCount = 0;
        this.emit('connectionRecovered');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      this.handleGenericError(error as Error);
    }
  }

  private async handleConversationalModeFailure(reason: string): Promise<void> {
    console.warn('Conversational mode failure detected:', reason);
    this.connectionState = 'degraded';
    this.lastError = new Error(`Conversational mode failed: ${reason}`);
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.emit('fallbackAttempt', { mode: 'conversational', retry: this.retryCount, reason });
      
      try {
        // Attempt to restart conversational agent
        if (this.conversationalAgent) {
          await this.conversationalAgent.reconnect();
        } else {
          await this.initializeConversationalAgent();
        }
      } catch (error) {
        console.error('Failed to restart conversational mode:', error);
        await this.fallbackToTTSMode(reason);
      }
    } else {
      await this.fallbackToTTSMode(reason);
    }
  }

  private async handleTTSConnectionFailure(reason: string): Promise<void> {
    console.warn('TTS connection failure detected:', reason);
    this.connectionState = 'degraded';
    this.lastError = new Error(`TTS connection failed: ${reason}`);
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.emit('fallbackAttempt', { mode: 'tts', retry: this.retryCount, reason });
      
      try {
        // Attempt to reconnect WebSocket
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
        await this.connectWebSocket();
      } catch (error) {
        console.error('Failed to reconnect TTS WebSocket:', error);
        if (this.config.conversationalMode) {
          await this.fallbackToConversationalMode(reason);
        } else {
          this.handleConnectionFailure(reason);
        }
      }
    } else {
      if (this.config.conversationalMode) {
        await this.fallbackToConversationalMode(reason);
      } else {
        this.handleConnectionFailure(reason);
      }
    }
  }

  private async fallbackToTTSMode(reason: string): Promise<void> {
    console.log('Falling back to TTS mode due to:', reason);
    this.fallbackMode = 'tts';
    this.connectionState = 'degraded';
    
    try {
      // Disable conversational mode temporarily
      const originalMode = this.config.conversationalMode;
      this.config.conversationalMode = false;
      
      // Initialize TTS-only mode
      await this.connectWebSocket();
      
      this.emit('fallbackToTTS', { reason, originalMode });
      this.emit('modeChanged', { from: 'conversational', to: 'tts', reason: 'fallback' });
      
      // Try to recover conversational mode after a delay
      setTimeout(() => {
        this.attemptConversationalModeRecovery(originalMode || false);
      }, this.fallbackTimeout);
      
    } catch (error) {
      console.error('Fallback to TTS mode failed:', error);
      this.handleConnectionFailure('fallback_failed');
    }
  }

  private async fallbackToConversationalMode(reason: string): Promise<void> {
    console.log('Falling back to conversational mode due to:', reason);
    this.fallbackMode = 'conversational';
    this.connectionState = 'degraded';
    
    try {
      // Enable conversational mode temporarily
      const originalMode = this.config.conversationalMode;
      this.config.conversationalMode = true;
      
      // Initialize conversational agent if not available
      if (!this.conversationalAgent) {
        await this.initializeConversationalAgent();
      }
      
      this.emit('fallbackToConversational', { reason, originalMode });
      this.emit('modeChanged', { from: 'tts', to: 'conversational', reason: 'fallback' });
      
      // Try to recover TTS mode after a delay
      setTimeout(() => {
        this.attemptTTSModeRecovery(originalMode || false);
      }, this.fallbackTimeout);
      
    } catch (error) {
      console.error('Fallback to conversational mode failed:', error);
      this.handleConnectionFailure('fallback_failed');
    }
  }

  private async attemptConversationalModeRecovery(originalMode: boolean): Promise<void> {
    if (!originalMode || this.connectionState === 'failed') return;
    
    try {
      console.log('Attempting to recover conversational mode...');
      this.config.conversationalMode = originalMode;
      
      if (!this.conversationalAgent) {
        await this.initializeConversationalAgent();
      }
      
      // Test the connection
      const status = this.conversationalAgent?.getConversationStatus();
      if (status && status !== 'error') {
        this.fallbackMode = null;
        this.connectionState = 'healthy';
        this.retryCount = 0;
        this.emit('conversationalModeRecovered');
        this.emit('modeChanged', { from: 'tts', to: 'conversational', reason: 'recovery' });
      }
    } catch (error) {
      console.error('Conversational mode recovery failed:', error);
      // Stay in fallback mode
    }
  }

  private async attemptTTSModeRecovery(originalMode: boolean): Promise<void> {
    if (originalMode || this.connectionState === 'failed') return;
    
    try {
      console.log('Attempting to recover TTS mode...');
      this.config.conversationalMode = originalMode;
      
      // Test WebSocket connection
      await this.connectWebSocket();
      
      this.fallbackMode = null;
      this.connectionState = 'healthy';
      this.retryCount = 0;
      this.emit('ttsModeRecovered');
      this.emit('modeChanged', { from: 'conversational', to: 'tts', reason: 'recovery' });
    } catch (error) {
      console.error('TTS mode recovery failed:', error);
      // Stay in fallback mode
    }
  }

  private handleConnectionFailure(reason: string): void {
    console.error('All connection attempts failed:', reason);
    this.connectionState = 'failed';
    
    if (this.currentSession) {
      this.currentSession.status = 'error';
    }
    
    this.emit('connectionFailed', { reason, retryCount: this.retryCount });
    
    // Provide user-friendly error message
    const errorMessage = this.getUserFriendlyErrorMessage(reason);
    this.emit('userMessage', { 
      type: 'error', 
      message: errorMessage,
      canRetry: true
    });
  }

  private handleGenericError(error: Error): void {
    this.lastError = error;
    this.connectionState = 'degraded';
    console.error('Voice service error:', error);
    
    // Try to determine the best fallback based on the error
    if (error.message.includes('conversational') || error.message.includes('agent')) {
      this.handleConversationalModeFailure(error.message);
    } else if (error.message.includes('websocket') || error.message.includes('tts')) {
      this.handleTTSConnectionFailure(error.message);
    } else {
      this.emit('error', error);
    }
  }

  private getUserFriendlyErrorMessage(reason: string): string {
    switch (reason) {
      case 'websocket_disconnected':
        return 'Voice connection lost. Trying to reconnect...';
      case 'health_check_failed':
        return 'Voice service temporarily unavailable. Switching to backup mode...';
      case 'fallback_failed':
        return 'Unable to establish voice connection. Please check your internet connection and try again.';
      default:
        return 'Voice service is experiencing issues. We\'re working to restore normal operation.';
    }
  }

  // Public method to manually trigger fallback for testing
  public async triggerFallback(mode: 'tts' | 'conversational', reason: string = 'manual'): Promise<void> {
    if (mode === 'tts') {
      await this.fallbackToTTSMode(reason);
    } else {
      await this.fallbackToConversationalMode(reason);
    }
  }

  // Public method to check current connection health
  public getConnectionHealth(): { state: string; mode: string; fallbackMode: string | null; retryCount: number } {
    return {
      state: this.connectionState,
      mode: this.config.conversationalMode ? 'conversational' : 'tts',
      fallbackMode: this.fallbackMode,
      retryCount: this.retryCount
    };
  }

  private initializeAudioContext(): void {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript;
          const isFinal = result.isFinal;

          const transcriptionResult: TranscriptionResult = {
            text: transcript,
            isFinal,
            confidence: result[0].confidence,
            timestamp: new Date(),
          };

          this.emit('transcription', transcriptionResult);

          if (isFinal) {
            this.emit('finalTranscription', transcriptionResult);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          const error = new Error(`Speech recognition failed: ${event.error}`);
          this.handleGenericError(error);
        };

        this.recognition.onend = () => {
          if (this.currentSession?.isActive) {
            // Restart recognition if session is still active
            this.recognition.start();
          }
        };
      } else {
        console.warn('Speech Recognition API not available');
      }
    }
  }

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    await this.requestMicrophonePermission();
    
    // Initialize conversational agent if in conversational mode
    if (this.config.conversationalMode) {
      await this.initializeConversationalAgent();
    }
  }

  private async initializeConversationalAgent(): Promise<void> {
    if (!this.apiKey || !this.config.voiceId) {
      throw new Error('API key and voice ID required for conversational mode');
    }

    // Check if conversational mode is properly configured on backend
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/voice-config`);
      const configData = await response.json();
      
      if (!configData.success || !configData.config.features.conversationalMode) {
        throw new Error('Conversational mode not available on backend');
      }
    } catch (error) {
      console.warn('Conversational mode not available, will fallback to TTS:', error);
      throw new Error('Conversational mode not configured on backend');
    }

    this.conversationalAgent = createConversationalAgent({
      voiceId: this.config.voiceId,
      ttsConfig: {
        voiceSettings: {
          stability: this.config.stability || 0.5,
          similarity_boost: this.config.similarityBoost || 0.75,
          ...(this.config.style !== undefined && { style: this.config.style }),
          ...(this.config.useSpeakerBoost !== undefined && { use_speaker_boost: this.config.useSpeakerBoost }),
        },
        model: this.config.modelId,
      },
    });

    await this.conversationalAgent.initialize(this.apiKey);
    this.setupConversationalAgentListeners();
  }

  private setupConversationalAgentListeners(): void {
    if (!this.conversationalAgent) return;

    this.conversationalAgent.on('conversationStarted', (session) => {
      if (this.currentSession) {
        this.currentSession.agentId = session.agentId;
        this.currentSession.status = 'connected';
      }
      this.emit('conversationStarted', session);
    });

    this.conversationalAgent.on('transcription', (result) => {
      this.emit('transcription', result);
    });

    this.conversationalAgent.on('userTranscript', (transcript) => {
      this.emit('userTranscript', transcript);
    });

    this.conversationalAgent.on('agentResponse', (response) => {
      this.emit('agentResponse', response);
    });

    this.conversationalAgent.on('agentSpeaking', (data) => {
      if (this.currentSession) {
        this.currentSession.status = 'speaking';
      }
      this.emit('agentSpeaking', data);
    });

    this.conversationalAgent.on('agentFinishedSpeaking', () => {
      if (this.currentSession) {
        this.currentSession.status = 'listening';
      }
      this.emit('agentFinishedSpeaking');
    });

    this.conversationalAgent.on('conversationEnded', (data) => {
      if (this.currentSession) {
        this.currentSession.status = 'idle';
        this.currentSession.isActive = false;
        this.currentSession.endTime = new Date();
      }
      this.emit('conversationEnded', data);
    });

    this.conversationalAgent.on('error', (error) => {
      if (this.currentSession) {
        this.currentSession.status = 'error';
      }
      this.emit('error', error);
    });
  }

  private async requestMicrophonePermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      this.emit('permissionGranted');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      this.emit('permissionDenied', error);
      throw new Error('Microphone permission required for voice chat');
    }
  }

  async startSession(context?: ConversationContext): Promise<string> {
    if (this.currentSession?.isActive) {
      throw new Error('Voice session already active');
    }

    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      status: this.config.conversationalMode ? 'connecting' : 'idle',
      isActive: true,
      startTime: new Date(),
      mode: this.config.conversationalMode ? 'conversational' : 'tts',
    };

    // Start conversational session if in conversational mode
    if (this.config.conversationalMode && this.conversationalAgent) {
      try {
        // Create agent first
        const agentId = await this.conversationalAgent.createAgent(context);
        this.currentSession.agentId = agentId;
        
        // Start conversation
        await this.conversationalAgent.startConversation(agentId, context);
      } catch (error) {
        this.currentSession.status = 'error';
        this.handleGenericError(error as Error);
        throw error;
      }
    }

    this.emit('sessionStarted', this.currentSession);
    return sessionId;
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    // End conversational session if in conversational mode
    if (this.config.conversationalMode && this.conversationalAgent) {
      await this.conversationalAgent.endConversation();
    } else {
      // Regular TTS mode cleanup
      this.stopListening();
      this.stopSpeaking();
      
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }

    this.currentSession.isActive = false;
    this.currentSession.endTime = new Date();
    this.currentSession.status = 'idle';

    this.emit('sessionEnded', this.currentSession);
    this.currentSession = null;
  }

  async startListening(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active voice session');
    }

    if (this.recognition) {
      this.currentSession.status = 'listening';
      this.recognition.start();
      this.emit('listeningStarted');
    } else {
      throw new Error('Speech recognition not available');
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      if (this.currentSession) {
        this.currentSession.status = 'idle';
      }
      this.emit('listeningStopped');
    }
  }

  async speakText(text: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active voice session');
    }

    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    this.currentSession.status = 'speaking';
    this.emit('speakingStarted', text);

    try {
      await this.connectWebSocket();
      await this.sendTextToTTS(text);
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      this.currentSession.status = 'error';
      this.handleGenericError(error as Error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const voiceId = this.config.voiceId;
    const modelId = this.config.modelId;
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}&optimize_streaming_latency=${this.config.optimizeStreamingLatency}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Send initial configuration
        const initMessage = {
          text: ' ',
          voice_settings: {
            stability: this.config.stability,
            similarity_boost: this.config.similarityBoost,
            style: this.config.style,
            use_speaker_boost: this.config.useSpeakerBoost,
          },
          generation_config: {
            chunk_length_schedule: [50],
          },
          xi_api_key: this.apiKey,
        };
        this.ws!.send(JSON.stringify(initMessage));
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        const wsError = new Error('WebSocket connection failed');
        this.handleGenericError(wsError);
        reject(wsError);
      };

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.audio) {
          const audioData = atob(data.audio);
          const audioArray = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i);
          }
          await this.playAudio(audioArray.buffer);
        }

        if (data.isFinal) {
          this.emit('speakingFinished');
          if (this.currentSession) {
            this.currentSession.status = 'idle';
          }
        }
      };

      this.ws.onclose = () => {
        this.emit('websocketClosed');
      };
    });
  }

  private async sendTextToTTS(text: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    // Split text into chunks for better streaming
    const chunks = this.splitTextIntoChunks(text);
    
    for (const chunk of chunks) {
      const message = {
        text: chunk,
        flush: false,
      };
      this.ws.send(JSON.stringify(message));
    }

    // Send final flush to generate remaining audio
    this.ws.send(JSON.stringify({ text: '', flush: true }));
  }

  private splitTextIntoChunks(text: string, maxChunkSize: number = 100): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
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

  stopSpeaking(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.currentSession) {
      this.currentSession.status = 'idle';
    }
    
    this.emit('speakingStopped');
  }

  setVoiceConfig(config: Partial<VoiceConfig>): void {
    const oldConversationalMode = this.config.conversationalMode;
    this.config = { ...this.config, ...config };
    
    // If conversational mode changed, reinitialize if needed
    if (this.config.conversationalMode !== oldConversationalMode && this.apiKey) {
      if (this.config.conversationalMode && !this.conversationalAgent) {
        this.initializeConversationalAgent().catch(console.error);
      }
    }
    
    this.emit('configUpdated', this.config);
  }

  // Conversational mode methods
  async enableConversationalMode(context?: ConversationContext): Promise<void> {
    if (this.config.conversationalMode) return;
    
    this.config.conversationalMode = true;
    
    if (this.apiKey && !this.conversationalAgent) {
      await this.initializeConversationalAgent();
    }
    
    // If there's an active session, restart it in conversational mode
    if (this.currentSession?.isActive) {
      const sessionContext = context;
      await this.endSession();
      await this.startSession(sessionContext);
    }
    
    this.emit('conversationalModeEnabled');
  }

  async disableConversationalMode(): Promise<void> {
    if (!this.config.conversationalMode) return;
    
    this.config.conversationalMode = false;
    
    // End current conversation if active
    if (this.currentSession?.isActive && this.currentSession.mode === 'conversational') {
      await this.endSession();
    }
    
    // Clean up conversational agent
    if (this.conversationalAgent) {
      this.conversationalAgent.dispose();
      this.conversationalAgent = null;
    }
    
    this.emit('conversationalModeDisabled');
  }

  updateConversationContext(context: Partial<ConversationContext>): void {
    if (this.conversationalAgent) {
      this.conversationalAgent.updateContext(context);
    }
  }

  isConversationalMode(): boolean {
    return this.config.conversationalMode || false;
  }

  getConversationalStatus(): string {
    if (this.conversationalAgent) {
      return this.conversationalAgent.getConversationStatus();
    }
    return 'idle';
  }

  getVoiceConfig(): VoiceConfig {
    return { ...this.config };
  }

  getCurrentSession(): VoiceSession | null {
    return this.currentSession;
  }

  isSessionActive(): boolean {
    return this.currentSession?.isActive || false;
  }

  getSessionStatus(): string {
    return this.currentSession?.status || 'idle';
  }

  // Cleanup method
  dispose(): void {
    this.endSession();
    
    // Clean up health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.conversationalAgent) {
      this.conversationalAgent.dispose();
      this.conversationalAgent = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    // Reset fallback state
    this.fallbackMode = null;
    this.retryCount = 0;
    this.connectionState = 'healthy';
    this.lastError = null;
    
    this.removeAllListeners();
  }
}

// Singleton instance
export const voiceService = new VoiceService();