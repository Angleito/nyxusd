/**
 * Test utilities and helpers for AI components
 * Provides reusable testing functions, matchers, and setup utilities
 */

import { AIFixtures } from "../fixtures/ai-fixtures";
import type {
  UserProfile,
  WalletData,
  ConversationStep,
} from "../../frontend/src/providers/AIAssistantProvider";
import type {
  WalletData as EngineWalletData,
  UserProfile as EngineUserProfile,
  Recommendation,
} from "../../frontend/src/lib/ai-assistant/recommendationEngine";
import type { RiskAnalysis } from "../../frontend/src/lib/ai-assistant/portfolioAnalyzer";
import type { UserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";

// Performance measurement utilities
export class TestPerformanceTracker {
  private measurements: Map<string, number[]> = new Map();
  private currentTimers: Map<string, number> = new Map();

  start(label: string): void {
    this.currentTimers.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.currentTimers.get(label);
    if (!startTime) {
      throw new Error(`No timer started for label: ${label}`);
    }

    const duration = performance.now() - startTime;
    this.currentTimers.delete(label);

    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);

    return duration;
  }

  getStats(
    label: string,
  ): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const avg =
      measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  clear(): void {
    this.measurements.clear();
    this.currentTimers.clear();
  }

  getAllStats(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const stats: Record<string, any> = {};
    for (const [label] of this.measurements) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }
}

// Test data builders
export class TestDataBuilder {
  static createWallet(): WalletDataBuilder {
    return new WalletDataBuilder();
  }

  static createProfile(): UserProfileBuilder {
    return new UserProfileBuilder();
  }

  static createEngineWallet(): EngineWalletDataBuilder {
    return new EngineWalletDataBuilder();
  }

  static createEngineProfile(): EngineUserProfileBuilder {
    return new EngineUserProfileBuilder();
  }
}

class WalletDataBuilder {
  private wallet: WalletData = {
    address: "0x0000000000000000000000000000000000000000",
    totalValueUSD: 0,
    assets: [],
  };

  withAddress(address: string): this {
    this.wallet.address = address;
    return this;
  }

  withAsset(
    symbol: string,
    balance: string,
    valueUSD: number,
    contractAddress?: string,
  ): this {
    this.wallet.assets.push({
      symbol,
      balance,
      valueUSD,
      contractAddress:
        contractAddress || `0x${symbol.toLowerCase().padEnd(40, "0")}`,
    });
    this.wallet.totalValueUSD += valueUSD;
    return this;
  }

  withTotalValue(value: number): this {
    this.wallet.totalValueUSD = value;
    return this;
  }

  balanced(): this {
    return this.withAsset("ETH", "5.0", 8000)
      .withAsset("USDC", "2000", 2000)
      .withAsset("BTC", "0.1", 3000);
  }

  concentrated(): this {
    return this.withAsset("ETH", "15.0", 22500).withAsset("USDC", "2500", 2500);
  }

  diversified(): this {
    return this.withAsset("ETH", "8.0", 12000)
      .withAsset("BTC", "0.3", 8000)
      .withAsset("USDC", "3000", 3000)
      .withAsset("AAVE", "15", 1500)
      .withAsset("UNI", "100", 500);
  }

  stablecoinHeavy(): this {
    return this.withAsset("USDC", "12000", 12000)
      .withAsset("DAI", "5000", 5000)
      .withAsset("USDT", "3000", 3000);
  }

  build(): WalletData {
    return { ...this.wallet };
  }
}

class UserProfileBuilder {
  private profile: UserProfile = {
    occupation: "engineer",
    investmentGoal: "growth",
    riskTolerance: "moderate",
    timeline: "5 years",
    monthlyAmount: 1000,
  };

  withOccupation(occupation: string): this {
    this.profile.occupation = occupation;
    return this;
  }

  withGoal(goal: "growth" | "income" | "preservation"): this {
    this.profile.investmentGoal = goal;
    return this;
  }

  withRiskTolerance(risk: "conservative" | "moderate" | "aggressive"): this {
    this.profile.riskTolerance = risk;
    return this;
  }

  withTimeline(timeline: string): this {
    this.profile.timeline = timeline;
    return this;
  }

  withMonthlyAmount(amount: number): this {
    this.profile.monthlyAmount = amount;
    return this;
  }

