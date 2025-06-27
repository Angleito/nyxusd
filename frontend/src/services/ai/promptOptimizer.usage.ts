/**
 * Usage examples and integration guide for the PromptOptimizer
 * This file demonstrates how to integrate prompt optimization into the existing AI service
 */

import { AIContext, AIResponse } from "./aiService";
import { PromptContext } from "./promptTemplates";
import {
  PromptOptimizer,
  createOptimizer,
  OptimizationConfig,
} from "./promptOptimizer";
import {
  OptimizedPromptTemplates,
  createOptimizedPromptTemplates,
} from "./optimizedPromptTemplates";

/**
 * Enhanced AI Service with prompt optimization
 */
export class OptimizedAIService {
  private optimizer: PromptOptimizer;
  private optimizedTemplates: OptimizedPromptTemplates;
  private config: OptimizationConfig;

  constructor(
    config: OptimizationConfig = {
      level: "balanced",
      preserveClarity: true,
      maxTokens: 400, // Token budget for cost control
      enableAbbreviations: true,
      compressRepeatedPatterns: true,
    },
  ) {
    this.config = config;
    this.optimizer = createOptimizer(config);
    this.optimizedTemplates = createOptimizedPromptTemplates(config);
  }

  /**
   * Generate optimized prompt for AI service
   */
  generateOptimizedPrompt(context: AIContext): {
    prompt: string;
    optimization: {
      originalTokens: number;
      optimizedTokens: number;
      reduction: number;
      withinBudget: boolean;
    };
  } {
    const promptContext: PromptContext = {
      step: context.conversationStep,
      userProfile: context.userProfile,
      walletData: context.walletData,
      userMessage:
        context.conversationHistory[context.conversationHistory.length - 1]
          ?.content || "",
      previousMessages: context.conversationHistory.slice(-3), // Last 3 messages for context
    };

    // Use pre-optimized templates for better performance
    const optimizedPrompt =
      this.optimizedTemplates.getPreOptimizedPrompt(promptContext);

    // Get optimization analytics
    const analytics =
      this.optimizedTemplates.getOptimizationAnalytics(promptContext);

    return {
      prompt: optimizedPrompt,
      optimization: {
        originalTokens: analytics.originalTokens,
        optimizedTokens: analytics.optimizedTokens,
        reduction: analytics.reduction,
        withinBudget:
          !this.config.maxTokens ||
          analytics.optimizedTokens <= this.config.maxTokens,
      },
    };
  }

  /**
   * Dynamic optimization based on context urgency
   */
  generateContextAwarePrompt(
    context: AIContext,
    urgency: "low" | "medium" | "high",
  ): string {
    const optimizationLevels: Record<
      typeof urgency,
      OptimizationConfig["level"]
    > = {
      low: "conservative",
      medium: "balanced",
      high: "aggressive",
    };

    const promptContext: PromptContext = {
      step: context.conversationStep,
      userProfile: context.userProfile,
      walletData: context.walletData,
      userMessage:
        context.conversationHistory[context.conversationHistory.length - 1]
          ?.content || "",
    };

    return this.optimizedTemplates.getDynamicOptimizedPrompt(
      promptContext,
      this.config.maxTokens,
      optimizationLevels[urgency],
    );
  }
}

/**
 * Usage examples for different scenarios
 */
