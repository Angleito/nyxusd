import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../providers/AIAssistantProvider";
import {
  PromptBuilder,
  QuickBuilders,
  buildSystemPrompt,
  createPromptBuilder,
  PRESET_CONFIGS,
} from "./promptBuilder";
import {
  AnalogyEngine,
  createAnalogyEngine,
  generateContextualAnalogy,
  ConceptType,
  AnalogyResult,
} from "./analogyEngine";
import {
  PersonalizationEngine,
  PersonalizationProfile,
  PersonalizationContext,
  PersonalizationResult,
} from "./personalizationEngine";
import {
  PromptOptimizer,
  createOptimizer,
  quickOptimize,
  OptimizationConfig,
  OptimizationResult,
} from "./promptOptimizer";
import { pipe, Result, Ok, Err } from "../../utils/fp-utils";

export interface PromptContext {
  step: ConversationStep;
  userProfile: UserProfile;
  walletData?: WalletData;
  userMessage: string;
  previousMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Enhanced PromptContext with additional personalization dimensions
 */
export interface EnhancedPromptContext extends PromptContext {
  hobbies?: string[];
  interests?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  urgency?: "low" | "medium" | "high";
  complexity?: number;
  optimizationLevel?: "conservative" | "balanced" | "aggressive";
  useAnalogies?: boolean;
  maxTokens?: number;
}

/**
 * Configuration for the enhanced prompt system
 */
export interface EnhancedPromptConfig {
  enablePersonalization?: boolean;
  enableAnalogies?: boolean;
  enableOptimization?: boolean;
  optimizationLevel?: "conservative" | "balanced" | "aggressive";
  maxTokens?: number;
  preserveCompatibility?: boolean;
}

/**
 * Result from enhanced prompt building
 */
export interface EnhancedPromptResult {
  prompt: string;
  tokenCount: number;
  personalization?: PersonalizationResult;
  analogy?: AnalogyResult;
  optimization?: OptimizationResult;
  metadata: {
    config: EnhancedPromptConfig;
    buildTime: number;
    strategy: string;
  };
}

// =====================================================================
// ENHANCED MODULAR SYSTEM COMPONENTS
// =====================================================================

// Initialize core engines
const analogyEngine = createAnalogyEngine();
const personalizationEngine = new PersonalizationEngine();
const promptOptimizer = createOptimizer({
  level: "balanced",
  preserveClarity: true,
  enableAbbreviations: true,
  compressRepeatedPatterns: true,
});

// Default configuration for enhanced system
const DEFAULT_ENHANCED_CONFIG: EnhancedPromptConfig = {
  enablePersonalization: true,
  enableAnalogies: true,
  enableOptimization: true,
  optimizationLevel: "balanced",
  maxTokens: 4000,
  preserveCompatibility: true,
};

// =====================================================================
// LEGACY STEP_PROMPTS (Enhanced with Modular System)
// =====================================================================

export const STEP_PROMPTS: Record<
  ConversationStep,
  (ctx: PromptContext) => string
> = {
  initial: (ctx) => {
    const enhanced = buildEnhancedPrompt(
      { ...ctx, urgency: "medium" },
      {
        enablePersonalization: false,
        enableOptimization: true,
        optimizationLevel: "conservative",
      },
    );

    return enhanced.isOk()
      ? enhanced.value.prompt
      : `
      Greet warmly as Nyx, AI investment strategist.
      Help build custom DeFi strategies for max yields.
      Options: 1) Custom strategy 2) Templates 3) Explore protocols.
      Stay engaging, professional.
    `;
  },

  chat: (ctx) => {
    // Use QuickBuilders for chat responses with optimization
    const chatResult = QuickBuilders.chat(
      ctx.userMessage,
      ctx.userProfile,
      ctx.previousMessages,
    );

    return chatResult.isOk()
      ? chatResult.value.prompt
      : `
      Natural DeFi/investment conversation.
      Q: "${ctx.userMessage}"
      Answer helpfully, stay concise.
    `;
  },

  strategy_choice: (ctx) => `
    The user said: "${ctx.userMessage}"
    Understand their preference:
    - Custom: Build from scratch
    - Template: Use proven strategies
    - Explore: Browse protocols first
    Guide them based on their choice.
  `,

  template_selection: (ctx) => `
    Present three strategy templates:
    - Conservative Yield Hunter (8-12% APY)
    - Balanced DeFi Portfolio (15-25% APY)
    - Aggressive Yield Farmer (30-80% APY)
    Help them choose based on their needs.
  `,

  protocol_selection: (ctx) => `
    Recommend protocols based on their profile:
    - Aave for stable lending
    - Curve for low-risk liquidity
    - Yearn for automated optimization
    Ask if they want these or to explore others.
  `,

  strategy_builder: (ctx) => `
    Guide them through allocation:
    - Show current selections
    - Suggest optimal percentages
    - Explain risk/reward tradeoffs
    Make it interactive and educational.
  `,

  leverage_optimization: (ctx) => `
    Explain CDP leverage benefits:
    - How it amplifies yields
    - Risk considerations
    - Recommended multiplier based on their profile
    Ask if they want to add leverage.
  `,

  wallet_prompt: (ctx) => `
    The user said: "${ctx.userMessage}"
    Determine if they want to connect their wallet.
    If yes, guide them to click the connect button.
    If unsure, explain the benefits of connecting (personalized analysis).
  `,

  wallet_scanning: (ctx) => `
    Acknowledge that the wallet is being scanned.
    Build anticipation about the analysis.
    Keep the message brief as this is a loading state.
  `,

  wallet_analyzed: (ctx) => `
    The user's wallet contains:
    ${
      ctx.walletData
        ? `
    - Total value: $${ctx.walletData.totalValueUSD.toLocaleString()}
    - Assets: ${ctx.walletData.assets.map((a) => `${a.symbol}: ${a.balance}`).join(", ")}
    `
        : "No wallet data available"
    }
    
    Summarize their holdings positively.
    Transition to asking about their investment goals.
  `,

  risk_assessment: (ctx) => `
    Ask about their risk tolerance in a friendly way.
    Avoid financial jargon.
    Give examples of conservative vs aggressive approaches.
  `,

  investment_goals: (ctx) => `
    The user said: "${ctx.userMessage}"
    Understand their primary goal:
    - Growth (maximize returns)
    - Income (steady yield)
    - Preservation (protect capital)
    
    Acknowledge their choice and explain what it means.
  `,

  occupation: (ctx) => `
    Ask about their occupation or main interests.
    Explain this helps you use relatable analogies.
    Give a few example occupations if they seem unsure.
  `,

  occupation_explanation: (ctx) => {
    const occupation = ctx.userProfile.occupation || "professional";

    // Generate dynamic analogy using AnalogyEngine
    const analogyResult = generateContextualAnalogy("growth", {
      occupation,
      hobbies: ctx.userProfile.hobbies || [],
      experienceLevel: getExperienceLevelFromProfile(ctx.userProfile),
    });

    const analogy = analogyResult.primary;

    return `
      As a ${occupation}, think of DeFi investment like: ${analogy}
      
      This analogy helps explain how investment strategies work in terms you know.
      Does this comparison make sense to you?
    `;
  },

  risk_tolerance: (ctx) => `
    Based on their occupation as a ${ctx.userProfile.occupation || "professional"},
    ask about risk tolerance using relatable terms.
    Offer three clear options: conservative, moderate, aggressive.
  `,

  timeline: (ctx) => `
    The user's risk tolerance is ${ctx.userProfile.riskTolerance || "not specified"}.
    Ask about their investment timeline.
    Explain why this matters for strategy selection.
  `,

  amount: (ctx) => `
    Ask about their monthly investment capacity.
    Be encouraging - any amount is good to start.
    Don't pressure them for large amounts.
  `,

  experience_level: (ctx) => `
    Gauge their DeFi experience level.
    Ask in a non-intimidating way.
    Assure beginners that you'll guide them.
  `,

  generating_recommendations: (ctx) => `
    Acknowledge you have all needed information.
    Build excitement about their personalized strategies.
    Mention you're considering their ${ctx.userProfile.occupation || "background"}.
  `,

  recommendations: (ctx) => {
    // Use comprehensive personalization for recommendations
    const enhanced = buildEnhancedPrompt(
      {
        ...ctx,
        urgency: "high",
        useAnalogies: true,
      },
      {
        enablePersonalization: true,
        enableAnalogies: true,
        enableOptimization: true,
        optimizationLevel: "balanced",
      },
    );

    if (enhanced.isOk()) {
      return enhanced.value.prompt;
    }

    // Fallback with basic personalization
    const occupation = ctx.userProfile.occupation || "professional";
    const analogy = getEnhancedOccupationAnalogy(occupation, "diversification");

    return `
      3 personalized strategies for you:
      - Goal: ${ctx.userProfile.investmentGoal || "growth"}
      - Risk: ${ctx.userProfile.riskTolerance || "moderate"} 
      - Timeline: ${ctx.userProfile.timeline || "medium-term"}
      - Budget: $${ctx.userProfile.monthlyAmount || 1000}/month
      
      ${analogy}
      
      Each strategy includes expected returns and risk analysis.
    `;
  },

  complete: (ctx) => `
    Congratulate them on completing the assessment.
    Offer to answer any questions about the recommendations.
    Suggest next steps for implementation.
    Remain available for ongoing support.
  `,
};

// Removed duplicate buildPrompt function - see the enhanced version below

export const OCCUPATION_ANALOGIES: Record<string, Record<string, string>> = {
  chef: {
    growth:
      "Like preparing a complex dish that takes time but creates an exceptional result",
    income:
      "Like a reliable recipe that consistently delivers satisfied customers",
    preservation: "Like keeping your best ingredients fresh and protected",
    diversification: "Like having a varied menu to appeal to different tastes",
    risk: "Like trying new flavor combinations - could be amazing or need adjustment",
  },
  truck_driver: {
    growth:
      "Like taking longer routes with better pay - more time but higher rewards",
    income: "Like regular delivery routes that provide steady income",
    preservation: "Like maintaining your truck to protect your investment",
    diversification: "Like having contracts with multiple companies",
    risk: "Like choosing between familiar routes and new territories",
  },
  retail_manager: {
    growth: "Like investing in inventory that appreciates over time",
    income: "Like products with consistent sales and good margins",
    preservation: "Like keeping cash reserves for operations",
    diversification: "Like stocking different product categories",
    risk: "Like deciding between proven products and trending items",
  },
};

// =====================================================================
// ENHANCED PROMPT BUILDING FUNCTIONS
// =====================================================================

/**
 * Enhanced prompt building function that uses the new modular system
 * while maintaining backward compatibility
 */
export function buildEnhancedPrompt(
  context: EnhancedPromptContext,
  config: Partial<EnhancedPromptConfig> = {},
): Result<EnhancedPromptResult, string> {
  const startTime = Date.now();
  const finalConfig = { ...DEFAULT_ENHANCED_CONFIG, ...config };

  try {
    // Step 1: Generate base prompt using modular system or fallback
    let basePrompt: string;
    let strategy = "legacy";

    if (finalConfig.enablePersonalization && hasPersonalizationData(context)) {
      // Use personalization engine
      const personalizationContext: PersonalizationContext = {
        step: context.step,
        concept: getConceptFromStep(context.step),
        urgency: context.urgency || "medium",
        complexity: context.complexity || 5,
      };

      const personalizationProfile = createPersonalizationProfile(context);
      const personalizationResult = personalizationEngine.selectPersonalization(
        personalizationProfile,
        personalizationContext,
      );

      basePrompt = generatePersonalizedPrompt(context, personalizationResult);
      strategy = "personalized";
    } else {
      // Use PromptBuilder system
      const builderResult = createPromptBuilder(PRESET_CONFIGS.strategy)
        .withStep(context.step)
        .withPersonalization(context.userProfile)
        .withContext({
          userMessage: context.userMessage,
          walletData: context.walletData,
          conversationHistory: context.previousMessages,
        })
        .build();

      if (builderResult.isOk()) {
        basePrompt = builderResult.value.prompt;
        strategy = "modular";
      } else {
        // Final fallback to legacy system
        const legacyPrompt = STEP_PROMPTS[context.step];
        basePrompt = legacyPrompt ? legacyPrompt(context) : "";
        strategy = "legacy";
      }
    }

    if (!basePrompt) {
      return new Err("Failed to generate base prompt");
    }

    // Step 2: Add analogies if enabled
    let analogyResult: AnalogyResult | undefined;
    if (finalConfig.enableAnalogies && context.useAnalogies !== false) {
      analogyResult = generateStepAnalogy(context);
      if (analogyResult && analogyResult.confidence > 0.7) {
        basePrompt = integrateAnalogy(basePrompt, analogyResult);
      }
    }

    // Step 3: Apply optimization if enabled
    let optimizationResult: OptimizationResult | undefined;
    if (finalConfig.enableOptimization) {
      const optimizationConfig: OptimizationConfig = {
        level: finalConfig.optimizationLevel || "balanced",
        preserveClarity: true,
        maxTokens: finalConfig.maxTokens || context.maxTokens,
        enableAbbreviations: true,
        compressRepeatedPatterns: true,
      };

      optimizationResult = promptOptimizer.optimize(
        basePrompt,
        optimizationConfig,
      );
      basePrompt = optimizationResult.optimizedPrompt;
    }

    const result: EnhancedPromptResult = {
      prompt: basePrompt,
      tokenCount: estimateTokenCount(basePrompt),
      analogy: analogyResult,
      optimization: optimizationResult,
      metadata: {
        config: finalConfig,
        buildTime: Date.now() - startTime,
        strategy,
      },
    };

    return new Ok(result);
  } catch (error) {
    return new Err(
      `Enhanced prompt building failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Backward compatible buildPrompt function
 * Now uses enhanced system internally but maintains same interface
 */
export function buildPrompt(context: PromptContext): string {
  // Try enhanced system first
  const enhanced = buildEnhancedPrompt(context, {
    enableOptimization: true,
    optimizationLevel: "conservative",
    preserveCompatibility: true,
  });

  if (enhanced.isOk()) {
    return enhanced.value.prompt;
  }

  // Fallback to legacy system
  const basePrompt = STEP_PROMPTS[context.step];
  return basePrompt ? basePrompt(context) : "";
}

// =====================================================================
// ENHANCED ANALOGY FUNCTIONS
// =====================================================================

/**
 * Enhanced occupation analogy function that uses AnalogyEngine
 * while maintaining backward compatibility with legacy system
 */
export function getEnhancedOccupationAnalogy(
  occupation: string,
  concept: string,
  hobbies?: string[],
  experienceLevel?: "beginner" | "intermediate" | "advanced",
): string {
  try {
    // Use new AnalogyEngine for dynamic generation
    const analogyResult = generateContextualAnalogy(concept as ConceptType, {
      occupation,
      hobbies,
      experienceLevel,
    });

    if (analogyResult.confidence > 0.7) {
      return analogyResult.primary;
    }
  } catch (error) {
    console.warn(
      "AnalogyEngine failed, falling back to legacy analogies:",
      error,
    );
  }

  // Fallback to legacy analogies
  const legacyAnalogy = getOccupationAnalogy(occupation, concept);
  return legacyAnalogy;
}

/**
 * Legacy occupation analogy function (maintained for backward compatibility)
 */
export function getOccupationAnalogy(
  occupation: string,
  concept: string,
): string {
  const analogies = OCCUPATION_ANALOGIES[occupation];
  return analogies?.[concept] || `${concept} in your field`;
}

// =====================================================================
// HELPER FUNCTIONS FOR ENHANCED SYSTEM
// =====================================================================

/**
 * Check if context has sufficient data for personalization
 */
function hasPersonalizationData(context: EnhancedPromptContext): boolean {
  const profile = context.userProfile;
  return !!(
    profile.occupation ||
    profile.hobbies?.length ||
    profile.riskTolerance ||
    profile.experienceLevel
  );
}

/**
 * Convert conversation step to concept type for analogy generation
 */
function getConceptFromStep(step: ConversationStep): ConceptType {
  const stepToConceptMap: Record<ConversationStep, ConceptType> = {
    initial: "growth",
    chat: "growth",
    strategy_choice: "diversification",
    template_selection: "risk",
    protocol_selection: "diversification",
    strategy_builder: "growth",
    leverage_optimization: "leverage",
    wallet_prompt: "liquidity",
    wallet_scanning: "liquidity",
    wallet_analyzed: "diversification",
    risk_assessment: "risk",
    investment_goals: "growth",
    occupation: "growth",
    occupation_explanation: "growth",
    risk_tolerance: "risk",
    timeline: "growth",
    amount: "yields",
    experience_level: "growth",
    generating_recommendations: "diversification",
    recommendations: "diversification",
    complete: "growth",
  };

  return stepToConceptMap[step] || "growth";
}

/**
 * Create personalization profile from enhanced context
 */
function createPersonalizationProfile(
  context: EnhancedPromptContext,
): PersonalizationProfile {
  const profile = context.userProfile;

  return {
    occupation: profile.occupation,
    hobbies: context.hobbies || profile.hobbies || [],
    interests: context.interests || [],
    experienceLevel:
      context.experienceLevel || getExperienceLevelFromProfile(profile),
    riskTolerance: profile.riskTolerance,
    investmentGoals: profile.investmentGoal ? [profile.investmentGoal] : [],
    lifestyle: inferLifestyleFromProfile(profile),
    learningStyle: "example-based", // Default, could be enhanced later
    communicationStyle: "conversational",
  };
}

/**
 * Infer experience level from user profile
 */
function getExperienceLevelFromProfile(
  profile: UserProfile,
): "beginner" | "intermediate" | "advanced" {
  // Simple heuristic based on available data
  if (profile.experienceLevel) {
    return profile.experienceLevel as "beginner" | "intermediate" | "advanced";
  }

  // Infer from other profile data
  const indicators = [
    profile.riskTolerance === "aggressive",
    profile.monthlyAmount && profile.monthlyAmount > 5000,
    profile.timeline === "long-term",
    profile.occupation?.toLowerCase().includes("finance") ||
      profile.occupation?.toLowerCase().includes("analyst"),
  ].filter(Boolean).length;

  if (indicators >= 3) return "advanced";
  if (indicators >= 1) return "intermediate";
  return "beginner";
}

/**
 * Infer lifestyle from user profile
 */
function inferLifestyleFromProfile(
  profile: UserProfile,
): "busy" | "flexible" | "structured" {
  const occupation = profile.occupation?.toLowerCase() || "";

  if (
    occupation.includes("manager") ||
    occupation.includes("executive") ||
    occupation.includes("ceo")
  ) {
    return "busy";
  }

  if (
    occupation.includes("freelance") ||
    occupation.includes("consultant") ||
    occupation.includes("entrepreneur")
  ) {
    return "flexible";
  }

  return "structured";
}

/**
 * Generate analogy for specific conversation step
 */
function generateStepAnalogy(
  context: EnhancedPromptContext,
): AnalogyResult | undefined {
  const concept = getConceptFromStep(context.step);
  const profile = createPersonalizationProfile(context);

  try {
    return generateContextualAnalogy(concept, {
      occupation: profile.occupation,
      hobbies: profile.hobbies,
      interests: profile.interests,
      experienceLevel: profile.experienceLevel === "expert" ? "advanced" : profile.experienceLevel,
      riskTolerance: profile.riskTolerance,
    });
  } catch (error) {
    console.warn("Failed to generate step analogy:", error);
    return undefined;
  }
}

/**
 * Integrate analogy into base prompt
 */
function integrateAnalogy(basePrompt: string, analogy: AnalogyResult): string {
  // Smart integration based on prompt structure
  const analogyText = `\n\nThink of it like this: ${analogy.primary}`;

  if (analogy.alternative) {
    return (
      basePrompt + analogyText + `\n\nAlternatively: ${analogy.alternative}`
    );
  }

  return basePrompt + analogyText;
}

/**
 * Generate personalized prompt based on personalization result
 */
function generatePersonalizedPrompt(
  context: EnhancedPromptContext,
  personalizationResult: PersonalizationResult,
): string {
  const baseInstructions = getBaseInstructionsForStep(context.step);
  const personalizedElements = [
    ...personalizationResult.analogies.slice(0, 1),
    ...personalizationResult.examples.slice(0, 1),
  ];

  let prompt = baseInstructions;

  if (personalizedElements.length > 0) {
    prompt += "\n\nPersonalized for you:\n" + personalizedElements.join("\n");
  }

  // Add tone adjustment
  const toneInstructions = getToneInstructions(personalizationResult.tone);
  if (toneInstructions) {
    prompt += "\n\n" + toneInstructions;
  }

  return prompt;
}

/**
 * Get base instructions for conversation step
 */
function getBaseInstructionsForStep(step: ConversationStep): string {
  const instructions: Record<ConversationStep, string> = {
    initial:
      "Greet as Nyx, AI investment strategist. Offer custom strategy, templates, or protocol exploration.",
    chat: "Provide helpful DeFi/investment information in a conversational way.",
    strategy_choice:
      "Guide user based on their preference for custom, template, or exploration approach.",
    template_selection:
      "Present 3 strategy templates with different risk/return profiles.",
    protocol_selection:
      "Recommend DeFi protocols based on user risk tolerance and goals.",
    strategy_builder:
      "Guide through portfolio allocation with risk/reward explanations.",
    leverage_optimization:
      "Explain CDP leverage benefits and risks for their profile.",
    wallet_prompt:
      "Determine if user wants to connect wallet and explain benefits.",
    wallet_scanning: "Acknowledge wallet analysis in progress.",
    wallet_analyzed:
      "Summarize wallet holdings and transition to investment planning.",
    risk_assessment: "Assess risk tolerance using user-friendly language.",
    investment_goals:
      "Understand and acknowledge primary investment objectives.",
    occupation: "Ask about occupation to enable relatable analogies.",
    occupation_explanation: "Create work-related investment analogies.",
    risk_tolerance:
      "Assess risk preference using occupation-relevant examples.",
    timeline: "Determine investment timeline and explain its importance.",
    amount: "Ask about investment capacity without pressure.",
    experience_level: "Gauge DeFi experience level supportively.",
    generating_recommendations:
      "Build anticipation for personalized strategies.",
    recommendations:
      "Present 3 personalized investment strategies with returns and risks.",
    complete: "Congratulate completion and offer ongoing support.",
  };

  return (
    instructions[step] ||
    "Provide helpful guidance based on the current context."
  );
}

/**
 * Get tone-specific instructions
 */
function getToneInstructions(tone: string): string {
  const toneMap: Record<string, string> = {
    formal: "Use professional language and structured explanations.",
    casual: "Keep the conversation relaxed and friendly.",
    technical: "Use appropriate technical terms and detailed explanations.",
    conversational: "Maintain a natural, engaging dialogue.",
    concise: "Keep responses brief and to the point.",
    detailed: "Provide comprehensive explanations and context.",
  };

  return toneMap[tone] || "";
}

/**
 * Simple token estimation (matches optimizer)
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// =====================================================================
// ENHANCED UTILITY FUNCTIONS
// =====================================================================

/**
 * Build prompt with full personalization and optimization
 */
export function buildPersonalizedPrompt(
  context: EnhancedPromptContext,
  config: Partial<EnhancedPromptConfig> = {},
): Result<string, string> {
  return buildEnhancedPrompt(context, config).map((result) => result.prompt);
}

/**
 * Build optimized prompt for token efficiency
 */
export function buildOptimizedPrompt(
  context: PromptContext,
  maxTokens?: number,
  optimizationLevel: "conservative" | "balanced" | "aggressive" = "balanced",
): string {
  const enhanced = buildEnhancedPrompt(
    { ...context },
    {
      enableOptimization: true,
      optimizationLevel,
      maxTokens,
      enablePersonalization: false,
      enableAnalogies: false,
    },
  );

  return enhanced.isOk() ? enhanced.value.prompt : buildPrompt(context);
}

/**
 * Analyze prompt effectiveness
 */
export function analyzePromptEffectiveness(
  context: EnhancedPromptContext,
  config: Partial<EnhancedPromptConfig> = {},
): Result<{ effectiveness: number; recommendations: string[] }, string> {
  const result = buildEnhancedPrompt(context, config);

  if (result.isErr()) {
    return Result.err((result as Err<EnhancedPromptResult, string>).value);
  }

  const { prompt, tokenCount, personalization, optimization } = (result as Ok<EnhancedPromptResult, string>).value;

  let effectiveness = 0.5; // Base score
  const recommendations: string[] = [];

  // Token efficiency
  if (tokenCount < 1000) {
    effectiveness += 0.2;
  } else if (tokenCount > 3000) {
    effectiveness -= 0.1;
    recommendations.push(
      "Consider enabling optimization to reduce token usage",
    );
  }

  // Personalization quality
  if (personalization && personalization.confidence > 0.8) {
    effectiveness += 0.3;
  } else if (!personalization) {
    recommendations.push("Enable personalization for better user engagement");
  }

  // Optimization impact
  if (optimization && optimization.reduction > 30) {
    effectiveness += 0.2;
  }

  // Content quality checks
  if (prompt.includes("analogy") || prompt.includes("like")) {
    effectiveness += 0.1;
  }

  if (prompt.length < 100) {
    effectiveness -= 0.2;
    recommendations.push("Prompt may be too brief for effective guidance");
  }

  return new Ok({
    effectiveness: Math.min(1.0, Math.max(0.0, effectiveness)),
    recommendations,
  });
}

// =====================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// =====================================================================

// Export engines for direct access
export { analogyEngine, personalizationEngine, promptOptimizer };

/**
 * Default enhanced prompt builder instance
 */
export const defaultEnhancedBuilder = {
  build: (
    context: EnhancedPromptContext,
    config?: Partial<EnhancedPromptConfig>,
  ) => buildEnhancedPrompt(context, config),

  optimize: (
    prompt: string,
    level: "conservative" | "balanced" | "aggressive" = "balanced",
  ) => quickOptimize(prompt, level),

  personalize: (context: EnhancedPromptContext) =>
    buildPersonalizedPrompt(context, {
      enablePersonalization: true,
      enableAnalogies: true,
    }),

  analyze: (context: EnhancedPromptContext) =>
    analyzePromptEffectiveness(context),
};

/**
 * Migration helper for upgrading from legacy system
 */
export function migrateToEnhancedSystem(
  legacyContext: PromptContext,
): EnhancedPromptContext {
  return {
    ...legacyContext,
    hobbies: legacyContext.userProfile.hobbies || [],
    experienceLevel: getExperienceLevelFromProfile(legacyContext.userProfile),
    urgency: "medium",
    complexity: 5,
    optimizationLevel: "balanced",
    useAnalogies: true,
    maxTokens: 4000,
  };
}
