/**
 * Performance benchmarks for AI Prompting System
 * Tests response times, memory usage, and optimization effectiveness
 */

import {
  explainWithAnalogy,
  generateAnalogy,
  getAllAnalogiesForConcept,
  type DeFiConcept,
  type Occupation,
} from "../../frontend/src/lib/ai-assistant/analogyGenerator";
import {
  generateRecommendations,
  calculatePortfolioRiskScore,
  calculateExpectedPortfolioReturn,
  type WalletData,
  type UserProfile,
} from "../../frontend/src/lib/ai-assistant/recommendationEngine";
import {
  analyzeWalletComposition,
  calculateRiskScore,
  identifyOpportunities,
  generateAllocationSuggestions,
} from "../../frontend/src/lib/ai-assistant/portfolioAnalyzer";
import { FallbackAIService } from "../../frontend/src/services/ai/fallbackService";
import { detectUserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";
import type {
  AIServiceConfig,
  AIContext,
} from "../../frontend/src/services/ai/aiService";

// Performance test utilities
interface PerformanceMetrics {
  averageTime: number;
  minTime: number;
  maxTime: number;
  operationsPerSecond: number;
  memoryUsed: number;
}

class PerformanceBenchmark {
  private results: number[] = [];
  private memoryBefore: number = 0;
  private memoryAfter: number = 0;

  start(): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      this.memoryBefore = process.memoryUsage().heapUsed;
    }
  }

  end(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      this.memoryAfter = process.memoryUsage().heapUsed;
    }
    return performance.now();
  }

  addResult(duration: number): void {
    this.results.push(duration);
  }

  getMetrics(): PerformanceMetrics {
    const totalTime = this.results.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / this.results.length;
    const minTime = Math.min(...this.results);
    const maxTime = Math.max(...this.results);
    const operationsPerSecond = 1000 / averageTime;
    const memoryUsed = this.memoryAfter - this.memoryBefore;

    return {
      averageTime,
      minTime,
      maxTime,
      operationsPerSecond,
      memoryUsed,
    };
  }

  reset(): void {
    this.results = [];
    this.memoryBefore = 0;
    this.memoryAfter = 0;
  }
}

// Test data generators
const generateLargeWallet = (assetCount: number): WalletData => ({
  holdings: Array.from({ length: assetCount }, (_, i) => ({
    symbol: `TOKEN${i}`,
    amount: Math.random() * 1000,
    valueUSD: Math.random() * 10000 + 100,
  })),
  totalValueUSD: 0,
});

const generateComplexProfile = (): UserProfile => ({
  riskTolerance: "moderate",
  investmentHorizon: "long",
  experienceLevel: "advanced",
  goals: ["growth", "income", "preservation"],
});

const generatePortfolioWallet = (assetCount: number) => ({
  address: "0x1234567890123456789012345678901234567890",
  totalValueUSD: 100000,
  assets: Array.from({ length: assetCount }, (_, i) => ({
    symbol: `TOKEN${i}`,
    balance: "1000",
    valueUSD: 100000 / assetCount,
    contractAddress: `0x${i.toString().padStart(40, "0")}`,
  })),
});

