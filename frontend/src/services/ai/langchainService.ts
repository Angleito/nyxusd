import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  AIMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { StructuredOutputParser } from "langchain/output_parsers";
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
    .string()
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
  private llm: ChatOpenAI;
  private memory: ConversationSummaryMemory;
  private outputParser: StructuredOutputParser<z.infer<typeof responseSchema>>;
  private isInitialized = false;

  // Enhanced prompt system components
  private personalizationEngine: PersonalizationEngine;
  private promptOptimizer: PromptOptimizer;
  private analytics: AIServiceAnalytics;

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
    this.outputParser = StructuredOutputParser.fromZodSchema(responseSchema);
    this.llm = this.createLLM();
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
    const modelName = this.selectModelByQueryType(
      queryType || "simple",
      this.config.model
    );
    
    return new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || this.config.apiKey,
      modelName: modelName,
      temperature: this.config.temperature || 0.7,
      maxTokens: this.config.maxTokens || 500,
      streaming: this.config.streamResponse,
      configuration: {
        baseURL: this.openRouterConfig.baseURL,
        defaultHeaders: {
          "HTTP-Referer": this.openRouterConfig.appUrl,
          "X-Title": this.openRouterConfig.appName,
        },
      },
      modelKwargs: {
        provider: {
          order: ["Google", "DeepSeek", "Qwen", "OpenAI"],
          allow_fallbacks: true,
        },
        transforms: ["middle-out"],
      },
    });
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
        maxTokens: 200,
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
      const testResponse = await this.llm.call([
        {
          role: "system",
          content: 'You are a test. Reply with "OK".',
        },
      ]);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("AI configuration validation failed:", error);
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
      if (!this.isInitialized) {
        const isValid = await this.validateConfiguration();
        if (!isValid) {
          throw new AIServiceError(
            "AI service configuration is invalid",
            "INVALID_CONFIG",
          );
        }
      }
      
      // Determine query type for model selection
      const queryType = this.analyzeQueryType(userMessage, context);
      this.llm = this.createLLM(queryType);
      
      // Track costs if using generation endpoint
      if (this.config.trackCosts) {
        await this.trackGeneration(userMessage, queryType);
      }

      // Build enhanced system prompt
      const systemPrompt = await this.buildEnhancedSystemPrompt(
        userMessage,
        context,
      );
      const formatInstructions = this.outputParser.getFormatInstructions();

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemPrompt),
        HumanMessagePromptTemplate.fromTemplate(
          `User message: {input}\n\nFormat your response according to these instructions:\n${formatInstructions}`,
        ),
      ]);

      const chain = new LLMChain({
        llm: this.llm,
        prompt,
        memory: this.memory,
      });

      const result = await chain.call({
        input: userMessage,
        conversation_step: context.conversationStep,
        user_profile: JSON.stringify(context.userProfile),
        wallet_data: JSON.stringify(context.walletData || {}),
      });

      let parsedResponse: z.infer<typeof responseSchema>;

      try {
        parsedResponse = await this.outputParser.parse(result.text);
      } catch (parseError) {
        console.warn(
          "Failed to parse structured output, using fallback:",
          parseError,
        );
        parsedResponse = {
          message: result.text,
          intent: {
            action: "unclear",
            confidence: 0.5,
          },
          shouldContinue: false,
        };
      }

      await this.memory.saveContext(
        { input: userMessage },
        { output: parsedResponse.message },
      );

      // Update analytics with OpenRouter info
      this.updateAnalytics(startTime, systemPrompt, parsedResponse, queryType);

      return parsedResponse;
    } catch (error: any) {
      console.error("AI service error:", error);

      // Fallback to legacy system if enhanced system fails
      if (!this.fallbackMode && error.message?.includes("personalization")) {
        console.warn("Enhanced system failed, falling back to legacy mode");
        this.fallbackMode = true;
        return this.generateLegacyResponse(userMessage, context);
      }

      if (error.response?.status === 429) {
        throw new AIServiceError(
          "Rate limit exceeded. Please try again later.",
          "RATE_LIMIT",
          error.response.data,
        );
      } else if (error.response?.status >= 500) {
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
      if (!this.isInitialized) {
        await this.validateConfiguration();
      }
      
      // Determine query type for model selection
      const queryType = this.analyzeQueryType(userMessage, context);
      this.llm = this.createLLM(queryType);

      // Build enhanced system prompt for streaming
      const systemPrompt = await this.buildEnhancedSystemPrompt(
        userMessage,
        context,
      );
      let fullResponse = "";

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemPrompt),
        HumanMessagePromptTemplate.fromTemplate("{input}"),
      ]);

      const chain = new LLMChain({
        llm: this.llm,
        prompt,
      });

      const stream = await chain.stream({
        input: userMessage,
        conversation_step: context.conversationStep,
        user_profile: JSON.stringify(context.userProfile),
        wallet_data: JSON.stringify(context.walletData || {}),
      });

      for await (const chunk of stream) {
        const text = chunk.text || "";
        fullResponse += text;
        onChunk(text);
      }

      await this.memory.saveContext(
        { input: userMessage },
        { output: fullResponse },
      );

      // Update analytics for streaming with OpenRouter info
      this.updateAnalytics(startTime, systemPrompt, { message: fullResponse }, queryType);

      return {
        message: fullResponse,
        intent: {
          action: "unclear",
          confidence: 0.5,
        },
      };
    } catch (error) {
      console.error("Streaming error:", error);

      // Fallback to legacy streaming if enhanced system fails
      if (!this.fallbackMode && error.message?.includes("personalization")) {
        console.warn("Enhanced streaming failed, falling back to legacy mode");
        this.fallbackMode = true;
        return this.streamLegacyResponse(userMessage, context, onChunk);
      }

      throw error;
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
        maxTokens: this.config.maxTokens || 500,
        compressionLevel: "balanced",
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
    this.isInitialized = false;

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
      careerStage: userProfile.careerStage,

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
          : userProfile.familyStatus,
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
    if (context.userProfile.experienceLevel === "expert") confidence += 0.4;
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
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough approximation
  }

  /**
   * Count personalized elements in response
   */
  private countPersonalizedElements(text: string): number {
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
   * Legacy response generation for fallback
   */
  private async generateLegacyResponse(
    userMessage: string,
    context: AIContext,
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context, userMessage);
    const formatInstructions = this.outputParser.getFormatInstructions();

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate(
        `User message: {input}\n\nFormat your response according to these instructions:\n${formatInstructions}`,
      ),
    ]);

    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      memory: this.memory,
    });

    const result = await chain.call({
      input: userMessage,
      conversation_step: context.conversationStep,
      user_profile: JSON.stringify(context.userProfile),
      wallet_data: JSON.stringify(context.walletData || {}),
    });

    let parsedResponse: z.infer<typeof responseSchema>;

    try {
      parsedResponse = await this.outputParser.parse(result.text);
    } catch (parseError) {
      parsedResponse = {
        message: result.text,
        intent: {
          action: "unclear",
          confidence: 0.5,
        },
        shouldContinue: false,
      };
    }

    await this.memory.saveContext(
      { input: userMessage },
      { output: parsedResponse.message },
    );

    return parsedResponse;
  }

  /**
   * Legacy streaming response for fallback
   */
  private async streamLegacyResponse(
    userMessage: string,
    context: AIContext,
    onChunk: (chunk: string) => void,
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context, userMessage);
    let fullResponse = "";

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = new LLMChain({
      llm: this.llm,
      prompt,
    });

    const stream = await chain.stream({
      input: userMessage,
      conversation_step: context.conversationStep,
      user_profile: JSON.stringify(context.userProfile),
      wallet_data: JSON.stringify(context.walletData || {}),
    });

    for await (const chunk of stream) {
      const text = chunk.text || "";
      fullResponse += text;
      onChunk(text);
    }

    await this.memory.saveContext(
      { input: userMessage },
      { output: fullResponse },
    );

    return {
      message: fullResponse,
      intent: {
        action: "unclear",
        confidence: 0.5,
      },
    };
  }
}
