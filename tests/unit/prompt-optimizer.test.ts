/**
 * Unit tests for PromptOptimizer (RecommendationEngine)
 * Tests recommendation generation, allocation optimization, and personalization
 */

import {
  generateRecommendations,
  calculatePortfolioRiskScore,
  calculateExpectedPortfolioReturn,
  type WalletData,
  type UserProfile,
  type Recommendation,
} from "../../frontend/src/lib/ai-assistant/recommendationEngine";

// Mock uuid to make tests predictable
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234-5678-9012-3456"),
}));

describe("PromptOptimizer (RecommendationEngine)", () => {
  let mockWalletData: WalletData;
  let conservativeProfile: UserProfile;
  let moderateProfile: UserProfile;
  let aggressiveProfile: UserProfile;

  beforeEach(() => {
    mockWalletData = {
      holdings: [
        {
          symbol: "ETH",
          amount: 5.0,
          valueUSD: 8000,
        },
        {
          symbol: "USDC",
          amount: 2000,
          valueUSD: 2000,
        },
      ],
      totalValueUSD: 10000,
    };

    conservativeProfile = {
      riskTolerance: "conservative",
      investmentHorizon: "medium",
      experienceLevel: "intermediate",
      goals: ["preservation", "income"],
    };

    moderateProfile = {
      riskTolerance: "moderate",
      investmentHorizon: "medium",
      experienceLevel: "intermediate",
      goals: ["growth", "income"],
    };

    aggressiveProfile = {
      riskTolerance: "aggressive",
      investmentHorizon: "long",
      experienceLevel: "advanced",
      goals: ["growth"],
    };
  });

  describe("generateRecommendations", () => {
    it("should generate recommendations for conservative profile", () => {
      const result = generateRecommendations(
        mockWalletData,
        conservativeProfile,
      );

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((r) => r.title.includes("Stablecoin"))).toBe(
        true,
      );
      expect(recommendations.some((r) => r.title.includes("nyxUSD"))).toBe(
        true,
      );
    });

    it("should generate recommendations for moderate profile", () => {
      const result = generateRecommendations(mockWalletData, moderateProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((r) => r.title.includes("Balanced"))).toBe(
        true,
      );
      expect(recommendations.some((r) => r.title.includes("CLMM"))).toBe(true);
    });

    it("should generate recommendations for aggressive profile", () => {
      const result = generateRecommendations(mockWalletData, aggressiveProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((r) => r.title.includes("High-Yield"))).toBe(
        true,
      );
      expect(recommendations.some((r) => r.title.includes("Leveraged"))).toBe(
        true,
      );
    });

    it("should normalize allocations to sum to 100%", () => {
      const result = generateRecommendations(mockWalletData, moderateProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      const totalAllocation = recommendations.reduce(
        (sum, rec) => sum + rec.allocationPercentage,
        0,
      );

      expect(totalAllocation).toBe(100);
    });

    it("should sort recommendations by allocation percentage", () => {
      const result = generateRecommendations(mockWalletData, moderateProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i]?.allocationPercentage).toBeLessThanOrEqual(
          recommendations[i - 1]?.allocationPercentage ?? 0,
        );
      }
    });

    it("should return proper recommendation structure", () => {
      const result = generateRecommendations(
        mockWalletData,
        conservativeProfile,
      );

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        expect(rec).toMatchObject({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          allocationPercentage: expect.any(Number),
          expectedReturnRange: {
            min: expect.any(Number),
            max: expect.any(Number),
          },
          riskLevel: expect.stringMatching(/^(low|medium|high)$/),
          explanation: expect.any(String),
          actions: expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringMatching(
                /^(allocate|stake|provide-liquidity|open-cdp)$/,
              ),
              asset: expect.any(String),
              amount: expect.any(Number),
            }),
          ]),
        });

        expect(rec.allocationPercentage).toBeGreaterThan(0);
        expect(rec.allocationPercentage).toBeLessThanOrEqual(100);
        expect(rec.expectedReturnRange.min).toBeLessThanOrEqual(
          rec.expectedReturnRange.max,
        );
      });
    });

    it("should handle error for invalid risk tolerance", () => {
      const invalidProfile = {
        ...conservativeProfile,
        riskTolerance: "invalid" as any,
      };

      const result = generateRecommendations(mockWalletData, invalidProfile);

      expect(result.isRight()).toBe(false);
    });

    it("should handle empty wallet gracefully", () => {
      const emptyWallet: WalletData = {
        holdings: [],
        totalValueUSD: 0,
      };

      const result = generateRecommendations(emptyWallet, conservativeProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        rec.actions.forEach((action) => {
          expect(action.amount).toBe(0);
        });
      });
    });
  });

  describe("profile-based adjustments", () => {
    it("should reduce high-risk allocations for short-term investors", () => {
      const shortTermProfile = {
        ...aggressiveProfile,
        investmentHorizon: "short" as const,
      };

      const aggressiveResult = generateRecommendations(
        mockWalletData,
        aggressiveProfile,
      );
      const shortTermResult = generateRecommendations(
        mockWalletData,
        shortTermProfile,
      );

      expect(aggressiveResult.isRight()).toBe(true);
      expect(shortTermResult.isRight()).toBe(true);

      const aggressiveRecs = aggressiveResult.value as Recommendation[];
      const shortTermRecs = shortTermResult.value as Recommendation[];

      const aggressiveHighRiskAllocation = aggressiveRecs
        .filter((r) => r.riskLevel === "high")
        .reduce((sum, r) => sum + r.allocationPercentage, 0);

      const shortTermHighRiskAllocation = shortTermRecs
        .filter((r) => r.riskLevel === "high")
        .reduce((sum, r) => sum + r.allocationPercentage, 0);

      expect(shortTermHighRiskAllocation).toBeLessThan(
        aggressiveHighRiskAllocation,
      );
    });

    it("should reduce high-risk allocations for beginners", () => {
      const beginnerProfile = {
        ...aggressiveProfile,
        experienceLevel: "beginner" as const,
      };

      const advancedResult = generateRecommendations(
        mockWalletData,
        aggressiveProfile,
      );
      const beginnerResult = generateRecommendations(
        mockWalletData,
        beginnerProfile,
      );

      expect(advancedResult.isRight()).toBe(true);
      expect(beginnerResult.isRight()).toBe(true);

      const advancedRecs = advancedResult.value as Recommendation[];
      const beginnerRecs = beginnerResult.value as Recommendation[];

      const advancedHighRiskAllocation = advancedRecs
        .filter((r) => r.riskLevel === "high")
        .reduce((sum, r) => sum + r.allocationPercentage, 0);

      const beginnerHighRiskAllocation = beginnerRecs
        .filter((r) => r.riskLevel === "high")
        .reduce((sum, r) => sum + r.allocationPercentage, 0);

      expect(beginnerHighRiskAllocation).toBeLessThan(
        advancedHighRiskAllocation,
      );
    });

    it("should reduce allocations for assets already overallocated", () => {
      const overallocatedWallet: WalletData = {
        holdings: [
          {
            symbol: "CLMM",
            amount: 10000,
            valueUSD: 8000,
          },
          {
            symbol: "USDC",
            amount: 2000,
            valueUSD: 2000,
          },
        ],
        totalValueUSD: 10000,
      };

      const result = generateRecommendations(
        overallocatedWallet,
        moderateProfile,
      );

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      // Should reduce CLMM allocations since already heavily allocated
      const clmmRecs = recommendations.filter((r) =>
        r.actions.some((a) => a.asset === "CLMM"),
      );

      if (clmmRecs.length > 0) {
        const clmmAllocation = clmmRecs.reduce(
          (sum, r) => sum + r.allocationPercentage,
          0,
        );
        expect(clmmAllocation).toBeLessThan(50); // Should be reduced from template
      }
    });

    it("should include personalized explanations based on profile", () => {
      const result = generateRecommendations(
        mockWalletData,
        conservativeProfile,
      );

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        expect(rec.explanation).toContain("conservative");
        expect(rec.explanation).toContain("medium-term");
        expect(rec.explanation).toMatch(/\d+%/); // Should include percentage
      });
    });
  });

  describe("calculatePortfolioRiskScore", () => {
    it("should calculate risk score correctly for conservative portfolio", () => {
      const conservativeRecs: Recommendation[] = [
        {
          id: "1",
          title: "Test Low Risk",
          description: "Test",
          allocationPercentage: 70,
          expectedReturnRange: { min: 5, max: 8 },
          riskLevel: "low",
          explanation: "Test",
          actions: [],
        },
        {
          id: "2",
          title: "Test Medium Risk",
          description: "Test",
          allocationPercentage: 30,
          expectedReturnRange: { min: 8, max: 15 },
          riskLevel: "medium",
          explanation: "Test",
          actions: [],
        },
      ];

      const riskScore = calculatePortfolioRiskScore(conservativeRecs);

      expect(riskScore).toBeGreaterThanOrEqual(0);
      expect(riskScore).toBeLessThanOrEqual(100);
      expect(riskScore).toBeLessThan(50); // Should be relatively low
    });

    it("should calculate risk score correctly for aggressive portfolio", () => {
      const aggressiveRecs: Recommendation[] = [
        {
          id: "1",
          title: "Test High Risk",
          description: "Test",
          allocationPercentage: 80,
          expectedReturnRange: { min: 15, max: 40 },
          riskLevel: "high",
          explanation: "Test",
          actions: [],
        },
        {
          id: "2",
          title: "Test Medium Risk",
          description: "Test",
          allocationPercentage: 20,
          expectedReturnRange: { min: 8, max: 15 },
          riskLevel: "medium",
          explanation: "Test",
          actions: [],
        },
      ];

      const riskScore = calculatePortfolioRiskScore(aggressiveRecs);

      expect(riskScore).toBeGreaterThanOrEqual(0);
      expect(riskScore).toBeLessThanOrEqual(100);
      expect(riskScore).toBeGreaterThan(70); // Should be relatively high
    });

    it("should handle empty recommendations array", () => {
      const riskScore = calculatePortfolioRiskScore([]);

      expect(riskScore).toBe(-50); // Normalized score for 0 risk
    });

    it("should handle single recommendation", () => {
      const singleRec: Recommendation[] = [
        {
          id: "1",
          title: "Test",
          description: "Test",
          allocationPercentage: 100,
          expectedReturnRange: { min: 5, max: 8 },
          riskLevel: "medium",
          explanation: "Test",
          actions: [],
        },
      ];

      const riskScore = calculatePortfolioRiskScore(singleRec);

      expect(riskScore).toBe(50); // Medium risk = 2, normalized to 50
    });
  });

  describe("calculateExpectedPortfolioReturn", () => {
    it("should calculate weighted portfolio returns correctly", () => {
      const testRecs: Recommendation[] = [
        {
          id: "1",
          title: "Test 1",
          description: "Test",
          allocationPercentage: 60,
          expectedReturnRange: { min: 5, max: 10 },
          riskLevel: "low",
          explanation: "Test",
          actions: [],
        },
        {
          id: "2",
          title: "Test 2",
          description: "Test",
          allocationPercentage: 40,
          expectedReturnRange: { min: 15, max: 25 },
          riskLevel: "high",
          explanation: "Test",
          actions: [],
        },
      ];

      const expectedReturn = calculateExpectedPortfolioReturn(testRecs);

      // Expected: 60% * (5-10) + 40% * (15-25) = 3-6 + 6-10 = 9-16
      expect(expectedReturn.min).toBe(9);
      expect(expectedReturn.max).toBe(16);
    });

    it("should handle empty recommendations array", () => {
      const expectedReturn = calculateExpectedPortfolioReturn([]);

      expect(expectedReturn.min).toBe(0);
      expect(expectedReturn.max).toBe(0);
    });

    it("should handle single recommendation", () => {
      const singleRec: Recommendation[] = [
        {
          id: "1",
          title: "Test",
          description: "Test",
          allocationPercentage: 100,
          expectedReturnRange: { min: 8, max: 12 },
          riskLevel: "medium",
          explanation: "Test",
          actions: [],
        },
      ];

      const expectedReturn = calculateExpectedPortfolioReturn(singleRec);

      expect(expectedReturn.min).toBe(8);
      expect(expectedReturn.max).toBe(12);
    });

    it("should round results to one decimal place", () => {
      const testRecs: Recommendation[] = [
        {
          id: "1",
          title: "Test",
          description: "Test",
          allocationPercentage: 33,
          expectedReturnRange: { min: 7.777, max: 12.345 },
          riskLevel: "medium",
          explanation: "Test",
          actions: [],
        },
        {
          id: "2",
          title: "Test",
          description: "Test",
          allocationPercentage: 67,
          expectedReturnRange: { min: 5.123, max: 9.876 },
          riskLevel: "low",
          explanation: "Test",
          actions: [],
        },
      ];

      const expectedReturn = calculateExpectedPortfolioReturn(testRecs);

      expect(expectedReturn.min).toBeCloseTo(6.0, 1);
      expect(expectedReturn.max).toBeCloseTo(10.7, 1);

      // Check that results are rounded to one decimal place
      expect(expectedReturn.min.toString()).toMatch(/^\d+\.\d$/);
      expect(expectedReturn.max.toString()).toMatch(/^\d+\.\d$/);
    });
  });

  describe("action generation", () => {
    it("should generate appropriate actions for each recommendation", () => {
      const result = generateRecommendations(mockWalletData, moderateProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        expect(rec.actions.length).toBeGreaterThan(0);

        rec.actions.forEach((action) => {
          expect(action.type).toMatch(
            /^(allocate|stake|provide-liquidity|open-cdp)$/,
          );
          expect(action.asset).toBeTruthy();
          expect(action.amount).toBeGreaterThanOrEqual(0);
          expect(action.details).toContain("$");
          expect(action.details).toContain(action.asset);
        });
      });
    });

    it("should calculate action amounts based on allocation percentage", () => {
      const result = generateRecommendations(
        mockWalletData,
        conservativeProfile,
      );

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        const expectedAmount =
          (mockWalletData.totalValueUSD * rec.allocationPercentage) / 100;

        rec.actions.forEach((action) => {
          expect(action.amount).toBe(expectedAmount);
        });
      });
    });

    it("should include detailed action descriptions", () => {
      const result = generateRecommendations(mockWalletData, aggressiveProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        rec.actions.forEach((action) => {
          expect(action.details).toBeTruthy();
          expect(action.details).toContain("Allocate");
          expect(action.details).toContain("$");
          expect(action.details).toContain("."); // Should have decimal places
        });
      });
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle zero total value gracefully", () => {
      const zeroWallet: WalletData = {
        holdings: [],
        totalValueUSD: 0,
      };

      const result = generateRecommendations(zeroWallet, conservativeProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      expect(recommendations.length).toBeGreaterThan(0);
      expect(
        recommendations.reduce((sum, r) => sum + r.allocationPercentage, 0),
      ).toBe(100);
    });

    it("should handle very small portfolio values", () => {
      const smallWallet: WalletData = {
        holdings: [
          {
            symbol: "USDC",
            amount: 10,
            valueUSD: 10,
          },
        ],
        totalValueUSD: 10,
      };

      const result = generateRecommendations(smallWallet, conservativeProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        rec.actions.forEach((action) => {
          expect(action.amount).toBeGreaterThanOrEqual(0);
          expect(action.amount).toBeLessThanOrEqual(10);
        });
      });
    });

    it("should handle very large portfolio values", () => {
      const largeWallet: WalletData = {
        holdings: [
          {
            symbol: "ETH",
            amount: 10000,
            valueUSD: 100000000,
          },
        ],
        totalValueUSD: 100000000,
      };

      const result = generateRecommendations(largeWallet, aggressiveProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      recommendations.forEach((rec) => {
        rec.actions.forEach((action) => {
          expect(Number.isFinite(action.amount)).toBe(true);
          expect(action.amount).toBeGreaterThan(0);
        });
      });
    });

    it("should handle all risk tolerance levels", () => {
      const riskLevels: UserProfile["riskTolerance"][] = [
        "conservative",
        "moderate",
        "aggressive",
      ];

      riskLevels.forEach((riskTolerance) => {
        const profile = { ...conservativeProfile, riskTolerance };
        const result = generateRecommendations(mockWalletData, profile);

        expect(result.isRight()).toBe(true);

        const recommendations = result.value as Recommendation[];
        expect(recommendations.length).toBeGreaterThan(0);
        expect(
          recommendations.reduce((sum, r) => sum + r.allocationPercentage, 0),
        ).toBe(100);
      });
    });

    it("should handle all experience levels", () => {
      const experienceLevels: UserProfile["experienceLevel"][] = [
        "beginner",
        "intermediate",
        "advanced",
      ];

      experienceLevels.forEach((experienceLevel) => {
        const profile = { ...moderateProfile, experienceLevel };
        const result = generateRecommendations(mockWalletData, profile);

        expect(result.isRight()).toBe(true);

        const recommendations = result.value as Recommendation[];
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });

    it("should handle all investment horizons", () => {
      const horizons: UserProfile["investmentHorizon"][] = [
        "short",
        "medium",
        "long",
      ];

      horizons.forEach((investmentHorizon) => {
        const profile = { ...moderateProfile, investmentHorizon };
        const result = generateRecommendations(mockWalletData, profile);

        expect(result.isRight()).toBe(true);

        const recommendations = result.value as Recommendation[];
        expect(recommendations.length).toBeGreaterThan(0);
      });
    });

    it("should filter out zero allocations", () => {
      // Create a profile that would result in very small allocations
      const beginnerProfile: UserProfile = {
        riskTolerance: "aggressive",
        investmentHorizon: "short",
        experienceLevel: "beginner",
        goals: ["preservation"],
      };

      const result = generateRecommendations(mockWalletData, beginnerProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      // All returned recommendations should have positive allocations
      recommendations.forEach((rec) => {
        expect(rec.allocationPercentage).toBeGreaterThan(0);
      });
    });
  });

  describe("template consistency", () => {
    it("should maintain consistent recommendation structure across profiles", () => {
      const profiles = [
        conservativeProfile,
        moderateProfile,
        aggressiveProfile,
      ];

      profiles.forEach((profile) => {
        const result = generateRecommendations(mockWalletData, profile);

        expect(result.isRight()).toBe(true);
        const recommendations = result.value as Recommendation[];

        // Each profile should have some recommendations
        expect(recommendations.length).toBeGreaterThan(0);

        // Each recommendation should have all required fields
        recommendations.forEach((rec) => {
          expect(rec.id).toBeTruthy();
          expect(rec.title).toBeTruthy();
          expect(rec.description).toBeTruthy();
          expect(rec.explanation).toBeTruthy();
          expect(rec.actions.length).toBeGreaterThan(0);
          expect(["low", "medium", "high"]).toContain(rec.riskLevel);
        });
      });
    });

    it("should maintain expected return consistency within risk levels", () => {
      const result = generateRecommendations(mockWalletData, moderateProfile);

      expect(result.isRight()).toBe(true);
      const recommendations = result.value as Recommendation[];

      const lowRiskRecs = recommendations.filter((r) => r.riskLevel === "low");
      const highRiskRecs = recommendations.filter(
        (r) => r.riskLevel === "high",
      );

      // Low risk should generally have lower returns than high risk
      if (lowRiskRecs.length > 0 && highRiskRecs.length > 0) {
        const avgLowRiskReturn =
          lowRiskRecs.reduce((sum, r) => sum + r.expectedReturnRange.max, 0) /
          lowRiskRecs.length;
        const avgHighRiskReturn =
          highRiskRecs.reduce((sum, r) => sum + r.expectedReturnRange.min, 0) /
          highRiskRecs.length;

        expect(avgLowRiskReturn).toBeLessThan(avgHighRiskReturn * 1.5); // Allow some overlap
      }
    });
  });
});
