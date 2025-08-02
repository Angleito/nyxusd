import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../providers/AIAssistantProvider";

export interface AIServiceConfig {
  apiKey?: string;
  apiEndpoint: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streamResponse?: boolean;
  // OpenRouter specific
  trackCosts?: boolean;
  providerPreferences?: {
    order: string[];
    allow_fallbacks: boolean;
  };
  transforms?: string[];
}

export interface AIContext {
  conversationStep: ConversationStep;
  userProfile: UserProfile;
  walletData?: WalletData;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface AIResponse {
  message: string;
  intent?: {
    action: string;
    confidence: number;
    extractedValue?: string | number;
  };
  shouldContinue?: boolean;
  nextStep?: ConversationStep;
  error?: string;
}

export interface AIService {
  generateResponse(
    userMessage: string,
    context: AIContext,
  ): Promise<AIResponse>;

  streamResponse?(
    userMessage: string,
    context: AIContext,
    onChunk: (chunk: string) => void,
  ): Promise<AIResponse>;

  validateConfiguration(): Promise<boolean>;

  reset(): void;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code:
      | "API_ERROR"
      | "RATE_LIMIT"
      | "INVALID_CONFIG"
      | "NETWORK_ERROR",
    public details?: any,
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  apiEndpoint: "/api/ai/chat",
  model: "google/gemini-2.5-flash",
  temperature: 0.7,
  maxTokens: 500,
  streamResponse: true,
  trackCosts: false,
  providerPreferences: {
    order: ["Google", "DeepSeek", "Qwen", "OpenAI"],
    allow_fallbacks: true,
  },
  transforms: ["middle-out"],
};
