/**
 * @fileoverview Modular Prompt Builder System
 *
 * A comprehensive prompt building system for the NyxUSD AI assistant that implements
 * composable prompt construction with dynamic context injection, template composition,
 * and compression utilities.
 *
 * Key features:
 * - Fluent API for composable prompt construction
 * - Context-aware prompt building with dynamic data injection
 * - Prompt compression utilities for token optimization (40-60% reduction)
 * - Template-based prompt composition
 * - Type-safe configuration and validation
 *
 * @author NyxUSD Team
 * @version 1.0.0
 */

// Simple local implementations to avoid build issues
const pipe = <T, U>(value: T, fn: (val: T) => U): U => fn(value);

class Ok<T, E> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T, E> { return true; }
  isErr(): this is Err<T, E> { return false; }
  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }
}
class Err<T, E> {
  constructor(public readonly error: E) {}
  isOk(): this is Ok<T, E> { return false; }
  isErr(): this is Err<T, E> { return true; }
  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Err(this.error);
  }
}
type Result<T, E> = Ok<T, E> | Err<T, E>;
import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../providers/AIAssistantProvider";

/**
 * Configuration for the prompt builder system
 */
export interface PromptBuilderConfig {
  /** Maximum token limit for the generated prompt */
  maxTokens?: number;
  /** Level of compression to apply */
  compressionLevel?: "none" | "basic" | "aggressive";
  /** User profile attributes to include for personalization */
  personalizeWith?: Array<
    | "occupation"
    | "riskTolerance"
    | "timeline"
    | "investmentGoal"
    | "monthlyAmount"
  >;
  /** Whether to include conversation history */
  includeHistory?: boolean;
  /** Maximum number of historical messages to include */
  maxHistoryItems?: number;
  /** Custom template overrides */
  customTemplates?: Partial<PromptTemplateMap>;
}

/**
 * Context data for prompt building
 */
export interface PromptContext {
  step: ConversationStep;
  userProfile: UserProfile;
  walletData?: WalletData;
  userMessage: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  metadata?: Record<string, unknown>;
}

/**
 * Prompt template function type
 */
export type PromptTemplate = (context: PromptContext) => string;

/**
 * Map of conversation steps to their corresponding templates
 */
export type PromptTemplateMap = Record<ConversationStep, PromptTemplate>;

/**
 * Compression statistics for monitoring optimization
 */
export interface CompressionStats {
  originalLength: number;
  compressedLength: number;
  reductionPercentage: number;
  tokensSaved: number;
}

/**
 * Result of prompt building operation
 */
export interface PromptBuildResult {
  prompt: string;
  tokenCount: number;
  compressionStats?: CompressionStats;
  truncated: boolean;
  metadata: {
    config: PromptBuilderConfig;
    context: PromptContext;
    buildTime: number;
  };
}

/**
 * Default configuration for the prompt builder
 */
export const DEFAULT_PROMPT_CONFIG: PromptBuilderConfig = {
  maxTokens: 128000, // Updated for modern LLM limits
  compressionLevel: "basic",
  personalizeWith: ["occupation", "riskTolerance"],
  includeHistory: true,
  maxHistoryItems: 3,
} as const;

/**
 * Prompt compression patterns for basic optimization
 */
const BASIC_COMPRESSION_PATTERNS: Array<[RegExp, string]> = [
  [/\s+/g, " "], // Multiple spaces to single space
  [/\n\s*\n/g, "\n"], // Multiple newlines to single newline
  [/\s*,\s*/g, ", "], // Normalize comma spacing
  [/\s*\.\s*/g, ". "], // Normalize period spacing
  [/\s*:\s*/g, ": "], // Normalize colon spacing
  [/\s*;\s*/g, "; "], // Normalize semicolon spacing
  [/\s*\(\s*/g, " ("], // Normalize parentheses spacing
  [/\s*\)\s*/g, ") "], // Normalize closing parentheses spacing
] as const;

/**
 * Aggressive compression patterns for maximum optimization
 */