describe("AI Prompting System Performance Benchmarks", () => {
  let benchmark: PerformanceBenchmark;
  let aiService: FallbackAIService;
  let mockConfig: AIServiceConfig;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
    mockConfig = {
      apiEndpoint: "http://localhost:3000/api/ai",
      model: "test-model",
      temperature: 0.7,
      maxTokens: 500,
      streamResponse: true,
    };
    aiService = new FallbackAIService(mockConfig);
  });

  describe("Analogy Generation Performance", () => {
    it("should generate analogies within performance thresholds", async () => {
      const concepts: DeFiConcept[] = [
        "liquidity",
        "portfolio",
        "staking",
        "yields",
      ];
      const occupations: Occupation[] = [
        "chef",
        "truck_driver",
        "engineer",
        "general",
      ];
      const iterations = 100;

      benchmark.start();

      for (let i = 0; i < iterations; i++) {
        const concept = concepts[i % concepts.length];
        const occupation = occupations[i % occupations.length];

        const startTime = performance.now();
        explainWithAnalogy(concept, occupation);
        const endTime = performance.now();

        benchmark.addResult(endTime - startTime);
      }

      const metrics = benchmark.getMetrics();

      // Performance thresholds
      expect(metrics.averageTime).toBeLessThan(1); // Less than 1ms average
      expect(metrics.maxTime).toBeLessThan(5); // Max 5ms for any single operation
      expect(metrics.operationsPerSecond).toBeGreaterThan(1000); // At least 1000 ops/sec

      console.log("Analogy Generation Performance:", metrics);
    });

    it("should handle bulk analogy generation efficiently", async () => {
      const concepts: DeFiConcept[] = [
        "clmm",
        "liquidity",
        "portfolio",
        "diversification",
        "risk_management",
        "yields",
        "smart_contracts",
        "pools",
        "impermanent_loss",
        "slippage",
        "gas_fees",
        "staking",
      ];

      benchmark.start();
      const startTime = performance.now();

      // Generate all analogies for all concepts
      concepts.forEach((concept) => {
        getAllAnalogiesForConcept(concept);
      });

      const endTime = performance.now();
      benchmark.addResult(endTime - startTime);

      const metrics = benchmark.getMetrics();

      expect(metrics.averageTime).toBeLessThan(50); // Complete bulk operation under 50ms
      console.log("Bulk Analogy Generation Performance:", metrics);
    });

    it("should maintain performance with repeated access", async () => {
      const concept: DeFiConcept = "portfolio";
      const occupation: Occupation = "chef";
      const iterations = 1000;

      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        explainWithAnalogy(concept, occupation);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const firstHundred = times.slice(0, 100);
      const lastHundred = times.slice(-100);

      const firstAvg =
        firstHundred.reduce((sum, t) => sum + t, 0) / firstHundred.length;
      const lastAvg =
        lastHundred.reduce((sum, t) => sum + t, 0) / lastHundred.length;

      // Performance should not degrade significantly over time
      expect(lastAvg).toBeLessThan(firstAvg * 1.5); // Max 50% degradation
      console.log(
        `Performance consistency: First 100 avg: ${firstAvg.toFixed(3)}ms, Last 100 avg: ${lastAvg.toFixed(3)}ms`,
      );
    });
  });

  describe("Recommendation Engine Performance", () => {
    it("should generate recommendations efficiently for various portfolio sizes", async () => {
      const portfolioSizes = [1, 5, 10, 25, 50, 100];
      const userProfile = generateComplexProfile();

      const results: Array<{ size: number; time: number }> = [];

      for (const size of portfolioSizes) {
        const wallet = generateLargeWallet(size);
        wallet.totalValueUSD = wallet.holdings.reduce(
          (sum, h) => sum + h.valueUSD,
          0,
        );

        const startTime = performance.now();
        const result = generateRecommendations(wallet, userProfile);
        const endTime = performance.now();

        expect(result.isRight()).toBe(true);

        const duration = endTime - startTime;
        results.push({ size, time: duration });

        // Individual performance thresholds
        expect(duration).toBeLessThan(100); // Max 100ms per recommendation generation
      }

      // Check that performance scales reasonably
      const smallPortfolio = results.find((r) => r.size === 5);
      const largePortfolio = results.find((r) => r.size === 100);

      if (smallPortfolio && largePortfolio) {
        // Large portfolio should not be more than 10x slower
        expect(largePortfolio.time).toBeLessThan(smallPortfolio.time * 10);
      }

      console.log("Recommendation Generation Scaling:", results);
    });

    it("should calculate portfolio metrics efficiently", async () => {
      const iterations = 1000;
      const testRecommendations = Array.from({ length: 10 }, (_, i) => ({
        id: `rec-${i}`,
        title: `Recommendation ${i}`,
        description: "Test recommendation",
        allocationPercentage: 10,
        expectedReturnRange: { min: 5 + i, max: 15 + i },
        riskLevel: ["low", "medium", "high"][i % 3] as
          | "low"
          | "medium"
          | "high",
        explanation: "Test explanation",
        actions: [],
      }));

      // Test risk score calculation performance
      benchmark.start();
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        calculatePortfolioRiskScore(testRecommendations);
        const endTime = performance.now();
        benchmark.addResult(endTime - startTime);
      }

      let metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(0.5); // Less than 0.5ms average
      console.log("Risk Score Calculation Performance:", metrics);

      // Test expected return calculation performance
      benchmark.reset();
      benchmark.start();
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        calculateExpectedPortfolioReturn(testRecommendations);
        const endTime = performance.now();
        benchmark.addResult(endTime - startTime);
      }

      metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(0.5); // Less than 0.5ms average
      console.log("Expected Return Calculation Performance:", metrics);
    });

    it("should handle recommendation normalization efficiently", async () => {
      const iterations = 100;
      const userProfile = generateComplexProfile();

      benchmark.start();

      for (let i = 0; i < iterations; i++) {
        const wallet = generateLargeWallet(20);
        wallet.totalValueUSD = wallet.holdings.reduce(
          (sum, h) => sum + h.valueUSD,
          0,
        );

        const startTime = performance.now();
        const result = generateRecommendations(wallet, userProfile);
        const endTime = performance.now();

        expect(result.isRight()).toBe(true);
        benchmark.addResult(endTime - startTime);
      }

      const metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(50); // Less than 50ms average
      expect(metrics.maxTime).toBeLessThan(200); // Max 200ms for any operation

      console.log("Recommendation Normalization Performance:", metrics);
    });
  });

  describe("Portfolio Analysis Performance", () => {
    it("should analyze portfolios efficiently across different sizes", async () => {
      const portfolioSizes = [1, 10, 50, 100, 500];
      const results: Array<{
        size: number;
        analysisTime: number;
        riskTime: number;
      }> = [];

      for (const size of portfolioSizes) {
        const wallet = generatePortfolioWallet(size);

        // Test portfolio analysis
        const analysisStart = performance.now();
        const analysis = analyzeWalletComposition(wallet);
        const analysisEnd = performance.now();

        // Test risk score calculation
        const riskStart = performance.now();
        const riskScore = calculateRiskScore(wallet);
        const riskEnd = performance.now();

        expect(analysis.diversificationScore).toBeGreaterThanOrEqual(0);
        expect(riskScore).toBeGreaterThanOrEqual(1);
        expect(riskScore).toBeLessThanOrEqual(10);

        const analysisTime = analysisEnd - analysisStart;
        const riskTime = riskEnd - riskStart;

        results.push({ size, analysisTime, riskTime });

        // Performance thresholds based on portfolio size
        if (size <= 50) {
          expect(analysisTime).toBeLessThan(10); // Less than 10ms for small portfolios
          expect(riskTime).toBeLessThan(5); // Less than 5ms for risk calculation
        } else {
          expect(analysisTime).toBeLessThan(50); // Less than 50ms for large portfolios
          expect(riskTime).toBeLessThan(20); // Less than 20ms for risk calculation
        }
      }

      console.log("Portfolio Analysis Scaling:", results);
    });

    it("should generate opportunities efficiently", async () => {
      const iterations = 100;
      const userProfile = generateComplexProfile();

      benchmark.start();

      for (let i = 0; i < iterations; i++) {
        const wallet = generatePortfolioWallet(10);

        const startTime = performance.now();
        const opportunities = identifyOpportunities(wallet, userProfile as any);
        const endTime = performance.now();

        expect(Array.isArray(opportunities)).toBe(true);
        benchmark.addResult(endTime - startTime);
      }

      const metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(10); // Less than 10ms average
      console.log("Opportunity Identification Performance:", metrics);
    });

    it("should generate allocation suggestions efficiently", async () => {
      const iterations = 500;
      const userProfile = generateComplexProfile();

      benchmark.start();

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const suggestions = generateAllocationSuggestions(userProfile as any);
        const endTime = performance.now();

        expect(suggestions.length).toBeGreaterThan(0);
        benchmark.addResult(endTime - startTime);
      }

      const metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(5); // Less than 5ms average
      expect(metrics.operationsPerSecond).toBeGreaterThan(200); // At least 200 ops/sec

      console.log("Allocation Suggestions Performance:", metrics);
    });
  });

  describe("AI Service Performance", () => {
    it("should handle conversation responses efficiently", async () => {
      const testCases = [
        { step: "initial", input: "Hello" },
        { step: "investment_goals", input: "I want growth" },
        { step: "risk_tolerance", input: "moderate risk" },
        { step: "timeline", input: "5 years" },
        { step: "amount", input: "$1000" },
      ];

      const aiContext: AIContext = {
        conversationStep: "initial",
        userProfile: {
          occupation: "engineer",
          investmentGoal: "growth",
          riskTolerance: "moderate",
          timeline: "5 years",
          monthlyAmount: 1000,
        },
        walletData: {
          address: "0x1234567890123456789012345678901234567890",
          totalValueUSD: 10000,
          assets: [],
        },
        conversationHistory: [],
      };

      for (const testCase of testCases) {
        const updatedContext = {
          ...aiContext,
          conversationStep: testCase.step as any,
        };

        benchmark.start();
        const startTime = performance.now();

        const response = await aiService.generateResponse(
          testCase.input,
          updatedContext,
        );

        const endTime = performance.now();
        benchmark.addResult(endTime - startTime);

        expect(response.message).toBeTruthy();
        expect(response.intent).toBeTruthy();
      }

      const metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(20); // Less than 20ms average for AI responses
      expect(metrics.maxTime).toBeLessThan(100); // Max 100ms for any response

      console.log("AI Service Response Performance:", metrics);
    });

    it("should stream responses efficiently", async () => {
      const aiContext: AIContext = {
        conversationStep: "recommendations",
        userProfile: {
          occupation: "chef",
          investmentGoal: "growth",
          riskTolerance: "moderate",
          timeline: "5 years",
          monthlyAmount: 1000,
        },
        walletData: {
          address: "0x1234567890123456789012345678901234567890",
          totalValueUSD: 10000,
          assets: [],
        },
        conversationHistory: [],
      };

      const chunks: string[] = [];
      let chunkCount = 0;

      const startTime = performance.now();

      await aiService.streamResponse(
        "Tell me about my recommendations",
        aiContext,
        (chunk) => {
          chunks.push(chunk);
          chunkCount++;
        },
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(chunkCount).toBeGreaterThan(0);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second

      // Calculate streaming rate
      const wordsPerSecond = (chunkCount / totalTime) * 1000;
      expect(wordsPerSecond).toBeGreaterThan(10); // At least 10 words per second

      console.log(
        `Streaming Performance: ${chunkCount} chunks in ${totalTime.toFixed(2)}ms (${wordsPerSecond.toFixed(1)} words/sec)`,
      );
    });
  });

  describe("Natural Language Processing Performance", () => {
    it("should detect user intents efficiently", async () => {
      const testInputs = [
        {
          step: "investment_goals",
          input: "I want to maximize my returns for retirement",
        },
        {
          step: "risk_tolerance",
          input: "I prefer a balanced approach with some risk",
        },
        { step: "timeline", input: "Planning for about 10 years" },
        { step: "amount", input: "I can invest around $2,500 monthly" },
        { step: "occupation", input: "I work as a software engineer" },
      ];

      const iterations = 1000;

      benchmark.start();

      for (let i = 0; i < iterations; i++) {
        const testCase = testInputs[i % testInputs.length];

        const startTime = performance.now();
        const intent = detectUserIntent(testCase.input, testCase.step as any);
        const endTime = performance.now();

        expect(intent.action).toBeTruthy();
        expect(intent.confidence).toBeGreaterThanOrEqual(0);

        benchmark.addResult(endTime - startTime);
      }

      const metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(2); // Less than 2ms average
      expect(metrics.operationsPerSecond).toBeGreaterThan(500); // At least 500 ops/sec

      console.log("NLP Intent Detection Performance:", metrics);
    });

    it("should handle complex pattern matching efficiently", async () => {
      const complexInputs = [
        "I am looking to maximize my long-term wealth building through aggressive growth strategies",
        "My preference is for a conservative approach that prioritizes capital preservation over high returns",
        "I want to balance risk and reward with a moderate strategy for my 10-year investment horizon",
        "As a chef working in a busy restaurant, I need simple explanations for complex financial concepts",
        "I can commit approximately $1,500 to $2,000 per month depending on seasonal business fluctuations",
      ];

      const iterations = 200;

      benchmark.start();

      for (let i = 0; i < iterations; i++) {
        const input = complexInputs[i % complexInputs.length];
        const step = [
          "investment_goals",
          "risk_tolerance",
          "timeline",
          "occupation",
          "amount",
        ][i % 5];

        const startTime = performance.now();
        const intent = detectUserIntent(input, step as any);
        const endTime = performance.now();

        expect(intent.action).toBeTruthy();
        benchmark.addResult(endTime - startTime);
      }

      const metrics = benchmark.getMetrics();
      expect(metrics.averageTime).toBeLessThan(5); // Less than 5ms for complex inputs

      console.log("Complex NLP Performance:", metrics);
    });
  });

  describe("Memory Usage and Optimization", () => {
    it("should maintain reasonable memory usage under load", async () => {
      const initialMemory =
        typeof process !== "undefined" && process.memoryUsage
          ? process.memoryUsage().heapUsed
          : 0;

      // Perform intensive operations
      const iterations = 1000;
      const userProfile = generateComplexProfile();

      for (let i = 0; i < iterations; i++) {
        const wallet = generateLargeWallet(20);
        wallet.totalValueUSD = wallet.holdings.reduce(
          (sum, h) => sum + h.valueUSD,
          0,
        );

        // Generate recommendations
        generateRecommendations(wallet, userProfile);

        // Analyze portfolio
        const portfolioWallet = generatePortfolioWallet(20);
        analyzeWalletComposition(portfolioWallet);

        // Generate analogies
        explainWithAnalogy("portfolio", "chef");

        // Detect intents
        detectUserIntent("I want growth", "investment_goals");
      }

      const finalMemory =
        typeof process !== "undefined" && process.memoryUsage
          ? process.memoryUsage().heapUsed
          : 0;

      const memoryIncrease = finalMemory - initialMemory;
      const memoryPerOperation = memoryIncrease / iterations;

      // Memory usage should be reasonable
      expect(memoryPerOperation).toBeLessThan(1000); // Less than 1KB per operation

      console.log(
        `Memory Usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB total, ${memoryPerOperation.toFixed(0)} bytes per operation`,
      );
    });

    it("should not have memory leaks in repeated operations", async () => {
      const measureMemory = () =>
        typeof process !== "undefined" && process.memoryUsage
          ? process.memoryUsage().heapUsed
          : 0;

      // Baseline measurement
      const baseline = measureMemory();

      // First batch of operations
      for (let i = 0; i < 100; i++) {
        explainWithAnalogy("liquidity", "chef");
        detectUserIntent("I want growth", "investment_goals");
      }

      const afterFirstBatch = measureMemory();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Second batch of operations
      for (let i = 0; i < 100; i++) {
        explainWithAnalogy("portfolio", "engineer");
        detectUserIntent("moderate risk", "risk_tolerance");
      }

      const afterSecondBatch = measureMemory();

      const firstIncrease = afterFirstBatch - baseline;
      const secondIncrease = afterSecondBatch - afterFirstBatch;

      // Second batch should not use significantly more memory than first
      expect(secondIncrease).toBeLessThan(firstIncrease * 1.5);

      console.log(
        `Memory Leak Test: Baseline: ${(baseline / 1024 / 1024).toFixed(2)}MB, First: +${(firstIncrease / 1024 / 1024).toFixed(2)}MB, Second: +${(secondIncrease / 1024 / 1024).toFixed(2)}MB`,
      );
    });
  });

  describe("Stress Testing", () => {
    it("should handle concurrent operations efficiently", async () => {
      const concurrentOperations = 50;
      const userProfile = generateComplexProfile();

      const startTime = performance.now();

      // Create multiple concurrent operations
      const promises = Array.from(
        { length: concurrentOperations },
        async (_, i) => {
          const wallet = generateLargeWallet(10);
          wallet.totalValueUSD = wallet.holdings.reduce(
            (sum, h) => sum + h.valueUSD,
            0,
          );

          // Mix of different operations
          return Promise.all([
            Promise.resolve(generateRecommendations(wallet, userProfile)),
            Promise.resolve(explainWithAnalogy("portfolio", "chef")),
            Promise.resolve(
              detectUserIntent("I want growth", "investment_goals"),
            ),
            Promise.resolve(
              analyzeWalletComposition(generatePortfolioWallet(10)),
            ),
          ]);
        },
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const operationsPerSecond = (concurrentOperations * 4 * 1000) / totalTime;

      // All operations should complete successfully
      expect(results.length).toBe(concurrentOperations);

      // Should maintain reasonable performance under load
      expect(totalTime).toBeLessThan(5000); // Complete within 5 seconds
      expect(operationsPerSecond).toBeGreaterThan(50); // At least 50 ops/sec

      console.log(
        `Concurrent Operations: ${concurrentOperations} batches (${concurrentOperations * 4} total ops) in ${totalTime.toFixed(2)}ms (${operationsPerSecond.toFixed(1)} ops/sec)`,
      );
    });

    it("should handle edge cases efficiently", async () => {
      const edgeCases = [
        // Empty portfolio
        {
          wallet: { holdings: [], totalValueUSD: 0 },
          profile: generateComplexProfile(),
        },
        // Single asset portfolio
        {
          wallet: {
            holdings: [{ symbol: "ETH", amount: 1, valueUSD: 3000 }],
            totalValueUSD: 3000,
          },
          profile: generateComplexProfile(),
        },
        // Very large portfolio
        {
          wallet: generateLargeWallet(1000),
          profile: generateComplexProfile(),
        },
        // Extreme values
        {
          wallet: {
            holdings: [{ symbol: "TEST", amount: 0.000001, valueUSD: 0.01 }],
            totalValueUSD: 0.01,
          },
          profile: generateComplexProfile(),
        },
      ];

      edgeCases[2].wallet.totalValueUSD = edgeCases[2].wallet.holdings.reduce(
        (sum, h) => sum + h.valueUSD,
        0,
      );

      for (const { wallet, profile } of edgeCases) {
        const startTime = performance.now();

        const result = generateRecommendations(wallet, profile);

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(result.isRight()).toBe(true);
        expect(duration).toBeLessThan(1000); // Should handle edge cases within 1 second
      }

      console.log("Edge case handling completed successfully");
    });
  });
});
