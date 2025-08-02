import { EventEmitter } from 'events';

export interface VoiceConfig {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  optimizeStreamingLatency?: number;
  enableSsmlParsing?: boolean;
}

export interface VoiceSession {
  id: string;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
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
    };
    this.initializeAudioContext();
    this.initializeSpeechRecognition();
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
          this.emit('error', { type: 'recognition', error: event.error });
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

  async startSession(): Promise<string> {
    if (this.currentSession?.isActive) {
      throw new Error('Voice session already active');
    }

    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      status: 'idle',
      isActive: true,
      startTime: new Date(),
    };

    this.emit('sessionStarted', this.currentSession);
    return sessionId;
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.stopListening();
    this.stopSpeaking();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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
      this.emit('error', { type: 'tts', error });
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
        reject(error);
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
    this.config = { ...this.config, ...config };
    this.emit('configUpdated', this.config);
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
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    this.removeAllListeners();
  }
}

// Singleton instance
export const voiceService = new VoiceService();