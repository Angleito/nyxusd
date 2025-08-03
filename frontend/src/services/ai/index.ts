import { AIService, AIServiceConfig, DEFAULT_AI_CONFIG } from "./aiService";
import { LangChainAIService } from "./langchainService";
import { FallbackAIService } from "./fallbackService";

let aiServiceInstance: AIService | null = null;

export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || config?.apiKey;
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...config, apiKey };

  // Detect if we're in production (Vercel deployment)
  const isProduction = 
    import.meta.env.PROD || 
    import.meta.env.MODE === 'production' ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost');

  // Check for API keys and use appropriate service
  // In production, assume API keys are configured in Vercel
  // Use mock only if explicitly set or in local dev without API key
  if (
    (apiKey || isProduction) &&
    import.meta.env.VITE_USE_MOCK_AI !== "true"
  ) {
    try {
      aiServiceInstance = new LangChainAIService(finalConfig);
      console.log("Using LangChain AI service (real AI)");
    } catch (error) {
      console.warn(
        "Failed to initialize LangChain service, falling back:",
        error,
      );
      // Only fall back to mock in development
      if (!isProduction) {
        aiServiceInstance = new FallbackAIService(finalConfig);
      } else {
        // In production, throw error if real AI fails
        throw new Error("AI service initialization failed in production");
      }
    }
  } else {
    console.log("Using fallback AI service (mock implementation for local dev)");
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