  conservative(): this {
    return this.withOccupation("teacher")
      .withGoal("preservation")
      .withRiskTolerance("conservative")
      .withTimeline("2 years")
      .withMonthlyAmount(500);
  }

  aggressive(): this {
    return this.withOccupation("chef")
      .withGoal("growth")
      .withRiskTolerance("aggressive")
      .withTimeline("10 years")
      .withMonthlyAmount(2000);
  }

  build(): UserProfile {
    return { ...this.profile };
  }
}

class EngineWalletDataBuilder {
  private wallet: EngineWalletData = {
    holdings: [],
    totalValueUSD: 0,
  };

  withHolding(symbol: string, amount: number, valueUSD: number): this {
    this.wallet.holdings.push({ symbol, amount, valueUSD });
    this.wallet.totalValueUSD += valueUSD;
    return this;
  }

  balanced(): this {
    return this.withHolding("ETH", 5.0, 8000)
      .withHolding("USDC", 2000, 2000)
      .withHolding("BTC", 0.1, 3000);
  }

  build(): EngineWalletData {
    return { ...this.wallet };
  }
}

class EngineUserProfileBuilder {
  private profile: EngineUserProfile = {
    riskTolerance: "moderate",
    investmentHorizon: "medium",
    experienceLevel: "intermediate",
    goals: ["growth"],
  };

  withRiskTolerance(risk: "conservative" | "moderate" | "aggressive"): this {
    this.profile.riskTolerance = risk;
    return this;
  }

  withHorizon(horizon: "short" | "medium" | "long"): this {
    this.profile.investmentHorizon = horizon;
    return this;
  }

  withExperience(level: "beginner" | "intermediate" | "advanced"): this {
    this.profile.experienceLevel = level;
    return this;
  }

  withGoals(goals: string[]): this {
    this.profile.goals = goals;
    return this;
  }

  build(): EngineUserProfile {
    return { ...this.profile };
  }
}

// Custom Jest matchers
export const CustomMatchers = {
  toBeValidRecommendation: (received: any) => {
    const pass =
      typeof received === "object" &&
      typeof received.id === "string" &&
      typeof received.title === "string" &&
      typeof received.description === "string" &&
      typeof received.allocation === "number" &&
      received.allocation >= 0 &&
      received.allocation <= 100 &&
      typeof received.expectedReturn === "string" &&
      ["low", "medium", "high"].includes(received.riskLevel) &&
      typeof received.explanation === "string";

    return {
      message: () => `Expected ${received} to be a valid recommendation`,
      pass,
    };
  },

  toBeValidRiskAnalysis: (received: RiskAnalysis) => {
    const pass =
      ["low", "medium", "high"].includes(received.overallRisk) &&
      typeof received.diversificationScore === "number" &&
      received.diversificationScore >= 0 &&
      received.diversificationScore <= 100 &&
      Array.isArray(received.concentrationRisk) &&
      typeof received.volatilityEstimate === "number" &&
      received.volatilityEstimate >= 0 &&
      Array.isArray(received.recommendations);

    return {
      message: () =>
        `Expected ${JSON.stringify(received)} to be a valid risk analysis`,
      pass,
    };
  },

  toBeValidUserIntent: (received: UserIntent) => {
    const validActions = [
      "connect_wallet",
      "select_option",
      "input_value",
      "continue",
      "skip",
      "help",
      "unclear",
    ];
    const pass =
      typeof received === "object" &&
      validActions.includes(received.action) &&
      typeof received.confidence === "number" &&
      received.confidence >= 0 &&
      received.confidence <= 1 &&
      typeof received.originalMessage === "string";

    return {
      message: () =>
        `Expected ${JSON.stringify(received)} to be a valid user intent`,
      pass,
    };
  },

  toBeWithinPerformanceThreshold: (received: number, expected: number) => {
    const pass = received <= expected;
    return {
      message: () =>
        `Expected ${received}ms to be within performance threshold of ${expected}ms`,
      pass,
    };
  },

  toHaveAllocationSumming: (received: any[], expectedSum: number = 100) => {
    const totalAllocation = received.reduce((sum, item) => {
      const allocation =
        item.allocation ||
        item.allocationPercentage ||
        item.suggestedPercentage ||
        0;
      return sum + allocation;
    }, 0);

    const tolerance = 1; // Allow 1% tolerance for rounding
    const pass = Math.abs(totalAllocation - expectedSum) <= tolerance;

    return {
      message: () =>
        `Expected allocations to sum to ${expectedSum}%, got ${totalAllocation}%`,
      pass,
    };
  },
};

