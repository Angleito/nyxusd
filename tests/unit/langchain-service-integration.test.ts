/**
 * Integration test for the enhanced LangChainAIService
 * Tests the new personalization and optimization features
 */

import { LangChainAIService } from "../../frontend/src/services/ai/langchainService";
import {
  ConversationStep,
  UserProfile,
} from "../../frontend/src/providers/AIAssistantProvider";

describe("LangChainAIService Integration", () => {
  let service: LangChainAIService;
  const mockConfig = {
    apiKey: "test-key",
    apiEndpoint: "/api/ai/chat",
    model: "gpt-4-turbo-preview",
    temperature: 0.7,
    maxTokens: 500,
    streamResponse: false,
  };

  beforeEach(() => {
    service = new LangChainAIService(mockConfig);
  });

  afterEach(() => {
    service.reset();
  });

  describe("Enhanced System Prompt Building", () => {
    it("should initialize enhanced prompt system components", () => {
      expect(service).toBeInstanceOf(LangChainAIService);

      // Should have analytics available
      const analytics = service.getAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.totalTokensUsed).toBe(0);
      expect(analytics.personalizationScore).toBe(0);
    });

    it("should build personalized prompts based on user profile", () => {
      const userProfile: UserProfile = {
        occupation: "software_engineer",
        riskTolerance: "moderate",
        experienceLevel: "intermediate",
        investmentGoal: "growth",
        hobbies: ["programming", "gaming"],
        interests: ["technology", "finance"],
        timeline: "long-term",
        monthlyAmount: 1000,
      };

      // Test building personalization profile
      const profile = (service as any).buildPersonalizationProfile(userProfile);

      // This should work without throwing errors
      expect(profile).toBeDefined();
      expect(profile.occupation).toBe("software_engineer");
    });

    it("should fall back to legacy mode on errors", () => {
      // Test with incomplete profile that might cause issues
      const userProfile: UserProfile = {};

      const context = {
        conversationStep: "chat" as ConversationStep,
        userProfile,
        conversationHistory: [],
      };

      // Should not throw errors and should handle gracefully
      expect(() => {
        (service as any).convertToEnhancedContext(context);
      }).not.toThrow();
    });

    it("should provide optimization statistics", () => {
      const optimizationStats = service.getOptimizationStats();
      expect(optimizationStats).toBeDefined();
      expect(optimizationStats.promptCompressionRatio).toBeDefined();
      expect(optimizationStats.clarityScore).toBeDefined();
      expect(optimizationStats.effectivenessScore).toBeDefined();
    });
  });

  describe("Analytics and Monitoring", () => {
    it("should track personalization effectiveness", () => {
      const initialScore = service.getPersonalizationScore();
      expect(typeof initialScore).toBe("number");
      expect(initialScore).toBeGreaterThanOrEqual(0);
    });

    it("should provide comprehensive analytics", () => {
      const analytics = service.getAnalytics();

      expect(analytics).toHaveProperty("totalTokensUsed");
      expect(analytics).toHaveProperty("tokensSaved");
      expect(analytics).toHaveProperty("avgResponseTime");
      expect(analytics).toHaveProperty("personalizationScore");
      expect(analytics).toHaveProperty("optimizationStats");

      expect(analytics.optimizationStats).toHaveProperty(
        "promptCompressionRatio",
      );
      expect(analytics.optimizationStats).toHaveProperty("clarityScore");
      expect(analytics.optimizationStats).toHaveProperty("effectivenessScore");
    });

    it("should reset analytics when service is reset", () => {
      // Set some initial state
      (service as any).analytics.totalTokensUsed = 100;

      service.reset();

      const analytics = service.getAnalytics();
      expect(analytics.totalTokensUsed).toBe(0);
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain existing interface", () => {
      // Check that all original methods exist
      expect(typeof service.generateResponse).toBe("function");
      expect(typeof service.streamResponse).toBe("function");
      expect(typeof service.validateConfiguration).toBe("function");
      expect(typeof service.reset).toBe("function");
    });

    it("should handle legacy context format", () => {
      const legacyContext = {
        conversationStep: "initial" as ConversationStep,
        userProfile: {
          occupation: "teacher",
          riskTolerance: "conservative" as const,
        },
        conversationHistory: [],
      };

      // Should not throw errors with legacy context
      expect(() => {
        (service as any).convertToEnhancedContext(legacyContext);
      }).not.toThrow();
    });
  });

  describe("Helper Methods", () => {
    it("should extract concepts from user messages correctly", () => {
      const extractConcept = (service as any).extractConcept.bind(service);

      expect(extractConcept("I want to invest in DeFi")).toBe("DeFi");
      expect(extractConcept("What is my risk tolerance?")).toBe("risk");
      expect(extractConcept("Show me investment strategies")).toBe("strategy");
      expect(extractConcept("Hello there")).toBe("general");
    });

    it("should determine urgency from messages", () => {
      const determineUrgency = (service as any).determineUrgency.bind(service);
      const context = {
        conversationStep: "chat" as ConversationStep,
        userProfile: {},
        conversationHistory: [],
      };

      expect(determineUrgency("I need this urgently", context)).toBe("high");
      expect(determineUrgency("Can you help me quickly?", context)).toBe(
        "high",
      );
      expect(determineUrgency("Tell me about DeFi", context)).toBe("medium");
    });

    it("should calculate complexity based on conversation step", () => {
      const calculateComplexity = (service as any).calculateComplexity.bind(
        service,
      );

      expect(calculateComplexity("initial")).toBe(2);
      expect(calculateComplexity("leverage_optimization")).toBe(9);
      expect(calculateComplexity("recommendations")).toBe(8);
    });

    it("should get appropriate time of day", () => {
      const getTimeOfDay = (service as any).getTimeOfDay.bind(service);
      const timeOfDay = getTimeOfDay();

      expect(["morning", "afternoon", "evening", "night"]).toContain(timeOfDay);
    });
  });
});