export const usageExamples = {
  // Basic optimization for cost savings
  basicOptimization: () => {
    const optimizer = createOptimizer({
      level: "balanced",
      preserveClarity: true,
    });

    const originalPrompt = `
      Present 3 personalized investment strategies based on the user's profile.
      Make sure to explain each strategy using analogies from their occupation.
      Include expected returns and risks for each strategy.
      Be helpful and informative while staying concise and professional.
    `;

    const result = optimizer.optimize(originalPrompt);

    console.log("Original tokens:", result.originalTokens);
    console.log("Optimized tokens:", result.optimizedTokens);
    console.log("Reduction:", result.reduction.toFixed(1) + "%");
    console.log("Optimized prompt:", result.optimizedPrompt);

    return result;
  },

  // High-volume scenario with aggressive optimization
  highVolumeOptimization: () => {
    const optimizer = createOptimizer({
      level: "aggressive",
      preserveClarity: false,
      maxTokens: 150,
    });

    const prompts = [
      "Explain DeFi yield farming strategies",
      "Analyze user portfolio for optimization opportunities",
      "Recommend CDP leverage ratios based on risk tolerance",
      "Guide user through wallet connection process",
    ];

    const results = prompts.map((prompt) => {
      const result = optimizer.optimize(prompt);
      return {
        original: prompt,
        optimized: result.optimizedPrompt,
        reduction: result.reduction,
      };
    });

    console.log("High-volume optimization results:");
    results.forEach((result, i) => {
      console.log(`${i + 1}. Reduction: ${result.reduction.toFixed(1)}%`);
      console.log(`   Original: ${result.original}`);
      console.log(`   Optimized: ${result.optimized}\n`);
    });

    return results;
  },

  // Real-time optimization with token budget
  realTimeOptimization: () => {
    const templates = createOptimizedPromptTemplates({
      level: "balanced",
      maxTokens: 300,
      preserveClarity: true,
    });

    const context: PromptContext = {
      step: "recommendations",
      userProfile: {
        occupation: "software engineer",
        investmentGoal: "growth",
        riskTolerance: "moderate",
        timeline: "long-term",
        monthlyAmount: 2000,
      },
      userMessage:
        "I want to maximize my returns while keeping reasonable risk",
      walletData: {
        totalValueUSD: 75000,
        assets: [
          { symbol: "ETH", balance: "20", valueUSD: 50000 },
          { symbol: "USDC", balance: "25000", valueUSD: 25000 },
        ],
      },
    };

    const optimizedPrompt = templates.getOptimizedPrompt(context);
    const analytics = templates.getOptimizationAnalytics(context);

    console.log("Real-time optimization:");
    console.log("Step:", context.step);
    console.log("Tokens:", analytics.optimizedTokens);
    console.log("Within budget:", analytics.optimizedTokens <= 300);
    console.log("Prompt:", optimizedPrompt);

    return { optimizedPrompt, analytics };
  },

  // A/B testing setup
  abTestingSetup: () => {
    const conservativeOptimizer = createOptimizer({ level: "conservative", preserveClarity: true });
    const aggressiveOptimizer = createOptimizer({ level: "aggressive", preserveClarity: false });

    const testPrompt =
      "Explain the benefits of using CDPs for yield optimization";

    const conservativeResult = conservativeOptimizer.optimize(testPrompt);
    const aggressiveResult = aggressiveOptimizer.optimize(testPrompt);

    console.log("A/B Testing Setup:");
    console.log("\nVariant A (Conservative):");
    console.log("Tokens:", conservativeResult.optimizedTokens);
    console.log("Clarity:", conservativeResult.clarity);
    console.log("Prompt:", conservativeResult.optimizedPrompt);

    console.log("\nVariant B (Aggressive):");
    console.log("Tokens:", aggressiveResult.optimizedTokens);
    console.log("Clarity:", aggressiveResult.clarity);
    console.log("Prompt:", aggressiveResult.optimizedPrompt);

    return { conservativeResult, aggressiveResult };
  },

  // Contextual optimization based on user profile
  contextualOptimization: () => {
    const optimizer = createOptimizer({ level: "balanced", preserveClarity: true });

    const contexts = [
      {
        userType: "beginner",
        prompt: "Explain DeFi concepts and guide through first investment",
        config: { preserveClarity: true, level: "conservative" as const },
      },
      {
        userType: "expert",
        prompt: "Provide advanced CDP strategies and optimization techniques",
        config: { preserveClarity: false, level: "aggressive" as const },
      },
      {
        userType: "high-value",
        prompt:
          "Analyze portfolio and provide comprehensive investment recommendations",
        config: { preserveClarity: true, level: "balanced" as const },
      },
    ];

    const results = contexts.map(({ userType, prompt, config }) => {
      const contextOptimizer = createOptimizer(config);
      const result = contextOptimizer.optimize(prompt);

      return {
        userType,
        originalTokens: result.originalTokens,
        optimizedTokens: result.optimizedTokens,
        reduction: result.reduction,
        clarity: result.clarity,
        optimizedPrompt: result.optimizedPrompt,
      };
    });

    console.log("Contextual optimization results:");
    results.forEach((result) => {
      console.log(`\n${result.userType}:`);
      console.log(`  Reduction: ${result.reduction.toFixed(1)}%`);
      console.log(`  Clarity: ${result.clarity}/100`);
      console.log(
        `  Tokens: ${result.originalTokens} → ${result.optimizedTokens}`,
      );
    });

    return results;
  },
};

/**
 * Integration patterns for existing codebase
 */
