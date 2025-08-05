// Local minimal SpeechRecognition interface to avoid `any`
export interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string; confidence: number }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string; name?: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

// Strongly-typed user-facing message events
export type StatusMessageEvent = {
  type: 'status';
  message: string;
  level: 'info' | 'warning' | 'error';
};

export type UserMessageEvent = {
  type: 'user';
  message: string;
  canRetry?: boolean;
};

export type AgentMessageEvent = {
  type: 'agent';
  message: string;
};

// Unified outbound UI event discriminated union
export type UIEvent = StatusMessageEvent | UserMessageEvent | AgentMessageEvent;

// Fix: lastError age computation helper
export function msSince(date: Date): number {
  return Date.now() - date.getTime();
}
import { EventEmitter } from 'events';
import { ConversationalAgent, createConversationalAgent, type ConversationContext } from './conversationalAgent';
import { secureVoiceClient } from './secureVoiceClient';

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
  private recognition: ISpeechRecognition | null = null; // SpeechRecognition API
  private currentSession: VoiceSession | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying: boolean = false;
  private config: VoiceConfig;
  private apiKey: string | null = null;
  private conversationalAgent: ConversationalAgent | null = null;

  // STT recording state
  private sttStream: MediaStream | null = null;
  private sttChunks: Blob[] = [];
  private sttRecording: boolean = false;
  
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
      voiceId: '', // Will be populated from server config
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
    
   // Emit user-friendly status message
   const friendlyMessage = this.getUserFriendlyFallbackMessage(reason);
   const statusEvent: StatusMessageEvent = {
     type: 'status',
     message: friendlyMessage,
     level: 'warning'
   };
   this.emit('statusMessage', statusEvent);
    
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
    // JSDoc: Guard - ensure we pass an Error instance to formatter
    const errorMessage = this.getUserFriendlyErrorMessage(new Error(String(reason)));
    this.emit('userMessage', {
      type: 'user',
      message: errorMessage,
      canRetry: true
    });
  }

  private handleGenericError(error: Error): void {
    this.lastError = error;
    this.connectionState = 'degraded';
    console.error('Voice service error:', error);
    
    // Convert technical error to user-friendly message
    const userFriendlyError = this.getUserFriendlyErrorMessage(error);
    
    // Try to determine the best fallback based on the error
    if (error.message.includes('conversational') || error.message.includes('agent')) {
      this.handleConversationalModeFailure(error.message);
    } else if (error.message.includes('websocket') || error.message.includes('tts')) {
      this.handleTTSConnectionFailure(error.message);
    } else {
      // Emit user-friendly error instead of technical error
      const friendlyError = new Error(userFriendlyError);
      friendlyError.name = 'VoiceServiceError';
      this.emit('error', friendlyError);
    }
  }

  private getUserFriendlyErrorMessage(error: Error): string {
    // Guard: avoid toLowerCase on undefined message
    const raw = (error && typeof error.message === 'string') ? error.message : '';
    const message = raw.toLowerCase();
    
    // Environment/Configuration errors
    if (message.includes('elevenlabs_api_key') || message.includes('not configured')) {
      return 'Voice service is not configured. Please check your settings.';
    }
    
    // Permission errors
    if (message.includes('microphone permission') || message.includes('getusermedia')) {
      return 'Microphone permission is required for voice chat. Please allow microphone access and try again.';
    }
    
    // Network/Connection errors
    if (message.includes('websocket') || message.includes('connection')) {
      return 'Voice connection lost. Trying to reconnect...';
    }
    
    // API errors
    if (message.includes('405') || message.includes('method not allowed')) {
      return 'Voice service temporarily unavailable. Trying alternative mode...';
    }
    
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Voice service authentication failed. Please refresh the page.';
    }
    
    if (message.includes('500') || message.includes('internal server error')) {
      return 'Voice service is experiencing issues. Attempting to recover...';
    }
    
    // Conversational mode specific errors
    if (message.includes('conversational') || message.includes('agent')) {
      return 'Advanced voice chat unavailable. Switching to basic voice mode...';
    }
    
    // Speech recognition errors
    if (message.includes('speech recognition') || message.includes('not-allowed')) {
      return 'Speech recognition unavailable. Please check microphone permissions.';
    }
    
    // Generic fallback
    return 'Voice chat encountered an issue. Trying to recover...';
  }

  private getUserFriendlyFallbackMessage(reason: string): string {
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
      console.log('🎤 VoiceService: Initializing speech recognition...');
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        console.log('🎤 VoiceService: Speech recognition API available');
       this.recognition = new SpeechRecognition() as ISpeechRecognition;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        console.log('🎤 VoiceService: Speech recognition configured');

        this.recognition.onresult = (event) => {
          const results = event.results;
          if (!results || results.length === 0) {
            return;
          }
          const last = results[results.length - 1];
          // Runtime guard to ensure expected shape
          if (!last || !last[0] || typeof last[0].transcript !== 'string') {
            return;
          }
          const transcript = last[0].transcript as string;
          const isFinal = !!last.isFinal;

          console.log('🎤 VoiceService: Speech recognition result:', { transcript, isFinal });

          const transcriptionResult: TranscriptionResult = {
            text: transcript,
            isFinal,
            confidence: typeof last[0].confidence === 'number' ? last[0].confidence : undefined,
            timestamp: new Date(),
          };

          this.emit('transcription', transcriptionResult);

          if (isFinal) {
            console.log('🎤 VoiceService: Final transcription:', transcript);
            this.emit('finalTranscription', transcriptionResult);
          }
        };

        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          
          // Friendly bubble-up error for UI
          const normalized = String(event.error || '').toLowerCase();

          // Stop the infinite restart loop on network-like or permission errors
          if (normalized === 'network' || normalized === 'service-not-allowed' || normalized === 'not-allowed' || normalized === 'aborted') {
            console.warn('🎤 VoiceService: Disabling speech recognition due to persistent errors');
            if (this.currentSession) {
              this.currentSession.status = 'error';
              this.currentSession.isActive = false;
            }
            const friendlyMessage =
              normalized === 'not-allowed' || normalized === 'service-not-allowed'
                ? 'Microphone permission is required for voice chat. Please allow access in your browser settings.'
                : 'Speech recognition unavailable due to a network or service issue. Please retry.';
            this.emit('error', new Error(friendlyMessage));
            return;
          }
          
          const error = new Error(`Speech recognition failed: ${event.error}`);
          this.handleGenericError(error);
        };

        this.recognition.onend = () => {
          // Only restart if session is active and no persistent errors occurred
          if (this.currentSession?.isActive && this.currentSession.status !== 'error') {
            try {
              // Add a small delay to prevent rapid restarts
              setTimeout(() => {
                if (this.recognition && this.currentSession?.isActive && this.currentSession.status !== 'error') {
                  try {
                    this.recognition.start();
                  } catch (e: any) {
                    // If already active or blocked, surface friendly info and stop restart loop
                    if (e?.name === 'InvalidStateError') {
                      console.warn('🎤 VoiceService: Recognition already active on onend restart path');
                      return;
                    }
                    console.error('🎤 VoiceService: Restart recognition failed:', e);
                    if (this.currentSession) {
                      this.currentSession.status = 'error';
                      this.currentSession.isActive = false;
                    }
                    this.emit('error', e instanceof Error ? e : new Error('Failed to restart speech recognition'));
                  }
                }
              }, 150);
            } catch (restartError) {
              console.error('🎤 VoiceService: Failed to restart recognition:', restartError);
              if (this.currentSession) {
                this.currentSession.status = 'error';
                this.currentSession.isActive = false;
              }
            }
          }
        };
      } else {
        console.warn('🎤 VoiceService: Speech Recognition API not available in this browser');
      }
    }
  }

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    // Note: Microphone permission is now requested when user starts voice chat
    
    // Initialize conversational agent if in conversational mode
    if (this.config.conversationalMode) {
      await this.initializeConversationalAgent();
    }
  }

  private async initializeConversationalAgent(): Promise<void> {
    if (!this.apiKey || !this.config.voiceId) {
      console.warn('🎤 VoiceService: API key and voice ID required for conversational mode');
      throw new Error('API key and voice ID required for conversational mode');
    }

    // Check if conversational mode is properly configured on backend
    try {
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const response = await fetch(`${apiUrl}/api/voice-config`);
      
      // Guard: always check response.ok before attempting to parse body
      // This prevents consuming an error body that might not be JSON.
      if (!response.ok) {
        throw new Error(`Voice config request failed: ${response.status} ${response.statusText}`);
      }
      
      // Guard: safely parse JSON and ensure we have an object
      const configDataRaw = await response.json().catch(() => null);
      if (!configDataRaw || typeof configDataRaw !== 'object') {
        throw new Error('Invalid voice config response: non-object JSON');
      }
      const configData: any = configDataRaw;
      
      console.log('🎤 VoiceService: Voice config response:', {
        success: (configData as any)?.success,
        apiStatus: (configData as any)?.apiStatus,
        hasFeatures: !!(configData as any)?.config?.features,
        conversationalMode: (configData as any)?.config?.features?.conversationalMode
      });
      
      // Guard: verify explicit success before accessing other fields
      if ((configData as any)?.success !== true) {
        const msg = typeof (configData as any)?.error === 'string' && (configData as any)?.error.length > 0
          ? (configData as any).error
          : 'Unknown error';
        throw new Error(`Voice config error: ${msg}`);
      }
      
      // Guard: feature flags object existence before access
      if (!configData.config || !configData.config.features || configData.config.features.conversationalMode !== true) {
        console.warn('🎤 VoiceService: Conversational mode not available on backend, will fallback to TTS');
        throw new Error('Conversational mode not available - backend not configured');
      }
      
      console.log('🎤 VoiceService: Conversational mode available, proceeding with initialization');
    } catch (error) {
      console.warn('🎤 VoiceService: Conversational mode initialization failed:', error);
      this.fallbackMode = 'tts'; // Set fallback mode
      throw error instanceof Error ? error : new Error('Conversational mode initialization failed');
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

    // Request microphone permission when user actually starts voice chat
    try {
      await this.requestMicrophonePermission();
    } catch (error) {
      console.error('🎤 VoiceService: Microphone permission denied:', error);
      throw new Error('Microphone permission required for voice chat');
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
    console.log('🎤 VoiceService: startListening called', {
      hasSession: !!this.currentSession,
      hasRecognition: !!this.recognition,
      currentStatus: this.currentSession?.status,
      isActive: this.currentSession?.isActive
    });
    
    if (!this.currentSession) {
      throw new Error('No active voice session');
    }

    // Don't start if already listening or in error state
    if (this.currentSession.status === 'listening') {
      console.log('🎤 VoiceService: Already listening, ignoring start request');
      return;
    }

    if (this.currentSession.status === 'error') {
      console.log('🎤 VoiceService: Session in error state, cannot start listening');
      throw new Error('Voice session is in error state');
    }

    // Attempt to resume audio prior to starting recognition (some browsers require user gesture already handled by UI)
    await this.resumeAudio();

    // Ensure microphone permission (if session was started without permission succeed)
    try {
      await this.requestMicrophonePermission();
    } catch (permErr) {
      this.emit('error', permErr instanceof Error ? permErr : new Error('Microphone permission required'));
      throw permErr instanceof Error ? permErr : new Error('Microphone permission required');
    }

    if (this.recognition) {
      console.log('🎤 VoiceService: Starting speech recognition...');
      this.currentSession.status = 'listening';
      
      try {
        this.recognition.start();
        console.log('🎤 VoiceService: Speech recognition started successfully');
        this.emit('listeningStarted');
      } catch (error: any) {
        console.error('🎤 VoiceService: Error starting speech recognition:', error);
        
        // If recognition is already started, don't treat it as an error
        if (error.name === 'InvalidStateError' && (error.message?.includes('already started') || error.message?.includes('already active'))) {
          console.log('🎤 VoiceService: Recognition already active');
          this.emit('listeningStarted');
          return;
        }

        // Surface a friendly error for common cases
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          const friendly = new Error('Microphone permission is required for voice chat. Please allow access and try again.');
          this.currentSession.status = 'error';
          this.emit('error', friendly);
          throw friendly;
        }
        
        this.currentSession.status = 'error';
        throw error;
      }
    } else {
      console.error('🎤 VoiceService: Speech recognition not available');
      const e = new Error('Speech recognition not available');
      this.emit('error', e);
      throw e;
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

  resetSession(): void {
    console.log('🎤 VoiceService: Resetting voice session');
    
    // Stop any ongoing recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
    
    // Reset session state
    if (this.currentSession) {
      this.currentSession.status = 'idle';
      this.currentSession.isActive = false;
    }
    
    // Reset error counters
    this.retryCount = 0;
    // JSDoc: Guard - connectionState is a health indicator, reset to healthy
    this.connectionState = 'healthy';
    this.lastError = null;
    
    this.emit('sessionReset');
  }

  async speakText(text: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active voice session');
    }

    // We now route TTS through our secure backend instead of direct ElevenLabs WS.
    this.currentSession.status = 'speaking';
    this.emit('speakingStarted', text);

    try {
      // Ensure audio context is resumed before attempting playback (handles autoplay policies)
      await this.resumeAudio();

      // Always prefer server-advertised defaultVoiceId/modelId from /api/voice-config via secureVoiceClient
      // to honor Vercel env (ELEVENLABS_DEFAULT_VOICE_ID, ELEVENLABS_MODEL_ID)
      const serverCfg = await secureVoiceClient.getConfig().catch(() => null as any);
      const advertisedVoiceId =
        (serverCfg && serverCfg.config && typeof serverCfg.config.defaultVoiceId === 'string' && serverCfg.config.defaultVoiceId) || null;
      const advertisedModelId =
        (serverCfg && serverCfg.config && typeof serverCfg.config.modelId === 'string' && serverCfg.config.modelId) || null;

      const cfg = this.getVoiceConfig();
      const voiceId = cfg.voiceId || advertisedVoiceId || '';
      const modelId = cfg.modelId || advertisedModelId || 'eleven_turbo_v2_5';

      console.log('🎤 VoiceService: TTS request start', { voiceId, modelId, textLen: (text || '').length });

      const audioBuffer = await secureVoiceClient.textToSpeech(text, voiceId, modelId);

      console.log('🎤 VoiceService: TTS response received', { bytes: (audioBuffer && (audioBuffer as ArrayBuffer).byteLength) || 0 });

      // Quick sanity probe: first few bytes (MPEG frames often start with 0xFF)
      try {
        const view = new Uint8Array(audioBuffer);
        const head = Array.from(view.slice(0, 8));
        console.log('🎤 VoiceService: TTS response head bytes', head);
      } catch (e) {
        console.warn('🎤 VoiceService: Unable to inspect audio buffer head');
      }

      await this.playAudio(audioBuffer);

      // Emit finished when queue drains; we keep current queue processing behavior
      // The play pipeline will shift chunks and trigger subsequent calls
      // For a single TTS call, mark status back to idle after enqueue
      if (this.currentSession) {
        this.currentSession.status = 'idle';
      }
      this.emit('speakingFinished');
    } catch (error) {
      console.error('🎤 VoiceService: Error in text-to-speech', error);
      if (this.currentSession) {
        this.currentSession.status = 'error';
      }
      this.handleGenericError(error as Error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const voiceId = this.config.voiceId;
    const modelId = this.config.modelId;
    // Guard: ensure required config fields exist before constructing URL
    if (!voiceId || !modelId) {
      // JSDoc: Guard ensures we don't construct an invalid WS URL with undefined params
      throw new Error('Missing voice or model configuration for TTS WebSocket');
    }
    const optLatency = typeof this.config.optimizeStreamingLatency === 'number' ? this.config.optimizeStreamingLatency : 0;
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}&optimize_streaming_latency=${optLatency}`;

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
        // Guard: Parse JSON defensively and validate structure
        let data: any = null;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('WebSocket message parse error:', e);
          // JSDoc: Guard prevents runtime errors on malformed WS messages; we drop the message
          return;
        }
        
        try {
          if (data && typeof data === 'object' && typeof data.audio === 'string' && data.audio.length > 0) {
            const audioData = atob(data.audio);
            const audioArray = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              audioArray[i] = audioData.charCodeAt(i);
            }
            await this.playAudio(audioArray.buffer);
          }

          if (data && typeof data === 'object' && (data.isFinal === true || data.is_final === true)) {
            this.emit('speakingFinished');
            if (this.currentSession) {
              this.currentSession.status = 'idle';
            }
          }
        } catch (innerError) {
          console.error('Error handling WebSocket message:', innerError);
          // Keep connection alive; surface as generic error without breaking flow
          this.handleGenericError(innerError as Error);
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

  /**
   * Guarded text splitter for streaming TTS.
   * Ensures input is a non-empty string and avoids string ops on null/undefined.
   */
  private splitTextIntoChunks(text: string, maxChunkSize: number = 100): string[] {
    // Guard: ensure text is a safe string
    const safeText = typeof text === 'string' ? text : '';
    if (safeText.length === 0) {
      return [];
    }
    const sentences = safeText.match(/[^.!?]+[.!?]+/g) || [safeText];
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const candidate = `${currentChunk}${sentence}`;
      if (candidate.length <= maxChunkSize) {
        currentChunk = candidate;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

 private async playAudio(audioData: ArrayBuffer): Promise<void> {
   if (!this.audioContext) {
     console.warn('🎤 VoiceService: No AudioContext available');
     return;
   }

   // Attempt to resume if suspended (common after page load until user gesture)
   if (this.audioContext.state === 'suspended') {
     try {
       console.log('🎤 VoiceService: AudioContext suspended, attempting resume');
       await this.audioContext.resume();
       console.log('🎤 VoiceService: AudioContext state after resume', this.audioContext.state);
     } catch (e) {
       console.warn('🎤 VoiceService: Failed to resume AudioContext', e);
     }
   }

   console.log('🎤 VoiceService: Queueing audio buffer', { bytes: audioData.byteLength, queueLen: this.audioQueue.length });

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
      console.log('🎤 VoiceService: Decoding audio data...');
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      console.log('🎤 VoiceService: Decoded buffer', { duration: audioBuffer.duration, sampleRate: audioBuffer.sampleRate, channels: audioBuffer.numberOfChannels });
 
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        console.log('🎤 VoiceService: Source ended, advancing queue');
        void this.processAudioQueue();
      };
      
      source.start();
      console.log('🎤 VoiceService: Playback started');
    } catch (error: any) {
      // decodeAudioData frequently throws when body is JSON or empty buffer
      console.error('🎤 VoiceService: Error decoding/playing audio', {
        name: error?.name, message: error?.message
      });
      void this.processAudioQueue(); // Continue with next chunk
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

  // Public: resume AudioContext to satisfy autoplay policies
  public async resumeAudio(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {
        // ignore
      }
    }
  }

  // Public: unlock by playing a short silent buffer
  public async unlockAudio(): Promise<void> {
    if (!this.audioContext) return;
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch {
      // ignore unlock errors
    }
  }

  // Speech-to-Text (STT) using backend Whisper endpoint
  public async startSttRecording(mimeType: string = 'audio/webm'): Promise<void> {
    if (this.sttRecording) return;
    // Get mic
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.sttStream = stream;
    this.sttChunks = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder = mediaRecorder;
    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        this.sttChunks.push(ev.data);
      }
    };
    mediaRecorder.start(100); // small chunks
    this.sttRecording = true;
    this.emit('listeningStarted');
  }

  public async stopSttRecordingAndTranscribe(): Promise<string> {
    if (!this.sttRecording || !this.mediaRecorder) {
      throw new Error('STT not recording');
    }
    const mediaRecorder = this.mediaRecorder;
    const stopped = new Promise<void>((resolve) => {
      mediaRecorder.onstop = () => resolve();
    });
    mediaRecorder.stop();
    await stopped;

    const blob = new Blob(this.sttChunks, { type: this.sttChunks[0]?.type || 'audio/webm' });

    // Cleanup stream
    if (this.sttStream) {
      this.sttStream.getTracks().forEach((t) => t.stop());
      this.sttStream = null;
    }
    this.sttChunks = [];
    this.sttRecording = false;
    this.emit('listeningStopped');

    const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
    const fd = new FormData();
    fd.append('file', blob, 'speech.webm');

    const resp = await fetch(`${apiBase}/api/voice/stt`, {
      method: 'POST',
      body: fd,
    });

    if (!resp.ok) {
      const snippet = await resp.text().catch(() => '').then(t => t.slice(0, 200));
      throw new Error(`STT request failed: ${resp.status} ${resp.statusText} - ${snippet}`);
    }
    const data = await resp.json().catch(() => ({} as any));
    const text = typeof data?.text === 'string' ? data.text : '';
    if (!text) {
      throw new Error('Empty transcription');
    }
    // Emit events for UI parity
    const result: TranscriptionResult = { text, isFinal: true, timestamp: new Date() };
    this.emit('transcription', result);
    this.emit('finalTranscription', result);
    return text;
  }

  public isSttRecording(): boolean {
    return this.sttRecording;
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