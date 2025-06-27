/**
 * Unit tests for PromptBuilder (AnalogyGenerator)
 * Tests analogy generation for different occupations and DeFi concepts
 */

import {
  explainWithAnalogy,
  generateAnalogy,
  getAllAnalogiesForConcept,
  hasAnalogy,
  type DeFiConcept,
  type Occupation,
  type Analogy,
} from "../../frontend/src/lib/ai-assistant/analogyGenerator";

describe("PromptBuilder (AnalogyGenerator)", () => {
  describe("explainWithAnalogy", () => {
    it("should return analogy for valid concept and occupation", () => {
      const result = explainWithAnalogy("liquidity", "chef");

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain("mise en place");
    });

    it("should fall back to general explanation when occupation-specific analogy not available", () => {
      const result = explainWithAnalogy("liquidity", "general");

      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result).toContain("asset can be bought or sold");
    });

    it("should return default message for unknown concept", () => {
      const result = explainWithAnalogy(
        "unknown_concept" as DeFiConcept,
        "chef",
      );

      expect(result).toContain("I don't have a specific analogy");
      expect(result).toContain("unknown_concept");
    });

    it("should handle all occupation types", () => {
      const occupations: Occupation[] = [
        "chef",
        "truck_driver",
        "retail_manager",
        "teacher",
        "doctor",
        "engineer",
        "general",
      ];

      occupations.forEach((occupation) => {
        const result = explainWithAnalogy("portfolio", occupation);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("should provide occupation-specific context", () => {
      const chefAnalogy = explainWithAnalogy("portfolio", "chef");
      const doctorAnalogy = explainWithAnalogy("portfolio", "doctor");

      expect(chefAnalogy).toContain("menu");
      expect(doctorAnalogy).toContain("treatment");
      expect(chefAnalogy).not.toEqual(doctorAnalogy);
    });

    it("should handle all DeFi concepts", () => {
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

      concepts.forEach((concept) => {
        const result = explainWithAnalogy(concept, "engineer");
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe("generateAnalogy", () => {
    it("should generate complete analogy object", () => {
      const result = generateAnalogy("staking", "chef", "Test context");

      expect(result).toMatchObject({
        concept: "staking",
        occupation: "chef",
        explanation: expect.any(String),
        example: "Test context",
      });

      expect(result.explanation).toContain("kitchen equipment");
    });

    it("should generate analogy without context", () => {
      const result = generateAnalogy("yields", "truck_driver");

      expect(result).toMatchObject({
        concept: "yields",
        occupation: "truck_driver",
        explanation: expect.any(String),
      });

      expect(result.example).toBeUndefined();
      expect(result.explanation).toContain("profit per mile");
    });

    it("should maintain consistency between generateAnalogy and explainWithAnalogy", () => {
      const concept: DeFiConcept = "smart_contracts";
      const occupation: Occupation = "teacher";

      const directExplanation = explainWithAnalogy(concept, occupation);
      const generatedAnalogy = generateAnalogy(concept, occupation);

      expect(generatedAnalogy.explanation).toBe(directExplanation);
    });
  });

  describe("getAllAnalogiesForConcept", () => {
    it("should return all available analogies for a concept", () => {
      const analogies = getAllAnalogiesForConcept("liquidity");

      expect(Array.isArray(analogies)).toBe(true);
      expect(analogies.length).toBeGreaterThan(0);

      // Should include multiple occupations
      const occupations = analogies.map((a) => a.occupation);
      expect(occupations).toContain("chef");
      expect(occupations).toContain("truck_driver");
      expect(occupations).toContain("general");
    });

    it("should return empty array for unknown concept", () => {
      const analogies = getAllAnalogiesForConcept(
        "unknown_concept" as DeFiConcept,
      );

      expect(Array.isArray(analogies)).toBe(true);
      expect(analogies.length).toBe(0);
    });

    it("should return properly formatted analogy objects", () => {
      const analogies = getAllAnalogiesForConcept("diversification");

      analogies.forEach((analogy) => {
        expect(analogy).toMatchObject({
          concept: "diversification",
          occupation: expect.any(String),
          explanation: expect.any(String),
        });
        expect(analogy.explanation.length).toBeGreaterThan(0);
      });
    });

    it("should have comprehensive coverage for major concepts", () => {
      const majorConcepts: DeFiConcept[] = [
        "liquidity",
        "portfolio",
        "yields",
        "staking",
      ];

      majorConcepts.forEach((concept) => {
        const analogies = getAllAnalogiesForConcept(concept);
        expect(analogies.length).toBeGreaterThanOrEqual(6); // Should have most occupations covered
      });
    });
  });

  describe("hasAnalogy", () => {
    it("should return true for existing analogy combinations", () => {
      expect(hasAnalogy("clmm", "chef")).toBe(true);
      expect(hasAnalogy("liquidity", "truck_driver")).toBe(true);
      expect(hasAnalogy("portfolio", "general")).toBe(true);
    });

    it("should return false for non-existing combinations", () => {
      expect(hasAnalogy("unknown_concept" as DeFiConcept, "chef")).toBe(false);
      expect(hasAnalogy("liquidity", "unknown_occupation" as Occupation)).toBe(
        false,
      );
    });

    it("should be consistent with explainWithAnalogy availability", () => {
      const concept: DeFiConcept = "risk_management";
      const occupation: Occupation = "doctor";

      const hasAnalogy_ = hasAnalogy(concept, occupation);
      const explanation = explainWithAnalogy(concept, occupation);

      if (hasAnalogy_) {
        expect(explanation).not.toContain("I don't have a specific analogy");
      }
    });
  });

  describe("Quality and Content Tests", () => {
    it("should provide analogies with appropriate length", () => {
      const analogy = explainWithAnalogy("impermanent_loss", "retail_manager");

      expect(analogy.length).toBeGreaterThan(50); // Minimum meaningful length
      expect(analogy.length).toBeLessThan(1000); // Not too verbose
    });

    it("should use occupation-relevant terminology", () => {
      const chefAnalogy = explainWithAnalogy("gas_fees", "chef");
      const engineerAnalogy = explainWithAnalogy("gas_fees", "engineer");

      expect(chefAnalogy).toMatch(/delivery|kitchen|restaurant|service/i);
      expect(engineerAnalogy).toMatch(
        /transaction|processing|computational|system/i,
      );
    });

    it("should maintain professional tone", () => {
      const analogies = getAllAnalogiesForConcept("smart_contracts");

      analogies.forEach((analogy) => {
        expect(analogy.explanation).not.toMatch(
          /slang|inappropriate|offensive/i,
        );
        expect(analogy.explanation).toMatch(/\w+/); // Contains actual words
      });
    });

    it("should be educational and clear", () => {
      const analogy = explainWithAnalogy("slippage", "teacher");

      // Should explain the concept, not just provide metaphor
      expect(analogy).toMatch(/price|change|difference|between/i);
      expect(analogy.split(" ").length).toBeGreaterThan(10); // Substantial explanation
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty strings gracefully", () => {
      expect(() => explainWithAnalogy("" as DeFiConcept, "chef")).not.toThrow();
      expect(() =>
        explainWithAnalogy("liquidity", "" as Occupation),
      ).not.toThrow();
    });

    it("should handle case sensitivity", () => {
      // The function should be case-sensitive as per current implementation
      const result = explainWithAnalogy("LIQUIDITY" as DeFiConcept, "chef");
      expect(result).toContain("I don't have a specific analogy");
    });

    it("should provide fallback explanations consistently", () => {
      const unknownConcept = "new_defi_concept" as DeFiConcept;
      const result1 = explainWithAnalogy(unknownConcept, "chef");
      const result2 = explainWithAnalogy(unknownConcept, "doctor");

      expect(result1).toContain("I don't have a specific analogy");
      expect(result2).toContain("I don't have a specific analogy");
      expect(result1).toBe(result2); // Should be consistent
    });
  });

  describe("Type Safety and Structure", () => {
    it("should maintain type safety for DeFi concepts", () => {
      const validConcepts: DeFiConcept[] = [
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

      validConcepts.forEach((concept) => {
        expect(() => explainWithAnalogy(concept, "general")).not.toThrow();
      });
    });

    it("should maintain type safety for occupations", () => {
      const validOccupations: Occupation[] = [
        "chef",
        "truck_driver",
        "retail_manager",
        "teacher",
        "doctor",
        "engineer",
        "general",
      ];

      validOccupations.forEach((occupation) => {
        expect(() => explainWithAnalogy("liquidity", occupation)).not.toThrow();
      });
    });

    it("should return properly typed Analogy objects", () => {
      const analogy = generateAnalogy("portfolio", "chef", "test");

      // TypeScript compile-time check, runtime verification
      expect(typeof analogy.concept).toBe("string");
      expect(typeof analogy.occupation).toBe("string");
      expect(typeof analogy.explanation).toBe("string");
      expect(typeof analogy.example).toBe("string");

      // Verify the structure matches the interface
      const requiredKeys: (keyof Analogy)[] = [
        "concept",
        "occupation",
        "explanation",
      ];
      requiredKeys.forEach((key) => {
        expect(analogy).toHaveProperty(key);
      });
    });
  });
});
