import { AIService, AIServiceConfig, DEFAULT_AI_CONFIG } from "./aiService";
import { LangChainAIService } from "./langchainService";
import { FallbackAIService } from "./fallbackService";

let aiServiceInstance: AIService | null = null;

export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || config?.apiKey;
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...config, apiKey };

  // Always use real AI service in production
  try {
    aiServiceInstance = new LangChainAIService(finalConfig);
    console.log("Using LangChain AI service");
  } catch (error) {
    console.error("Failed to initialize AI service:", error);
    // For production, we need a working AI service
    // Ensure API keys are properly configured
    throw new Error("AI service initialization failed. Please configure VITE_OPENROUTER_API_KEY");
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
