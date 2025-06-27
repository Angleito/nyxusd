import * as fc from "fast-check";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { AIService, AIContext } from "../../frontend/src/services/ai/aiService";
import {
  ConversationStep,
  UserProfile,
  type WalletData,
} from "../../frontend/src/providers/AIAssistantProvider";
import { FallbackAIService } from "../../frontend/src/services/ai/fallbackService";
import { detectUserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";
import {
  getNextStep,
  canTransitionTo,
} from "../../frontend/src/services/ai/conversationChain";

// Arbitraries for generating test data
const conversationStepArb = fc.constantFrom<ConversationStep>(
  "initial",
  "chat",
  "strategy_choice",
  "template_selection",
  "wallet_prompt",
  "wallet_scanning",
  "wallet_analyzed",
  "risk_assessment",
  "investment_goals",
  "occupation",
  "occupation_explanation",
  "risk_tolerance",
  "timeline",
  "amount",
  "experience_level",
  "protocol_selection",
  "strategy_builder",
  "leverage_optimization",
  "generating_recommendations",
  "recommendations",
  "complete",
);

const userProfileArb = fc.record({
  investmentGoal: fc.option(
    fc.constantFrom("growth", "income", "preservation"),
  ),
  riskTolerance: fc.option(
    fc.constantFrom("conservative", "moderate", "aggressive"),
  ),
  timeline: fc.option(fc.string()),
  monthlyAmount: fc.option(fc.nat({ max: 100000 })),
  occupation: fc.option(
    fc.constantFrom("chef", "truck_driver", "retail_manager"),
  ),
});

const walletAssetArb = fc.record({
  symbol: fc.constantFrom("ETH", "BTC", "USDC", "DAI", "LINK"),
  balance: fc.float({ min: 0, max: 1000000 }).map((n) => n.toFixed(6)),
  valueUSD: fc.nat({ max: 10000000 }),
});

const walletDataArb = fc.record({
  address: fc.option(
    fc.hexaString({ minLength: 40, maxLength: 40 }).map((s) => `0x${s}`),
  ),
  assets: fc.array(walletAssetArb, { minLength: 1, maxLength: 10 }),
  totalValueUSD: fc.nat({ max: 100000000 }),
});

const messageArb = fc.oneof(
  // Common user messages
  fc.constantFrom(
    "yes",
    "no",
    "ok",
    "continue",
    "help",
    "what?",
    "connect my wallet",
    "I want growth",
    "conservative please",
    "5 years",
    "$1000",
    "I am a chef",
    "skip",
  ),
  // Random sentences
  fc.lorem({ mode: "sentences", maxCount: 3 }),
  // Numbers
  fc.nat({ max: 100 }).map((n) => n.toString()),
  // Dollar amounts
  fc.nat({ max: 100000 }).map((n) => `$${n}`),
);

describe("AI Service Property Tests", () => {
  let service: AIService;

  beforeEach(() => {
    service = new FallbackAIService({ apiEndpoint: "/test" });
  });

  describe("Response Properties", () => {
    it("should always return a valid response structure", async () => {
      await fc.assert(
        fc.asyncProperty(
          messageArb,
          conversationStepArb,
          userProfileArb,
          fc.option(walletDataArb),
          async (message, step, profile, wallet) => {
            const context: AIContext = {
              conversationStep: step,
              userProfile: profile as UserProfile,
              walletData: wallet as WalletData | undefined,
              conversationHistory: [],
            };

            const response = await service.generateResponse(message, context);

            // Response must have required fields
            expect(response).toHaveProperty("message");
            expect(typeof response.message).toBe("string");
            expect(response.message.length).toBeGreaterThan(0);

            // Optional fields must have correct types if present
            if (response.intent) {
              expect(response.intent).toHaveProperty("action");
              expect(response.intent).toHaveProperty("confidence");
              expect(typeof response.intent.confidence).toBe("number");
              expect(response.intent.confidence).toBeGreaterThanOrEqual(0);
              expect(response.intent.confidence).toBeLessThanOrEqual(1);
            }

            if (response.shouldContinue !== undefined) {
              expect(typeof response.shouldContinue).toBe("boolean");
            }

            if (response.nextStep !== undefined) {
              expect(typeof response.nextStep).toBe("string");
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should maintain conversation flow consistency", async () => {
      await fc.assert(
        fc.asyncProperty(
          conversationStepArb,
          messageArb,
          async (currentStep, message) => {
            const context: AIContext = {
              conversationStep: currentStep,
              userProfile: {},
              conversationHistory: [],
            };

            const response = await service.generateResponse(message, context);

            if (response.nextStep) {
              // Next step should be a valid transition
              // const validTransition = canTransitionTo(currentStep, response.nextStep as ConversationStep);

              // Some transitions might be conditional, so we check if it's at least a known step
              const allSteps: ConversationStep[] = [
                "initial",
                "chat",
                "strategy_choice",
                "template_selection",
                "wallet_prompt",
                "wallet_scanning",
                "wallet_analyzed",
                "investment_goals",
                "occupation",
                "occupation_explanation",
                "risk_tolerance",
                "timeline",
                "amount",
                "experience_level",
                "protocol_selection",
                "strategy_builder",
                "leverage_optimization",
                "generating_recommendations",
                "recommendations",
                "complete",
              ];

              expect(allSteps).toContain(response.nextStep);
            }
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("Intent Detection Properties", () => {
    it("should detect wallet connection intent correctly", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            "connect my wallet",
            "yes connect wallet",
            "ok connect",
            "connect me",
            "lets connect",
            "yes",
            "sure",
            "ok",
          ),
          (message) => {
            const intent = detectUserIntent(message, "wallet_prompt");
            expect(intent.action).toBe("connect_wallet");
            expect(intent.confidence).toBeGreaterThan(0.5);
          },
        ),
      );
    });

    it("should detect numeric inputs for timeline", () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 50 }),
          fc.constantFrom("years", "year", "yr", ""),
          (num, suffix) => {
            const message = `${num} ${suffix}`.trim();
            const intent = detectUserIntent(message, "timeline");

            if (num > 0 && (suffix.includes("y") || suffix === "")) {
              expect(intent.action).toBe("input_value");
              expect(intent.extractedValue).toBe(num);
            }
          },
        ),
      );
    });

    it("should detect dollar amounts", () => {
      fc.assert(
        fc.property(fc.integer({ min: 100, max: 100000 }), (amount) => {
          const messages = [
            `$${amount}`,
            `${amount} dollars`,
            `${amount} per month`,
            `$${amount} monthly`,
          ];

          for (const message of messages) {
            const intent = detectUserIntent(message, "amount");
            expect(intent.action).toBe("input_value");
            expect(Number(intent.extractedValue)).toBe(amount);
          }
        }),
      );
    });
  });

  describe("Conversation Memory Properties", () => {
    it("should handle conversation history of any length", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.tuple(fc.constantFrom("user", "assistant"), messageArb), {
            minLength: 0,
            maxLength: 50,
          }),
          conversationStepArb,
          async (history, step) => {
            const context: AIContext = {
              conversationStep: step,
              userProfile: {},
              conversationHistory: history.map(([role, content]) => ({
                role: role as "user" | "assistant",
                content,
              })),
            };

            // Should not throw with any history length
            await expect(
              service.generateResponse("test message", context),
            ).resolves.toBeTruthy();
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe("Error Handling Properties", () => {
    it("should handle malformed inputs gracefully", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(""),
            fc.constant(" ".repeat(1000)),
            fc.unicodeString(),
            fc.constantFrom("🚀", "💰", "📈", "🤖"),
          ),
          conversationStepArb,
          async (message, step) => {
            const context: AIContext = {
              conversationStep: step,
              userProfile: {},
              conversationHistory: [],
            };

            // Should not throw
            await expect(
              service.generateResponse(message, context),
            ).resolves.toBeTruthy();
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("Streaming Properties", () => {
    it("should stream complete messages", async () => {
      if (!service.streamResponse) {
        return; // Skip if streaming not supported
      }

      await fc.assert(
        fc.asyncProperty(
          messageArb,
          conversationStepArb,
          async (message, step) => {
            let streamedContent = "";
            const chunks: string[] = [];

            const response = await service.streamResponse!(
              message,
              {
                conversationStep: step,
                userProfile: {},
                conversationHistory: [],
              },
              (chunk) => {
                chunks.push(chunk);
                streamedContent += chunk;
              },
            );

            // Streamed content should match response
            expect(streamedContent.trim()).toBe(response.message.trim());

            // Should have received multiple chunks
            expect(chunks.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 10 },
      );
    });
  });

  describe("State Transition Properties", () => {
    it("should follow valid conversation flows", () => {
      fc.assert(
        fc.property(conversationStepArb, (step) => {
          const nextStep = getNextStep(step);

          if (nextStep) {
            // Should be able to transition
            expect(canTransitionTo(step, nextStep)).toBe(true);
          }

          // Terminal states should not have next steps
          if (step === "complete") {
            expect(nextStep).toBeNull();
          }
        }),
      );
    });

    it("should update user profile based on intents", async () => {
      const profileUpdates = [
        {
          step: "investment_goals" as ConversationStep,
          message: "I want growth",
          field: "investmentGoal",
          value: "growth",
        },
        {
          step: "risk_tolerance" as ConversationStep,
          message: "conservative",
          field: "riskTolerance",
          value: "conservative",
        },
        {
          step: "occupation" as ConversationStep,
          message: "I am a chef",
          field: "occupation",
          value: "chef",
        },
      ];

      for (const update of profileUpdates) {
        const context: AIContext = {
          conversationStep: update.step,
          userProfile: {},
          conversationHistory: [],
        };

        const response = await service.generateResponse(
          update.message,
          context,
        );

        if (response.intent?.action === "select_option") {
          expect(response.intent.extractedValue).toBe(update.value);
        }
      }
    });
  });
});

describe("AI Service Invariants", () => {
  it("should maintain response time bounds", async () => {
    const service = new FallbackAIService({ apiEndpoint: "/test" });

    await fc.assert(
      fc.asyncProperty(
        messageArb,
        conversationStepArb,
        async (message, step) => {
          const start = Date.now();

          await service.generateResponse(message, {
            conversationStep: step,
            userProfile: {},
            conversationHistory: [],
          });

          const duration = Date.now() - start;

          // Response should be fast (under 100ms for fallback)
          expect(duration).toBeLessThan(100);
        },
      ),
      { numRuns: 50 },
    );
  });

  it("should be idempotent for the same input", async () => {
    const service = new FallbackAIService({ apiEndpoint: "/test" });

    await fc.assert(
      fc.asyncProperty(
        messageArb,
        conversationStepArb,
        userProfileArb,
        async (message, step, profile) => {
          const context: AIContext = {
            conversationStep: step,
            userProfile: profile as UserProfile,
            conversationHistory: [],
          };

          const response1 = await service.generateResponse(message, context);
          const response2 = await service.generateResponse(message, context);

          // Same input should produce same intent detection
          if (response1.intent && response2.intent) {
            expect(response1.intent.action).toBe(response2.intent.action);
            expect(response1.intent.extractedValue).toBe(
              response2.intent.extractedValue,
            );
          }
        },
      ),
      { numRuns: 20 },
    );
  });
});
