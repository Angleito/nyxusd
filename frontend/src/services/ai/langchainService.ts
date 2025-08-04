import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  AIMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
// import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

import {
  AIService,
  AIServiceConfig,
  AIContext,
  AIResponse,
  AIServiceError,
  DEFAULT_AI_CONFIG,
} from "./aiService";
import {
  PromptBuilder,
  QuickBuilders,
  buildSystemPrompt,
  PRESET_CONFIGS,
} from "./promptBuilder";
import { buildEnhancedPrompt } from './promptTemplates';
import {
  PersonalizationEngine,
  PersonalizationProfile,
  PersonalizationContext,
  PersonalizationResult,
  CareerStage,
  FamilyStatus,
} from "./personalizationEngine";
import {
  PromptOptimizer,
  createOptimizer,
  OptimizationConfig,
  OptimizationResult,
} from "./promptOptimizer";
// Simple local implementations to avoid build issues
class Ok<T, E> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T, E> { return true; }
  isErr(): this is Err<T, E> { return false; }
}
class Err<T, E> {
  constructor(public readonly value: E) {}
  isOk(): this is Ok<T, E> { return false; }
  isErr(): this is Err<T, E> { return true; }
}
type Result<T, E> = Ok<T, E> | Err<T, E>;
import {
  ConversationStep,
  UserProfile,
} from "../../providers/AIAssistantProvider";

