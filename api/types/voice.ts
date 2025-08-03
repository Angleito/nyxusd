/**
 * Voice API TypeScript Type Definitions
 * 
 * Comprehensive type definitions for ElevenLabs integration,
 * JWT tokens, and voice service responses.
 */

// ElevenLabs API Response Types
export interface ElevenLabsUser {
  readonly user_id: string;
  readonly subscription: ElevenLabsSubscription;
  readonly is_new_user: boolean;
  readonly xi_api_key: string;
  readonly can_extend_character_limit: boolean;
  readonly can_extend_voice_limit: boolean;
  readonly can_use_instant_voice_cloning: boolean;
  readonly can_use_professional_voice_cloning: boolean;
  readonly available_for_tiers: ReadonlyArray<string>;
  readonly xi_api_key_id: string;
}

export interface ElevenLabsSubscription {
  readonly tier: 'free' | 'starter' | 'creator' | 'pro' | 'scale' | 'business';
  readonly character_count: number;
  readonly character_limit: number;
  readonly can_extend_character_limit: boolean;
  readonly allowed_to_extend_character_limit: boolean;
  readonly next_character_count_reset_unix: number;
  readonly voice_limit: number;
  readonly max_voice_add_edits: number;
  readonly voice_add_edit_counter: number;
  readonly professional_voice_limit: number;
  readonly can_extend_voice_limit: boolean;
  readonly can_use_instant_voice_cloning: boolean;
  readonly can_use_professional_voice_cloning: boolean;
  readonly currency: string;
  readonly status: 'free' | 'active' | 'inactive';
}

// Voice Configuration Types
export interface VoiceSettings {
  readonly stability: number;
  readonly similarity_boost: number;
  readonly style: number;
  readonly use_speaker_boost: boolean;
}

export interface VoiceInfo {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface VoiceLimits {
  readonly maxCharactersPerRequest: number;
  readonly maxRequestsPerMinute: number;
  readonly sessionTimeout: number;
}

export interface VoiceFeatures {
  readonly textToSpeech: boolean;
  readonly conversationalMode: boolean;
  readonly streaming: boolean;
  readonly voiceCloning: boolean;
}

export interface VoiceEndpoints {
  readonly session: string;
  readonly tts: string;
  readonly config: string;
  readonly health: string;
  readonly token: string;
}

export interface VoiceConfig {
  readonly defaultVoiceId: string;
  readonly modelId: string;
  readonly availableVoices: ReadonlyArray<VoiceInfo>;
  readonly voiceSettings: VoiceSettings;
  readonly limits: VoiceLimits;
  readonly features: VoiceFeatures;
  readonly endpoints: VoiceEndpoints;
}

// JWT Token Types
export interface VoiceTokenPayload {
  readonly sessionId: string;
  readonly voiceId: string;
  readonly type: 'voice_session';
  readonly iat: number;
  readonly exp: number;
}

export interface TokenConfig {
  readonly voiceId: string;
  readonly modelId: string;
  readonly wsUrl: string;
  readonly optimizeStreamingLatency: number;
  readonly voiceSettings: VoiceSettings;
}

// API Request/Response Types
export interface TTSRequestBody {
  readonly text: string;
  readonly voiceId?: string;
  readonly modelId?: string;
  readonly token: string;
}

export interface VoiceHealthStatus {
  readonly configured: boolean;
  readonly apiStatus: 'not_configured' | 'connected' | 'error';
  readonly subscription: ElevenLabsSubscription | null;
}

export interface ServerlessInfo {
  readonly platform: 'vercel';
  readonly region: string;
  readonly environment: string;
}

// API Response Types
export interface VoiceConfigResponse {
  readonly success: true;
  readonly configured: boolean;
  readonly apiStatus: 'not_configured' | 'connected' | 'error';
  readonly errorDetails: string | null;
  readonly config: VoiceConfig;
  readonly timestamp: string;
}

export interface VoiceTokenResponse {
  readonly success: true;
  readonly token: string;
  readonly sessionId: string;
  readonly config: TokenConfig;
}

export interface VoiceHealthResponse {
  readonly success: true;
  readonly status: 'healthy';
  readonly elevenLabs: VoiceHealthStatus;
  readonly serverless: ServerlessInfo;
  readonly timestamp: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly details?: string;
  readonly timestamp?: string;
}

// Type guards for runtime validation
export function isValidTTSRequest(body: unknown): body is TTSRequestBody {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  
  const req = body as Record<string, unknown>;
  
  return (
    typeof req['text'] === 'string' &&
    req['text'].length > 0 &&
    req['text'].length <= 5000 &&
    typeof req['token'] === 'string' &&
    req['token'].length > 0 &&
    (req['voiceId'] === undefined || typeof req['voiceId'] === 'string') &&
    (req['modelId'] === undefined || typeof req['modelId'] === 'string')
  );
}

export function isValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === 'string' && sessionId.length > 0;
}

// Environment variable validation
export interface VoiceEnvironment {
  readonly ELEVENLABS_API_KEY: string;
  readonly ELEVENLABS_DEFAULT_VOICE_ID: string;
  readonly ELEVENLABS_MODEL_ID: string;
  readonly JWT_SECRET: string;
  readonly NODE_ENV?: string;
  readonly VERCEL_ENV?: string;
  readonly VERCEL_REGION?: string;
  readonly FRONTEND_URL?: string;
}

export function validateVoiceEnvironment(): {
  readonly isValid: boolean;
  readonly env: Partial<VoiceEnvironment>;
  readonly errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  const envData: Record<string, string | undefined> = {};

  // Required environment variables
  const elevenLabsApiKey = process.env['ELEVENLABS_API_KEY'];
  if (!elevenLabsApiKey) {
    errors.push('ELEVENLABS_API_KEY is required');
  } else {
    envData['ELEVENLABS_API_KEY'] = elevenLabsApiKey;
  }

  const jwtSecret = process.env['JWT_SECRET'];
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required');
  } else {
    envData['JWT_SECRET'] = jwtSecret;
  }

  // Optional with defaults
  envData['ELEVENLABS_DEFAULT_VOICE_ID'] = process.env['ELEVENLABS_DEFAULT_VOICE_ID'] || 'EXAVITQu4vr4xnSDxMaL';
  envData['ELEVENLABS_MODEL_ID'] = process.env['ELEVENLABS_MODEL_ID'] || 'eleven_turbo_v2_5';
  envData['NODE_ENV'] = process.env['NODE_ENV'];
  envData['VERCEL_ENV'] = process.env['VERCEL_ENV'];
  envData['VERCEL_REGION'] = process.env['VERCEL_REGION'];
  envData['FRONTEND_URL'] = process.env['FRONTEND_URL'];

  return {
    isValid: errors.length === 0,
    env: envData as Partial<VoiceEnvironment>,
    errors
  };
}