// Conversation flow testing utilities
export class ConversationFlowTester {
  private steps: Array<{
    step: ConversationStep;
    input: string;
    expected?: any;
  }> = [];

  addStep(step: ConversationStep, input: string, expected?: any): this {
    this.steps.push({ step, input, expected });
    return this;
  }

  addSequence(
    sequence: Array<{ step: ConversationStep; input: string; expected?: any }>,
  ): this {
    this.steps.push(...sequence);
    return this;
  }

  getSteps(): Array<{ step: ConversationStep; input: string; expected?: any }> {
    return [...this.steps];
  }

  static createBasicFlow(): ConversationFlowTester {
    return new ConversationFlowTester()
      .addStep("initial", "Hello")
      .addStep("occupation", "chef")
      .addStep("investment_goals", "growth")
      .addStep("risk_tolerance", "moderate")
      .addStep("timeline", "5 years")
      .addStep("amount", "$1000");
  }

  static createConservativeFlow(): ConversationFlowTester {
    return new ConversationFlowTester()
      .addStep("occupation", "teacher")
      .addStep("investment_goals", "preservation")
      .addStep("risk_tolerance", "conservative")
      .addStep("timeline", "2 years")
      .addStep("amount", "$500");
  }

  static createAggressiveFlow(): ConversationFlowTester {
    return new ConversationFlowTester()
      .addStep("occupation", "engineer")
      .addStep("investment_goals", "growth")
      .addStep("risk_tolerance", "aggressive")
      .addStep("timeline", "10 years")
      .addStep("amount", "$2000");
  }
}

// Mock generators for testing
export class MockGenerator {
  static generateRandomWallet(assetCount: number = 5): WalletData {
    const builder = TestDataBuilder.createWallet();

    for (let i = 0; i < assetCount; i++) {
      const symbol = `TOKEN${i}`;
      const balance = (Math.random() * 1000).toFixed(2);
      const valueUSD = Math.random() * 10000 + 100;
      builder.withAsset(symbol, balance, valueUSD);
    }

    return builder.build();
  }

  static generateRandomProfile(): UserProfile {
    const occupations = [
      "chef",
      "truck_driver",
      "engineer",
      "teacher",
      "doctor",
      "retail_manager",
    ];
    const goals = ["growth", "income", "preservation"];
    const risks = ["conservative", "moderate", "aggressive"];
    const timelines = ["1 year", "3 years", "5 years", "10 years"];

    return TestDataBuilder.createProfile()
      .withOccupation(
        occupations[Math.floor(Math.random() * occupations.length)],
      )
      .withGoal(goals[Math.floor(Math.random() * goals.length)] as any)
      .withRiskTolerance(risks[Math.floor(Math.random() * risks.length)] as any)
      .withTimeline(timelines[Math.floor(Math.random() * timelines.length)])
      .withMonthlyAmount(Math.floor(Math.random() * 5000) + 100)
      .build();
  }

