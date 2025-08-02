import { ChatOpenAI } from "@langchain/openai";
import { ConversationSummaryMemory } from "langchain/memory";
import dotenv from "dotenv";
import { aiLogger } from "../utils/logger.js";

dotenv.config();

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  top_provider?: {
    max_completion_tokens?: number;
  };
}

interface OpenRouterParams {
  provider?: {
    order?: string[];
    allow_fallbacks?: boolean;
    require_parameters?: boolean;
  };
  transforms?: string[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repetition_penalty?: number;
  min_p?: number;
  top_a?: number;
  seed?: number;
  max_tokens?: number;
  stop?: string[];
}

export class OpenRouterService {
  private apiKey: string;
  private baseURL: string = "https://openrouter.ai/api/v1";
  private appName: string;
  private appUrl: string;
  private defaultModel: string = "google/gemini-2.5-flash";
  private availableModels: Map<string, OpenRouterModel> = new Map();
  private conversationMemories: Map<string, ConversationSummaryMemory> = new Map();

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.appName = process.env.APP_NAME || "NyxUSD";
    this.appUrl = process.env.APP_URL || "http://localhost:3000";
    
    if (!this.apiKey) {
      aiLogger.warn("OpenRouter API key not configured");
    }
    
    this.initializeModels();
  }

  private async initializeModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.appUrl,
          "X-Title": this.appName,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.data || [];
        
        models.forEach((model: OpenRouterModel) => {
          this.availableModels.set(model.id, model);
        });
        
