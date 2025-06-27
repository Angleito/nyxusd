/**
 * Unit tests for AI Services
 * Tests AI service implementations, natural language processing, and conversation handling
 */

import { FallbackAIService } from "../../frontend/src/services/ai/fallbackService";
import {
  detectUserIntent,
  generateClarificationMessage,
  generateConfirmationMessage,
  type UserIntent,
} from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";
import type {
  AIServiceConfig,
  AIContext,
  AIResponse,
} from "../../frontend/src/services/ai/aiService";
import type { ConversationStep } from "../../frontend/src/providers/AIAssistantProvider";

// Mock the dependencies
jest.mock("../../frontend/src/lib/ai-assistant/mockResponses", () => ({
  getInitialGreeting: jest.fn(() => "Hello! I am your AI investment advisor."),
  getWalletPrompt: jest.fn(
    () => "Please connect your wallet to analyze your portfolio.",
  ),
  getWalletAnalysisMessage: jest.fn(
    (data) => `Analysis complete. Portfolio value: $${data.totalValueUSD}.`,
  ),
  getInvestmentGoalsQuestion: jest.fn(() => "What are your investment goals?"),
  getRiskToleranceQuestion: jest.fn(() => "What is your risk tolerance?"),
  getTimelineQuestion: jest.fn(() => "What is your investment timeline?"),
  getAmountQuestion: jest.fn(
    () => "How much would you like to invest monthly?",
  ),
  getOccupationQuestion: jest.fn(() => "What is your occupation?"),
  getRecommendationsIntro: jest.fn(
    () => "Here are your personalized recommendations.",
  ),
  generateClarificationMessage: jest.fn(
    (step) => `Please clarify for step: ${step}`,
  ),
  generateConfirmationMessage: jest.fn(
    (action, value) => `Confirmed: ${action} = ${value}`,
  ),
}));

jest.mock("../../frontend/src/services/ai/conversationChain", () => ({
  getNextStep: jest.fn((currentStep, context) => {
    const stepMap: Record<string, string> = {
      initial: "wallet_prompt",
      wallet_prompt: "wallet_analyzed",
      wallet_analyzed: "investment_goals",
      investment_goals: "occupation",
      occupation: "risk_tolerance",
      risk_tolerance: "timeline",
      timeline: "amount",
      amount: "generating_recommendations",
      generating_recommendations: "recommendations",
    };
    return stepMap[currentStep] || currentStep;
  }),
}));

