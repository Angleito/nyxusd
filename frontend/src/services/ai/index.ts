import { AIService, AIServiceConfig, DEFAULT_AI_CONFIG } from "./aiService";
import { LangChainAIService } from "./langchainService";
import { FallbackAIService } from "./fallbackService";

let aiServiceInstance: AIService | null = null;

export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || config?.apiKey;
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...config, apiKey };

  // Check for API keys and use appropriate service
  // Use mock only if explicitly set or no API key available
  if (
    apiKey &&
    import.meta.env.VITE_USE_MOCK_AI !== "true"
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
