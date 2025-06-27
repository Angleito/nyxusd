/**
 * Optimized prompt templates that integrate with the existing prompt system
 * Demonstrates how to use PromptOptimizer with actual conversation flows
 */

import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../providers/AIAssistantProvider";
import { PromptContext, STEP_PROMPTS } from "./promptTemplates";
import {
  PromptOptimizer,
  OptimizationConfig,
  createOptimizer,
} from "./promptOptimizer";

/**
 * Optimized version of the prompt templates with different optimization levels
 */
export class OptimizedPromptTemplates {
  private optimizer: PromptOptimizer;
  private config: OptimizationConfig;

  constructor(
    config: OptimizationConfig = {
      level: "balanced",
      preserveClarity: true,
      enableAbbreviations: true,
      compressRepeatedPatterns: true,
    },
  ) {
    this.config = config;
    this.optimizer = createOptimizer(config);
  }

  /**
   * Get optimized prompt for a conversation step
   */
  getOptimizedPrompt(context: PromptContext): string {
    const originalPrompt = this.buildOriginalPrompt(context);
    const optimizationResult = this.optimizer.optimize(originalPrompt, {
      ...this.config,
      priorityContext: this.getPriorityContext(context),
    });

    return optimizationResult.optimizedPrompt;
  }

  /**
   * Get optimization analytics for a prompt
   */
  getOptimizationAnalytics(context: PromptContext) {
    const originalPrompt = this.buildOriginalPrompt(context);
    return this.optimizer.optimize(originalPrompt);
  }

  /**
   * Pre-optimized templates for each conversation step
   * These are hand-crafted for maximum efficiency while maintaining effectiveness
   */
  private static readonly OPTIMIZED_TEMPLATES: Record<
    ConversationStep,
    (ctx: PromptContext) => string
  > = {
    initial: () =>
      `Greet as Nyx, AI strategist. Offer: 1)Custom strat 2)Templates 3)Explore protocols. Stay engaging.`,

    chat: (ctx) => `Q: "${ctx.userMessage}" - Answer concisely, stay helpful.`,

    strategy_choice: (ctx) =>
      `User: "${ctx.userMessage}" - Guide: Custom=scratch, Template=proven, Explore=browse.`,

    template_selection: () => `3 templates:
- Conserv Yield (8-12% APY)
- Balanced DeFi (15-25% APY) 
- Aggr Yield Farm (30-80% APY)
Help choose per needs.`,

    protocol_selection: () => `Rec protocols:
- Aave: stable lending
- Curve: low-risk LP
- Yearn: auto-optimization
Ask if want these or explore others.`,

    strategy_builder: () => `Guide allocation:
- Show selections
- Suggest optimal %
- Explain risk/reward
Interactive & educational.`,

    leverage_optimization: () => `CDP leverage benefits:
- Amplifies yields
- Risk considerations
- Rec multiplier per profile
Ask if want leverage.`,

    wallet_prompt: (ctx) =>
      `User: "${ctx.userMessage}" - Want wallet connect? If yes, guide to button. If unsure, explain benefits (personal analysis).`,

    wallet_scanning: () =>
      `Wallet scanning... Building anticipation for analysis. Brief message.`,

    wallet_analyzed: (
      ctx,
    ) => `Wallet: $${ctx.walletData?.totalValueUSD.toLocaleString() || 0}
Assets: ${ctx.walletData?.assets.map((a) => `${a.symbol}:${a.balance}`).join(", ") || "none"}
Summarize positively. Ask inv goals.`,

    risk_assessment: () =>
      `Risk tolerance? Friendly, no jargon. Examples: conserv vs aggr approaches.`,

    investment_goals: (ctx) =>
      `User: "${ctx.userMessage}" - Understand goal: Growth/Income/Preservation. Acknowledge & explain.`,

    occupation: () =>
      `Occupation/interests? Helps with analogies. Give examples if unsure.`,

    occupation_explanation: (ctx) =>
      `User: ${ctx.userProfile.occupation || "professional"} - Create work analogy for inv strategies. Creative & memorable. Ask if makes sense.`,

    risk_tolerance: (ctx) =>
      `Per ${ctx.userProfile.occupation || "professional"}, ask risk tolerance in relatable terms. 3 options: conserv/mod/aggr.`,

    timeline: (ctx) =>
      `Risk: ${ctx.userProfile.riskTolerance || "unset"} - Ask inv timeline. Explain why matters for strategy.`,

    amount: () =>
      `Monthly inv capacity? Encouraging - any amount good. No pressure.`,

    experience_level: () =>
      `DeFi experience? Non-intimidating. Assure beginners you'll guide.`,

    generating_recommendations: (ctx) =>
      `Have all info. Build excitement for personal strategies. Mention ${ctx.userProfile.occupation || "background"}.`,

    recommendations: (ctx) => `3 strategies per:
Goal: ${ctx.userProfile.investmentGoal || "growth"}
Risk: ${ctx.userProfile.riskTolerance || "mod"}
Timeline: ${ctx.userProfile.timeline || "med-term"}
Amount: $${ctx.userProfile.monthlyAmount || 1000}/mo
Job: ${ctx.userProfile.occupation || "prof"}
Use job analogies. Include returns & risks.`,

    complete: () =>
      `Congrats! Questions on recs? Suggest next steps. Available for support.`,
  };

