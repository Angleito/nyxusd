/**
 * Unit tests for AnalogyEngine (ConversationFlow)
 * Tests conversation flow, user message processing, and context management
 */

import {
  processUserMessage,
  getNextStep,
  generatePersonalizedRecommendations,
  simulateTypingDelay,
  type ConversationContext,
} from "../../frontend/src/lib/ai-assistant/conversationFlow";
import type {
  ConversationStep,
  UserProfile,
  WalletData,
} from "../../frontend/src/providers/AIAssistantProvider";

// Mock the dependencies
jest.mock("../../frontend/src/lib/ai-assistant/mockResponses", () => ({
  getInitialGreeting: jest.fn(() => "Hello! I am your AI assistant."),
  getWalletPrompt: jest.fn(() => "Please connect your wallet."),
  getWalletScanningMessage: jest.fn(() => "Scanning your wallet..."),
  getWalletAnalysisMessage: jest.fn(
    (data) => `Found ${data.tokenCount} tokens worth $${data.totalValueUSD}`,
  ),
  getInvestmentGoalsQuestion: jest.fn(() => "What are your investment goals?"),
  getRiskToleranceQuestion: jest.fn(() => "What is your risk tolerance?"),
  getTimelineQuestion: jest.fn(() => "What is your investment timeline?"),
  getAmountQuestion: jest.fn(() => "How much would you like to invest?"),
  getRecommendationsIntro: jest.fn(
    () => "Here are your personalized recommendations:",
  ),
  getErrorMessage: jest.fn(() => "An error occurred."),
  typingDelay: jest.fn(() => 1000),
}));

jest.mock("../../frontend/src/lib/ai-assistant/portfolioAnalyzer", () => ({
  analyzeWalletComposition: jest.fn(() => ({
    overallRisk: "medium",
    diversificationScore: 75,
    volatilityEstimate: 15,
    recommendations: ["Diversify further", "Consider stablecoins"],
  })),
}));

jest.mock("../../frontend/src/lib/ai-assistant/recommendationEngine", () => ({
  generateRecommendations: jest.fn(() => ({
    isRight: () => true,
    value: [
      {
        id: "1",
        title: "Stablecoin Strategy",
        description: "Low-risk stablecoin yields",
        allocationPercentage: 40,
        expectedReturnRange: { min: 5, max: 8 },
        riskLevel: "low",
        explanation: "Conservative approach",
      },
    ],
  })),
}));

