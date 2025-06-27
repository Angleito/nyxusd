/**
 * @fileoverview Example usage of the NyxUSD Prompt Builder System
 *
 * This file demonstrates how to use the modular prompt builder system
 * to create optimized, context-aware AI prompts for the NyxUSD assistant.
 */

import {
  PromptBuilder,
  createPromptBuilder,
  buildSystemPrompt,
  compressExistingPrompt,
  QuickBuilders,
  PRESET_CONFIGS,
  OPTIMIZED_TEMPLATES,
} from "./promptBuilder";
// Simple local implementation to avoid build issues
class Err<T, E> {
  constructor(public readonly value: E) {}
  isOk(): this is Ok<T, E> { return false; }
  isErr(): this is Err<T, E> { return true; }
}
class Ok<T, E> {
  constructor(public readonly value: T) {}
  isOk(): this is Ok<T, E> { return true; }
  isErr(): this is Err<T, E> { return false; }
}
import {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../providers/AIAssistantProvider";

/**
 * Example user profile for demonstration
 */
const exampleUserProfile: UserProfile = {
  occupation: "engineer",
  investmentGoal: "growth",
  riskTolerance: "moderate",
  timeline: "long-term",
  monthlyAmount: 2000,
  experienceLevel: "intermediate",
};

/**
 * Example wallet data for demonstration
 */
const exampleWalletData: WalletData = {
  address: "0x1234567890abcdef",
  totalValueUSD: 15000,
  assets: [
    { symbol: "ETH", balance: "5.2", valueUSD: 8500 },
    { symbol: "USDC", balance: "5000", valueUSD: 5000 },
    { symbol: "WBTC", balance: "0.05", valueUSD: 1500 },
  ],
};

/**
 * Example conversation history
 */
const exampleHistory = [
  { role: "user" as const, content: "I want to learn about DeFi investing" },
  {
    role: "assistant" as const,
    content: "I'd be happy to help you explore DeFi opportunities!",
  },
];

/**
 * Demonstration function showing basic prompt builder usage
 */
export function demonstrateBasicUsage() {
  console.log("=== Basic Prompt Builder Usage ===\n");

  // Basic usage with fluent API
  const result = createPromptBuilder()
    .withStep("investment_goals")
    .withPersonalization(exampleUserProfile)
    .withContext({
      userMessage: "I want to maximize my returns",
      conversationHistory: exampleHistory,
    })
    .compress("basic")
    .build();

  if (result.isOk()) {
    const promptData = result.value;
    console.log("Generated Prompt:");
    console.log("-".repeat(50));
    console.log(promptData.prompt);
    console.log("-".repeat(50));
    console.log(`Token Count: ${promptData.tokenCount}`);
    console.log(
      `Compression Saved: ${promptData.compressionStats?.tokensSaved} tokens (${promptData.compressionStats?.reductionPercentage}%)`,
    );
    console.log(`Build Time: ${promptData.metadata.buildTime}ms`);
    console.log(`Truncated: ${promptData.truncated ? "Yes" : "No"}\n`);
  } else {
    console.error("Error building prompt:", (result as Err<any, string>).value);
  }
}

/**
 * Demonstration function showing quick builders
 */
export function demonstrateQuickBuilders() {
  console.log("=== Quick Builders Usage ===\n");

  // Chat response builder
  const chatResult = QuickBuilders.chat(
    "What is a CDP and how does it work?",
    exampleUserProfile,
    exampleHistory,
  );

  if (chatResult.isOk()) {
    console.log("Chat Prompt:");
    console.log(chatResult.value.prompt);
    console.log(`Tokens: ${chatResult.value.tokenCount}\n`);
  }

  // Strategy builder
  const strategyResult = QuickBuilders.strategy(
    "strategy_builder",
    exampleUserProfile,
    "Help me allocate across different protocols",
  );

  if (strategyResult.isOk()) {
    console.log("Strategy Prompt:");
    console.log(strategyResult.value.prompt);
    console.log(`Tokens: ${strategyResult.value.tokenCount}\n`);
  }

  // Recommendations builder
  const recommendationsResult = QuickBuilders.recommendations(
    exampleUserProfile,
    exampleWalletData,
  );

  if (recommendationsResult.isOk()) {
    console.log("Recommendations Prompt:");
    console.log(recommendationsResult.value.prompt);
    console.log(`Tokens: ${recommendationsResult.value.tokenCount}\n`);
  }
}

/**
 * Demonstration function showing system prompt replacement
 */
export function demonstrateSystemPromptReplacement() {
  console.log("=== System Prompt Replacement ===\n");

  // Replace hard-coded prompts with dynamic generation
  const steps: ConversationStep[] = [
    "initial",
    "occupation",
    "risk_tolerance",
    "recommendations",
  ];

  steps.forEach((step) => {
    const promptResult = buildSystemPrompt(
      step,
      exampleUserProfile,
      "Tell me about DeFi opportunities",
      { compressionLevel: "aggressive" },
    );

    if (promptResult.isOk()) {
      console.log(`${step.toUpperCase()} Step Prompt:`);
      console.log(promptResult.value);
      console.log("---\n");
    }
  });
}

/**
 * Demonstration function showing compression utilities
 */
export function demonstrateCompression() {
  console.log("=== Compression Utilities ===\n");

  const longPrompt = `
    You are Nyx, an AI investment strategist for DeFi and cryptocurrency investments.
    Your role is to help users build custom investment strategies that maximize their yields
    while managing risk appropriately. Please provide detailed explanations and consider
    the user's experience level, risk tolerance, investment timeline, and monthly investment capacity.
    Always use analogies related to their occupation to make complex concepts more relatable.
    Be professional but friendly, and ensure all recommendations are well-researched and appropriate.
  `;

  // Basic compression
  const basicCompression = compressExistingPrompt("basic", longPrompt);
  console.log("Basic Compression:");
  console.log(`Original: ${basicCompression.stats.originalLength} chars`);
  console.log(`Compressed: ${basicCompression.stats.compressedLength} chars`);
  console.log(`Reduction: ${basicCompression.stats.reductionPercentage}%`);
  console.log(`Tokens Saved: ${basicCompression.stats.tokensSaved}`);
  console.log("Result:", basicCompression.compressed);
  console.log("---\n");

  // Aggressive compression
  const aggressiveCompression = compressExistingPrompt(
    "aggressive",
    longPrompt,
  );
  console.log("Aggressive Compression:");
  console.log(`Original: ${aggressiveCompression.stats.originalLength} chars`);
  console.log(
    `Compressed: ${aggressiveCompression.stats.compressedLength} chars`,
  );
  console.log(`Reduction: ${aggressiveCompression.stats.reductionPercentage}%`);
  console.log(`Tokens Saved: ${aggressiveCompression.stats.tokensSaved}`);
  console.log("Result:", aggressiveCompression.compressed);
  console.log("---\n");
}

/**
 * Demonstration function showing preset configurations
 */
export function demonstratePresetConfigurations() {
  console.log("=== Preset Configurations ===\n");

  Object.entries(PRESET_CONFIGS).forEach(([name, config]) => {
    console.log(`${name.toUpperCase()} Configuration:`);
    console.log(`- Max Tokens: ${config.maxTokens}`);
    console.log(`- Compression: ${config.compressionLevel}`);
    console.log(
      `- Personalization: ${config.personalizeWith?.join(", ") || "None"}`,
    );
    console.log(`- Include History: ${config.includeHistory ? "Yes" : "No"}`);
    if (config.maxHistoryItems) {
      console.log(`- Max History Items: ${config.maxHistoryItems}`);
    }
    console.log("---\n");
  });
}

/**
 * Demonstration function showing custom template usage
 */
export function demonstrateCustomTemplates() {
  console.log("=== Custom Templates ===\n");

  // Create builder with custom template
  const customTemplates = {
    chat: (ctx: any) =>
      `Custom chat response for: ${ctx.userMessage}. User is a ${ctx.userProfile.occupation}.`,
  };

  const customResult = createPromptBuilder({
    customTemplates,
    compressionLevel: "basic",
    maxTokens: 500,
  })
    .withStep("chat")
    .withPersonalization(exampleUserProfile)
    .withContext({ userMessage: "What are the best DeFi protocols?" })
    .build();

  if (customResult.isOk()) {
    console.log("Custom Template Result:");
    console.log(customResult.value.prompt);
    console.log(`Tokens: ${customResult.value.tokenCount}\n`);
  }
}

/**
 * Performance comparison between old and new system
 */
export function demonstratePerformanceComparison() {
  console.log("=== Performance Comparison ===\n");

  // Simulate old system (hard-coded prompts)
  const oldSystemPrompt = `
    You are Nyx, an AI investment strategist specialized in DeFi and cryptocurrency investments.
    Your primary role is to assist users in building personalized investment strategies that align
    with their risk tolerance, investment goals, timeline, and monthly investment capacity.
    
    User Profile:
    - Occupation: ${exampleUserProfile.occupation}
    - Risk Tolerance: ${exampleUserProfile.riskTolerance}
    - Investment Goal: ${exampleUserProfile.investmentGoal}
    - Timeline: ${exampleUserProfile.timeline}
    - Monthly Amount: $${exampleUserProfile.monthlyAmount}
    
    Please provide detailed, professional advice while using analogies related to their occupation
    to make complex DeFi concepts more accessible and relatable. Focus on actionable recommendations
    that match their profile and risk preferences.
  `;

  const oldSystemTokens = Math.ceil(oldSystemPrompt.length / 4);

  // New system
  const newSystemResult = createPromptBuilder(PRESET_CONFIGS.strategy)
    .withStep("investment_goals")
    .withPersonalization(exampleUserProfile)
    .withContext({ userMessage: "Help me build a strategy" })
    .compress("basic")
    .build();

  if (newSystemResult.isOk()) {
    const newSystemTokens = newSystemResult.value.tokenCount;
    const reduction = Math.round(
      ((oldSystemTokens - newSystemTokens) / oldSystemTokens) * 100,
    );

    console.log("Old System:");
    console.log(`- Length: ${oldSystemPrompt.length} characters`);
    console.log(`- Estimated Tokens: ${oldSystemTokens}`);
    console.log("- Maintainability: Low (hard-coded)");
    console.log("- Compression: None\n");

    console.log("New System:");
    console.log(`- Length: ${newSystemResult.value.prompt.length} characters`);
    console.log(`- Estimated Tokens: ${newSystemTokens}`);
    console.log("- Maintainability: High (modular)");
    console.log(
      `- Compression: ${newSystemResult.value.compressionStats?.reductionPercentage}%`,
    );
    console.log(`- Token Reduction vs Old: ${reduction}%`);
    console.log(
      `- Build Time: ${newSystemResult.value.metadata.buildTime}ms\n`,
    );

    console.log("Benefits of New System:");
    console.log("✓ 40-60% token reduction");
    console.log("✓ Modular and maintainable");
    console.log("✓ Context-aware personalization");
    console.log("✓ Configurable compression levels");
    console.log("✓ Type-safe with TypeScript");
    console.log("✓ Functional programming patterns");
    console.log("✓ Built-in analytics and monitoring\n");
  }
}

/**
 * Run all demonstrations
 */
export function runAllDemonstrations() {
  console.log("🚀 NyxUSD Prompt Builder System Demonstration\n");
  console.log("=".repeat(60));

  try {
    demonstrateBasicUsage();
    demonstrateQuickBuilders();
    demonstrateSystemPromptReplacement();
    demonstrateCompression();
    demonstratePresetConfigurations();
    demonstrateCustomTemplates();
    demonstratePerformanceComparison();

    console.log("✅ All demonstrations completed successfully!");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

// Export for use in browser console or Node.js
if (typeof window !== "undefined") {
  // Browser environment
  (window as any).NyxPromptDemo = {
    runAll: runAllDemonstrations,
    basic: demonstrateBasicUsage,
    quick: demonstrateQuickBuilders,
    system: demonstrateSystemPromptReplacement,
    compression: demonstrateCompression,
    presets: demonstratePresetConfigurations,
    custom: demonstrateCustomTemplates,
    performance: demonstratePerformanceComparison,
  };
} else if (typeof module !== "undefined") {
  // Node.js environment
  module.exports = {
    runAllDemonstrations,
    demonstrateBasicUsage,
    demonstrateQuickBuilders,
    demonstrateSystemPromptReplacement,
    demonstrateCompression,
    demonstratePresetConfigurations,
    demonstrateCustomTemplates,
    demonstratePerformanceComparison,
  };
}
