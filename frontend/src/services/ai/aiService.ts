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
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 500,
  streamResponse: true,
};
