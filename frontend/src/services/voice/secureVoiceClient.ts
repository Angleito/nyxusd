/**
 * Secure voice client that uses server-side token generation
 * instead of exposing API keys to the frontend
 */

// Minimal API error envelope used by backend responses
export interface ApiErrorResponse {
  code?: string;
  message?: string;
  error?: string;
}

// Response for /api/voice-token, trimmed for frontend needs
export interface VoiceAuthTokenResponse {
  token: string;
  expiresAt: number;
}

// Response for /api/voice-config used by consumers that build TTS and WS URLs
export interface VoiceConfigResponse {
  ttsUrl: string;
  wsUrl: string;
  model: string;
  voiceId: string;
}

// Existing richer types used internally by this client
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
  apiStatus?: string;
  errorDetails?: string;
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
    endpoints?: {
      session: string;
      tts: string;
      config: string;
      health: string;
      token: string;
    };
  };
}

// Runtime type guards (minimal, non-invasive)
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function isVoiceAuthTokenResponse(v: unknown): v is VoiceAuthTokenResponse {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return isNonEmptyString(obj.token) && isFiniteNumber(obj.expiresAt);
}

export function isVoiceConfigResponse(v: unknown): v is VoiceConfigResponse {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    isNonEmptyString(obj.ttsUrl) &&
    isNonEmptyString(obj.wsUrl) &&
    isNonEmptyString(obj.model) &&
    isNonEmptyString(obj.voiceId)
  );
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
        // Preserve original behavior; internal cast retained
        config: this.config!.config as any,
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/voice-token${this.sessionId ? `?sessionId=${this.sessionId}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const snippet = (await response.text()).slice(0, 120);
        throw new Error(`Failed to get voice token: ${response.status} ${response.statusText} - ${snippet}`);
      }

      const raw: unknown = await response.json().catch(() => ({}));
      // Keep existing envelope behavior (success, token, sessionId, config fields).
      // We do minimal safe checks and set cache; behavior preserved.
      const obj = (typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}) as Record<
        string,
        unknown
      >;

      if (obj.success !== true) {
        const emsg =
          typeof obj.error === 'string' && obj.error.length > 0 ? obj.error : 'Failed to get voice token';
        throw new Error(emsg);
      }

      const token = typeof obj.token === 'string' ? obj.token : '';
      const sessionId = typeof obj.sessionId === 'string' ? obj.sessionId : '';
      if (!token || !sessionId) {
        throw new Error('Invalid token payload');
      }

      this.token = token;
      this.sessionId = sessionId;
      // Keep original 4 minutes validity window (refresh 1 minute before)
      this.tokenExpiry = Date.now() + 4 * 60 * 1000;

      // Return as original shape (relies on backend 'config' field passthrough)
      return obj as unknown as VoiceToken;
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
      console.log('🎤 Voice Service: Using cached config');
      return this.config; // Safe because we checked it exists
    }

    try {
      const configUrl = `${this.baseUrl}/api/voice-config`;
      console.log('🎤 Voice Service: Fetching config from:', configUrl);

      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🎤 Voice Service: Config response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎤 Voice Service: Config error response:', errorText);
        const snippet = errorText.slice(0, 200);
        throw new Error(`Failed to get voice config: ${response.status} ${response.statusText} - ${snippet}`);
      }

      const responseText = await response.text();
      console.log(
        '🎤 Voice Service: Raw config response:',
        responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
      );

      let dataUnknown: unknown;
      try {
        dataUnknown = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🎤 Voice Service: Failed to parse config JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }

      const data = dataUnknown as Record<string, unknown>;
      if (data.success !== true) {
        const errMsg =
          typeof data.error === 'string' && data.error.length > 0 ? data.error : 'Failed to get voice config';
        console.error('🎤 Voice Service: Config API returned error:', errMsg);
        throw new Error(errMsg);
      }

      // Preserve original behavior by trusting backend shape and caching
      this.config = data as unknown as VoiceConfig;

      console.log('🎤 Voice Service: Config loaded successfully:', {
        configured: (this.config as VoiceConfig).configured,
        apiStatus: (this.config as VoiceConfig).apiStatus,
        voiceCount: (this.config as VoiceConfig).config?.availableVoices?.length || 0,
      });

      return this.config;
    } catch (error) {
      console.error('🎤 Voice Service: Error getting voice config:', error);
      // Return a default config that indicates voice is not configured
      this.config = {
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
          },
        },
      };
      return this.config;
    }
  }

  /**
   * Check voice service health
   */
  async checkHealth(): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const snippet = (await response.text()).slice(0, 120);
        throw new Error(`Health check failed: ${response.status} ${response.statusText} - ${snippet}`);
      }

      const raw: unknown = await response.json().catch(() => ({}));
      if (typeof raw !== 'object' || raw === null) {
        return { success: false, status: 'error', error: 'Invalid health payload' };
      }
      const obj = raw as Record<string, unknown>;
      return {
        success: obj.success === true,
        status: typeof obj.status === 'string' ? obj.status : undefined,
        error: typeof obj.error === 'string' ? obj.error : undefined,
      };
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
      const response = await fetch(`${this.baseUrl}/api/voice/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({
          text,
          voiceId: voiceId || tokenData.config.voiceId,
          modelId: modelId || tokenData.config.modelId,
          // Include token in body to satisfy server validator isValidTTSRequest
          token: tokenData.token,
        }),
      });

      if (!response.ok) {
        // Prefer short, non-secret error snippets
        const maybeJson = await response.json().catch(async () => {
          const t = await response.text().catch(() => '');
          return { error: t.slice(0, 120) };
        });
        const msg =
          (typeof maybeJson.error === 'string' && maybeJson.error) ||
          `${response.status} ${response.statusText}`;
        throw new Error(`Failed to generate speech: ${msg}`);
      }

      // Ensure server returned audio, not JSON, to avoid decode failures upstream
      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.toLowerCase().includes('audio')) {
        // Try to parse small snippet for diagnostics
        const snippet = await response.text().catch(() => '').then(t => t.slice(0, 200));
        throw new Error(`Unexpected TTS response type: ${contentType}. Snippet: ${snippet}`);
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
   * Start a voice session with context
   */
  async startSession(context?: Record<string, unknown>): Promise<{ sessionId: string; token: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          sessionId: this.sessionId,
          context,
        }),
      });

      if (!response.ok) {
        const maybeJson: unknown = await response.json().catch(() => ({}));
        const errMsg =
          (typeof maybeJson === 'object' &&
            maybeJson !== null &&
            typeof (maybeJson as Record<string, unknown>).error === 'string' &&
            (maybeJson as Record<string, unknown>).error) ||
          `Failed to start session: ${response.status} ${response.statusText}`;
        throw new Error(String(errMsg));
      }

      const dataUnknown: unknown = await response.json();
      const data = (typeof dataUnknown === 'object' && dataUnknown !== null
        ? (dataUnknown as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      if (data.success !== true) {
        const msg =
          typeof data.error === 'string' && data.error.length > 0 ? data.error : 'Failed to start session';
        throw new Error(msg);
      }

      const sessionId =
        typeof data.sessionId === 'string' && data.sessionId.length > 0 ? data.sessionId : '';
      const token = typeof data.token === 'string' && data.token.length > 0 ? data.token : '';
      if (!sessionId || !token) {
        throw new Error('Invalid session payload');
      }

      this.sessionId = sessionId;
      this.token = token;
      this.tokenExpiry = Date.now() + 29 * 60 * 1000; // 29 minutes

      return {
        sessionId,
        token,
      };
    } catch (error) {
      console.error('Error starting voice session:', error);
      throw error;
    }
  }

  /**
   * End the current voice session
   */
  async endSession(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/voice/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'end',
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to properly end session:', response.statusText);
      }
    } catch (error) {
      console.warn('Error ending voice session:', error);
    } finally {
      this.clearSession();
    }
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
    return config.configured && config.apiStatus === 'connected';
  }
}

// Export singleton instance
// Determine base URL based on environment
const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return ''; // SSR

  // Use environment variable for API URL, with fallback
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const mode = import.meta.env.MODE as string | undefined;

  console.log('🎤 Voice Service: Environment detection:', {
    VITE_API_URL: apiUrl,
    MODE: mode,
    window: typeof window !== 'undefined' ? 'available' : 'undefined',
  });

  if (apiUrl) {
    console.log('🎤 Voice Service: Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }

  // In production (Vercel), API routes are served from the same origin
  if (mode === 'production') {
    console.log('🎤 Voice Service: Production mode, using relative URLs');
    return '';
  }

  // Development fallback
  console.log('🎤 Voice Service: Development fallback to localhost:8081');
  return 'http://localhost:8081';
};

export const secureVoiceClient = new SecureVoiceClient(getBaseUrl());