const responseSchema = z.object({
  message: z.string().describe("The response message to show the user"),
  intent: z
    .object({
      action: z
        .enum([
          "connect_wallet",
          "select_option",
          "input_value",
          "continue",
          "skip",
          "help",
          "unclear",
        ])
        .describe("The detected user intent"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("Confidence score for the intent"),
      extractedValue: z
        .union([z.string(), z.number()])
        .optional()
        .describe("Any value extracted from the user input"),
    })
    .optional(),
  shouldContinue: z
    .boolean()
    .optional()
    .describe("Whether to continue to the next step"),
  nextStep: z
    .enum([
      "initial",
      "chat",
      "strategy_choice",
      "template_selection",
      "wallet_prompt",
      "wallet_scanning",
      "wallet_analyzed",
      "risk_assessment", 
      "investment_goals",
      "occupation",
      "occupation_explanation",
      "risk_tolerance",
      "timeline",
      "amount",
      "experience_level",
      "protocol_selection",
      "strategy_builder",
      "leverage_optimization",
      "generating_recommendations",
      "recommendations",
      "complete",
    ])
    .optional()
    .describe("The next conversation step to transition to"),
});

/**
 * Enhanced AI context with new personalization dimensions
 */
export interface EnhancedAIContext extends AIContext {
  // Enhanced personalization fields
  hobbies?: string[];
  interests?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  urgency?: "low" | "medium" | "high";
  complexity?: number; // 1-10 scale
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";

  // Analytics metadata
  sessionId?: string;
  previousTokenUsage?: number;
  personalizationEffectiveness?: number;
}

/**
 * Analytics and monitoring data
 */
interface AIServiceAnalytics {
  totalTokensUsed: number;
  tokensSaved: number;
  avgResponseTime: number;
  personalizationScore: number;
  optimizationStats: {
    promptCompressionRatio: number;
    clarityScore: number;
    effectivenessScore: number;
  };
}

export class LangChainAIService implements AIService {
  private config: AIServiceConfig;
  private llm!: ChatOpenAI;
  private memory: ConversationSummaryMemory;
  // private outputParser: StructuredOutputParser<unknown>;
  private isInitialized = false;

  // Enhanced prompt system components
  private personalizationEngine!: PersonalizationEngine;
  private promptOptimizer!: PromptOptimizer;
  private analytics!: AIServiceAnalytics;

  // Fallback system for backward compatibility
  private fallbackMode = false;
  
  // OpenRouter specific
  private openRouterConfig = {
    baseURL: import.meta.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
    appName: import.meta.env.VITE_APP_NAME || "NyxUSD",
    appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
  };

  constructor(config: AIServiceConfig = DEFAULT_AI_CONFIG) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
    // this.outputParser = StructuredOutputParser.fromZodSchema(responseSchema);
    // Skip LLM creation - we use backend API instead
    this.memory = this.createMemory();

    // Initialize enhanced prompt system components
    try {
      this.personalizationEngine = new PersonalizationEngine();
      this.promptOptimizer = createOptimizer({
        level: "balanced",
        preserveClarity: true,
        enableAbbreviations: true,
        compressRepeatedPatterns: true,
      });

      this.analytics = {
        totalTokensUsed: 0,
        tokensSaved: 0,
        avgResponseTime: 0,
        personalizationScore: 0,
        optimizationStats: {
          promptCompressionRatio: 0,
          clarityScore: 0,
          effectivenessScore: 0,
        },
      };

      console.log(
        "Enhanced AI service initialized with personalization and optimization",
      );
    } catch (error) {
      console.warn(
        "Failed to initialize enhanced prompt system, falling back to legacy mode:",
        error,
      );
      this.fallbackMode = true;
    }
  }

  private createLLM(queryType?: "simple" | "complex" | "crypto" | "reasoning"): ChatOpenAI {
    // This method is no longer used - we use backend API instead
    // Keeping for compatibility but throwing error to prevent direct usage
    throw new Error("Direct LLM usage disabled. Use backend API instead.");
  }

  // Simple conversation history storage
  private conversationHistory: Array<{user: string, assistant: string, timestamp: Date}> = [];
  private maxHistoryLength = 10; // Keep last 10 exchanges

  private storeConversationLocally(userMessage: string, assistantMessage: string): void {
    this.conversationHistory.push({
      user: userMessage,
      assistant: assistantMessage,
      timestamp: new Date()
    });

    // Keep only the last N exchanges
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  private buildSimpleMemoryContext(context: AIContext): string {
    const parts: string[] = [];
    
    // Add conversation history context
    if (this.conversationHistory.length > 0) {
      const recentHistory = this.conversationHistory.slice(-3).map(exchange => 
        `User: ${exchange.user} | Assistant: ${exchange.assistant}`
      ).join(' || ');
      parts.push(`Recent conversation: ${recentHistory}`);
    }
    
    if (context.userProfile) {
      parts.push(`User: ${JSON.stringify(context.userProfile)}`);
    }
    
    if (context.walletData) {
      parts.push(`Wallet: ${JSON.stringify(context.walletData)}`);
    }
    
    if (context.conversationStep) {
      parts.push(`Step: ${context.conversationStep}`);
    }
    
    return parts.join(' | ');
  }

  private buildConversationSummary(): string {
    if (this.conversationHistory.length === 0) return "";
    
    // Create a simple summary of the conversation
    const lastFewExchanges = this.conversationHistory.slice(-5);
    return lastFewExchanges.map(exchange => 
      `Q: ${exchange.user.substring(0, 100)} A: ${exchange.assistant.substring(0, 100)}`
    ).join(' | ');
  }
  
  private selectModelByQueryType(
    queryType: "simple" | "complex" | "crypto" | "reasoning",
    customModel?: string
  ): string {
    if (customModel) return customModel;
    
    const modelMap = {
      simple: "google/gemini-2.5-flash",
      complex: "qwen/qwen3-30b-a3b-instruct-2507",
      crypto: "deepseek/deepseek-chat-v3-0324",
      reasoning: "qwen/qwen3-235b-a22b-thinking-2507",
    };
    
    return modelMap[queryType] || "google/gemini-2.5-flash";
  }
  
  private analyzeQueryType(userMessage: string, context: AIContext): "simple" | "complex" | "crypto" | "reasoning" {
    const message = userMessage.toLowerCase();
    
    // Check for reasoning/thinking requirements
    if (/step.?by.?step|think.*through|explain.*reasoning|analyze.*deeply/i.test(message)) {
      return "reasoning";
    }
    
    // Check for crypto/DeFi specific terms
    if (/cdp|leverage|liquidation|collateral|defi|yield|apy|protocol|vault/i.test(message)) {
      return "crypto";
    }
    
    // Check complexity based on message characteristics
    const wordCount = message.split(/\s+/).length;
    const hasMultipleQuestions = /\?.*\?/.test(message);
    const requiresAnalysis = /analyze|compare|evaluate|explain|how|why/i.test(message);
    
    if (wordCount > 50 || hasMultipleQuestions || requiresAnalysis) {
      return "complex";
    }
    
    return "simple";
  }

  private createMemory(): ConversationSummaryMemory {
    return new ConversationSummaryMemory({
      llm: new ChatOpenAI({
        openAIApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || this.config.apiKey,
        modelName: "google/gemini-2.5-flash",
        temperature: 0.5,
        maxTokens: 8000, // Summary context
        configuration: {
          baseURL: this.openRouterConfig.baseURL,
          defaultHeaders: {
            "HTTP-Referer": this.openRouterConfig.appUrl,
            "X-Title": this.openRouterConfig.appName,
          },
        },
      }),
      memoryKey: "conversation_summary",
      returnMessages: true,
    });
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      // Test backend API connection instead of direct LLM
      const baseUrl = import.meta.env.VITE_API_URL || 'https://nyxusd.com';
      const apiUrl = `${baseUrl}/api/ai/chat`;
      
      console.log('🔧 AI Service: Validating configuration with URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test',
          context: {},
        }),
      });

      console.log('🔧 AI Service: Validation response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔧 AI Service: Validation successful, response:', data.success ? 'success' : 'failed');
      } else {
        const errorText = await response.text();
        console.error('🔧 AI Service: Validation failed, error:', errorText);
      }

      this.isInitialized = response.ok;
      return response.ok;
    } catch (error) {
      console.error("🔧 AI Service: Configuration validation failed with exception:", error);
      this.isInitialized = false;
      return false;
    }
  }

  async generateResponse(
    userMessage: string,
    context: AIContext,
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Determine query type for model selection
      const queryType = this.analyzeQueryType(userMessage, context);
      
      // Build simple context for backend API
      const memoryContext = this.buildSimpleMemoryContext(context);
      const conversationSummary = this.buildConversationSummary();
      
      // Get selected model
      const model = this.selectModelByQueryType(queryType);
      
      // Call backend API
      const baseUrl = import.meta.env.VITE_API_URL || 'https://nyxusd.com';
      const apiUrl = `${baseUrl}/api/ai/chat`;
      
      console.log('🤖 AI Service: Environment variables:', {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        MODE: import.meta.env.MODE,
        baseUrl,
        finalApiUrl: apiUrl
      });
      
      console.log('🤖 AI Service: Making request to:', apiUrl);
      console.log('🤖 AI Service: Request payload:', {
        message: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
        context: Object.keys(context),
        memoryContext: memoryContext ? 'present' : 'none',
        conversationSummary: conversationSummary ? 'present' : 'none',
        model
      });
      
      const requestPayload = {
        message: userMessage,
        context,
        memoryContext,
        conversationSummary,
        model
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('🤖 AI Service: Response status:', response.status, response.statusText);
      console.log('🤖 AI Service: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 AI Service: Error response body:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        // Handle validation errors with user-friendly messages
        if (response.status === 400 && errorData.validationErrors) {
          const validationError = errorData.validationErrors.find((err: any) => 
            err.field === 'memoryContext' && err.message.includes('2000 characters')
          );
          if (validationError) {
            throw new Error('Your conversation history is too long. Let me clear some context and try again.');
          }
        }
        
        // Handle other validation errors
        if (response.status === 400 && errorData.error === 'Validation failed') {
          throw new Error('Invalid request format. Please try again with a different message.');
        }
        
        throw new Error(errorData.error || `API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('🤖 AI Service: Raw response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🤖 AI Service: Failed to parse JSON response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      // Extract the actual message from the response
      const aiMessage = data.data || data.message;
      console.log('🤖 AI Service: Extracted AI message:', aiMessage ? aiMessage.substring(0, 100) + '...' : 'none');
      
      // Store conversation in simple memory (without LangChain)
      this.storeConversationLocally(userMessage, aiMessage);

      // Create structured response
      const parsedResponse = {
        message: aiMessage,
        intent: {
          action: "continue" as const,
          confidence: 0.8,
        },
        shouldContinue: false,
      };

      // Update analytics
      this.updateAnalytics(startTime, userMessage, parsedResponse, queryType);

      return this.convertToAIResponse(parsedResponse);
    } catch (error: any) {
      console.error("AI service error:", error);

      // Fallback to legacy system if enhanced system fails
      if (!this.fallbackMode && error.message?.includes("personalization")) {
        console.warn("Enhanced system failed, falling back to legacy mode");
        this.fallbackMode = true;
        return this.generateLegacyResponse(userMessage, context);
      }

      if (error.status === 429) {
        throw new AIServiceError(
          "Rate limit exceeded. Please try again later.",
          "RATE_LIMIT",
        );
      } else if (error.status >= 500) {
        throw new AIServiceError(
          "AI service is temporarily unavailable.",
          "API_ERROR",
          error.response.data,
        );
      } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        throw new AIServiceError(
          "Could not connect to AI service.",
          "NETWORK_ERROR",
          error,
        );
      }

      throw new AIServiceError(
        "An unexpected error occurred.",
        "API_ERROR",
        error,
      );
    }
  }

  async streamResponse(
    userMessage: string,
    context: AIContext,
    onChunk: (chunk: string) => void,
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Determine query type for model selection
      const queryType = this.analyzeQueryType(userMessage, context);
      
      // Build simple context for backend API
      const memoryContext = this.buildSimpleMemoryContext(context);
      const conversationSummary = this.buildConversationSummary();
      
      // Get selected model
      const model = this.selectModelByQueryType(queryType);
      
      // Call streaming backend API
      const baseUrl = import.meta.env.VITE_API_URL || 'https://nyxusd.com';
      const apiUrl = `${baseUrl}/api/ai/chat-stream`;
      
      console.log('🤖 AI Service: Making streaming request to:', apiUrl);
      console.log('🤖 AI Service: Request payload:', {
        message: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
        context: Object.keys(context),
        memoryContext: memoryContext ? 'present' : 'none',
        conversationSummary: conversationSummary ? 'present' : 'none',
        model
      });
      
      const requestPayload = {
        message: userMessage,
        context,
        memoryContext,
        conversationSummary,
        model
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('🤖 AI Service: Streaming response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 AI Service: Streaming error response:', errorText);
        
        // Handle validation errors with user-friendly messages
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          if (response.status === 400 && errorData.validationErrors) {
            const validationError = errorData.validationErrors.find((err: any) => 
              err.field === 'memoryContext' && err.message.includes('2000 characters')
            );
            if (validationError) {
              throw new Error('Your conversation history is too long. Let me clear some context and try again.');
            }
          }
          if (response.status === 400 && errorData.error === 'Validation failed') {
            throw new Error('Invalid request format. Please try again with a different message.');
          }
        } catch (parseError) {
          // If we can't parse the error, use the original text
        }
        
        throw new Error(`Streaming API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullMessage += chunk;
          
          // Send chunk to callback
          onChunk(chunk);
        }
      } catch (streamError) {
        console.error('🤖 AI Service: Stream processing error:', streamError);
        throw new Error('Failed to process streaming response');
      }

      // Store conversation in simple memory
      this.storeConversationLocally(userMessage, fullMessage);

      // Create structured response
      const parsedResponse = {
        message: fullMessage,
        intent: {
          action: "continue" as const,
          confidence: 0.8,
        },
        shouldContinue: false,
      };

      // Update analytics
      this.updateAnalytics(startTime, userMessage, parsedResponse, queryType);

      return this.convertToAIResponse(parsedResponse);

    } catch (error) {
      console.error("Streaming error:", error);

      // Fallback to simulated streaming with regular API
      console.warn("Real streaming failed, falling back to simulated streaming");
      
      try {
        const response = await this.generateResponse(userMessage, context);
        
        // Enhanced streaming simulation with character-by-character display
        const message = response.message || '';
        if (!message) {
          onChunk(''); // Send empty chunk if no message
          return response;
        }
        
        // Stream character by character for more natural typing effect
        const chars = message.split('');
        
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          
          // Send the new character as chunk
          onChunk(char);
          
          // Variable delay based on character type for natural typing
          let delay = 30; // Base delay
          if (['.', '!', '?'].includes(char)) delay = 200; // Pause at sentence end
          else if ([',', ';', ':'].includes(char)) delay = 100; // Pause at punctuation
          else if (char === ' ') delay = 50; // Slight pause at spaces
          else if (char === '\n') delay = 150; // Pause at line breaks
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return response;
      } catch (fallbackError) {
        console.error("Fallback streaming also failed:", fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Build enhanced system prompt using new personalization and optimization system
   */
  private async buildEnhancedSystemPrompt(
    userMessage: string,
    context: AIContext,
  ): Promise<string> {
    // Fallback to legacy system if needed
    if (this.fallbackMode) {
      return this.buildLegacySystemPrompt(context);
    }

    try {
      // Convert context to enhanced format
      const enhancedContext = this.convertToEnhancedContext(context);

      // Build personalization profile
      const personalizationProfile = this.buildPersonalizationProfile(
        context.userProfile,
      );

      // Create personalization context
      const personalizationContext: PersonalizationContext = {
        step: context.conversationStep,
        concept: this.extractConcept(userMessage),
        urgency: this.determineUrgency(userMessage, context),
        complexity: this.calculateComplexity(context.conversationStep),
        userConfidence: this.estimateUserConfidence(context),
        timeOfDay: this.getTimeOfDay(),
      };

      // Get personalization strategy
      const personalizationResult =
        this.personalizationEngine.selectPersonalization(
          personalizationProfile,
          personalizationContext,
        );

      // Build prompt using new system
      const promptResult = new PromptBuilder({
        maxTokens: this.config.maxTokens || 128000, // Default to higher limit for Gemini
        compressionLevel: "basic",
        personalizeWith: ["occupation", "riskTolerance", "timeline"],
        includeHistory: true,
        maxHistoryItems: 3,
      })
        .withStep(context.conversationStep)
        .withPersonalization(context.userProfile)
        .withContext({
          step: context.conversationStep,
          userProfile: context.userProfile,
          walletData: context.walletData,
          userMessage,
          conversationHistory: context.conversationHistory,
        })
        .build();

      if (promptResult.isErr()) {
        console.warn("Prompt building failed:", promptResult.error);
        return this.buildLegacySystemPrompt(context);
      }

      const prompt = promptResult.value;

      // Apply optimization
      const optimizationResult = this.promptOptimizer.optimize(prompt.prompt, {
        level: "balanced",
        preserveClarity: true,
        maxTokens: this.config.maxTokens,
      });

      // Store optimization stats for analytics
      this.analytics.optimizationStats = {
        promptCompressionRatio: optimizationResult.reduction,
        clarityScore: optimizationResult.clarity,
        effectivenessScore: personalizationResult.confidence * 100,
      };

      // Enhance with personalization elements
      const enhancedPrompt = this.enhancePromptWithPersonalization(
        optimizationResult.optimizedPrompt,
        personalizationResult,
      );

      console.log("Enhanced prompt built successfully:", {
        originalTokens: optimizationResult.originalTokens,
        optimizedTokens: optimizationResult.optimizedTokens,
        tokensSaved:
          optimizationResult.originalTokens -
          optimizationResult.optimizedTokens,
        personalizationConfidence: personalizationResult.confidence,
      });

      return enhancedPrompt;
    } catch (error) {
      console.error("Enhanced prompt building failed:", error);
      return this.buildLegacySystemPrompt(context);
    }
  }

  /**
   * Build system prompt using the new modular system
   */
  private buildSystemPrompt(context: AIContext, userMessage: string = ''): string {
    try {
      // Use enhanced prompt system
      const enhancedContext = {
        step: context.conversationStep,
        userProfile: {
          ...context.userProfile,
          experienceLevel: context.userProfile.experienceLevel || 'intermediate',
        },
        walletData: context.walletData,
        userMessage: userMessage,
        previousMessages: context.conversationHistory?.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        urgency: 'medium' as const,
        complexity: 0.7
      };

      const result = buildEnhancedPrompt(enhancedContext, {
        enablePersonalization: true,
        enableAnalogies: true,
        enableOptimization: true,
        optimizationLevel: 'balanced'
      });

      if (result.isOk()) {
        return result.value.prompt;
      } else {
        console.warn('Enhanced prompt building failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.warn('Enhanced prompt failed, using fallback:', error);
      
      // Fallback to original system
      const { conversationStep, userProfile, walletData } = context;
      
      return `You are Nyx, an AI investment assistant for a DeFi platform specializing in CDP (Collateralized Debt Position) management. 
      
Current conversation step: ${conversationStep}
User profile: ${JSON.stringify(userProfile)}
Wallet data: ${walletData ? JSON.stringify(walletData) : 'Not connected'}

Your personality:
- Friendly, knowledgeable, and encouraging
- Use simple language to explain complex DeFi concepts
- Create personalized analogies based on ANY occupation the user provides
- Find creative connections between their profession and investment concepts
- For uncommon occupations, identify core activities and draw parallels from those
- Be concise but informative

Guidelines for this step:
${this.getStepGuidelines(conversationStep)}

Always structure your response with:
1. A clear message to the user
2. Intent detection from their input
3. Whether to continue to the next step
4. What the next step should be (if applicable)`;
    }
  }

  /**
   * Legacy system prompt for backward compatibility
   */
  private buildLegacySystemPrompt(context: AIContext): string {
    const { conversationStep, userProfile, walletData } = context;

    return `You are Nyx, an AI investment assistant for a DeFi platform specializing in CDP (Collateralized Debt Position) management. 
    
Current conversation step: ${conversationStep}
User profile: ${JSON.stringify(userProfile)}
Wallet data: ${walletData ? JSON.stringify(walletData) : "Not connected"}

Your personality:
- Friendly, knowledgeable, and encouraging
- Use simple language to explain complex DeFi concepts
- Create personalized analogies based on ANY occupation the user provides
- Find creative connections between their profession and investment concepts
- For uncommon occupations, identify core activities and draw parallels from those
- Be concise but informative

Guidelines for this step:
${this.getStepGuidelines(conversationStep)}

Always structure your response with:
1. A clear message to the user
2. Intent detection from their input
3. Whether to continue to the next step
4. What the next step should be (if applicable)`;
  }

  /**
   * Enhanced step guidelines with personalization
   */
  private getStepGuidelines(step: ConversationStep): string {
    const guidelines: Record<ConversationStep, string> = {
      initial:
        "Welcome the user and explain your purpose. Ask if they want to connect their wallet.",
      chat: "Have a natural conversation. Answer questions about DeFi, CDPs, and investment strategies.",
      strategy_choice:
        "Help user choose between custom strategy, templates, or protocol exploration.",
      template_selection:
        "Present strategy templates based on risk tolerance and goals.",
      protocol_selection:
        "Recommend protocols based on user profile and risk tolerance.",
      strategy_builder:
        "Guide through interactive strategy building with personalized recommendations.",
      leverage_optimization:
        "Explain CDP leverage benefits and risks based on user profile.",
      wallet_prompt:
        "Encourage the user to connect their wallet to get personalized recommendations.",
      wallet_scanning: "Inform the user that you are analyzing their wallet.",
      wallet_analyzed:
        "Summarize their wallet holdings and transition to understanding their goals.",
      risk_assessment:
        "Ask about their risk tolerance in a friendly, non-intimidating way.",
      investment_goals:
        "Understand if they want growth, income, or capital preservation.",
      occupation: "Ask about their occupation to personalize explanations. Accept any profession they provide.",
      occupation_explanation:
        "Generate creative, relevant analogies for their specific occupation. Find parallels between their professional activities and DeFi concepts. If it's an uncommon occupation, identify its key characteristics (analytical, creative, physical, service-oriented) and build analogies from those aspects.",
      risk_tolerance:
        "Assess their comfort level with volatility and potential losses.",
      timeline:
        "Understand their investment horizon (short, medium, or long term).",
      amount:
        "Ask about their monthly investment capacity without being pushy.",
      experience_level: "Gauge their familiarity with DeFi and crypto.",
      generating_recommendations:
        "Let them know you are creating personalized recommendations.",
      recommendations:
        "Present tailored investment strategies with clear explanations.",
      complete: "Offer to answer any questions and provide ongoing support.",
    };

    return (
      guidelines[step] || "Engage naturally and help the user with their needs."
    );
  }

  reset(): void {
    this.memory = this.createMemory();
    this.conversationHistory = [];
    this.isInitialized = false;
    this.fallbackMode = false;

    // Reset analytics
    this.analytics = {
      totalTokensUsed: 0,
      tokensSaved: 0,
      avgResponseTime: 0,
      personalizationScore: 0,
      optimizationStats: {
        promptCompressionRatio: 0,
        clarityScore: 0,
        effectivenessScore: 0,
      },
    };

    console.log("LangChain AI service reset - conversation history cleared");
  }

  /**
   * Get analytics and performance metrics
   */
  getAnalytics(): AIServiceAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get personalization effectiveness score
   */
  getPersonalizationScore(): number {
    return this.analytics.personalizationScore;
  }

  /**
   * Get token optimization statistics
   */
  getOptimizationStats(): typeof this.analytics.optimizationStats {
    return { ...this.analytics.optimizationStats };
  }

  // =====================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================

  /**
   * Convert AIContext to enhanced context format
   */
  private convertToEnhancedContext(context: AIContext): EnhancedAIContext {
    return {
      ...context,
      hobbies: context.userProfile.hobbies,
      interests: context.userProfile.interests,
      experienceLevel: context.userProfile.experienceLevel,
      urgency: "medium", // Default, can be determined from user message
      complexity: this.calculateComplexity(context.conversationStep),
      timeOfDay: this.getTimeOfDay(),
    };
  }

  /**
   * Build personalization profile from user profile
   */
  private buildPersonalizationProfile(
    userProfile: UserProfile,
  ): PersonalizationProfile {
    return {
      // Professional dimension
      occupation: userProfile.occupation,
      industry: userProfile.industry,
      workStyle: userProfile.workStyle,
      careerStage: this.mapCareerStage(userProfile.careerStage),

      // Personal dimension
      hobbies: userProfile.hobbies,
      interests: userProfile.interests,
      lifestyle: userProfile.lifestyle,
      values: userProfile.values,

      // Financial dimension
      experienceLevel: userProfile.experienceLevel,
      riskTolerance: userProfile.riskTolerance,
      investmentGoals: userProfile.financialGoals,

      // Learning preferences
      learningStyle: userProfile.learningStyle,
      communicationStyle: this.mapCommunicationStyle(
        userProfile.communicationPreference,
      ),

      // Demographic (optional)
      ageRange: userProfile.ageRange,
      familyStatus:
        userProfile.familyStatus === "prefer_not_to_say"
          ? undefined
          : this.mapFamilyStatus(userProfile.familyStatus),
    };
  }

  /**
   * Map communication preference to style
   */
  private mapCommunicationStyle(
    preference?: string,
  ): PersonalizationProfile["communicationStyle"] {
    switch (preference) {
      case "concise":
        return "concise";
      case "detailed":
        return "detailed";
      case "analogies":
        return "conversational";
      case "examples":
        return "conversational";
      default:
        return "conversational";
    }
  }

  /**
   * Map career stage from UserProfile to PersonalizationProfile format
   */
  private mapCareerStage(careerStage?: string): CareerStage | undefined {
    switch (careerStage) {
      case "entry":
        return "entry-level";
      case "mid":
        return "mid-level";
      case "senior":
        return "senior";
      case "executive":
        return "executive";
      case "retired":
        return "retired";
      default:
        return undefined;
    }
  }

  /**
   * Map family status from UserProfile to PersonalizationProfile format
   */
  private mapFamilyStatus(familyStatus?: string): FamilyStatus | undefined {
    switch (familyStatus) {
      case "single":
        return "single";
      case "married":
        return "married";
      case "family":
        return "parent";
      default:
        return undefined;
    }
  }

  /**
   * Get JSON format instructions for structured output
   */
  private getJSONFormatInstructions(): string {
    return `You must respond with a valid JSON object matching this exact schema:
{
  "message": "string - The response message to show the user",
  "intent": {
    "action": "string - One of: connect_wallet, select_option, input_value, continue, skip, help, unclear",
    "confidence": "number - Between 0 and 1",
    "extractedValue": "string or number - Optional value extracted from user input"
  },
  "shouldContinue": "boolean - Whether to continue to the next step",
  "nextStep": "string - Optional next conversation step"
}

Ensure the response is valid JSON without any markdown formatting or code blocks.`;
  }

  /**
   * Parse JSON response from AI with proper validation
   */
  private parseJSONResponse(text: string): z.infer<typeof responseSchema> {
    // Try to extract JSON from response if it's wrapped in code blocks
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      const parsed = JSON.parse(jsonText);
      return responseSchema.parse(parsed);
    } catch (error) {
      // If JSON parsing fails, try to find JSON in the text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return responseSchema.parse(parsed);
      }
      throw error;
    }
  }

  /**
   * Convert ParsedAIResponse to AIResponse with proper type validation
   */
  private convertToAIResponse(parsedResponse: z.infer<typeof responseSchema>): AIResponse {
    return {
      message: parsedResponse.message,
      intent: parsedResponse.intent ? {
        action: parsedResponse.intent.action,
        confidence: parsedResponse.intent.confidence,
        extractedValue: parsedResponse.intent.extractedValue,
      } : undefined,
      shouldContinue: parsedResponse.shouldContinue,
      nextStep: parsedResponse.nextStep,
    };
  }

  /**
   * Extract main concept from user message
   */
  private extractConcept(userMessage: string): string {
    const concepts = [
      "investment",
      "risk",
      "strategy",
      "DeFi",
      "CDP",
      "portfolio",
      "yield",
    ];
    const lowerMessage = userMessage.toLowerCase();

    for (const concept of concepts) {
      if (lowerMessage.includes(concept.toLowerCase())) {
        return concept;
      }
    }

    return "general";
  }

  /**
   * Determine urgency from user message and context
   */
  private determineUrgency(
    userMessage: string,
    context: AIContext,
  ): "low" | "medium" | "high" {
    const urgentWords = ["urgent", "quickly", "asap", "immediately", "now"];
    const lowerMessage = userMessage.toLowerCase();

    if (urgentWords.some((word) => lowerMessage.includes(word))) {
      return "high";
    }

    // High urgency for financial decisions
    if (
      context.conversationStep === "recommendations" ||
      context.conversationStep === "strategy_builder"
    ) {
      return "high";
    }

    return "medium";
  }

  /**
   * Calculate complexity based on conversation step
   */
  private calculateComplexity(step: ConversationStep): number {
    const complexityMap: Record<ConversationStep, number> = {
      initial: 2,
      chat: 5,
      strategy_choice: 4,
      template_selection: 6,
      protocol_selection: 7,
      strategy_builder: 8,
      leverage_optimization: 9,
      wallet_prompt: 3,
      wallet_scanning: 2,
      wallet_analyzed: 6,
      risk_assessment: 5,
      investment_goals: 4,
      occupation: 3,
      occupation_explanation: 6,
      risk_tolerance: 5,
      timeline: 4,
      amount: 3,
      experience_level: 4,
      generating_recommendations: 2,
      recommendations: 8,
      complete: 3,
    };

    return complexityMap[step] || 5;
  }

  /**
   * Estimate user confidence based on context
   */
  private estimateUserConfidence(context: AIContext): number {
    let confidence = 0.5; // Base confidence

    if (context.userProfile.experienceLevel === "advanced") confidence += 0.3;
    if (context.userProfile.experienceLevel === "beginner") confidence -= 0.2;

    if (context.conversationHistory.length > 5) confidence += 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get current time of day
   */
  private getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "night";
  }

  /**
   * Enhance prompt with personalization elements
   */
  private enhancePromptWithPersonalization(
    basePrompt: string,
    personalizationResult: PersonalizationResult,
  ): string {
    let enhancedPrompt = basePrompt;

    // Add analogies if available
    if (personalizationResult.analogies.length > 0) {
      enhancedPrompt += `\n\nPersonalization analogies: ${personalizationResult.analogies.join("; ")}`;
    }

    // Add examples if available
    if (personalizationResult.examples.length > 0) {
      enhancedPrompt += `\n\nPersonalized examples: ${personalizationResult.examples.join("; ")}`;
    }

    // Add tone and complexity guidance
    enhancedPrompt += `\n\nCommunication style: ${personalizationResult.tone}, complexity level: ${personalizationResult.complexity}/10`;

    return enhancedPrompt;
  }

  /**
   * Track generation for cost monitoring (OpenRouter feature)
   */
  private async trackGeneration(
    userMessage: string,
    queryType: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.openRouterConfig.baseURL}/generation`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": this.openRouterConfig.appUrl,
          "X-Title": this.openRouterConfig.appName,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.selectModelByQueryType(queryType as any),
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Generation tracked:", data.usage);
      }
    } catch (error) {
      console.warn("Failed to track generation:", error);
    }
  }
  
  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.openRouterConfig.baseURL}/models`, {
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": this.openRouterConfig.appUrl,
          "X-Title": this.openRouterConfig.appName,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data.map((model: any) => model.id);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
    return [];
  }
  
  /**
   * Set provider routing preferences
   */
  setProviderPreferences(providers: string[], allowFallbacks: boolean = true): void {
    // This will be used in the next LLM creation
    this.config.providerPreferences = {
      order: providers,
      allow_fallbacks: allowFallbacks,
    };
  }
  
  /**
   * Enable transform settings for better responses
   */
  enableTransforms(transforms: string[]): void {
    this.config.transforms = transforms;
  }
  
  /**
   * Update analytics with response data
   */
  private updateAnalytics(
    startTime: number,
    systemPrompt: string,
    response: { message: string },
    queryType?: string,
  ): void {
    const responseTime = Date.now() - startTime;
    const promptTokens = this.estimateTokens(systemPrompt);
    const responseTokens = this.estimateTokens(response.message);

    this.analytics.totalTokensUsed += promptTokens + responseTokens;
    this.analytics.avgResponseTime =
      (this.analytics.avgResponseTime + responseTime) / 2;

    // Update personalization score based on response quality
    const personalizedElements = this.countPersonalizedElements(
      response.message,
    );
    this.analytics.personalizationScore =
      (this.analytics.personalizationScore + personalizedElements) / 2;
  }

  /**
   * Simple token estimation
   */
  private estimateTokens(text: string | undefined | null): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    return Math.ceil(text.length / 4); // Rough approximation
  }

  /**
   * Count personalized elements in response
   */
  private countPersonalizedElements(text: string | undefined | null): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    const personalizedIndicators = [
      "like",
      "similar to",
      "as a",
      "in your field",
      "for example",
      "consider",
      "based on your",
      "given your",
    ];

    return personalizedIndicators.reduce((count, indicator) => {
      return count + (text.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);
  }

  /**
   * Legacy response generation for fallback - now uses backend API
   */
  private async generateLegacyResponse(
    userMessage: string,
    context: AIContext,
  ): Promise<AIResponse> {
    console.warn("Using legacy fallback mode, calling backend API");
    
    // Use the same backend API call as the main method
    return this.generateResponse(userMessage, context);
  }

  /**
   * Legacy streaming response for fallback - now uses backend API
   */
  private async streamLegacyResponse(
    userMessage: string,
    context: AIContext,
    onChunk: (chunk: string) => void,
  ): Promise<AIResponse> {
    console.warn("Using legacy streaming fallback mode, calling backend API");
    
    // Use the same streaming method as the main method
    return this.streamResponse(userMessage, context, onChunk);
  }

}
