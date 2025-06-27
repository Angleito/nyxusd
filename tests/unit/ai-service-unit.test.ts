import { describe, it, expect, beforeEach } from "@jest/globals";
import { FallbackAIService } from "../../frontend/src/services/ai/fallbackService";
import { detectUserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";
import {
  getNextStep,
  canTransitionTo,
  CONVERSATION_FLOW,
} from "../../frontend/src/services/ai/conversationChain";
import { AIContext } from "../../frontend/src/services/ai/aiService";
import { ConversationStep } from "../../frontend/src/providers/AIAssistantProvider";

describe("AI Service Unit Tests", () => {
  describe("Fallback Service", () => {
    let service: FallbackAIService;

    beforeEach(() => {
      service = new FallbackAIService({
        apiEndpoint: "/test",
      });
    });

    it("should generate appropriate responses for each conversation step", async () => {
      const steps: ConversationStep[] = [
        "initial",
        "wallet_prompt",
        "investment_goals",
        "occupation",
        "risk_tolerance",
        "timeline",
        "amount",
      ];

      for (const step of steps) {
        const context: AIContext = {
          conversationStep: step,
          userProfile: {},
          conversationHistory: [],
        };

        const response = await service.generateResponse(
          "test message",
          context,
        );

        expect(response).toBeDefined();
        expect(response.message).toBeTruthy();
        expect(typeof response.message).toBe("string");
      }
    });

    it("should detect user intents correctly", async () => {
      const testCases = [
        {
          step: "wallet_prompt" as ConversationStep,
          message: "yes connect my wallet",
          expectedAction: "connect_wallet",
        },
        {
          step: "investment_goals" as ConversationStep,
          message: "I want growth",
          expectedAction: "select_option",
        },
        {
          step: "timeline" as ConversationStep,
          message: "5 years",
          expectedAction: "input_value",
        },
      ];

      for (const test of testCases) {
        const context: AIContext = {
          conversationStep: test.step,
          userProfile: {},
          conversationHistory: [],
        };

        const response = await service.generateResponse(test.message, context);

        expect(response.intent).toBeDefined();
        expect(response.intent?.action).toBe(test.expectedAction);
      }
    });

    it("should handle streaming responses", async () => {
      const chunks: string[] = [];

      const response = await service.streamResponse(
        "Tell me about investments",
        {
          conversationStep: "chat",
          userProfile: {},
          conversationHistory: [],
        },
        (chunk) => chunks.push(chunk),
      );

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join("").trim()).toBe(response.message.trim());
    });
  });

  describe("Intent Detection", () => {
    it("should detect wallet connection intents", () => {
      const positiveMessages = [
        "yes",
        "ok connect my wallet",
        "sure",
        "connect me",
        "lets do it",
      ];

      for (const message of positiveMessages) {
        const intent = detectUserIntent(message, "wallet_prompt");
        expect(intent.action).toBe("connect_wallet");
        expect(intent.confidence).toBeGreaterThan(0.7);
      }
    });

    it("should extract numeric values", () => {
      const intent1 = detectUserIntent("5 years", "timeline");
      expect(intent1.action).toBe("input_value");
      expect(intent1.extractedValue).toBe(5);

      const intent2 = detectUserIntent("$1000", "amount");
      expect(intent2.action).toBe("input_value");
      expect(intent2.extractedValue).toBe(1000);

      const intent3 = detectUserIntent("10 months", "timeline");
      expect(intent3.action).toBe("input_value");
      expect(intent3.extractedValue).toBe(1); // Converted to years
    });

    it("should detect option selections", () => {
      const tests = [
        {
          message: "growth",
          step: "investment_goals" as ConversationStep,
          expected: "growth",
        },
        {
          message: "conservative please",
          step: "risk_tolerance" as ConversationStep,
          expected: "conservative",
        },
        {
          message: "I am a chef",
          step: "occupation" as ConversationStep,
          expected: "chef",
        },
      ];

      for (const test of tests) {
        const intent = detectUserIntent(test.message, test.step);
        expect(intent.action).toBe("select_option");
        expect(intent.extractedValue).toBe(test.expected);
      }
    });
  });

  describe("Conversation Flow", () => {
    it("should have valid transitions for all steps", () => {
      for (const transition of CONVERSATION_FLOW) {
        expect(transition.from).toBeTruthy();
        expect(transition.to).toBeTruthy();
        expect(transition.description).toBeTruthy();
      }
    });

    it("should get correct next steps", () => {
      expect(getNextStep("initial")).toBe("wallet_prompt");
      expect(getNextStep("wallet_prompt", { walletConnected: true })).toBe(
        "wallet_scanning",
      );
      expect(getNextStep("investment_goals")).toBe("occupation");
      expect(getNextStep("complete")).toBeNull();
    });

    it("should validate transitions", () => {
      expect(canTransitionTo("initial", "wallet_prompt")).toBe(true);
      expect(
        canTransitionTo("wallet_prompt", "wallet_scanning", {
          walletConnected: true,
        }),
      ).toBe(true);
      expect(
        canTransitionTo("wallet_prompt", "wallet_scanning", {
          walletConnected: false,
        }),
      ).toBe(false);
      expect(canTransitionTo("initial", "complete")).toBe(false);
    });
  });

  describe("Error Handling", () => {
    let service: FallbackAIService;

    beforeEach(() => {
      service = new FallbackAIService({ apiEndpoint: "/test" });
    });

    it("should handle empty messages", async () => {
      const response = await service.generateResponse("", {
        conversationStep: "chat",
        userProfile: {},
        conversationHistory: [],
      });

      expect(response).toBeDefined();
      expect(response.message).toBeTruthy();
    });

    it("should handle very long messages", async () => {
      const longMessage = "a".repeat(10000);

      const response = await service.generateResponse(longMessage, {
        conversationStep: "chat",
        userProfile: {},
        conversationHistory: [],
      });

      expect(response).toBeDefined();
      expect(response.message).toBeTruthy();
    });

    it("should handle special characters", async () => {
      const specialMessages = [
        "🚀💰📈",
        '<script>alert("test")</script>',
        "```code```",
        "SELECT * FROM users;",
      ];

      for (const message of specialMessages) {
        const response = await service.generateResponse(message, {
          conversationStep: "chat",
          userProfile: {},
          conversationHistory: [],
        });

        expect(response).toBeDefined();
        expect(response.message).toBeTruthy();
      }
    });
  });
});