const AGGRESSIVE_COMPRESSION_PATTERNS: Array<[RegExp, string]> = [
  ...BASIC_COMPRESSION_PATTERNS,
  [/\b(the|a|an)\s+/gi, ""], // Remove articles
  [/\b(very|really|quite|rather|extremely)\s+/gi, ""], // Remove intensifiers
  [/\b(please|kindly)\s+/gi, ""], // Remove politeness words
  [/\b(that|which)\s+/gi, ""], // Remove relative pronouns where possible
  [/\b(in order to|so as to)\b/gi, "to"], // Simplify infinitive phrases
  [/\b(due to the fact that|owing to the fact that)\b/gi, "because"], // Simplify causal phrases
  [/\b(in spite of the fact that|despite the fact that)\b/gi, "although"], // Simplify concessive phrases
] as const;

/**
 * System prompt templates optimized for different conversation steps
 *
 * NOTE: All templates must respect NYX identity and scope policy from platformIdentity.
 */
const NYX_POLICY_PREFIX = `You are Nyx, the NYX AI operating exclusively for NYX (nyxusd.com).
Identity: NYX is a CDP and DeFi hub — an AI assistant for position management and risk monitoring.
Scope: You must only represent NYX and must not offer, endorse, or refer services outside NYX.
Compliance: Provide information only, not financial advice. Prefer actions that route users to nyxusd.com or in-app flows.`;

export const OPTIMIZED_TEMPLATES: PromptTemplateMap = {
  initial: () => `
${NYX_POLICY_PREFIX}

Welcome users warmly and offer:
1) Custom strategy builder
2) Proven templates
3) Protocol explorer
Keep responses under 100 words.`,

  chat: (ctx) => `
${NYX_POLICY_PREFIX}

Answer concisely about DeFi/CDP topics strictly within NYX context. User asks: "${ctx.userMessage}"
Do not recommend non-NYX platforms or services. If external is requested, reframe to NYX equivalents.
Prioritize accuracy over length. Max 150 words.`,

  strategy_choice: (ctx) => `
User said: "${ctx.userMessage}"
Guide based on their choice:
- Custom: Build from scratch with questionnaire
- Template: Show 3 risk-adjusted options
- Explore: Present top protocols by TVL
Response under 120 words.`,

  template_selection: () => `
Present 3 strategy templates:
• Conservative: 8-12% APY (Aave, Compound)
• Balanced: 15-25% APY (Yearn, Curve)  
• Aggressive: 30-80% APY (Leveraged farming)
Ask which matches their risk preference. Under 100 words.`,

  protocol_selection: (ctx) => `
${NYX_POLICY_PREFIX}

Recommend options only insofar as they are NYX-integrated routes. For ${ctx.userProfile.riskTolerance || "moderate"} risk:
• NYX Safe/Medium/High pools via NYX routes
• If discussing external protocols, frame as underlying integrations managed by NYX, not direct referrals
Ask to choose or explore NYX-managed options. Under 80 words.`,

  strategy_builder: () => `
Guide allocation with:
- Current selections
- Optimal percentages
- Risk/reward explanation
Make it interactive. Under 120 words.`,

  leverage_optimization: (ctx) => `
CDP leverage for ${ctx.userProfile.occupation || "your profile"}:
- Amplifies yields 2-5x
- Liquidation risk at 80% LTV
- Recommended: 2x multiplier
Want to add leverage? Under 100 words.`,

  wallet_prompt: (ctx) => `
User: "${ctx.userMessage}"
If connecting wallet: Click connect button for personalized analysis.
If unsure: Wallet analysis shows holdings and suggests optimal strategies.
Under 60 words.`,

  wallet_scanning: () => `
Analyzing your wallet for personalized strategies...
This takes 10-15 seconds for thorough analysis.`,

  wallet_analyzed: (ctx) => {
    const hasWallet = ctx.walletData && ctx.walletData.totalValueUSD > 0;
    if (!hasWallet) return "No wallet data available. Connect to proceed.";

    return `Portfolio: $${ctx.walletData!.totalValueUSD.toLocaleString()}
Top assets: ${ctx
      .walletData!.assets.slice(0, 3)
      .map((a) => a.symbol)
      .join(", ")}
Ready to optimize your DeFi strategy based on current holdings.`;
  },

  risk_assessment: () => `
What's your comfort level with investment risk?
• Conservative: Prefer stability over high returns
• Moderate: Balanced approach with some risk
• Aggressive: Maximize returns, accept volatility
Under 60 words.`,

  investment_goals: (ctx) => `
Goal: ${ctx.userMessage}
${
  ctx.userMessage.toLowerCase().includes("growth")
    ? "Focus on appreciation strategies."
    : ctx.userMessage.toLowerCase().includes("income")
      ? "Focus on yield generation."
      : "Focus on capital preservation."
}
This guides our recommendations. Under 50 words.`,

  occupation: () => `
What's your profession? This helps create relatable investment analogies.
Examples: engineer, teacher, chef, manager, trader, student.
Under 40 words.`,

  occupation_explanation: (ctx) => {
    const occupation = ctx.userProfile.occupation || "professional";
    return `As a ${occupation}, think of DeFi like ${getOccupationAnalogy(occupation, "investment")}.
Does this analogy help explain the strategy approach? Under 60 words.`;
  },

  risk_tolerance: (ctx) => `
For a ${ctx.userProfile.occupation || "professional"}, choose risk level:
• Conservative: Steady growth like ${getOccupationAnalogy(ctx.userProfile.occupation || "default", "stable")}
• Moderate: Balanced approach
• Aggressive: High growth potential
Under 60 words.`,

  timeline: (ctx) => `
Risk tolerance: ${ctx.userProfile.riskTolerance}
Investment timeline?
• Short-term: < 1 year
• Medium-term: 1-5 years  
• Long-term: 5+ years
Timeline affects strategy selection. Under 50 words.`,

  amount: () => `
Monthly investment capacity? Any amount works - $100, $500, $1000+.
No pressure for large amounts. This helps size recommendations.
Under 40 words.`,

  experience_level: () => `
DeFi experience level?
• Beginner: New to DeFi
• Intermediate: Some experience
• Advanced: Active user
No wrong answer - I'll guide accordingly. Under 40 words.`,

  generating_recommendations: (ctx) => `
Analyzing your profile...
Creating personalized strategies for ${ctx.userProfile.occupation || "your background"}.
This takes 5-10 seconds for optimization.`,

  recommendations: (ctx) => `
3 strategies for you:
Profile: ${ctx.userProfile.occupation} | ${ctx.userProfile.riskTolerance} risk | $${ctx.userProfile.monthlyAmount}/month

1. ${generateStrategyName(ctx, "conservative")}: ${getExpectedReturn(ctx, "conservative")} APY
2. ${generateStrategyName(ctx, "moderate")}: ${getExpectedReturn(ctx, "moderate")} APY  
3. ${generateStrategyName(ctx, "aggressive")}: ${getExpectedReturn(ctx, "aggressive")} APY

Which interests you most?`,

  complete: () => `
Assessment complete! 🎉
Questions about recommendations? Ready to implement?
I'm here for ongoing strategy support.
Under 30 words.`,
};