  static generateRecommendations(count: number = 3): Recommendation[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-rec-${i}`,
      title: `Mock Recommendation ${i + 1}`,
      description: `Description for recommendation ${i + 1}`,
      allocationPercentage: Math.floor(100 / count),
      expectedReturnRange: {
        min: Math.random() * 10 + 5,
        max: Math.random() * 20 + 15,
      },
      riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as
        | "low"
        | "medium"
        | "high",
      explanation: `Explanation for recommendation ${i + 1}`,
      actions: [
        {
          type: "allocate",
          asset: `ASSET${i}`,
          amount: Math.random() * 10000,
          details: `Allocate to asset ${i}`,
        },
      ],
    }));
  }
}

// Test assertion helpers
export class TestAssertions {
  static assertValidPortfolioMetrics(metrics: any): void {
    expect(typeof metrics).toBe("object");
    if ("diversificationScore" in metrics) {
      expect(metrics.diversificationScore).toBeGreaterThanOrEqual(0);
      expect(metrics.diversificationScore).toBeLessThanOrEqual(100);
    }
    if ("volatilityEstimate" in metrics) {
      expect(metrics.volatilityEstimate).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(metrics.volatilityEstimate)).toBe(true);
    }
    if ("overallRisk" in metrics) {
      expect(["low", "medium", "high"]).toContain(metrics.overallRisk);
    }
  }

  static assertValidRecommendations(recommendations: any[]): void {
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);

    const totalAllocation = recommendations.reduce((sum, rec) => {
      const allocation = rec.allocation || rec.allocationPercentage || 0;
      expect(allocation).toBeGreaterThan(0);
      expect(allocation).toBeLessThanOrEqual(100);
      return sum + allocation;
    }, 0);

    expect(totalAllocation).toBeCloseTo(100, 1); // Within 1% tolerance

    recommendations.forEach((rec) => {
      expect(typeof rec.id).toBe("string");
      expect(typeof rec.title).toBe("string");
      expect(typeof rec.description).toBe("string");
      expect(typeof rec.explanation).toBe("string");
      expect(["low", "medium", "high"]).toContain(rec.riskLevel);
    });
  }

  static assertPerformanceWithinThreshold(
    duration: number,
    threshold: number,
    operation: string,
  ): void {
    expect(duration).toBeLessThan(threshold);
    if (duration > threshold * 0.8) {
      console.warn(
        `Performance warning: ${operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
      );
    }
  }

  static assertConversationFlowProgression(
    currentStep: ConversationStep,
    nextStep: ConversationStep,
  ): void {
    const validProgressions: Record<ConversationStep, ConversationStep[]> = {
      initial: ["occupation", "strategy_choice", "wallet_prompt"],
      occupation: ["investment_goals", "occupation_explanation"],
      investment_goals: ["risk_tolerance", "occupation"],
      risk_tolerance: ["timeline"],
      timeline: ["amount"],
      amount: ["strategy_choice", "generating_recommendations"],
      strategy_choice: ["wallet_prompt", "template_selection"],
      wallet_prompt: ["wallet_scanning"],
      wallet_scanning: ["wallet_analyzed"],
      wallet_analyzed: ["investment_goals"],
      generating_recommendations: ["recommendations"],
      recommendations: ["complete", "chat"],
      complete: ["complete"],
      chat: ["chat"],
    };

    const validNext = validProgressions[currentStep] || [];
    if (validNext.length > 0) {
      expect(validNext).toContain(nextStep);
    }
  }
}

// Test scenario runner
export class TestScenarioRunner {
  private scenarios: Array<{
    name: string;
    setup: () => Promise<void>;
    execute: () => Promise<any>;
    validate: (result: any) => void;
    cleanup?: () => Promise<void>;
  }> = [];

  addScenario(scenario: {
    name: string;
    setup: () => Promise<void>;
    execute: () => Promise<any>;
    validate: (result: any) => void;
    cleanup?: () => Promise<void>;
  }): this {
    this.scenarios.push(scenario);
    return this;
  }

  async runAll(): Promise<
    Array<{ name: string; success: boolean; error?: any; duration: number }>
  > {
    const results = [];

    for (const scenario of this.scenarios) {
      const startTime = performance.now();
      let success = false;
      let error;

      try {
        await scenario.setup();
        const result = await scenario.execute();
        scenario.validate(result);
        success = true;
      } catch (e) {
        error = e;
      } finally {
        if (scenario.cleanup) {
          await scenario.cleanup();
        }
      }

      const duration = performance.now() - startTime;
      results.push({ name: scenario.name, success, error, duration });
    }

    return results;
  }
}

// Export test setup utilities
export const TestSetup = {
  /**
   * Set up Jest custom matchers
   */
  setupCustomMatchers(): void {
    // Extend Jest expect with custom matchers
    expect.extend(CustomMatchers);
  },

  /**
   * Create a test environment with fixtures loaded
   */
  createTestEnvironment() {
    return {
      fixtures: AIFixtures,
      builders: TestDataBuilder,
      mocks: MockGenerator,
      assertions: TestAssertions,
      performance: new TestPerformanceTracker(),
    };
  },

  /**
   * Setup for integration tests
   */
  setupIntegrationTest() {
    const env = this.createTestEnvironment();
    this.setupCustomMatchers();
    return env;
  },
};

// Export all utilities
export {
  TestDataBuilder,
  ConversationFlowTester,
  MockGenerator,
  TestAssertions,
  TestScenarioRunner,
  TestPerformanceTracker,
};
