import { AIService, AIServiceConfig, DEFAULT_AI_CONFIG } from "./aiService";
import { LangChainAIService } from "./langchainService";
import { FallbackAIService } from "./fallbackService";

let aiServiceInstance: AIService | null = null;

export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };

  // For this demo/mock implementation, always use fallback service
  // In production, you would check for API keys and use LangChain service
  if (
    false &&
    finalConfig.apiKey &&
    process.env.REACT_APP_USE_MOCK_AI !== "true"
  ) {
    try {
      aiServiceInstance = new LangChainAIService(finalConfig);
      console.log("Using LangChain AI service");
    } catch (error) {
      console.warn(
        "Failed to initialize LangChain service, falling back:",
        error,
      );
      aiServiceInstance = new FallbackAIService(finalConfig);
    }
  } else {
    console.log("Using fallback AI service (mock implementation)");
    aiServiceInstance = new FallbackAIService(finalConfig);
  }

  return aiServiceInstance;
}

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = createAIService();
  }
  return aiServiceInstance;
}

export function resetAIService(): void {
  if (aiServiceInstance) {
    aiServiceInstance.reset();
  }
}

export * from "./aiService";
export * from "./conversationChain";
export * from "./promptTemplates";
export * from "./promptOptimizer";
export * from "./optimizedPromptTemplates";