describe("AnalogyEngine (ConversationFlow)", () => {
  let mockContext: ConversationContext;
  let mockUserProfile: UserProfile;
  let mockWalletData: WalletData;

  beforeEach(() => {
    mockUserProfile = {
      occupation: "chef",
      investmentGoal: "growth",
      riskTolerance: "moderate",
      timeline: "5 years",
      monthlyAmount: 1000,
    };

    mockWalletData = {
      address: "0x1234567890123456789012345678901234567890",
      totalValueUSD: 10000,
      assets: [
        {
          symbol: "ETH",
          balance: "5.0",
          valueUSD: 8000,
        },
        {
          symbol: "USDC",
          balance: "2000",
          valueUSD: 2000,
        },
      ],
    };

    mockContext = {
      walletData: mockWalletData,
      userProfile: mockUserProfile,
      conversationHistory: [],
    };
  });

  describe("processUserMessage", () => {
    it("should handle initial conversation step", async () => {
      const result = await processUserMessage("Hello", "initial", {});

      expect(result).toMatchObject({
        message: expect.stringContaining("Nyx"),
        nextStep: "strategy_choice",
        typingDelay: expect.any(Number),
      });
    });

    it("should handle strategy choice with custom option", async () => {
      const result = await processUserMessage(
        "I want custom strategy",
        "strategy_choice",
        {},
      );

      expect(result).toMatchObject({
        message: expect.stringContaining("wallet"),
        nextStep: "wallet_prompt",
        typingDelay: expect.any(Number),
      });
    });

    it("should handle strategy choice with template option", async () => {
      const result = await processUserMessage(
        "I want templates",
        "strategy_choice",
        {},
      );

      expect(result).toMatchObject({
        message: expect.stringContaining("Conservative Yield Hunter"),
        nextStep: "template_selection",
        typingDelay: expect.any(Number),
      });
    });

    it("should process wallet scanning with valid data", async () => {
      const result = await processUserMessage(
        "Wallet connected",
        "wallet_scanning",
        mockContext,
      );

      expect(result).toMatchObject({
        message: expect.stringContaining("2 tokens"),
        nextStep: "investment_goals",
        typingDelay: expect.any(Number),
      });
    });

    it("should handle wallet scanning without wallet data", async () => {
      const { walletData, ...contextWithoutWallet } = mockContext;
      const result = await processUserMessage(
        "Wallet connected",
        "wallet_scanning",
        contextWithoutWallet,
      );

      expect(result).toMatchObject({
        error: true,
        typingDelay: expect.any(Number),
      });
    });

    it("should detect and explain DeFi concepts with analogies", async () => {
      const contextWithProfile = { ...mockContext };
      const result = await processUserMessage(
        "What is liquidity?",
        "investment_goals",
        contextWithProfile,
      );

      expect(result.message).toContain("mise en place"); // Chef-specific analogy
      expect(result.message).toContain("investment goals");
    });

    it("should handle risk analysis questions", async () => {
      const result = await processUserMessage(
        "Tell me about risk",
        "recommendations",
        mockContext,
      );

      expect(result.message).toContain("Overall Risk: medium");
      expect(result.message).toContain("Diversification Score: 75");
    });

    it("should process template selection", async () => {
      const result = await processUserMessage(
        "I choose conservative",
        "template_selection",
        {},
      );

      expect(result.message).toContain("Conservative Yield Hunter");
      expect(result.nextStep).toBe("wallet_prompt");
    });

    it("should handle generating recommendations step", async () => {
      const result = await processUserMessage(
        "Generate recommendations",
        "generating_recommendations",
        mockContext,
      );

      expect(result.message).toContain("personalized recommendations");
      expect(result.nextStep).toBe("recommendations");
    });

    it("should handle error gracefully", async () => {
      // Simulate error by passing invalid step
      const result = await processUserMessage(
        "test",
        "invalid_step" as ConversationStep,
        {},
      );

      expect(result.message).toContain("help");
    });
  });

  describe("occupation mapping", () => {
    it("should map chef-related occupations correctly", async () => {
      const contexts = [
        {
          ...mockContext,
          userProfile: { ...mockUserProfile, occupation: "chef" },
        },
        {
          ...mockContext,
          userProfile: { ...mockUserProfile, occupation: "restaurant manager" },
        },
        {
          ...mockContext,
          userProfile: { ...mockUserProfile, occupation: "cook" },
        },
      ];

      for (const context of contexts) {
        const result = await processUserMessage(
          "What is liquidity?",
          "investment_goals",
          context,
        );
        expect(result.message).toContain("mise en place");
      }
    });

    it("should map engineering-related occupations correctly", async () => {
      const contexts = [
        {
          ...mockContext,
          userProfile: { ...mockUserProfile, occupation: "software engineer" },
        },
        {
          ...mockContext,
          userProfile: { ...mockUserProfile, occupation: "developer" },
        },
        {
          ...mockContext,
          userProfile: { ...mockUserProfile, occupation: "tech lead" },
        },
      ];

      for (const context of contexts) {
        const result = await processUserMessage(
          "What are smart contracts?",
          "investment_goals",
          context,
        );
        expect(result.message).toContain("code");
      }
    });

    it("should fall back to general for unknown occupations", async () => {
      const context = {
        ...mockContext,
        userProfile: { ...mockUserProfile, occupation: "astronaut" },
      };
      const result = await processUserMessage(
        "What is staking?",
        "investment_goals",
        context,
      );

      expect(result.message).toContain("tokens to support network");
    });
  });

  describe("DeFi concept detection", () => {
    const conceptTests = [
      { input: "Tell me about liquidity pools", expectedConcept: "pools" },
      {
        input: "What is impermanent loss?",
        expectedConcept: "impermanent_loss",
      },
      { input: "Explain gas fees", expectedConcept: "gas_fees" },
      { input: "How does staking work?", expectedConcept: "staking" },
      { input: "What about slippage?", expectedConcept: "slippage" },
      { input: "APY and yields", expectedConcept: "yields" },
      { input: "Smart contract risks", expectedConcept: "smart_contracts" },
    ];

    conceptTests.forEach(({ input, expectedConcept }) => {
      it(`should detect ${expectedConcept} concept in: "${input}"`, async () => {
        const result = await processUserMessage(
          input,
          "investment_goals",
          mockContext,
        );

        // The message should contain an analogy for the detected concept
        expect(result.message.length).toBeGreaterThan(50);
        expect(result.message).not.toContain("I don't have a specific analogy");
      });
    });

    it("should not detect concepts in unrelated messages", async () => {
      const result = await processUserMessage(
        "Hello how are you?",
        "investment_goals",
        mockContext,
      );

      // Should just proceed with the flow, not provide concept explanations
      expect(result.nextStep).toBe("risk_tolerance");
    });
  });

  describe("conversation flow progression", () => {
    it("should progress through questionnaire steps correctly", async () => {
      const steps: Array<{
        step: ConversationStep;
        expectedNext: ConversationStep;
      }> = [
        { step: "investment_goals", expectedNext: "risk_tolerance" },
        { step: "risk_tolerance", expectedNext: "timeline" },
        { step: "timeline", expectedNext: "amount" },
        { step: "amount", expectedNext: "protocol_selection" },
      ];

      for (const { step, expectedNext } of steps) {
        const result = await processUserMessage(
          "test response",
          step,
          mockContext,
        );
        expect(result.nextStep).toBe(expectedNext);
      }
    });

    it("should handle strategy builder flow", async () => {
      const protocolResult = await processUserMessage(
        "sounds good",
        "protocol_selection",
        mockContext,
      );
      expect(protocolResult.nextStep).toBe("strategy_builder");

      const builderResult = await processUserMessage(
        "yes",
        "strategy_builder",
        mockContext,
      );
      expect(builderResult.nextStep).toBe("leverage_optimization");

      const leverageResult = await processUserMessage(
        "add leverage",
        "leverage_optimization",
        mockContext,
      );
      expect(leverageResult.nextStep).toBe("generating_recommendations");
      expect(leverageResult.shouldGenerateRecommendations).toBe(true);
    });
  });

  describe("getNextStep", () => {
    it("should return correct next steps for standard flow", () => {
      const stepMappings: Array<[ConversationStep, ConversationStep]> = [
        ["initial", "strategy_choice"],
        ["strategy_choice", "wallet_prompt"],
        ["wallet_prompt", "wallet_scanning"],
        ["investment_goals", "occupation"],
        ["risk_tolerance", "timeline"],
        ["timeline", "amount"],
      ];

      stepMappings.forEach(([current, expected]) => {
        expect(getNextStep(current)).toBe(expected);
      });
    });

    it("should handle terminal states", () => {
      expect(getNextStep("complete")).toBe("complete");
      expect(getNextStep("chat")).toBe("chat");
    });

    it("should return same step for unknown steps", () => {
      const unknownStep = "unknown_step" as ConversationStep;
      expect(getNextStep(unknownStep)).toBe(unknownStep);
    });
  });

  describe("generatePersonalizedRecommendations", () => {
    it("should generate recommendations with valid inputs", () => {
      const recommendations = generatePersonalizedRecommendations(
        mockWalletData,
        mockUserProfile,
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      const rec = recommendations[0];
      expect(rec).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        allocation: expect.any(Number),
        expectedReturn: expect.any(String),
        riskLevel: expect.any(String),
        explanation: expect.any(String),
      });
    });

    it("should add occupation-specific context to recommendations", () => {
      const chefProfile = { ...mockUserProfile, occupation: "chef" };
      const recommendations = generatePersonalizedRecommendations(
        mockWalletData,
        chefProfile,
      );

      // Should add chef-specific context if the recommendation title matches
      const rec = recommendations[0];
      if (rec && rec.title.toLowerCase().includes("stablecoin")) {
        expect(rec.explanation).toContain("ingredient"); // Chef context
      }
    });

    it("should handle different risk tolerances", () => {
      const profiles = [
        { ...mockUserProfile, riskTolerance: "conservative" as const },
        { ...mockUserProfile, riskTolerance: "moderate" as const },
        { ...mockUserProfile, riskTolerance: "aggressive" as const },
      ];

      profiles.forEach((profile) => {
        const recommendations = generatePersonalizedRecommendations(
          mockWalletData,
          profile,
        );
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });

    it("should handle different investment horizons", () => {
      const timelines = ["1 year", "3 years", "10 years"];

      timelines.forEach((timeline) => {
        const profile = { ...mockUserProfile, timeline };
        const recommendations = generatePersonalizedRecommendations(
          mockWalletData,
          profile,
        );
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });

    it("should provide fallback recommendations on engine failure", () => {
      // Mock the recommendation engine to fail
      const mockGenerateRecommendations = jest.requireMock(
        "../../frontend/src/lib/ai-assistant/recommendationEngine",
      ).generateRecommendations;
      mockGenerateRecommendations.mockReturnValueOnce({
        isRight: () => false,
        value: null,
      });

      const recommendations = generatePersonalizedRecommendations(
        mockWalletData,
        mockUserProfile,
      );

      expect(recommendations.length).toBe(1);
      expect(recommendations[0]?.title).toBe("Balanced DeFi Portfolio");
    });
  });

  describe("simulateTypingDelay", () => {
    it("should simulate realistic typing delay", async () => {
      const startTime = Date.now();
      await simulateTypingDelay(100);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(200); // Allow some tolerance
    });

    it("should use default delay when none provided", async () => {
      const startTime = Date.now();
      await simulateTypingDelay();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(0);
    });
  });

  describe("error handling and edge cases", () => {
    it("should handle empty messages gracefully", async () => {
      const result = await processUserMessage("", "initial", {});

      expect(result.message).toBeTruthy();
      expect(result.error).not.toBe(true);
    });

    it("should handle missing context gracefully", async () => {
      const result = await processUserMessage("test", "recommendations", {});

      expect(result.message).toBeTruthy();
    });

    it("should handle undefined user profile", async () => {
      const { userProfile, ...contextWithoutProfile } = mockContext;
      const result = await processUserMessage(
        "What is staking?",
        "investment_goals",
        contextWithoutProfile,
      );

      expect(result.message).toBeTruthy();
      expect(result.message).toContain("general"); // Should fall back to general explanation
    });

    it("should catch and handle processing errors", async () => {
      // Force an error by mocking a throwing function
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Mock an internal function to throw
      jest.doMock(
        "../../frontend/src/lib/ai-assistant/analogyGenerator",
        () => {
          throw new Error("Test error");
        },
      );

      const result = await processUserMessage(
        "test message",
        "investment_goals",
        mockContext,
      );

      expect(result.error).toBe(true);
      expect(result.message).toContain("error");

      console.error = originalConsoleError;
    });
  });

  describe("conversation context management", () => {
    it("should maintain conversation history", async () => {
      const contextWithHistory = {
        ...mockContext,
        conversationHistory: [
          { role: "user" as const, content: "Previous message" },
          { role: "ai" as const, content: "Previous response" },
        ],
      };

      const result = await processUserMessage(
        "Current message",
        "recommendations",
        contextWithHistory,
      );

      expect(result.message).toBeTruthy();
      // Context should be preserved (function doesn't modify it)
      expect(contextWithHistory.conversationHistory.length).toBe(2);
    });

    it("should handle last user message context", async () => {
      const contextWithLastMessage = {
        ...mockContext,
        lastUserMessage: "I asked about liquidity before",
      };

      const result = await processUserMessage(
        "Continue",
        "recommendations",
        contextWithLastMessage,
      );

      expect(result.message).toBeTruthy();
    });
  });
});
