/**
 * Test file demonstrating the PromptOptimizer capabilities
 * This file shows real-world usage and optimization results
 */

import {
  PromptOptimizer,
  createOptimizer,
  quickOptimize,
  analyzePromptEfficiency,
  estimateTokenSavings,
  OptimizationConfig,
} from "./promptOptimizer";

// Sample prompts from the actual NyxUSD system
const SAMPLE_PROMPTS = {
  initial: `
    Greet the user warmly as Nyx, their AI investment strategist.
    Explain that you help build custom DeFi strategies that maximize yields.
    Offer three options: 1) Build custom strategy, 2) Use templates, 3) Explore protocols.
    Keep it engaging and professional.
  `,

  recommendations: `
    Present 3 personalized investment strategies based on:
    - Goal: growth
    - Risk: moderate
    - Timeline: medium-term
    - Amount: $1000/month
    - Occupation: software engineer
    
    Explain each strategy using their occupation analogies.
    Include expected returns and risks.
    Make it interactive and educational.
    Be helpful and informative while staying concise.
  `,

  strategyBuilder: `
    Guide them through allocation based on their preferences and risk tolerance.
    Show current selections and explain how each protocol works.
    Suggest optimal percentages for their portfolio diversification.
    Explain risk and reward tradeoffs for each investment strategy.
    Make it interactive and educational so they understand their choices.
    Keep it engaging and professional while being helpful and informative.
  `,

  walletAnalyzed: `
    The user's wallet contains:
    - Total value: $50,000
    - Assets: ETH: 15.5, USDC: 10000, DAI: 5000
    
    Summarize their holdings positively and provide constructive feedback.
    Explain how their current portfolio can be optimized for better yields.
    Transition to asking about their investment goals and risk tolerance.
    Be encouraging about their current holdings while identifying opportunities.
    Make personalized recommendations based on their current asset allocation.
    Keep the analysis professional and actionable.
  `,
};

/**
 * Demonstration function showing optimization results
 */
export function demonstrateOptimization() {
  console.log("=== NyxUSD Prompt Optimization Demo ===\n");

  const configs: OptimizationConfig[] = [
    { level: "conservative", preserveClarity: true },
    { level: "balanced", preserveClarity: true },
    { level: "aggressive", preserveClarity: false },
  ];

  configs.forEach((config) => {
    console.log(`--- ${config.level.toUpperCase()} OPTIMIZATION ---`);

    Object.entries(SAMPLE_PROMPTS).forEach(([step, prompt]) => {
      const optimizer = createOptimizer(config);
      const result = optimizer.optimize(prompt);

      console.log(`\nStep: ${step}`);
      console.log(`Original tokens: ${result.originalTokens}`);
      console.log(`Optimized tokens: ${result.optimizedTokens}`);
      console.log(`Reduction: ${result.reduction.toFixed(1)}%`);
      console.log(`Clarity score: ${result.clarity}/100`);
      console.log(
        `Strategies used: ${result.compressionStrategies.join(", ")}`,
      );

      if (config.level === "balanced") {
        console.log("\nOriginal:");
        console.log(prompt.trim());
        console.log("\nOptimized:");
        console.log(result.optimizedPrompt);
      }
    });

    console.log("\n" + "=".repeat(50) + "\n");
  });

  // Overall savings analysis
  const allPrompts = Object.values(SAMPLE_PROMPTS);
  const savingsAnalysis = estimateTokenSavings(allPrompts, "balanced");

  console.log("--- OVERALL SAVINGS ANALYSIS ---");
  console.log(`Total original tokens: ${savingsAnalysis.totalOriginalTokens}`);
  console.log(
    `Total optimized tokens: ${savingsAnalysis.totalOptimizedTokens}`,
  );
  console.log(`Total savings: ${savingsAnalysis.totalSavings} tokens`);
  console.log(
    `Average reduction: ${savingsAnalysis.averageReduction.toFixed(1)}%`,
  );
}

/**
 * Test specific optimization techniques
 */
export function testOptimizationTechniques() {
  console.log("=== Testing Individual Optimization Techniques ===\n");

  const optimizer = new PromptOptimizer();
  const testPrompt = SAMPLE_PROMPTS.recommendations;

  // Test abbreviation
  console.log("--- Technical Term Abbreviation ---");
  const abbreviated = optimizer.abbreviateTechnicalTerms(testPrompt);
  console.log("Original length:", testPrompt.length);
  console.log("Abbreviated length:", abbreviated.length);
  console.log(
    "Reduction:",
    (
      ((testPrompt.length - abbreviated.length) / testPrompt.length) *
      100
    ).toFixed(1) + "%",
  );

  // Test pattern compression
  console.log("\n--- Pattern Compression ---");
  const compressed = optimizer.compressCommonPatterns(testPrompt);
  console.log("Original length:", testPrompt.length);
  console.log("Compressed length:", compressed.length);
  console.log(
    "Reduction:",
    (
      ((testPrompt.length - compressed.length) / testPrompt.length) *
      100
    ).toFixed(1) + "%",
  );

  // Test context prioritization
  console.log("\n--- Context Prioritization ---");
  const contexts = [
    'User message: "I want aggressive yields"',
    "Risk tolerance: moderate",
    "General DeFi explanation",
    "Investment goal: growth",
    "Wallet balance: $50,000",
    "Occupation: software engineer",
    "Example strategies",
    "Legal disclaimers",
  ];

  const prioritized = optimizer.prioritizeContext(contexts, 200); // 200 token limit
  console.log("Original contexts:", contexts.length);
  console.log("Prioritized contexts:", prioritized.length);
  console.log("Selected contexts:");
  prioritized.forEach((ctx, i) => console.log(`  ${i + 1}. ${ctx}`));
}