  /**
   * Use pre-optimized templates for maximum efficiency
   */
  getPreOptimizedPrompt(context: PromptContext): string {
    const template = OptimizedPromptTemplates.OPTIMIZED_TEMPLATES[context.step];
    return template ? template(context) : this.getOptimizedPrompt(context);
  }

  /**
   * Build original prompt using existing template system
   */
  private buildOriginalPrompt(context: PromptContext): string {
    const basePrompt = STEP_PROMPTS[context.step];
    return basePrompt ? basePrompt(context) : "";
  }

  /**
   * Determine priority context for optimization
   */
  private getPriorityContext(context: PromptContext): string[] {
    const priority: string[] = [];

    // Always prioritize user message and current step
    if (context.userMessage) priority.push("userMessage");
    priority.push("currentStep");

    // Add context based on conversation step
    switch (context.step) {
      case "wallet_analyzed":
        if (context.walletData) priority.push("walletData");
        break;
      case "recommendations":
      case "occupation_explanation":
      case "risk_tolerance":
        priority.push("userProfile");
        break;
      case "chat":
        if (context.previousMessages) priority.push("previousMessages");
        break;
    }

    return priority;
  }

  /**
   * Dynamic optimization based on context
   */
  getDynamicOptimizedPrompt(
    context: PromptContext,
    tokenBudget?: number,
    optimizationLevel?: OptimizationConfig["level"],
  ): string {
    const dynamicConfig: OptimizationConfig = {
      ...this.config,
      level: optimizationLevel || this.config.level,
      maxTokens: tokenBudget,
    };

    const originalPrompt = this.buildOriginalPrompt(context);
    const result = this.optimizer.optimize(originalPrompt, dynamicConfig);

    return result.optimizedPrompt;
  }

  /**
   * Get optimization recommendations for improving prompt templates
   */
  getTemplateOptimizationReport(): Array<{
    step: ConversationStep;
    originalTokens: number;
    optimizedTokens: number;
    reduction: number;
    recommendations: string[];
  }> {
    const mockContext = (step: ConversationStep): PromptContext => ({
      step,
      userProfile: {
        occupation: "software engineer",
        investmentGoal: "growth",
        riskTolerance: "moderate",
        timeline: "medium-term",
        monthlyAmount: 1000,
      },
      userMessage: "Sample user message",
      walletData: {
        totalValueUSD: 50000,
        assets: [
          { symbol: "ETH", balance: "15.5", valueUSD: 40000 },
          { symbol: "USDC", balance: "10000", valueUSD: 10000 },
        ],
      },
    });

    const steps: ConversationStep[] = [
      "initial",
      "chat",
      "strategy_choice",
      "template_selection",
      "protocol_selection",
      "strategy_builder",
      "recommendations",
      "wallet_analyzed",
      "risk_assessment",
      "investment_goals",
    ];

    return steps.map((step) => {
      const context = mockContext(step);
      const originalPrompt = this.buildOriginalPrompt(context);
      const analysis = this.optimizer.analyzeTokenUsage(originalPrompt);
      const optimization = this.optimizer.optimize(originalPrompt);

      return {
        step,
        originalTokens: analysis.totalTokens,
        optimizedTokens: optimization.optimizedTokens,
        reduction: optimization.reduction,
        recommendations: analysis.recommendations,
      };
    });
  }
}