export const integrationPatterns = {
  // Middleware pattern for AI service
  createOptimizationMiddleware: (config?: OptimizationConfig) => {
    const optimizer = createOptimizer(config);

    return (prompt: string, context?: any) => {
      const result = optimizer.optimize(prompt, {
        ...config,
        priorityContext: context?.priority || [],
      });

      return {
        prompt: result.optimizedPrompt,
        metadata: {
          originalTokens: result.originalTokens,
          optimizedTokens: result.optimizedTokens,
          reduction: result.reduction,
          clarity: result.clarity,
        },
      };
    };
  },

  // Factory pattern for different optimization strategies
  createOptimizationFactory: () => {
    const strategies = {
      costOptimized: createOptimizer({
        level: "aggressive",
        preserveClarity: false,
        maxTokens: 200,
      }),

      qualityOptimized: createOptimizer({
        level: "conservative",
        preserveClarity: true,
        maxTokens: 500,
      }),

      balanced: createOptimizer({
        level: "balanced",
        preserveClarity: true,
        maxTokens: 350,
      }),
    };

    return (strategy: keyof typeof strategies, prompt: string) => {
      return strategies[strategy].optimize(prompt);
    };
  },

  // Decorator pattern for existing prompt functions
  withOptimization: (
    originalFunction: (context: any) => string,
    optimizationConfig?: OptimizationConfig,
  ) => {
    const optimizer = createOptimizer(optimizationConfig);

    return (context: any) => {
      const originalPrompt = originalFunction(context);
      const result = optimizer.optimize(originalPrompt);

      // Add optimization metadata to context
      if (context.metadata) {
        context.metadata.optimization = {
          originalTokens: result.originalTokens,
          optimizedTokens: result.optimizedTokens,
          reduction: result.reduction,
        };
      }

      return result.optimizedPrompt;
    };
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  // Token usage tracker
  tokenUsageTracker: () => {
    const usage = {
      original: 0,
      optimized: 0,
      requests: 0,
    };

    return {
      track: (originalTokens: number, optimizedTokens: number) => {
        usage.original += originalTokens;
        usage.optimized += optimizedTokens;
        usage.requests += 1;
      },

      getStats: () => ({
        totalOriginalTokens: usage.original,
        totalOptimizedTokens: usage.optimized,
        totalRequests: usage.requests,
        averageReduction:
          usage.original > 0
            ? ((usage.original - usage.optimized) / usage.original) * 100
            : 0,
        tokensSaved: usage.original - usage.optimized,
      }),
    };
  },

  // Cost calculator
  costCalculator: (costPer1KTokens: number = 0.03) => {
    return (originalTokens: number, optimizedTokens: number) => {
      const originalCost = (originalTokens / 1000) * costPer1KTokens;
      const optimizedCost = (optimizedTokens / 1000) * costPer1KTokens;
      const savings = originalCost - optimizedCost;

      return {
        originalCost: originalCost.toFixed(4),
        optimizedCost: optimizedCost.toFixed(4),
        savings: savings.toFixed(4),
        savingsPercentage: ((savings / originalCost) * 100).toFixed(1),
      };
    };
  },
};

/**
 * Example integration with existing AI service
 */
export function integrateWithAIService() {
  // This would be integrated into the existing aiService.ts
  const optimizedService = new OptimizedAIService({
    level: "balanced",
    preserveClarity: true,
    maxTokens: 400,
  });

  // Example of generating optimized prompt
  const mockContext: AIContext = {
    conversationStep: "recommendations",
    userProfile: {
      occupation: "doctor",
      investmentGoal: "growth",
      riskTolerance: "moderate",
      timeline: "long-term",
      monthlyAmount: 3000,
    },
    conversationHistory: [
      { role: "user", content: "I want to invest in DeFi but need guidance" },
      { role: "assistant", content: "I can help you build a strategy" },
      { role: "user", content: "Show me some recommendations" },
    ],
  };

  const result = optimizedService.generateOptimizedPrompt(mockContext);

  console.log("Integration example:");
  console.log("Optimized prompt:", result.prompt);
  console.log(
    "Token reduction:",
    result.optimization.reduction.toFixed(1) + "%",
  );
  console.log("Within budget:", result.optimization.withinBudget);

  return result;
}

export default {
  OptimizedAIService,
  usageExamples,
  integrationPatterns,
  performanceMonitoring,
  integrateWithAIService,
};