describe("AI Services", () => {
  let mockConfig: AIServiceConfig;
  let mockContext: AIContext;

  beforeEach(() => {
    mockConfig = {
      apiEndpoint: "http://localhost:3000/api/ai",
      model: "test-model",
      temperature: 0.7,
      maxTokens: 500,
      streamResponse: true,
    };

    mockContext = {
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
        assets: [
          {
            symbol: "ETH",
            balance: "5.0",
            valueUSD: 8000,
            contractAddress: "0x0000000000000000000000000000000000000000",
          },
          {
            symbol: "USDC",
            balance: "2000",
            valueUSD: 2000,
            contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
          },
        ],
      },
      conversationHistory: [],
    };
  });

  describe("FallbackAIService", () => {
    let fallbackService: FallbackAIService;

    beforeEach(() => {
      fallbackService = new FallbackAIService(mockConfig);
    });

    describe("constructor and configuration", () => {
      it("should create service with provided config", () => {
        expect(fallbackService).toBeInstanceOf(FallbackAIService);
      });

      it("should validate configuration successfully", async () => {
        const isValid = await fallbackService.validateConfiguration();
        expect(isValid).toBe(true);
      });

      it("should reset service state", () => {
        expect(() => fallbackService.reset()).not.toThrow();
      });
    });

    describe("generateResponse", () => {
      it("should handle initial conversation step", async () => {
        const response = await fallbackService.generateResponse(
          "Hello",
          mockContext,
        );

        expect(response).toMatchObject({
          message: expect.stringContaining("investment advisor"),
          intent: expect.objectContaining({
            action: expect.any(String),
            confidence: expect.any(Number),
          }),
          shouldContinue: expect.any(Boolean),
        });
      });

      it("should handle wallet prompt step", async () => {
        const context = {
          ...mockContext,
          conversationStep: "wallet_prompt" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "connect wallet",
          context,
        );

        expect(response.message).toBeTruthy();
        expect(response.intent?.action).toBe("connect_wallet");
      });

      it("should handle wallet analyzed step with wallet data", async () => {
        const context = {
          ...mockContext,
          conversationStep: "wallet_analyzed" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "analyze",
          context,
        );

        expect(response.message).toContain("$10000");
        expect(response.shouldContinue).toBe(true);
        expect(response.nextStep).toBe("investment_goals");
      });

      it("should handle investment goals step", async () => {
        const context = {
          ...mockContext,
          conversationStep: "investment_goals" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "growth",
          context,
        );

        expect(response.intent?.action).toBe("select_option");
        expect(response.intent?.extractedValue).toBe("growth");
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle occupation step", async () => {
        const context = {
          ...mockContext,
          conversationStep: "occupation" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "chef",
          context,
        );

        expect(response.intent?.action).toBe("select_option");
        expect(response.intent?.extractedValue).toBe("chef");
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle risk tolerance step", async () => {
        const context = {
          ...mockContext,
          conversationStep: "risk_tolerance" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "moderate risk",
          context,
        );

        expect(response.intent?.action).toBe("select_option");
        expect(response.intent?.extractedValue).toBe("moderate");
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle timeline step with numeric input", async () => {
        const context = {
          ...mockContext,
          conversationStep: "timeline" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "5 years",
          context,
        );

        expect(response.intent?.action).toBe("input_value");
        expect(response.intent?.extractedValue).toBe(5);
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle amount step with monetary input", async () => {
        const context = {
          ...mockContext,
          conversationStep: "amount" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "$1000",
          context,
        );

        expect(response.intent?.action).toBe("input_value");
        expect(response.intent?.extractedValue).toBe(1000);
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle generating recommendations step", async () => {
        const context = {
          ...mockContext,
          conversationStep: "generating_recommendations" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "generate",
          context,
        );

        expect(response.message).toContain("analyze your profile");
        expect(response.nextStep).toBe("recommendations");
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle recommendations step", async () => {
        const context = {
          ...mockContext,
          conversationStep: "recommendations" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "show recommendations",
          context,
        );

        expect(response.message).toContain("personalized recommendations");
        expect(response.nextStep).toBe("complete");
        expect(response.shouldContinue).toBe(true);
      });

      it("should handle unknown steps with default response", async () => {
        const context = {
          ...mockContext,
          conversationStep: "unknown_step" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "test",
          context,
        );

        expect(response.message).toContain("help");
      });

      it("should handle help requests", async () => {
        const context = {
          ...mockContext,
          conversationStep: "investment_goals" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "help",
          context,
        );

        expect(response.message).toBeTruthy();
        expect(response.intent?.action).toBe("help");
      });

      it("should update next step when conditions are met", async () => {
        const context = {
          ...mockContext,
          conversationStep: "investment_goals" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "growth",
          context,
        );

        expect(response.nextStep).toBe("occupation");
      });
    });

    describe("streamResponse", () => {
      it("should stream response word by word", async () => {
        const chunks: string[] = [];
        const onChunk = jest.fn((chunk: string) => {
          chunks.push(chunk);
        });

        const response = await fallbackService.streamResponse(
          "Hello",
          mockContext,
          onChunk,
        );

        expect(onChunk).toHaveBeenCalled();
        expect(chunks.length).toBeGreaterThan(0);
        expect(response.message).toBeTruthy();

        // Verify that chunks combine to form the full message
        const combinedChunks = chunks.join("").trim();
        expect(combinedChunks).toBe(response.message);
      });

      it("should simulate realistic typing delay", async () => {
        const startTime = Date.now();

        await fallbackService.streamResponse(
          "Test message",
          mockContext,
          () => {},
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should take some time due to delays
        expect(duration).toBeGreaterThan(50);
      });
    });

    describe("error handling", () => {
      it("should handle context without wallet data", async () => {
        const contextWithoutWallet = {
          ...mockContext,
          walletData: undefined,
          conversationStep: "wallet_analyzed" as ConversationStep,
        };

        const response = await fallbackService.generateResponse(
          "analyze",
          contextWithoutWallet,
        );

        expect(response).toBeDefined();
        expect(response.message).toBeTruthy();
      });

      it("should handle empty user messages", async () => {
        const response = await fallbackService.generateResponse(
          "",
          mockContext,
        );

        expect(response).toBeDefined();
        expect(response.message).toBeTruthy();
      });

      it("should handle malformed input gracefully", async () => {
        const response = await fallbackService.generateResponse(
          "!@#$%^&*()",
          mockContext,
        );

        expect(response).toBeDefined();
        expect(response.message).toBeTruthy();
        expect(response.intent?.action).toBe("unclear");
      });
    });
  });

  describe("Natural Language Processing", () => {
    describe("detectUserIntent", () => {
      it("should detect wallet connection intent", () => {
        const testCases = [
          "connect wallet",
          "yes, connect me",
          "let's do it",
          "ok",
          "sure, go ahead",
        ];

        testCases.forEach((message) => {
          const intent = detectUserIntent(message, "wallet_prompt");
          expect(intent.action).toBe("connect_wallet");
          expect(intent.confidence).toBeGreaterThan(0.8);
        });
      });

      it("should detect strategy choice intent", () => {
        const intent1 = detectUserIntent(
          "I want custom strategy",
          "strategy_choice",
        );
        expect(intent1.action).toBe("select_option");
        expect(intent1.extractedValue).toBe("custom");

        const intent2 = detectUserIntent("template please", "strategy_choice");
        expect(intent2.action).toBe("select_option");
        expect(intent2.extractedValue).toBe("template");

        const intent3 = detectUserIntent(
          "let me explore protocols",
          "strategy_choice",
        );
        expect(intent3.action).toBe("select_option");
        expect(intent3.extractedValue).toBe("explore");
      });

      it("should detect template selection intent", () => {
        const intent1 = detectUserIntent(
          "conservative strategy",
          "template_selection",
        );
        expect(intent1.action).toBe("select_option");
        expect(intent1.extractedValue).toBe("conservative");

        const intent2 = detectUserIntent(
          "balanced approach",
          "template_selection",
        );
        expect(intent2.action).toBe("select_option");
        expect(intent2.extractedValue).toBe("balanced");

        const intent3 = detectUserIntent(
          "aggressive farming",
          "template_selection",
        );
        expect(intent3.action).toBe("select_option");
        expect(intent3.extractedValue).toBe("aggressive");
      });

      it("should detect investment goal selection", () => {
        const intent1 = detectUserIntent("I want growth", "investment_goals");
        expect(intent1.action).toBe("select_option");
        expect(intent1.extractedValue).toBe("growth");

        const intent2 = detectUserIntent(
          "steady income please",
          "investment_goals",
        );
        expect(intent2.action).toBe("select_option");
        expect(intent2.extractedValue).toBe("income");

        const intent3 = detectUserIntent(
          "preserve my capital",
          "investment_goals",
        );
        expect(intent3.action).toBe("select_option");
        expect(intent3.extractedValue).toBe("preservation");
      });

      it("should detect risk tolerance selection", () => {
        const intent1 = detectUserIntent(
          "conservative approach",
          "risk_tolerance",
        );
        expect(intent1.action).toBe("select_option");
        expect(intent1.extractedValue).toBe("conservative");

        const intent2 = detectUserIntent("moderate risk", "risk_tolerance");
        expect(intent2.action).toBe("select_option");
        expect(intent2.extractedValue).toBe("moderate");

        const intent3 = detectUserIntent(
          "aggressive strategy",
          "risk_tolerance",
        );
        expect(intent3.action).toBe("select_option");
        expect(intent3.extractedValue).toBe("aggressive");
      });

      it("should detect occupation selection", () => {
        const intent1 = detectUserIntent("I am a chef", "occupation");
        expect(intent1.action).toBe("select_option");
        expect(intent1.extractedValue).toBe("chef");

        const intent2 = detectUserIntent("truck driver", "occupation");
        expect(intent2.action).toBe("select_option");
        expect(intent2.extractedValue).toBe("truck_driver");

        const intent3 = detectUserIntent("retail manager", "occupation");
        expect(intent3.action).toBe("select_option");
        expect(intent3.extractedValue).toBe("retail_manager");
      });

      it("should detect timeline input with various formats", () => {
        const testCases = [
          { input: "5 years", expected: 5 },
          { input: "3 yr", expected: 3 },
          { input: "24 months", expected: 2 },
          { input: "36 mo", expected: 3 },
        ];

        testCases.forEach(({ input, expected }) => {
          const intent = detectUserIntent(input, "timeline");
          expect(intent.action).toBe("input_value");
          expect(intent.extractedValue).toBe(expected);
        });
      });

      it("should detect amount input with various formats", () => {
        const testCases = [
          { input: "$1000", expected: 1000 },
          { input: "2,500 dollars", expected: 2500 },
          { input: "500.50", expected: 500.5 },
          { input: "1,234.56 per month", expected: 1234.56 },
        ];

        testCases.forEach(({ input, expected }) => {
          const intent = detectUserIntent(input, "amount");
          expect(intent.action).toBe("input_value");
          expect(intent.extractedValue).toBe(expected);
        });
      });

      it("should detect continue intent", () => {
        const testCases = ["continue", "next", "that's correct", "confirmed"];

        testCases.forEach((message) => {
          const intent = detectUserIntent(message, "investment_goals");
          expect(intent.action).toBe("continue");
        });
      });

      it("should detect help intent", () => {
        const testCases = ["help", "what?", "explain", "I don't understand"];

        testCases.forEach((message) => {
          const intent = detectUserIntent(message, "investment_goals");
          expect(intent.action).toBe("help");
        });
      });

      it("should handle occupation explanation responses", () => {
        const confirmIntent = detectUserIntent(
          "yes, that works",
          "occupation_explanation",
        );
        expect(confirmIntent.action).toBe("continue");

        const changeIntent = detectUserIntent(
          "no, change it",
          "occupation_explanation",
        );
        expect(changeIntent.action).toBe("select_option");
        expect(changeIntent.extractedValue).toBe("change");

        const directSelect = detectUserIntent(
          "actually, I'm a chef",
          "occupation_explanation",
        );
        expect(directSelect.action).toBe("select_option");
        expect(directSelect.extractedValue).toBe("chef");
      });

      it("should default to unclear for ambiguous input", () => {
        const intent = detectUserIntent("xyz123", "investment_goals");
        expect(intent.action).toBe("unclear");
        expect(intent.confidence).toBeLessThan(0.5);
      });

      it("should preserve original message in intent", () => {
        const originalMessage = "I want to maximize growth";
        const intent = detectUserIntent(originalMessage, "investment_goals");
        expect(intent.originalMessage).toBe(originalMessage);
      });
    });

    describe("generateClarificationMessage", () => {
      it("should provide step-specific clarifications", () => {
        const steps: ConversationStep[] = [
          "strategy_choice",
          "template_selection",
          "wallet_prompt",
          "investment_goals",
          "risk_tolerance",
          "occupation",
          "timeline",
          "amount",
        ];

        steps.forEach((step) => {
          const message = generateClarificationMessage(step);
          expect(message).toBeTruthy();
          expect(message.length).toBeGreaterThan(10);
        });
      });

      it("should handle unknown steps with default message", () => {
        const message = generateClarificationMessage(
          "unknown_step" as ConversationStep,
        );
        expect(message).toContain("rephrase");
      });

      it("should provide helpful guidance for each step", () => {
        const strategyMessage = generateClarificationMessage("strategy_choice");
        expect(strategyMessage).toContain("1, 2, or 3");

        const timelineMessage = generateClarificationMessage("timeline");
        expect(timelineMessage).toContain("years");

        const amountMessage = generateClarificationMessage("amount");
        expect(amountMessage).toContain("$");
      });
    });

    describe("generateConfirmationMessage", () => {
      it("should generate confirmations for investment goals", () => {
        const growthMsg = generateConfirmationMessage("", "growth");
        expect(growthMsg).toContain("growth");

        const incomeMsg = generateConfirmationMessage("", "income");
        expect(incomeMsg).toContain("income");

        const preservationMsg = generateConfirmationMessage("", "preservation");
        expect(preservationMsg).toContain("preservation");
      });

      it("should generate confirmations for risk tolerance", () => {
        const conservativeMsg = generateConfirmationMessage("", "conservative");
        expect(conservativeMsg).toContain("Conservative");

        const moderateMsg = generateConfirmationMessage("", "moderate");
        expect(moderateMsg).toContain("Balanced");

        const aggressiveMsg = generateConfirmationMessage("", "aggressive");
        expect(aggressiveMsg).toContain("High risk");
      });

      it("should generate confirmations for occupations with analogy hints", () => {
        const chefMsg = generateConfirmationMessage("", "chef");
        expect(chefMsg).toContain("culinary analogies");

        const driverMsg = generateConfirmationMessage("", "truck_driver");
        expect(driverMsg).toContain("logistics");

        const retailMsg = generateConfirmationMessage("", "retail_manager");
        expect(retailMsg).toContain("inventory");
      });

      it("should handle numeric values for timeline", () => {
        const timelineMsg = generateConfirmationMessage("timeline", 5);
        expect(timelineMsg).toContain("5 years");

        const singleYear = generateConfirmationMessage("timeline", 1);
        expect(singleYear).toContain("1 year");
        expect(singleYear).not.toContain("years");
      });

      it("should handle numeric values for amount with formatting", () => {
        const amountMsg = generateConfirmationMessage("amount", 1000);
        expect(amountMsg).toContain("$1,000");

        const largeAmount = generateConfirmationMessage("amount", 25000);
        expect(largeAmount).toContain("$25,000");
      });

      it("should provide default confirmation for unknown values", () => {
        const defaultMsg = generateConfirmationMessage("", "unknown_value");
        expect(defaultMsg).toContain("Got it");
      });
    });
  });

  describe("Integration Tests", () => {
    let fallbackService: FallbackAIService;

    beforeEach(() => {
      fallbackService = new FallbackAIService(mockConfig);
    });

    it("should handle complete conversation flow", async () => {
      // Initial greeting
      let context = {
        ...mockContext,
        conversationStep: "initial" as ConversationStep,
      };
      let response = await fallbackService.generateResponse("Hello", context);
      expect(response.message).toBeTruthy();

      // Wallet connection
      context = {
        ...context,
        conversationStep: "wallet_prompt" as ConversationStep,
      };
      response = await fallbackService.generateResponse(
        "connect wallet",
        context,
      );
      expect(response.intent?.action).toBe("connect_wallet");

      // Investment goals
      context = {
        ...context,
        conversationStep: "investment_goals" as ConversationStep,
      };
      response = await fallbackService.generateResponse("growth", context);
      expect(response.intent?.extractedValue).toBe("growth");

      // Risk tolerance
      context = {
        ...context,
        conversationStep: "risk_tolerance" as ConversationStep,
      };
      response = await fallbackService.generateResponse("moderate", context);
      expect(response.intent?.extractedValue).toBe("moderate");

      // Timeline
      context = {
        ...context,
        conversationStep: "timeline" as ConversationStep,
      };
      response = await fallbackService.generateResponse("5 years", context);
      expect(response.intent?.extractedValue).toBe(5);

      // Amount
      context = { ...context, conversationStep: "amount" as ConversationStep };
      response = await fallbackService.generateResponse("$1000", context);
      expect(response.intent?.extractedValue).toBe(1000);
    });

    it("should maintain conversation state and context", async () => {
      const context = {
        ...mockContext,
        conversationStep: "investment_goals" as ConversationStep,
        conversationHistory: [
          { role: "user" as const, content: "Hello" },
          { role: "assistant" as const, content: "Hi there!" },
        ],
      };

      const response = await fallbackService.generateResponse(
        "growth",
        context,
      );

      expect(response).toBeDefined();
      expect(response.intent?.extractedValue).toBe("growth");
      // Context should not be modified by the service
      expect(context.conversationHistory.length).toBe(2);
    });

    it("should handle mixed case and variations in user input", async () => {
      const variations = [
        "GROWTH",
        "Growth",
        "maximize growth",
        "I want growth",
        "capital appreciation",
      ];

      const context = {
        ...mockContext,
        conversationStep: "investment_goals" as ConversationStep,
      };

      for (const input of variations) {
        const response = await fallbackService.generateResponse(input, context);
        expect(response.intent?.extractedValue).toBe("growth");
      }
    });

    it("should provide appropriate responses for unclear input", async () => {
      const context = {
        ...mockContext,
        conversationStep: "investment_goals" as ConversationStep,
      };

      const response = await fallbackService.generateResponse(
        "xyzabc",
        context,
      );

      expect(response.intent?.action).toBe("unclear");
      expect(response.message).toBeTruthy();
    });
  });
});