/**
 * Factory function to create optimized prompt templates
 */
export function createOptimizedPromptTemplates(
  config?: OptimizationConfig,
): OptimizedPromptTemplates {
  return new OptimizedPromptTemplates(config);
}

/**
 * Utility function to get optimized prompt for any conversation step
 */
export function getOptimizedStepPrompt(
  step: ConversationStep,
  userMessage: string,
  userProfile: UserProfile,
  walletData?: WalletData,
  optimizationLevel: OptimizationConfig["level"] = "balanced",
): string {
  const templates = createOptimizedPromptTemplates({
    level: optimizationLevel,
    preserveClarity: true,
  });
  const context: PromptContext = {
    step,
    userMessage,
    userProfile,
    walletData,
  };

  return templates.getOptimizedPrompt(context);
}

/**
 * Batch optimization for multiple prompts
 */
export function batchOptimizePrompts(
  prompts: Array<{ context: PromptContext; tokenBudget?: number }>,
  level: OptimizationConfig["level"] = "balanced",
): Array<{
  context: PromptContext;
  originalPrompt: string;
  optimizedPrompt: string;
  optimization: {
    originalTokens: number;
    optimizedTokens: number;
    reduction: number;
    clarity: number;
  };
}> {
  const templates = createOptimizedPromptTemplates({ level, preserveClarity: true });

  return prompts.map(({ context, tokenBudget }) => {
    const originalPrompt = STEP_PROMPTS[context.step]?.(context) || "";
    const optimizedPrompt = templates.getDynamicOptimizedPrompt(
      context,
      tokenBudget,
      level,
    );

    const optimization = templates.getOptimizationAnalytics(context);

    return {
      context,
      originalPrompt,
      optimizedPrompt,
      optimization: {
        originalTokens: optimization.originalTokens,
        optimizedTokens: optimization.optimizedTokens,
        reduction: optimization.reduction,
        clarity: optimization.clarity,
      },
    };
  });
}

/**
 * A/B testing utility for prompt optimization
 */
export class PromptOptimizationTester {
  private results: Map<
    string,
    {
      original: { tokens: number; responses: number; effectiveness: number };
      optimized: { tokens: number; responses: number; effectiveness: number };
    }
  > = new Map();

  recordResult(
    promptId: string,
    version: "original" | "optimized",
    tokens: number,
    effectiveness: number,
  ) {
    if (!this.results.has(promptId)) {
      this.results.set(promptId, {
        original: { tokens: 0, responses: 0, effectiveness: 0 },
        optimized: { tokens: 0, responses: 0, effectiveness: 0 },
      });
    }

    const result = this.results.get(promptId)!;
    result[version].tokens += tokens;
    result[version].responses += 1;
    result[version].effectiveness += effectiveness;
  }

  getTestResults() {
    const results: Array<{
      promptId: string;
      originalAvgTokens: number;
      optimizedAvgTokens: number;
      tokenReduction: number;
      effectivenessChange: number;
      recommendOptimized: boolean;
    }> = [];

    this.results.forEach((data, promptId) => {
      const originalAvg =
        data.original.responses > 0
          ? data.original.tokens / data.original.responses
          : 0;
      const optimizedAvg =
        data.optimized.responses > 0
          ? data.optimized.tokens / data.optimized.responses
          : 0;

      const originalEffectiveness =
        data.original.responses > 0
          ? data.original.effectiveness / data.original.responses
          : 0;
      const optimizedEffectiveness =
        data.optimized.responses > 0
          ? data.optimized.effectiveness / data.optimized.responses
          : 0;

      const tokenReduction =
        originalAvg > 0
          ? ((originalAvg - optimizedAvg) / originalAvg) * 100
          : 0;
      const effectivenessChange =
        originalEffectiveness > 0
          ? ((optimizedEffectiveness - originalEffectiveness) /
              originalEffectiveness) *
            100
          : 0;

      results.push({
        promptId,
        originalAvgTokens: originalAvg,
        optimizedAvgTokens: optimizedAvg,
        tokenReduction,
        effectivenessChange,
        recommendOptimized: tokenReduction > 20 && effectivenessChange > -10,
      });
    });

    return results;
  }
}

export default OptimizedPromptTemplates;