/**
 * Occupation-based analogies for investment concepts (optimized version)
 */
export const OPTIMIZED_OCCUPATION_ANALOGIES: Record<
  string,
  Record<string, string>
> = {
  engineer: {
    investment: "building robust systems with redundancy",
    stable: "well-tested, reliable infrastructure",
    risk: "prototype vs production deployment",
  },
  teacher: {
    investment: "developing curriculum that builds over time",
    stable: "proven educational methods",
    risk: "trying new teaching approaches",
  },
  chef: {
    investment: "creating recipes that improve with experience",
    stable: "classic dishes that always work",
    risk: "experimenting with fusion cuisine",
  },
  default: {
    investment: "building something valuable over time",
    stable: "tried and tested methods",
    risk: "exploring new opportunities",
  },
} as const;

/**
 * Get occupation-specific analogy for investment concepts
 */
const getOccupationAnalogy = (occupation: string, concept: string): string => {
  const byOcc = OPTIMIZED_OCCUPATION_ANALOGIES[occupation as keyof typeof OPTIMIZED_OCCUPATION_ANALOGIES];
  const analogies: Record<string, string> =
    (byOcc as Record<string, string>) ||
    (OPTIMIZED_OCCUPATION_ANALOGIES.default as Record<string, string>) ||
    {};

  const candidate = analogies[concept];
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }

  const fallback =
    analogies['investment'] ||
    (OPTIMIZED_OCCUPATION_ANALOGIES.default as Record<string, string>)['investment'] ||
    'building something valuable over time';

  return fallback;
};