        aiLogger.info(`Loaded ${this.availableModels.size} OpenRouter models`);
      } else {
        aiLogger.error("Failed to fetch OpenRouter models", {
          status: response.status,
          statusText: response.statusText,
        });
      }
    } catch (error) {
      aiLogger.error("Error initializing OpenRouter models", { error });
    }
  }

  public async refreshModels(): Promise<void> {
    await this.initializeModels();
  }

  public getAvailableModels(): string[] {
    return Array.from(this.availableModels.keys());
  }

  public getModelInfo(modelId: string): OpenRouterModel | undefined {
    return this.availableModels.get(modelId);
  }

  private selectModelByComplexity(complexity: "low" | "medium" | "high" | "thinking"): string {
    const modelMap = {
      low: "google/gemini-2.5-flash",
      medium: "deepseek/deepseek-chat-v3-0324",
      high: "qwen/qwen3-235b-a22b-2507",
      thinking: "qwen/qwen3-235b-a22b-thinking-2507",
    };

    const selectedModel = modelMap[complexity];
    
    if (!this.availableModels.has(selectedModel)) {
      aiLogger.warn(`Model ${selectedModel} not available, falling back to default`);
      return this.defaultModel;
    }
    
    return selectedModel;
  }

  public analyzeQueryComplexity(message: string, context?: any): "low" | "medium" | "high" | "thinking" {
    const wordCount = message.split(/\s+/).length;
    const hasCode = /```|function|class|const|let|var|import|export/.test(message);
    const hasMath = /[\d+\-*/=<>]/.test(message);
    const hasMultipleQuestions = /\?.*\?/.test(message);
    const requiresReasoning = /why|how|explain|analyze|compare|evaluate/i.test(message);
    const requiresDeepThinking = /step.?by.?step|think.*through|reason.*about|complex.*problem/i.test(message);
    
    // Check if this requires deep thinking/reasoning
    if (requiresDeepThinking || (requiresReasoning && (hasCode || hasMath))) {
      return "thinking";
    }
    
    let score = 0;
    
    if (wordCount > 100) score += 2;
    else if (wordCount > 50) score += 1;
    
    if (hasCode) score += 2;
    if (hasMath) score += 1;
    if (hasMultipleQuestions) score += 1;
    if (requiresReasoning) score += 1;
    
    if (context?.conversationStep === "complex_analysis") score += 2;
    if (context?.walletData && Object.keys(context.walletData).length > 5) score += 1;
    
    if (score >= 4) return "high";
    if (score >= 2) return "medium";
    return "low";
  }

  public createLLM(options: {
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
    queryComplexity?: "low" | "medium" | "high" | "thinking";
    useAlternativeModels?: boolean;
    openRouterParams?: OpenRouterParams;
  } = {}): ChatOpenAI {
    const {
      modelName,
      temperature = 0.7,
      maxTokens = 500,
      streaming = false,
      queryComplexity,
      useAlternativeModels = false,
      openRouterParams = {},
    } = options;

    let selectedModel = modelName || 
      (queryComplexity ? this.selectModelByComplexity(queryComplexity) : this.defaultModel);
    
    // Alternative model fallbacks if requested
    if (useAlternativeModels && !modelName) {
      const alternativeModels = {
        low: ["google/gemini-2.5-flash", "openai/o4-mini"],
        medium: ["deepseek/deepseek-chat-v3-0324", "qwen/qwen3-30b-a3b-instruct-2507"],
        high: ["qwen/qwen3-235b-a22b-2507", "qwen/qwen3-30b-a3b-instruct-2507"],
        thinking: ["qwen/qwen3-235b-a22b-thinking-2507", "qwen/qwen3-235b-a22b-2507"],
      };
      
      const complexity = queryComplexity || "low";
      const models = alternativeModels[complexity];
      
      for (const model of models) {
        if (this.availableModels.has(model)) {
          selectedModel = model;
          break;
        }
      }
    }

    aiLogger.info(`Using OpenRouter model: ${selectedModel}`, {
      complexity: queryComplexity,
      streaming,
    });

    const configuration: any = {
      openAIApiKey: this.apiKey,
      modelName: selectedModel,
      temperature,
      maxTokens,
      streaming,
      configuration: {
        baseURL: this.baseURL,
        defaultHeaders: {
          "HTTP-Referer": this.appUrl,
          "X-Title": this.appName,
        },
      },
    };

    if (openRouterParams.provider) {
      configuration.modelKwargs = {
        provider: openRouterParams.provider,
      };
    }

    if (openRouterParams.transforms) {
      configuration.modelKwargs = {
        ...configuration.modelKwargs,
        transforms: openRouterParams.transforms,
      };
    }

    if (openRouterParams.top_p !== undefined) {
      configuration.topP = openRouterParams.top_p;
    }

    if (openRouterParams.frequency_penalty !== undefined) {
      configuration.frequencyPenalty = openRouterParams.frequency_penalty;
    }

    if (openRouterParams.presence_penalty !== undefined) {
      configuration.presencePenalty = openRouterParams.presence_penalty;
    }

    if (openRouterParams.stop) {
      configuration.stop = openRouterParams.stop;
    }

    return new ChatOpenAI(configuration);
  }

  public getOrCreateMemory(sessionId: string): ConversationSummaryMemory {
    if (!this.conversationMemories.has(sessionId)) {
      const memory = new ConversationSummaryMemory({
        llm: this.createLLM({
          modelName: "google/gemini-2.5-flash",
          temperature: 0.5,
          maxTokens: 200,
        }),
        memoryKey: "conversation_summary",
        returnMessages: true,
      });
      this.conversationMemories.set(sessionId, memory);
    }
    return this.conversationMemories.get(sessionId)!;
  }

  public clearMemory(sessionId: string): void {
    if (this.conversationMemories.has(sessionId)) {
      this.conversationMemories.delete(sessionId);
    }
  }

  public getActiveSessionCount(): number {
    return this.conversationMemories.size;
  }

  public async handleRateLimit(error: any): Promise<{ shouldRetry: boolean; retryAfter?: number }> {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      aiLogger.warn("OpenRouter rate limit hit", { retryAfter });
      
      return {
        shouldRetry: true,
        retryAfter: retryAfter ? parseInt(retryAfter) : 60,
      };
    }

    if (error.message?.includes("rate limit")) {
      aiLogger.warn("OpenRouter rate limit detected from error message");
      return {
        shouldRetry: true,
        retryAfter: 60,
      };
    }

    return { shouldRetry: false };
  }

  public async handleApiError(error: any): Promise<{ fallback: boolean; message: string }> {
    aiLogger.error("OpenRouter API error", {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      return {
        fallback: true,
        message: "Authentication failed. Please check your OpenRouter API key.",
      };
    }

    if (error.response?.status === 400) {
      return {
        fallback: false,
        message: "Invalid request to OpenRouter API.",
      };
    }

    if (error.response?.status === 503) {
      return {
        fallback: true,
        message: "OpenRouter service temporarily unavailable.",
      };
    }

    return {
      fallback: true,
      message: "An error occurred with the OpenRouter service.",
    };
  }

  public cleanupOldSessions(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [sessionId, memory] of this.conversationMemories.entries()) {
      if (now - (memory as any).lastUsed > maxAge) {
        this.conversationMemories.delete(sessionId);
        aiLogger.info(`Cleaned up old session: ${sessionId}`);
      }
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.appUrl,
          "X-Title": this.appName,
        },
      });

      return response.ok;
    } catch (error) {
      aiLogger.error("OpenRouter connection test failed", { error });
      return false;
    }
  }

  public getServiceInfo(): {
    configured: boolean;
    baseURL: string;
    defaultModel: string;
    modelsLoaded: number;
    activeSessions: number;
  } {
    return {
      configured: !!this.apiKey,
      baseURL: this.baseURL,
      defaultModel: this.defaultModel,
      modelsLoaded: this.availableModels.size,
      activeSessions: this.conversationMemories.size,
    };
  }
}

export const openRouterService = new OpenRouterService();