/**
 * Analyze prompt efficiency
 */
export function analyzePromptEfficiencyDemo() {
  console.log("=== Prompt Efficiency Analysis ===\n");

  Object.entries(SAMPLE_PROMPTS).forEach(([step, prompt]) => {
    console.log(`--- ${step.toUpperCase()} STEP ---`);

    const analysis = analyzePromptEfficiency(prompt);

    console.log(`Total tokens: ${analysis.totalTokens}`);
    console.log(`Redundant tokens: ${analysis.redundantTokens}`);
    console.log(
      `Compressible patterns found: ${analysis.compressiblePatterns.length}`,
    );

    if (analysis.compressiblePatterns.length > 0) {
      console.log("Top compressible patterns:");
      analysis.compressiblePatterns.slice(0, 3).forEach((pattern, i) => {
        console.log(
          `  ${i + 1}. "${pattern.pattern}" (${pattern.frequency}x, ${(pattern.compressionPotential * 100).toFixed(1)}% potential)`,
        );
      });
    }

    console.log("Context distribution:");
    analysis.contextDistribution.forEach((ctx) => {
      console.log(
        `  ${ctx.type}: ${ctx.tokens} tokens (priority: ${ctx.priority})`,
      );
    });

    if (analysis.recommendations.length > 0) {
      console.log("Recommendations:");
      analysis.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    console.log("\n" + "-".repeat(40) + "\n");
  });
}

/**
 * Performance comparison function
 */
export function compareOptimizationPerformance() {
  console.log("=== Optimization Performance Comparison ===\n");

  const testPrompts = Object.values(SAMPLE_PROMPTS);
  const levels: Array<OptimizationConfig["level"]> = [
    "conservative",
    "balanced",
    "aggressive",
  ];

  console.log("| Level | Avg Reduction | Avg Clarity | Token Savings |");
  console.log("|-------|---------------|-------------|---------------|");

  levels.forEach((level) => {
    const optimizer = createOptimizer({
      level,
      preserveClarity: level !== "aggressive",
    });

    let totalReduction = 0;
    let totalClarity = 0;
    let totalOriginal = 0;
    let totalOptimized = 0;

    testPrompts.forEach((prompt) => {
      const result = optimizer.optimize(prompt);
      totalReduction += result.reduction;
      totalClarity += result.clarity;
      totalOriginal += result.originalTokens;
      totalOptimized += result.optimizedTokens;
    });

    const avgReduction = (totalReduction / testPrompts.length).toFixed(1);
    const avgClarity = (totalClarity / testPrompts.length).toFixed(0);
    const tokenSavings = totalOriginal - totalOptimized;

    console.log(
      `| ${level.padEnd(9)} | ${avgReduction.padStart(11)}% | ${avgClarity.padStart(9)}/100 | ${tokenSavings.toString().padStart(11)} |`,
    );
  });

  console.log("\n--- Cost Impact Analysis ---");

  // Assuming GPT-4 pricing: ~$0.03 per 1K tokens
  const costPer1KTokens = 0.03;
  const monthlyPrompts = 10000; // Estimated monthly prompt volume

  levels.forEach((level) => {
    const savings = estimateTokenSavings(testPrompts, level);
    const monthlySavings =
      (savings.totalSavings / testPrompts.length) * monthlyPrompts;
    const costSavings = (monthlySavings / 1000) * costPer1KTokens;

    console.log(
      `${level}: ${savings.averageReduction.toFixed(1)}% reduction = ~$${costSavings.toFixed(2)}/month savings`,
    );
  });
}

/**
 * Real-world integration example
 */
export function integrateWithExistingPrompts() {
  console.log("=== Integration with Existing Prompt Templates ===\n");

  // Simulate integration with existing prompt template system
  const optimizer = createOptimizer({
    level: "balanced",
    preserveClarity: true,
    maxTokens: 300, // Token budget constraint
  });

  console.log("Optimizing existing conversation flow prompts...\n");

  Object.entries(SAMPLE_PROMPTS).forEach(([step, originalPrompt]) => {
    const result = optimizer.optimize(originalPrompt);

    console.log(`${step}:`);
    console.log(`  Before: ${result.originalTokens} tokens`);
    console.log(`  After: ${result.optimizedTokens} tokens`);
    console.log(`  Savings: ${result.reduction.toFixed(1)}%`);
    console.log(`  Clarity: ${result.clarity}/100`);

    if (result.optimizedTokens > 300) {
      console.log(`  ⚠️  Still over budget, needs further optimization`);
    } else {
      console.log(`  ✅ Within token budget`);
    }
    console.log();
  });
}

// Export functions for external testing
export const optimizationTests = {
  demonstrateOptimization,
  testOptimizationTechniques,
  analyzePromptEfficiencyDemo,
  compareOptimizationPerformance,
  integrateWithExistingPrompts,
};

// Quick optimization examples for different use cases
export const quickOptimizationExamples = {
  // Conservative: For critical prompts where clarity is paramount
  conservative: (prompt: string) => quickOptimize(prompt, "conservative"),

  // Balanced: For general use, good compromise between savings and clarity
  balanced: (prompt: string) => quickOptimize(prompt, "balanced"),

  // Aggressive: For high-volume scenarios where maximum savings are needed
  aggressive: (prompt: string) => quickOptimize(prompt, "aggressive"),
};

export default optimizationTests;
