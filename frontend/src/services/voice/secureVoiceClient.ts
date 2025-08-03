/**
 * Secure voice client that uses server-side token generation
 * instead of exposing API keys to the frontend
 */

export interface VoiceToken {
  token: string;
  sessionId: string;
  config: {
    voiceId: string;
    modelId: string;
    wsUrl: string;
    optimizeStreamingLatency: number;
    voiceSettings: {
      stability: number;
      similarity_boost: number;
      style: number;
      use_speaker_boost: boolean;
    };
  };
}

export interface VoiceConfig {
  configured: boolean;
  config: {
    defaultVoiceId: string;
    modelId: string;
    availableVoices: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    voiceSettings: {
      stability: number;
      similarity_boost: number;
      style: number;
      use_speaker_boost: boolean;
    };
    limits: {
      maxCharactersPerRequest: number;
      maxRequestsPerMinute: number;
      sessionTimeout: number;
    };
    features: {
      textToSpeech: boolean;
      conversationalMode: boolean;
      streaming: boolean;
      voiceCloning: boolean;
    };
  };
}

export class SecureVoiceClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private sessionId: string | null = null;
  private config: VoiceConfig | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || '';
  }

  /**
   * Get or refresh the voice token
   */
  private async getToken(): Promise<VoiceToken> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry > Date.now()) {
      return {
        token: this.token,
        sessionId: this.sessionId!,
        config: this.config!.config as any,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/voice-token${this.sessionId ? `?sessionId=${this.sessionId}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get voice token: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get voice token');
      }

      this.token = data.token;
      this.sessionId = data.sessionId;
      this.tokenExpiry = Date.now() + (4 * 60 * 1000); // Refresh 1 minute before expiry
      
      return data;
    } catch (error) {
      console.error('Error getting voice token:', error);
      throw error;
    }
  }

  /**
   * Get voice configuration
   */
  async getConfig(): Promise<VoiceConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/voice-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get voice config: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get voice config');
      }

      this.config = data;
      return data;
    } catch (error) {
      console.error('Error getting voice config:', error);
      // Return a default config that indicates voice is not configured
      this.config = {
        success: false,
        configured: false,
        config: {
          defaultVoiceId: 'EXAVITQu4vr4xnSDxMaL',
          modelId: 'eleven_turbo_v2_5',
          availableVoices: [],
          voiceSettings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
          },
          limits: {
            maxCharactersPerRequest: 5000,
            maxRequestsPerMinute: 20,
            sessionTimeout: 300000,
          },
          features: {
            textToSpeech: false,
            conversationalMode: false,
            streaming: false,
            voiceCloning: false,
          }
        }
      };
      return this.config;
    }
  }

  /**
   * Check voice service health
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Text to speech conversion
   */
  async textToSpeech(text: string, voiceId?: string, modelId?: string): Promise<ArrayBuffer> {
    const tokenData = await this.getToken();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId: voiceId || tokenData.config.voiceId,
          modelId: modelId || tokenData.config.modelId,
          token: tokenData.token,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate speech' }));
        throw new Error(error.error || `Failed to generate speech: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  /**
   * Get WebSocket URL for streaming (client-side connection)
   */
  async getStreamingConfig(): Promise<{
    wsUrl: string;
    voiceId: string;
    modelId: string;
    sessionId: string;
  }> {
    const tokenData = await this.getToken();
    const config = tokenData.config;
    
    // Build WebSocket URL for direct client connection
    // Note: The actual API key should be passed via the token to a proxy if needed
    const wsUrl = `${config.wsUrl}/text-to-speech/${config.voiceId}/stream-input?model_id=${config.modelId}&optimize_streaming_latency=${config.optimizeStreamingLatency}`;
    
    return {
      wsUrl,
      voiceId: config.voiceId,
      modelId: config.modelId,
      sessionId: tokenData.sessionId,
    };
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<Array<{ id: string; name: string; description: string }>> {
    const config = await this.getConfig();
    return config.config.availableVoices;
  }

  /**
   * Clear session
   */
  clearSession(): void {
    this.token = null;
    this.tokenExpiry = 0;
    this.sessionId = null;
  }

  /**
   * Check if voice service is configured
   */
  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return config.configured;
  }
}

// Export singleton instance
// Determine base URL based on environment
const getBaseUrl = () => {
  if (typeof window === 'undefined') return ''; // SSR
  
  // In production (Vercel), API routes are served from the same origin
  if (import.meta.env.MODE === 'production') {
    return '';
  }
  
  // In development, API might be on different port
  return '';
};

export const secureVoiceClient = new SecureVoiceClient(getBaseUrl());