/**
 * Generate strategy names based on user profile
 */
const generateStrategyName = (
  ctx: PromptContext,
  riskLevel: string,
): string => {
  const occupation = ctx.userProfile.occupation || "Professional";
  const riskMap = {
    conservative: "Steady Builder",
    moderate: "Growth Optimizer",
    aggressive: "Yield Maximizer",
  };
  return `${occupation} ${riskMap[riskLevel as keyof typeof riskMap]}`;
};

/**
 * Get expected returns based on risk level and profile
 */
const getExpectedReturn = (ctx: PromptContext, riskLevel: string): string => {
  const returns = {
    conservative: "6-12%",
    moderate: "12-25%",
    aggressive: "25-60%",
  };
  return returns[riskLevel as keyof typeof returns];
};

/**
 * Estimate token count for a given text (rough approximation)
 */
const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

/**
 * Apply compression patterns to text
 */
const applyCompressionPatterns = (
  patterns: Array<[RegExp, string]>,
  text: string,
): string =>
  patterns.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    text,
  );

/**
 * Compress prompt based on compression level
 */
const compressPrompt = (
  level: "none" | "basic" | "aggressive",
  text: string,
): string => {
  switch (level) {
    case "none":
      return text.trim();
    case "basic":
      return pipe(text.trim(), (t: string) =>
        applyCompressionPatterns(BASIC_COMPRESSION_PATTERNS, t),
      );
    case "aggressive":
      return pipe(text.trim(), (t: string) =>
        applyCompressionPatterns(AGGRESSIVE_COMPRESSION_PATTERNS, t),
      );
    default:
      return text.trim();
  }
};

/**
 * Calculate compression statistics
 */
const calculateCompressionStats = (
  original: string,
  compressed: string,
): CompressionStats => {
  const originalLength = original.length;
  const compressedLength = compressed.length;
  const reductionPercentage = Math.round(
    ((originalLength - compressedLength) / originalLength) * 100,
  );
  const tokensSaved =
    estimateTokenCount(original) - estimateTokenCount(compressed);

  return {
    originalLength,
    compressedLength,
    reductionPercentage,
    tokensSaved,
  };
};

/**
 * Inject dynamic context into prompt template
 */
const injectContext = (
  template: PromptTemplate,
  context: PromptContext,
  config: PromptBuilderConfig,
): string => {
  const basePrompt = template(context);

  // Add personalization if configured
  if (config.personalizeWith && config.personalizeWith.length > 0) {
    const personalizations = config.personalizeWith
      .map((attr) => {
        const profile = context.userProfile as any;
        const value = profile[attr];
        return value ? `${attr}: ${value}` : null;
      })
      .filter(Boolean)
      .join(", ");

    if (personalizations) {
      return `${basePrompt}\n\nPersonalization: ${personalizations}`;
    }
  }

  return basePrompt;
};

/**
 * Truncate prompt to fit within token limit
 */
const truncateToTokenLimit = (
  maxTokens: number,
  text: string,
): { text: string; truncated: boolean } => {
  const tokenCount = estimateTokenCount(text);

  if (tokenCount <= maxTokens) {
    return { text, truncated: false };
  }

  // Truncate to approximately 90% of limit to leave buffer
  const targetLength = Math.floor(maxTokens * 0.9 * 4);
  const truncated = text.substring(0, targetLength) + "...";

  return { text: truncated, truncated: true };
};

/**
 * Build conversation history context
 */
const buildHistoryContext = (
  config: PromptBuilderConfig,
  history?: Array<{ role: "user" | "assistant"; content: string }>,
): string => {
  if (!config.includeHistory || !history || history.length === 0) {
    return "";
  }

  const recentHistory = history
    .slice(-Math.min(config.maxHistoryItems || 3, history.length))
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  return `\nRecent conversation:\n${recentHistory}`;
};

/**
 * Main PromptBuilder class with fluent API
 */
export class PromptBuilder {
  private config: PromptBuilderConfig;
  private context: Partial<PromptContext>;
  private templates: PromptTemplateMap;

  constructor(config: Partial<PromptBuilderConfig> = {}) {
    this.config = { ...DEFAULT_PROMPT_CONFIG, ...config };
    this.context = {};
    this.templates = { ...OPTIMIZED_TEMPLATES, ...config.customTemplates };
  }

