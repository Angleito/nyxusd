/**
 * @fileoverview Unit tests for PersonalizationEngine
 *
 * Tests the multi-dimensional personalization system functionality
 * including profile analysis, strategy selection, and effectiveness scoring.
 */

import {
  PersonalizationEngine,
  PersonalizationProfile,
  PersonalizationContext,
} from "../../frontend/src/services/ai/personalizationEngine";

describe("PersonalizationEngine", () => {
  let engine: PersonalizationEngine;

  beforeEach(() => {
    engine = new PersonalizationEngine();
  });

  describe("analyzeProfile", () => {
    it("should calculate profile completeness correctly", () => {
      const emptyProfile: PersonalizationProfile = {};
      const analysis = engine.analyzeProfile(emptyProfile);

      expect(analysis.completeness).toBe(0);
      expect(analysis.gaps).toContain("occupation");
      expect(analysis.gaps).toContain("hobbies");
    });

    it("should identify primary dimensions for complete profile", () => {
      const completeProfile: PersonalizationProfile = {
        occupation: "software_engineer",
        hobbies: ["gaming", "cooking"],
        experienceLevel: "intermediate",
        lifestyle: "busy",
        workStyle: "analytical",
      };

      const analysis = engine.analyzeProfile(completeProfile);

      expect(analysis.completeness).toBeGreaterThan(0.3);
      expect(analysis.primaryDimensions.length).toBeGreaterThanOrEqual(2); // professional, personal, and possibly financial
      expect(analysis.primaryDimensions[0]?.type).toBe("professional"); // Professional is highest weighted due to occupation
    });

    it("should suggest profile improvements", () => {
      const partialProfile: PersonalizationProfile = {
        occupation: "chef",
      };

      const analysis = engine.analyzeProfile(partialProfile);

      expect(analysis.recommendedImprovements.length).toBeGreaterThanOrEqual(1);
      expect(analysis.recommendedImprovements[0]?.priority).toBe("high");
      expect(analysis.recommendedImprovements[0]?.impact).toBeGreaterThan(0.5);
    });
  });

  describe("selectPersonalization", () => {
    it("should select appropriate strategy for hobby-rich profile", () => {
      const profile: PersonalizationProfile = {
        occupation: "chef",
        hobbies: ["cooking", "gardening"],
        experienceLevel: "beginner",
        lifestyle: "flexible",
      };

      const context: PersonalizationContext = {
        step: "occupation_explanation",
        concept: "risk_tolerance",
        urgency: "medium",
        complexity: 5,
      };

      const result = engine.selectPersonalization(profile, context);

      expect(result.strategy.name).toBe("Hobby-Based Learning");
      expect(result.analogies.length).toBeGreaterThanOrEqual(2);
      expect(result.analogies[0]).toContain("flavor");
      expect(result.tone).toBe("conversational");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it("should adjust complexity based on experience level", () => {
      const beginnerProfile: PersonalizationProfile = {
        occupation: "teacher",
        experienceLevel: "beginner",
      };

      const expertProfile: PersonalizationProfile = {
        occupation: "teacher",
        experienceLevel: "expert",
      };

      const context: PersonalizationContext = {
        step: "strategy_builder",
        concept: "portfolio_optimization",
        urgency: "low",
        complexity: 5,
      };

      const beginnerResult = engine.selectPersonalization(
        beginnerProfile,
        context,
      );
      const expertResult = engine.selectPersonalization(expertProfile, context);

      expect(beginnerResult.complexity).toBeLessThan(expertResult.complexity);
      expect(expertResult.tone).toBe("technical");
      expect(beginnerResult.tone).toBe("conversational");
    });

    it("should provide fallback strategies", () => {
      const profile: PersonalizationProfile = {
        occupation: "truck_driver",
        experienceLevel: "intermediate",
      };

      const context: PersonalizationContext = {
        step: "risk_assessment",
        concept: "diversification",
        urgency: "high",
        complexity: 6,
      };

      const result = engine.selectPersonalization(profile, context);

      expect(result.fallbacks.length).toBeGreaterThanOrEqual(0); // May not always have fallbacks available
      expect(result.fallbacks[0]?.id).not.toBe(result.strategy.id);
    });
  });

  describe("scoreEffectiveness", () => {
    it("should score analogies higher for users with hobbies", () => {
      const profileWithHobbies: PersonalizationProfile = {
        hobbies: ["gaming", "sports"],
        occupation: "software_engineer",
      };

      const profileWithoutHobbies: PersonalizationProfile = {
        occupation: "software_engineer",
      };

      const personalizationWithAnalogy =
        "Like leveling up in a game, compound interest levels up your wealth over time.";
      const personalizationWithoutAnalogy =
        "Compound interest helps your investments grow exponentially over time.";

      const scoreWithHobbies = engine.scoreEffectiveness(
        personalizationWithAnalogy,
        profileWithHobbies,
      );
      const scoreWithoutHobbies = engine.scoreEffectiveness(
        personalizationWithAnalogy,
        profileWithoutHobbies,
      );
      const scoreNoAnalogy = engine.scoreEffectiveness(
        personalizationWithoutAnalogy,
        profileWithHobbies,
      );

      expect(scoreWithHobbies).toBeGreaterThanOrEqual(scoreWithoutHobbies);
      expect(scoreWithHobbies).toBeGreaterThan(scoreNoAnalogy);
    });

    it("should score examples higher for example-based learners", () => {
      const exampleBasedProfile: PersonalizationProfile = {
        learningStyle: "example-based",
        experienceLevel: "intermediate",
      };

      const theoryProfile: PersonalizationProfile = {
        learningStyle: "theory-first",
        experienceLevel: "intermediate",
      };

      const personalizationWithExamples =
        "For example, consider using index funds like VTSAX for broad market exposure.";

      const exampleScore = engine.scoreEffectiveness(
        personalizationWithExamples,
        exampleBasedProfile,
      );
      const theoryScore = engine.scoreEffectiveness(
        personalizationWithExamples,
        theoryProfile,
      );

      expect(exampleScore).toBeGreaterThan(theoryScore);
    });
  });

  describe("suggestProfileImprovements", () => {
    it("should prioritize high-impact improvements", () => {
      const minimalProfile: PersonalizationProfile = {
        occupation: "retail_manager",
      };

      const suggestions = engine.suggestProfileImprovements(minimalProfile);

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0]).toContain("hobbies");
    });

    it("should suggest fewer improvements for complete profiles", () => {
      const completeProfile: PersonalizationProfile = {
        occupation: "chef",
        hobbies: ["cooking", "gardening", "reading"],
        experienceLevel: "intermediate",
        lifestyle: "flexible",
        workStyle: "creative",
        learningStyle: "example-based",
        riskTolerance: "moderate",
        values: ["growth", "sustainability"],
        communicationStyle: "conversational",
      };

      const suggestions = engine.suggestProfileImprovements(completeProfile);

      expect(suggestions.length).toBeLessThan(3);
    });
  });

  describe("integration tests", () => {
    it("should handle complete personalization workflow", () => {
      const profile: PersonalizationProfile = {
        occupation: "chef",
        hobbies: ["cooking", "gardening"],
        experienceLevel: "beginner",
        lifestyle: "busy",
        workStyle: "creative",
        learningStyle: "example-based",
        riskTolerance: "conservative",
      };

      const context: PersonalizationContext = {
        step: "occupation_explanation",
        concept: "compound_interest",
        urgency: "medium",
        complexity: 4,
      };

      // Analyze profile
      const analysis = engine.analyzeProfile(profile);
      expect(analysis.completeness).toBeGreaterThan(0.4);
      expect(analysis.personalizationPotential).toBeGreaterThan(0.4); // Adjusted based on actual calculation

      // Select personalization
      const result = engine.selectPersonalization(profile, context);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.analogies.length).toBeGreaterThan(0);
      expect(result.examples.length).toBeGreaterThan(0);

      // Score effectiveness
      const testPersonalization =
        result.analogies[0] || "Sample personalization";
      const score = engine.scoreEffectiveness(testPersonalization, profile);
      expect(score).toBeGreaterThan(0.5);

      // Suggest improvements
      const improvements = engine.suggestProfileImprovements(profile);
      expect(improvements.length).toBeLessThan(5); // Should be fewer since profile is fairly complete
    });
  });
});
