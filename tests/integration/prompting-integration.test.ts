/**
 * Integration tests for Prompting System Components
 * Tests component interactions, end-to-end workflows, and cross-module communication
 */

import { FallbackAIService } from "../../frontend/src/services/ai/fallbackService";
import {
  processUserMessage,
  generatePersonalizedRecommendations,
  type ConversationContext,
} from "../../frontend/src/lib/ai-assistant/conversationFlow";
import {
  explainWithAnalogy,
  generateAnalogy,
} from "../../frontend/src/lib/ai-assistant/analogyGenerator";
import {
  analyzeWalletComposition,
  identifyOpportunities,
  generateAllocationSuggestions,
} from "../../frontend/src/lib/ai-assistant/portfolioAnalyzer";
import {
  generateRecommendations,
  calculatePortfolioRiskScore,
  calculateExpectedPortfolioReturn,
} from "../../frontend/src/lib/ai-assistant/recommendationEngine";
import { detectUserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";
import type {
  AIServiceConfig,
  AIContext,
} from "../../frontend/src/services/ai/aiService";
import type {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../frontend/src/providers/AIAssistantProvider";

// Mock external dependencies
jest.mock("../../frontend/src/lib/ai-assistant/mockResponses", () => ({
  getInitialGreeting: () => "Hello! I am your AI investment advisor.",
  getWalletPrompt: () => "Please connect your wallet.",
  getWalletScanningMessage: () => "Scanning wallet...",
  getWalletAnalysisMessage: (data: any) =>
    `Portfolio worth $${data.totalValueUSD} analyzed.`,
  getInvestmentGoalsQuestion: () => "What are your investment goals?",
  getRiskToleranceQuestion: () => "What is your risk tolerance?",
  getTimelineQuestion: () => "What is your timeline?",
  getAmountQuestion: () => "How much monthly investment?",
  getOccupationQuestion: () => "What is your occupation?",
  getRecommendationsIntro: () => "Here are your recommendations.",
  generateClarificationMessage: () => "Please clarify.",
  generateConfirmationMessage: () => "Confirmed.",
  typingDelay: () => 100,
}));

jest.mock("../../frontend/src/services/ai/conversationChain", () => ({
  getNextStep: (currentStep: string) => {
    const stepMap: Record<string, string> = {
      initial: "wallet_prompt",
      wallet_prompt: "wallet_scanning",
      wallet_scanning: "investment_goals",
      investment_goals: "risk_tolerance",
      risk_tolerance: "timeline",
      timeline: "amount",
    };
    return stepMap[currentStep] || currentStep;
  },
}));

describe("Prompting System Integration Tests", () => {
  let mockConfig: AIServiceConfig;
  let mockWalletData: WalletData;
  let mockUserProfile: UserProfile;
  let mockContext: ConversationContext;
  let aiService: FallbackAIService;

  beforeEach(() => {
    mockConfig = {
      apiEndpoint: "http://localhost:3000/api/ai",
      model: "test-model",
      temperature: 0.7,
      maxTokens: 500,
      streamResponse: true,
    };

    mockWalletData = {
      address: "0x1234567890123456789012345678901234567890",
      totalValueUSD: 25000,
      assets: [
        {
          symbol: "ETH",
          balance: "8.5",
          valueUSD: 15000,
          contractAddress: "0x0000000000000000000000000000000000000000",
        },
        {
          symbol: "USDC",
          balance: "5000",
          valueUSD: 5000,
          contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
        },
        {
          symbol: "AAVE",
          balance: "25",
          valueUSD: 3000,
          contractAddress: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        },
        {
          symbol: "UNI",
          balance: "200",
          valueUSD: 2000,
          contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        },
      ],
    };

    mockUserProfile = {
      occupation: "chef",
      investmentGoal: "growth",
      riskTolerance: "moderate",
      timeline: "5 years",
      monthlyAmount: 2000,
    };

    mockContext = {
      walletData: mockWalletData,
      userProfile: mockUserProfile,
      conversationHistory: [],
    };

    aiService = new FallbackAIService(mockConfig);
  });

  describe("End-to-End Conversation Flow", () => {
    it("should complete full investment advisory conversation", async () => {
      const conversationSteps: Array<{
        step: ConversationStep;
        userInput: string;
        expectedIntentAction: string;
      }> = [
        {
          step: "initial",
          userInput: "Hello",
          expectedIntentAction: "unclear",
        },
        {
          step: "wallet_prompt",
          userInput: "connect wallet",
          expectedIntentAction: "connect_wallet",
        },
        {
          step: "investment_goals",
          userInput: "I want growth",
          expectedIntentAction: "select_option",
        },
        {
          step: "occupation",
          userInput: "chef",
          expectedIntentAction: "select_option",
        },
        {
          step: "risk_tolerance",
          userInput: "moderate risk",
          expectedIntentAction: "select_option",
        },
        {
          step: "timeline",
          userInput: "5 years",
          expectedIntentAction: "input_value",
        },
        {
          step: "amount",
          userInput: "$2000",
          expectedIntentAction: "input_value",
        },
      ];

      for (const {
        step,
        userInput,
        expectedIntentAction,
      } of conversationSteps) {
        const context = { ...mockContext, conversationStep: step };

        // Test conversation flow processing
        const flowResponse = await processUserMessage(userInput, step, context);
        expect(flowResponse.message).toBeTruthy();

        // Test AI service response
        const aiContext: AIContext = {
          conversationStep: step,
          userProfile: mockUserProfile,
          walletData: mockWalletData,
          conversationHistory: [],
        };

        const aiResponse = await aiService.generateResponse(
          userInput,
          aiContext,
        );
        expect(aiResponse.intent?.action).toBe(expectedIntentAction);
        expect(aiResponse.message).toBeTruthy();
      }
    });

    it("should maintain conversation state throughout flow", async () => {
      let currentStep: ConversationStep = "initial";
      const conversationHistory: Array<{
        step: ConversationStep;
        response: string;
      }> = [];

      const interactions = [
        { input: "Hello", step: "initial" },
        { input: "connect wallet", step: "wallet_prompt" },
        { input: "growth", step: "investment_goals" },
        { input: "chef", step: "occupation" },
        { input: "moderate", step: "risk_tolerance" },
      ];

      for (const { input, step } of interactions) {
        currentStep = step as ConversationStep;
        const context = { ...mockContext, conversationStep: currentStep };

        const response = await processUserMessage(input, currentStep, context);

        conversationHistory.push({
          step: currentStep,
          response: response.message,
        });

        expect(response.message).toBeTruthy();
        if (response.nextStep) {
          currentStep = response.nextStep;
        }
      }

      expect(conversationHistory.length).toBe(interactions.length);
      expect(conversationHistory.every((h) => h.response.length > 0)).toBe(
        true,
      );
    });

    it("should handle error recovery in conversation flow", async () => {
      const context = {
        ...mockContext,
        conversationStep: "investment_goals" as ConversationStep,
      };

      // Test unclear input
      const unclearResponse = await processUserMessage(
        "xyz123",
        "investment_goals",
        context,
      );
      expect(unclearResponse.message).toBeTruthy();

      // Test recovery with clear input
      const clarifiedResponse = await processUserMessage(
        "I want growth",
        "investment_goals",
        context,
      );
      expect(clarifiedResponse.nextStep).toBe("risk_tolerance");
    });
  });

  describe("Analogy Integration with Conversation Flow", () => {
    it("should provide occupation-specific analogies during conversation", async () => {
      const chefContext = {
        ...mockContext,
        userProfile: { ...mockUserProfile, occupation: "chef" },
        conversationStep: "investment_goals" as ConversationStep,
      };

      // Test DeFi concept explanation with chef analogies
      const response = await processUserMessage(
        "What is liquidity?",
        "investment_goals",
        chefContext,
      );

      expect(response.message).toContain("mise en place"); // Chef-specific analogy
    });

    it("should adapt analogies for different occupations", async () => {
      const occupations = ["chef", "truck_driver", "engineer", "doctor"];
      const concept = "portfolio";

      for (const occupation of occupations) {
        const analogy = explainWithAnalogy("portfolio", occupation as any);

        // Each occupation should get different analogies
        expect(analogy).toBeTruthy();
        expect(analogy.length).toBeGreaterThan(50);

        // Verify occupation-specific terminology
        if (occupation === "chef") {
          expect(analogy).toMatch(/menu|kitchen|dish|recipe/i);
        } else if (occupation === "truck_driver") {
          expect(analogy).toMatch(/route|cargo|load|delivery/i);
        } else if (occupation === "engineer") {
          expect(analogy).toMatch(/system|component|redundancy|fail/i);
        }
      }
    });

    it("should generate contextual analogies during recommendation phase", async () => {
      const context = {
        ...mockContext,
        conversationStep: "recommendations" as ConversationStep,
      };

      const response = await processUserMessage(
        "Explain smart contracts",
        "recommendations",
        context,
      );

      // Should use chef analogies since user profile has chef occupation
      expect(response.message).toContain("kitchen"); // Chef-specific explanation
    });
  });

  describe("Portfolio Analysis Integration", () => {
    it("should integrate wallet analysis with recommendation generation", async () => {
      // Analyze portfolio composition
      const analysis = analyzeWalletComposition(mockWalletData);
      expect(analysis.overallRisk).toMatch(/^(low|medium|high)$/);

      // Generate recommendations based on profile
      const recommendations = generatePersonalizedRecommendations(
        mockWalletData,
        mockUserProfile,
      );
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify integration: recommendations should consider current portfolio
      const totalAllocation = recommendations.reduce(
        (sum, r) => sum + r.allocation,
        0,
      );
      expect(totalAllocation).toBe(100);

      // Risk level should be consistent with user profile
      const hasModerateRisk = recommendations.some(
        (r) => r.riskLevel === "medium",
      );
      expect(hasModerateRisk).toBe(true);
    });

    it("should identify opportunities based on portfolio analysis", async () => {
      const analysis = analyzeWalletComposition(mockWalletData);
      const opportunities = identifyOpportunities(
        mockWalletData,
        mockUserProfile as any,
      );
      const suggestions = generateAllocationSuggestions(mockUserProfile as any);

      // All components should return valid data
      expect(analysis.diversificationScore).toBeGreaterThanOrEqual(0);
      expect(opportunities.length).toBeGreaterThanOrEqual(0);
      expect(suggestions.length).toBeGreaterThan(0);

      // Integration: if low diversification, should suggest diversification
      if (analysis.diversificationScore < 50) {
        const hasDiversificationOpp = opportunities.some(
          (opp) => opp.type === "diversification",
        );
        expect(hasDiversificationOpp).toBe(true);
      }
    });

    it("should handle concentrated portfolios appropriately", async () => {
      const concentratedWallet = {
        ...mockWalletData,
        assets: [
          {
            symbol: "ETH",
            balance: "20",
            valueUSD: 22000,
            contractAddress: "0x0000000000000000000000000000000000000000",
          },
          {
            symbol: "USDC",
            balance: "3000",
            valueUSD: 3000,
            contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
          },
        ],
        totalValueUSD: 25000,
      };

      const analysis = analyzeWalletComposition(concentratedWallet);
      expect(analysis.concentrationRisk.length).toBeGreaterThan(0);
      expect(analysis.overallRisk).toBe("high");

      const opportunities = identifyOpportunities(
        concentratedWallet,
        mockUserProfile as any,
      );
      const diversificationOpp = opportunities.find(
        (opp) => opp.type === "diversification",
      );
      expect(diversificationOpp).toBeDefined();
      expect(diversificationOpp?.priority).toBe("high");
    });
  });

  describe("Recommendation Engine Integration", () => {
    it("should generate consistent recommendations across components", async () => {
      // Generate recommendations using recommendation engine
      const engineResult = generateRecommendations(
        {
          holdings: mockWalletData.assets.map((asset) => ({
            symbol: asset.symbol,
            amount: parseFloat(asset.balance),
            valueUSD: asset.valueUSD,
          })),
          totalValueUSD: mockWalletData.totalValueUSD,
        },
        {
          riskTolerance: mockUserProfile.riskTolerance,
          investmentHorizon: "medium",
          experienceLevel: "intermediate",
          goals: [mockUserProfile.investmentGoal],
        },
      );

      // Generate recommendations using conversation flow
      const flowRecommendations = generatePersonalizedRecommendations(
        mockWalletData,
        mockUserProfile,
      );

      expect(engineResult.isRight()).toBe(true);
      expect(flowRecommendations.length).toBeGreaterThan(0);

      if (engineResult.isRight()) {
        const engineRecs = engineResult.value as any[];

        // Both should generate recommendations
        expect(engineRecs.length).toBeGreaterThan(0);
        expect(flowRecommendations.length).toBeGreaterThan(0);

        // Calculate risk scores
        const engineRiskScore = calculatePortfolioRiskScore(engineRecs);
        expect(engineRiskScore).toBeGreaterThanOrEqual(0);
        expect(engineRiskScore).toBeLessThanOrEqual(100);
      }
    });

    it("should calculate portfolio metrics consistently", async () => {
      const engineResult = generateRecommendations(
        {
          holdings: mockWalletData.assets.map((asset) => ({
            symbol: asset.symbol,
            amount: parseFloat(asset.balance),
            valueUSD: asset.valueUSD,
          })),
          totalValueUSD: mockWalletData.totalValueUSD,
        },
        {
          riskTolerance: "moderate",
          investmentHorizon: "medium",
          experienceLevel: "intermediate",
          goals: ["growth"],
        },
      );

      if (engineResult.isRight()) {
        const recommendations = engineResult.value as any[];

        // Calculate metrics
        const riskScore = calculatePortfolioRiskScore(recommendations);
        const expectedReturn =
          calculateExpectedPortfolioReturn(recommendations);

        // Verify consistency
        expect(riskScore).toBeGreaterThanOrEqual(0);
        expect(riskScore).toBeLessThanOrEqual(100);
        expect(expectedReturn.min).toBeLessThanOrEqual(expectedReturn.max);
        expect(expectedReturn.min).toBeGreaterThanOrEqual(-10); // Reasonable bounds
        expect(expectedReturn.max).toBeLessThanOrEqual(100);

        // Allocations should sum to 100%
        const totalAllocation = recommendations.reduce(
          (sum, r) => sum + r.allocationPercentage,
          0,
        );
        expect(totalAllocation).toBe(100);
      }
    });

    it("should adapt recommendations based on user profile changes", async () => {
      const conservativeProfile = {
        ...mockUserProfile,
        riskTolerance: "conservative" as const,
      };
      const aggressiveProfile = {
        ...mockUserProfile,
        riskTolerance: "aggressive" as const,
      };

      const conservativeRecs = generatePersonalizedRecommendations(
        mockWalletData,
        conservativeProfile,
      );
      const aggressiveRecs = generatePersonalizedRecommendations(
        mockWalletData,
        aggressiveProfile,
      );

      expect(conservativeRecs.length).toBeGreaterThan(0);
      expect(aggressiveRecs.length).toBeGreaterThan(0);

      // Conservative should have more low-risk allocations
      const conservativeLowRisk = conservativeRecs.filter(
        (r) => r.riskLevel === "low",
      );
      const aggressiveLowRisk = aggressiveRecs.filter(
        (r) => r.riskLevel === "low",
      );

      const conservativeLowRiskAllocation = conservativeLowRisk.reduce(
        (sum, r) => sum + r.allocation,
        0,
      );
      const aggressiveLowRiskAllocation = aggressiveLowRisk.reduce(
        (sum, r) => sum + r.allocation,
        0,
      );

      expect(conservativeLowRiskAllocation).toBeGreaterThan(
        aggressiveLowRiskAllocation,
      );
    });
  });

  describe("Natural Language Processing Integration", () => {
    it("should handle complex conversational scenarios", async () => {
      const scenarios = [
        {
          step: "investment_goals" as ConversationStep,
          input: "I want to grow my wealth for retirement",
          expectedExtraction: "growth",
        },
        {
          step: "risk_tolerance" as ConversationStep,
          input: "I prefer a balanced approach with moderate risk",
          expectedExtraction: "moderate",
        },
        {
          step: "timeline" as ConversationStep,
          input: "Planning for about 10 years",
          expectedExtraction: 10,
        },
        {
          step: "amount" as ConversationStep,
          input: "I can invest $1,500 per month",
          expectedExtraction: 1500,
        },
      ];

      for (const scenario of scenarios) {
        const intent = detectUserIntent(scenario.input, scenario.step);

        expect(intent.action).toBe(
          scenario.step === "timeline" || scenario.step === "amount"
            ? "input_value"
            : "select_option",
        );
        expect(intent.extractedValue).toBe(scenario.expectedExtraction);
        expect(intent.confidence).toBeGreaterThan(0.8);
      }
    });

    it("should integrate NLP with conversation flow smoothly", async () => {
      const context = {
        ...mockContext,
        conversationStep: "investment_goals" as ConversationStep,
      };

      // Test natural language processing integration
      const complexInput =
        "I am looking to maximize my returns for long-term wealth building";
      const response = await processUserMessage(
        complexInput,
        "investment_goals",
        context,
      );

      expect(response.message).toBeTruthy();
      expect(response.nextStep).toBe("risk_tolerance");
    });

    it("should handle conversation repair and clarification", async () => {
      const context = {
        ...mockContext,
        conversationStep: "risk_tolerance" as ConversationStep,
      };

      // Test unclear input
      const unclearResponse = await processUserMessage(
        "maybe?",
        "risk_tolerance",
        context,
      );
      expect(unclearResponse.message).toBeTruthy();

      // Test clarification
      const clarifiedResponse = await processUserMessage(
        "I meant conservative",
        "risk_tolerance",
        context,
      );
      expect(clarifiedResponse.nextStep).toBe("timeline");
    });
  });

  describe("Performance and Scalability Integration", () => {
    it("should handle large portfolios efficiently in full workflow", async () => {
      const largeWallet = {
        address: "0x1234567890123456789012345678901234567890",
        totalValueUSD: 1000000,
        assets: Array.from({ length: 50 }, (_, i) => ({
          symbol: `TOKEN${i}`,
          balance: "1000",
          valueUSD: 20000,
          contractAddress: `0x${i.toString().padStart(40, "0")}`,
        })),
      };

      const startTime = performance.now();

      // Test full integration pipeline
      const analysis = analyzeWalletComposition(largeWallet);
      const opportunities = identifyOpportunities(
        largeWallet,
        mockUserProfile as any,
      );
      const recommendations = generatePersonalizedRecommendations(
        largeWallet,
        mockUserProfile,
      );

      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(500); // 500ms for large portfolio

      // All components should return valid results
      expect(analysis.diversificationScore).toBeGreaterThan(0);
      expect(opportunities.length).toBeGreaterThanOrEqual(0);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should maintain response times for AI service integration", async () => {
      const aiContext: AIContext = {
        conversationStep: "recommendations",
        userProfile: mockUserProfile,
        walletData: mockWalletData,
        conversationHistory: [],
      };

      const startTime = performance.now();

      // Test streaming response
      const chunks: string[] = [];
      await aiService.streamResponse(
        "Tell me about my recommendations",
        aiContext,
        (chunk) => {
          chunks.push(chunk);
        },
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should gracefully handle missing data across components", async () => {
      const incompleteWallet = {
        address: "0x1234567890123456789012345678901234567890",
        totalValueUSD: 0,
        assets: [],
      };

      const incompleteProfile = {
        occupation: "chef",
        investmentGoal: undefined,
        riskTolerance: undefined,
        timeline: undefined,
        monthlyAmount: undefined,
      };

      // All components should handle incomplete data gracefully
      expect(() => analyzeWalletComposition(incompleteWallet)).not.toThrow();
      expect(() =>
        identifyOpportunities(incompleteWallet, incompleteProfile as any),
      ).not.toThrow();
      expect(() =>
        generatePersonalizedRecommendations(
          incompleteWallet,
          incompleteProfile as any,
        ),
      ).not.toThrow();
    });

    it("should recover from component failures gracefully", async () => {
      const context = { ...mockContext, walletData: undefined };

      // Should handle missing wallet data
      const response = await processUserMessage(
        "Show recommendations",
        "recommendations",
        context,
      );
      expect(response.message).toBeTruthy();
      expect(response.error).toBeTruthy();
    });

    it("should validate data consistency across component boundaries", async () => {
      // Test with inconsistent data
      const inconsistentWallet = {
        ...mockWalletData,
        totalValueUSD: 1000, // Doesn't match sum of assets
        assets: mockWalletData.assets,
      };

      // Components should handle inconsistencies gracefully
      const analysis = analyzeWalletComposition(inconsistentWallet);
      expect(analysis).toBeDefined();

      const recommendations = generatePersonalizedRecommendations(
        inconsistentWallet,
        mockUserProfile,
      );
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("User Experience Integration", () => {
    it("should provide coherent experience across all touchpoints", async () => {
      // Test complete user journey
      let currentStep: ConversationStep = "initial";
      let context = { ...mockContext, conversationStep: currentStep };

      // Initial interaction
      let response = await processUserMessage("Hello", currentStep, context);
      expect(response.message).toContain("investment advisor");

      // Wallet connection
      currentStep = "wallet_prompt";
      context = { ...context, conversationStep: currentStep };
      response = await processUserMessage(
        "connect wallet",
        currentStep,
        context,
      );
      expect(response.message).toBeTruthy();

      // Portfolio analysis
      currentStep = "wallet_scanning";
      context = { ...context, conversationStep: currentStep };
      response = await processUserMessage("analyze", currentStep, context);
      expect(response.message).toContain("$25000"); // Should show portfolio value

      // Investment goals with analogy
      currentStep = "investment_goals";
      context = { ...context, conversationStep: currentStep };
      response = await processUserMessage(
        "What is diversification?",
        currentStep,
        context,
      );
      expect(response.message).toContain("basket"); // Should provide analogy

      // Each step should provide meaningful, contextual responses
      expect(response.message.length).toBeGreaterThan(20);
    });

    it("should maintain conversation context and personalization", async () => {
      const personalizedContext = {
        ...mockContext,
        userProfile: { ...mockUserProfile, occupation: "chef" },
        conversationStep: "recommendations" as ConversationStep,
      };

      // Should use chef-specific analogies
      const response = await processUserMessage(
        "Explain liquidity pools",
        "recommendations",
        personalizedContext,
      );
      expect(response.message).toContain("kitchen"); // Chef-specific analogy

      // Should remember user preferences
      const recommendations = generatePersonalizedRecommendations(
        mockWalletData,
        personalizedContext.userProfile,
      );
      expect(recommendations.some((r) => r.explanation.includes("chef"))).toBe(
        false,
      ); // Explanations shouldn't be chef-specific, analogies should be
    });
  });
});