  /**
   * Add personalization data to the prompt
   */
  withPersonalization(profile: UserProfile): PromptBuilder {
    return new PromptBuilder(this.config).setContext({
      ...this.context,
      userProfile: profile,
    });
  }

  /**
   * Set conversation step for prompt template selection
   */
  withStep(step: ConversationStep): PromptBuilder {
    return new PromptBuilder(this.config).setContext({
      ...this.context,
      step,
    });
  }

  /**
   * Add dynamic context data
   */
  withContext(contextData: Partial<PromptContext>): PromptBuilder {
    return new PromptBuilder(this.config).setContext({
      ...this.context,
      ...contextData,
    });
  }

  /**
   * Apply compression to the final prompt
   */
  compress(level: "basic" | "aggressive" = "basic"): PromptBuilder {
    return new PromptBuilder({
      ...this.config,
      compressionLevel: level,
    }).setContext(this.context);
  }

  /**
   * Configure maximum token limit
   */
  withMaxTokens(maxTokens: number): PromptBuilder {
    return new PromptBuilder({
      ...this.config,
      maxTokens,
    }).setContext(this.context);
  }

  /**
   * Build the final prompt
   */
  build(): Result<PromptBuildResult, string> {
    const startTime = Date.now();

    try {
      // Validate required context
      if (
        !this.context.step ||
        !this.context.userProfile ||
        !this.context.userMessage
      ) {
        return new Err(
          "Missing required context: step, userProfile, and userMessage are required",
        );
      }

      const fullContext = this.context as PromptContext;
      const template = this.templates[fullContext.step];

      if (!template) {
        return new Err(`No template found for step: ${fullContext.step}`);
      }

      // Generate base prompt
      const basePrompt = injectContext(template, fullContext, this.config);

      // Add conversation history if configured
      const historyContext = buildHistoryContext(
        this.config,
        fullContext.conversationHistory,
      );
      const promptWithHistory = basePrompt + historyContext;

      // Apply compression
      const originalPrompt = promptWithHistory;
      const compressedPrompt = compressPrompt(
        this.config.compressionLevel || "basic",
        originalPrompt,
      );

      // Calculate compression stats
      const compressionStats = calculateCompressionStats(
        originalPrompt,
        compressedPrompt,
      );

      // Apply token limit truncation
      const truncationResult = truncateToTokenLimit(
        this.config.maxTokens || DEFAULT_PROMPT_CONFIG.maxTokens!,
        compressedPrompt,
      );
      const finalPrompt = truncationResult.text;
      const truncated = truncationResult.truncated;

      const result: PromptBuildResult = {
        prompt: finalPrompt,
        tokenCount: estimateTokenCount(finalPrompt),
        compressionStats: compressionStats,
        truncated,
        metadata: {
          config: this.config,
          context: fullContext,
          buildTime: Date.now() - startTime,
        },
      };

      return new Ok(result);
    } catch (error) {
      return new Err(
        `Failed to build prompt: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Internal method to set context (immutable)
   */
  private setContext(context: Partial<PromptContext>): PromptBuilder {
    const builder = new PromptBuilder(this.config);
    builder.context = context;
    builder.templates = this.templates;
    return builder;
  }
}

/**
 * Utility function to build system prompt (replaces hard-coded strings)
 */
export const buildSystemPrompt = (
  step: ConversationStep,
  userProfile: UserProfile,
  userMessage: string,
  options: Partial<PromptBuilderConfig> = {},
): Result<string, string> => {
  const buildResult = new PromptBuilder(options)
    .withStep(step)
    .withPersonalization(userProfile)
    .withContext({ userMessage })
    .build();

  const NYX_POLICY_PREFIX = `You are Nyx, the NYX AI operating exclusively for NYX (nyxusd.com).
Identity: NYX is a CDP and DeFi hub — an AI assistant for position management and risk monitoring.
Scope: Only represent NYX and do not offer or refer services outside NYX.
Compliance: Informational only; not financial advice. Prefer actions routed to nyxusd.com or in-app flows.`;

  if (buildResult.isOk()) {
    const withPolicy = `${NYX_POLICY_PREFIX}\n\n${buildResult.value.prompt}`;
    return new Ok(withPolicy);
  } else {
    return new Err((buildResult as Err<PromptBuildResult, string>).error);
  }
};

/**
 * Compress existing prompt utility
 */
export const compressExistingPrompt = (
  level: "basic" | "aggressive",
  prompt: string,
): { compressed: string; stats: CompressionStats } => {
  const compressed = compressPrompt(level, prompt);
  const stats = calculateCompressionStats(prompt, compressed);
  return { compressed, stats };
};

/**
 * Create a prompt builder with preset configuration
 */
export const createPromptBuilder = (
  config: Partial<PromptBuilderConfig> = {},
): PromptBuilder => new PromptBuilder(config);

/**
 * Preset configurations for common use cases
 */
export const PRESET_CONFIGS: Record<string, PromptBuilderConfig> = {
  /** Optimized for chat responses */
  chat: {
    maxTokens: 32000, // Chat context window
    compressionLevel: "basic",
    personalizeWith: [],
    includeHistory: true,
    maxHistoryItems: 2,
  },

  /** Optimized for strategy building */
  strategy: {
    maxTokens: 64000, // Strategy building context
    compressionLevel: "basic",
    personalizeWith: ["occupation", "riskTolerance", "timeline"],
    includeHistory: false,
  },

  /** Optimized for questionnaire steps */
  questionnaire: {
    maxTokens: 16000, // Questionnaire context
    compressionLevel: "aggressive",
    personalizeWith: ["occupation"],
    includeHistory: false,
  },

  /** Optimized for recommendations */
  recommendations: {
    maxTokens: 96000, // Recommendations context
    compressionLevel: "basic",
    personalizeWith: [
      "occupation",
      "riskTolerance",
      "timeline",
      "monthlyAmount",
    ],
    includeHistory: false,
  },
};

/**
 * Quick builders for common scenarios
 */
export const QuickBuilders = {
  /** Build chat response prompt */
  chat: (
    userMessage: string,
    profile: UserProfile,
    history?: Array<{ role: "user" | "assistant"; content: string }>,
  ) =>
    createPromptBuilder(PRESET_CONFIGS.chat)
      .withStep("chat")
      .withPersonalization(profile)
      .withContext({ userMessage, conversationHistory: history })
      .build(),

  /** Build strategy prompt */
  strategy: (
    step: ConversationStep,
    profile: UserProfile,
    userMessage: string,
  ) =>
    createPromptBuilder(PRESET_CONFIGS.strategy)
      .withStep(step)
      .withPersonalization(profile)
      .withContext({ userMessage })
      .build(),

  /** Build questionnaire prompt */
  questionnaire: (
    step: ConversationStep,
    profile: UserProfile,
    userMessage: string = "",
  ) =>
    createPromptBuilder(PRESET_CONFIGS.questionnaire)
      .withStep(step)
      .withPersonalization(profile)
      .withContext({ userMessage })
      .build(),

  /** Build recommendations prompt */
  recommendations: (profile: UserProfile, walletData?: WalletData) =>
    createPromptBuilder(PRESET_CONFIGS.recommendations)
      .withStep("recommendations")
      .withPersonalization(profile)
      .withContext({ userMessage: "", walletData })
      .build(),
} as const;

/**
 * Export commonly used functions
 */
export {
  estimateTokenCount,
  compressPrompt,
  calculateCompressionStats,
  injectContext,
};

/**
 * Example usage:
 *
 * ```typescript
 * // Basic usage
 * const result = createPromptBuilder()
 *   .withStep('chat')
 *   .withPersonalization(userProfile)
 *   .withContext({ userMessage: 'Tell me about DeFi' })
 *   .compress('basic')
 *   .build();
 *
 * if (result.isOk()) {
 *   console.log('Prompt:', result.value.prompt);
 *   console.log('Tokens:', result.value.tokenCount);
 *   console.log('Compression saved:', result.value.compressionStats?.tokensSaved);
 * }
 *
 * // Quick builders
 * const chatPrompt = QuickBuilders.chat(
 *   'What is a CDP?',
 *   userProfile,
 *   conversationHistory
 * );
 *
 * // System prompt replacement
 * const systemPrompt = buildSystemPrompt(
 *   'investment_goals',
 *   userProfile,
 *   'I want to maximize returns',
 *   { compressionLevel: 'aggressive' }
 * );
 * ```
 */
