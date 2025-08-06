/**
 * Voice API TypeScript Type Definitions
 *
 * Centralized, precise types for Voice API endpoints and ElevenLabs integration.
 * Includes runtime guards for narrowing unknown JSON.
 */

/* =========================
 * ElevenLabs API Types
 * ========================= */

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

/* =========================
 * Voice Config Types
 * ========================= */

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
  readonly config?: string;
  readonly health: string;
  readonly token: string;
  readonly conversationalAgent?: string;
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

/* =========================
 * JWT / Token Types
 * ========================= */

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

/* =========================
 * API Contracts
 * ========================= */

export interface TTSRequestBody {
  readonly text: string;
  readonly voiceId?: string;           // optional override
  readonly modelId?: string;           // optional override
  readonly token: string;

  // Optional tuning/settings used by ElevenLabs and referenced in the handler
  readonly voiceSettings?: {
    readonly stability?: number;
    readonly similarity_boost?: number;
    readonly style?: number;
    readonly use_speaker_boost?: boolean;
  };

  // Output format and latency controls (used by handler defaults)
  readonly outputFormat?: string;              // e.g. 'mp3_44100_128', 'wav', etc
  readonly optimizeStreamingLatency?: number;  // 0-5 per ElevenLabs docs
}

export interface TTSResponseBodySuccess {
  readonly success: true;
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

/* =========================
 * Conversational Agent Types
 * ========================= */

export interface AgentContext {
  readonly userProfile?: unknown;
  readonly conversationHistory?: ReadonlyArray<unknown>;
  readonly memoryContext?: string;
  readonly defiCapabilities?: unknown;
}

export interface AgentConfig {
  readonly voiceId?: string;
  readonly modelId?: string;
  readonly language?: string;
  readonly firstMessage?: string;
}

export interface AgentRequest {
  readonly sessionId?: string;
  readonly userId?: string;
  readonly context?: AgentContext;
  readonly config?: AgentConfig;
}

export interface AgentResponse {
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

/* If future WS/SSE events are emitted, this discriminated union can be used */
export type AgentEvent =
  | { readonly type: 'ready'; readonly agentId: string; readonly sessionId: string }
  | { readonly type: 'message'; readonly role: 'assistant' | 'user'; readonly content: string; readonly ts: string }
  | { readonly type: 'error'; readonly error: string; readonly details?: string; readonly ts: string };

/* =========================
 * Session Types
 * ========================= */

export interface SessionCreateRequest {
  readonly action: 'start';
  readonly sessionId?: string;
  readonly userId?: string;
  readonly context?: AgentContext;
}

export interface SessionEndRequest {
  readonly action: 'end';
  readonly sessionId: string;
}

export type SessionRequest = SessionCreateRequest | SessionEndRequest;

export interface SessionCreateResponse {
  readonly success: true;
  readonly sessionId: string;
  readonly token: string;
  readonly expiresAt: string;
  readonly elevenlabs: {
    readonly connected: boolean;
    readonly subscription: ElevenLabsSubscription | null;
  };
  readonly config: {
    readonly voiceId: string;
    readonly modelId: string;
    readonly wsUrl: string;
    readonly voiceSettings: VoiceSettings;
  };
}

export interface SessionEndResponse {
  readonly success: true;
  readonly sessionId: string;
  readonly ended: true;
  readonly duration: number;
  readonly summary: {
    readonly startTime: string;
    readonly endTime: string;
    readonly durationMs: number;
  };
}

/* =========================
 * Runtime Guards
 * ========================= */

export function isValidTTSRequest(body: unknown): body is TTSRequestBody {
  if (typeof body !== 'object' || body === null) return false;
  const req = body as Record<string, unknown>;
  if (typeof req['text'] !== 'string') return false;
  if (req['text'].length === 0 || req['text'].length > 5000) return false;
  if (typeof req['token'] !== 'string' || req['token'].length === 0) return false;
  if (req['voiceId'] !== undefined && typeof req['voiceId'] !== 'string') return false;
  if (req['modelId'] !== undefined && typeof req['modelId'] !== 'string') return false;
  return true;
}

export function isValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === 'string' && sessionId.length > 0;
}

export function isAgentRequest(body: unknown): body is AgentRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  if (b['sessionId'] !== undefined && typeof b['sessionId'] !== 'string') return false;
  if (b['userId'] !== undefined && typeof b['userId'] !== 'string') return false;
  if (b['context'] !== undefined && typeof b['context'] !== 'object') return false;
  if (b['config'] !== undefined && typeof b['config'] !== 'object') return false;
  return true;
}

/* =========================
 * Environment Validation
 * ========================= */

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

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) {
    errors.push('ELEVENLABS_API_KEY is required');
  } else {
    envData['ELEVENLABS_API_KEY'] = elevenLabsApiKey;
  }

  // JWT_SECRET is optional - will use simple base64 token if not present
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    envData['JWT_SECRET'] = jwtSecret;
  }

  const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '4Kt8muEUKO23q5wH9LHK';
  envData['ELEVENLABS_DEFAULT_VOICE_ID'] = defaultVoiceId;
  
  envData['ELEVENLABS_MODEL_ID'] =
    process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5';
  envData['NODE_ENV'] = process.env.NODE_ENV;
  envData['VERCEL_ENV'] = process.env.VERCEL_ENV;
  envData['VERCEL_REGION'] = process.env.VERCEL_REGION;
  envData['FRONTEND_URL'] = process.env.FRONTEND_URL;

  return {
    isValid: errors.length === 0,
    env: envData as Partial<VoiceEnvironment>,
    errors,
  };
}

/* =========================
 * Barrel export helper
 * ========================= */

export type {
  // re-export well-known response shapes for convenience if needed externally
  TTSResponseBodySuccess as TTSResponseBody,
};