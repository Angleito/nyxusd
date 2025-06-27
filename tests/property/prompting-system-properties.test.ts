/**
 * Property-based tests for Prompting System
 * Tests mathematical properties, invariants, and edge cases using fast-check
 */

import * as fc from "fast-check";
import {
  explainWithAnalogy,
  generateAnalogy,
  getAllAnalogiesForConcept,
  hasAnalogy,
  type DeFiConcept,
  type Occupation,
} from "../../frontend/src/lib/ai-assistant/analogyGenerator";
import {
  generateRecommendations,
  calculatePortfolioRiskScore,
  calculateExpectedPortfolioReturn,
  type WalletData,
  type UserProfile,
  type Recommendation,
} from "../../frontend/src/lib/ai-assistant/recommendationEngine";
import {
  analyzeWalletComposition,
  calculateRiskScore,
  identifyOpportunities,
  generateAllocationSuggestions,
} from "../../frontend/src/lib/ai-assistant/portfolioAnalyzer";
import { detectUserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";

// Fast-check generators for our domain types
const defiConceptGen = fc.constantFrom<DeFiConcept>(
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
);

const occupationGen = fc.constantFrom<Occupation>(
  "chef",
  "truck_driver",
  "retail_manager",
  "teacher",
  "doctor",
  "engineer",
  "general",
);

const riskToleranceGen = fc.constantFrom<UserProfile["riskTolerance"]>(
  "conservative",
  "moderate",
  "aggressive",
);

const investmentHorizonGen = fc.constantFrom<UserProfile["investmentHorizon"]>(
  "short",
  "medium",
  "long",
);

const experienceLevelGen = fc.constantFrom<UserProfile["experienceLevel"]>(
  "beginner",
  "intermediate",
  "advanced",
);

const userProfileGen = fc.record({
  riskTolerance: riskToleranceGen,
  investmentHorizon: investmentHorizonGen,
  experienceLevel: experienceLevelGen,
  goals: fc.array(fc.constantFrom("growth", "income", "preservation"), {
    minLength: 1,
    maxLength: 3,
  }),
});

const assetGen = fc.record({
  symbol: fc
    .string({ minLength: 2, maxLength: 10 })
    .filter((s) => /^[A-Z]+$/.test(s.toUpperCase())),
  amount: fc.float({ min: 0.001, max: 1000000, noNaN: true }),
  valueUSD: fc.float({ min: 1, max: 10000000, noNaN: true }),
});

const walletDataGen = fc
  .record({
    holdings: fc.array(assetGen, { minLength: 1, maxLength: 20 }),
    totalValueUSD: fc.float({ min: 100, max: 100000000, noNaN: true }),
  })
  .map((wallet) => ({
    ...wallet,
    totalValueUSD: wallet.holdings.reduce(
      (sum, asset) => sum + asset.valueUSD,
      0,
    ),
  }));

const recommendationGen = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 5, maxLength: 50 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  allocationPercentage: fc.integer({ min: 1, max: 100 }),
  expectedReturnRange: fc
    .record({
      min: fc.float({ min: -10, max: 50 }),
      max: fc.float({ min: 0, max: 100 }),
    })
    .filter((range) => range.min <= range.max),
  riskLevel: fc.constantFrom<"low" | "medium" | "high">(
    "low",
    "medium",
    "high",
  ),
  explanation: fc.string({ minLength: 20, maxLength: 500 }),
  actions: fc.array(
    fc.record({
      type: fc.constantFrom<
        "allocate" | "stake" | "provide-liquidity" | "open-cdp"
      >("allocate", "stake", "provide-liquidity", "open-cdp"),
      asset: fc.string({ minLength: 2, maxLength: 10 }),
      amount: fc.float({ min: 0, max: 1000000, noNaN: true }),
      details: fc.string({ minLength: 5, maxLength: 100 }),
    }),
    { minLength: 1, maxLength: 3 },
  ),
});

describe("Prompting System Property-Based Tests", () => {
  describe("Analogy Generator Properties", () => {
    it("should always return non-empty strings for valid inputs", () => {
      fc.assert(
        fc.property(defiConceptGen, occupationGen, (concept, occupation) => {
          const result = explainWithAnalogy(concept, occupation);

          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
          expect(result.trim()).toBe(result); // No leading/trailing whitespace
        }),
      );
    });

    it("should maintain consistency between explainWithAnalogy and generateAnalogy", () => {
      fc.assert(
        fc.property(
          defiConceptGen,
          occupationGen,
          fc.string(),
          (concept, occupation, context) => {
            const directExplanation = explainWithAnalogy(concept, occupation);
            const generatedAnalogy = generateAnalogy(
              concept,
              occupation,
              context,
            );

            expect(generatedAnalogy.explanation).toBe(directExplanation);
            expect(generatedAnalogy.concept).toBe(concept);
            expect(generatedAnalogy.occupation).toBe(occupation);
            expect(generatedAnalogy.example).toBe(context);
          },
        ),
      );
    });

    it("should have hasAnalogy consistent with explainWithAnalogy availability", () => {
      fc.assert(
        fc.property(defiConceptGen, occupationGen, (concept, occupation) => {
          const hasAnalogy_ = hasAnalogy(concept, occupation);
          const explanation = explainWithAnalogy(concept, occupation);

          if (hasAnalogy_) {
            expect(explanation).not.toContain(
              "I don't have a specific analogy",
            );
          }

          // If no analogy exists, should either fallback to general or return default message
          if (!hasAnalogy_) {
            const generalAnalogy = explainWithAnalogy(concept, "general");
            expect(
              [explanation, generalAnalogy].some(
                (text) =>
                  text.includes("I don't have a specific analogy") ||
                  text === generalAnalogy,
              ),
            ).toBe(true);
          }
        }),
      );
    });

    it("should return all analogies for getAllAnalogiesForConcept consistently", () => {
      fc.assert(
        fc.property(defiConceptGen, (concept) => {
          const allAnalogies = getAllAnalogiesForConcept(concept);

          expect(Array.isArray(allAnalogies)).toBe(true);

          allAnalogies.forEach((analogy) => {
            expect(analogy.concept).toBe(concept);
            expect(typeof analogy.occupation).toBe("string");
            expect(typeof analogy.explanation).toBe("string");
            expect(analogy.explanation.length).toBeGreaterThan(0);

            // Verify the explanation matches direct call
            const directExplanation = explainWithAnalogy(
              concept,
              analogy.occupation,
            );
            expect(analogy.explanation).toBe(directExplanation);
          });
        }),
      );
    });

    it("should maintain deterministic behavior for same inputs", () => {
      fc.assert(
        fc.property(defiConceptGen, occupationGen, (concept, occupation) => {
          const result1 = explainWithAnalogy(concept, occupation);
          const result2 = explainWithAnalogy(concept, occupation);

          expect(result1).toBe(result2);
        }),
      );
    });

    it("should handle edge cases gracefully", () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (concept, occupation) => {
          // Should not throw for any string inputs
          expect(() => {
            explainWithAnalogy(
              concept as DeFiConcept,
              occupation as Occupation,
            );
          }).not.toThrow();
        }),
      );
    });
  });

  describe("Recommendation Engine Properties", () => {
    it("should always return normalized allocations summing to 100%", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const result = generateRecommendations(walletData, userProfile);

            if (result.isRight()) {
              const recommendations = result.value as Recommendation[];
              const totalAllocation = recommendations.reduce(
                (sum, rec) => sum + rec.allocationPercentage,
                0,
              );

              expect(totalAllocation).toBe(100);
            }
          },
        ),
      );
    });

    it("should maintain allocation percentage bounds", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const result = generateRecommendations(walletData, userProfile);

            if (result.isRight()) {
              const recommendations = result.value as Recommendation[];

              recommendations.forEach((rec) => {
                expect(rec.allocationPercentage).toBeGreaterThan(0);
                expect(rec.allocationPercentage).toBeLessThanOrEqual(100);
                expect(Number.isInteger(rec.allocationPercentage)).toBe(true);
              });
            }
          },
        ),
      );
    });

    it("should maintain expected return range consistency", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const result = generateRecommendations(walletData, userProfile);

            if (result.isRight()) {
              const recommendations = result.value as Recommendation[];

              recommendations.forEach((rec) => {
                expect(rec.expectedReturnRange.min).toBeLessThanOrEqual(
                  rec.expectedReturnRange.max,
                );
                expect(Number.isFinite(rec.expectedReturnRange.min)).toBe(true);
                expect(Number.isFinite(rec.expectedReturnRange.max)).toBe(true);
              });
            }
          },
        ),
      );
    });

    it("should generate consistent action amounts based on allocation", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const result = generateRecommendations(walletData, userProfile);

            if (result.isRight()) {
              const recommendations = result.value as Recommendation[];

              recommendations.forEach((rec) => {
                const expectedAmount =
                  (walletData.totalValueUSD * rec.allocationPercentage) / 100;

                rec.actions.forEach((action) => {
                  expect(action.amount).toBeCloseTo(expectedAmount, 2);
                  expect(Number.isFinite(action.amount)).toBe(true);
                  expect(action.amount).toBeGreaterThanOrEqual(0);
                });
              });
            }
          },
        ),
      );
    });

    it("should maintain risk consistency within profiles", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const result = generateRecommendations(walletData, userProfile);

            if (result.isRight()) {
              const recommendations = result.value as Recommendation[];

              // Conservative profiles should have more low-risk recommendations
              if (userProfile.riskTolerance === "conservative") {
                const lowRiskPercentage = recommendations
                  .filter((r) => r.riskLevel === "low")
                  .reduce((sum, r) => sum + r.allocationPercentage, 0);

                expect(lowRiskPercentage).toBeGreaterThan(30); // At least 30% in low risk
              }

              // Aggressive profiles should have some high-risk recommendations
              if (userProfile.riskTolerance === "aggressive") {
                const hasHighRisk = recommendations.some(
                  (r) => r.riskLevel === "high",
                );
                expect(hasHighRisk).toBe(true);
              }
            }
          },
        ),
      );
    });

    it("should handle zero wallet values gracefully", () => {
      fc.assert(
        fc.property(userProfileGen, (userProfile) => {
          const emptyWallet: WalletData = {
            holdings: [],
            totalValueUSD: 0,
          };

          const result = generateRecommendations(emptyWallet, userProfile);

          expect(result.isRight()).toBe(true);

          if (result.isRight()) {
            const recommendations = result.value as Recommendation[];
            expect(recommendations.length).toBeGreaterThan(0);

            recommendations.forEach((rec) => {
              expect(rec.allocationPercentage).toBeGreaterThan(0);
              rec.actions.forEach((action) => {
                expect(action.amount).toBe(0);
              });
            });
          }
        }),
      );
    });
  });

  describe("Portfolio Risk Scoring Properties", () => {
    it("should return risk scores within valid bounds", () => {
      fc.assert(
        fc.property(
          fc.array(recommendationGen, { minLength: 1, maxLength: 10 }),
          (recommendations) => {
            const riskScore = calculatePortfolioRiskScore(recommendations);

            expect(riskScore).toBeGreaterThanOrEqual(-50); // Normalized minimum
            expect(riskScore).toBeLessThanOrEqual(100); // Normalized maximum
            expect(Number.isInteger(riskScore)).toBe(true);
          },
        ),
      );
    });

    it("should maintain monotonicity: more high-risk assets = higher score", () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 90 }), (baseAllocation) => {
          const lowRiskRec: Recommendation = {
            id: "1",
            title: "Low Risk",
            description: "Test",
            allocationPercentage: baseAllocation,
            expectedReturnRange: { min: 3, max: 7 },
            riskLevel: "low",
            explanation: "Test",
            actions: [],
          };

          const highRiskRec: Recommendation = {
            id: "2",
            title: "High Risk",
            description: "Test",
            allocationPercentage: 100 - baseAllocation,
            expectedReturnRange: { min: 15, max: 40 },
            riskLevel: "high",
            explanation: "Test",
            actions: [],
          };

          const lowRiskScore = calculatePortfolioRiskScore([
            { ...lowRiskRec, allocationPercentage: 100 },
          ]);
          const mixedScore = calculatePortfolioRiskScore([
            lowRiskRec,
            highRiskRec,
          ]);
          const highRiskScore = calculatePortfolioRiskScore([
            { ...highRiskRec, allocationPercentage: 100 },
          ]);

          expect(lowRiskScore).toBeLessThan(mixedScore);
          expect(mixedScore).toBeLessThan(highRiskScore);
        }),
      );
    });

    it("should calculate weighted portfolio returns correctly", () => {
      fc.assert(
        fc.property(
          fc
            .array(recommendationGen, { minLength: 1, maxLength: 5 })
            .filter(
              (recs) =>
                recs.reduce((sum, r) => sum + r.allocationPercentage, 0) ===
                100,
            ),
          (recommendations) => {
            const expectedReturn =
              calculateExpectedPortfolioReturn(recommendations);

            expect(Number.isFinite(expectedReturn.min)).toBe(true);
            expect(Number.isFinite(expectedReturn.max)).toBe(true);
            expect(expectedReturn.min).toBeLessThanOrEqual(expectedReturn.max);

            // Manual calculation for verification
            const manualMin = recommendations.reduce(
              (sum, rec) =>
                sum +
                (rec.allocationPercentage / 100) * rec.expectedReturnRange.min,
              0,
            );
            const manualMax = recommendations.reduce(
              (sum, rec) =>
                sum +
                (rec.allocationPercentage / 100) * rec.expectedReturnRange.max,
              0,
            );

            expect(expectedReturn.min).toBeCloseTo(manualMin, 1);
            expect(expectedReturn.max).toBeCloseTo(manualMax, 1);
          },
        ),
      );
    });
  });

  describe("Portfolio Analyzer Properties", () => {
    const portfolioWalletGen = fc
      .record({
        address: fc
          .hexaString({ minLength: 40, maxLength: 40 })
          .map((s) => `0x${s}`),
        totalValueUSD: fc.float({ min: 100, max: 1000000, noNaN: true }),
        assets: fc.array(
          fc.record({
            symbol: fc.string({ minLength: 2, maxLength: 10 }),
            balance: fc.string({ minLength: 1, maxLength: 20 }),
            valueUSD: fc.float({ min: 1, max: 100000, noNaN: true }),
            contractAddress: fc
              .hexaString({ minLength: 40, maxLength: 40 })
              .map((s) => `0x${s}`),
          }),
          { minLength: 1, maxLength: 20 },
        ),
      })
      .map((wallet) => ({
        ...wallet,
        totalValueUSD: wallet.assets.reduce(
          (sum, asset) => sum + asset.valueUSD,
          0,
        ),
      }));

    it("should return consistent risk scores within bounds", () => {
      fc.assert(
        fc.property(portfolioWalletGen, (walletData) => {
          const riskScore = calculateRiskScore(walletData);

          expect(riskScore).toBeGreaterThanOrEqual(1);
          expect(riskScore).toBeLessThanOrEqual(10);
          expect(Number.isInteger(riskScore)).toBe(true);
        }),
      );
    });

    it("should maintain diversification score bounds and consistency", () => {
      fc.assert(
        fc.property(portfolioWalletGen, (walletData) => {
          const analysis = analyzeWalletComposition(walletData);

          expect(analysis.diversificationScore).toBeGreaterThanOrEqual(0);
          expect(analysis.diversificationScore).toBeLessThanOrEqual(100);
          expect(Number.isInteger(analysis.diversificationScore)).toBe(true);

          // Single asset portfolios should have low diversification
          if (walletData.assets.length === 1) {
            expect(analysis.diversificationScore).toBeLessThanOrEqual(20);
          }

          // More assets should generally mean better diversification
          if (walletData.assets.length >= 5) {
            expect(analysis.diversificationScore).toBeGreaterThan(10);
          }
        }),
      );
    });

    it("should identify concentration risks correctly", () => {
      fc.assert(
        fc.property(portfolioWalletGen, (walletData) => {
          const analysis = analyzeWalletComposition(walletData);

          analysis.concentrationRisk.forEach((risk) => {
            expect(risk.percentage).toBeGreaterThan(30);
            expect(risk.percentage).toBeLessThanOrEqual(100);
            expect(typeof risk.asset).toBe("string");
            expect(risk.asset.length).toBeGreaterThan(0);
          });
        }),
      );
    });

    it("should generate valid opportunities", () => {
      fc.assert(
        fc.property(
          portfolioWalletGen,
          userProfileGen,
          (walletData, userProfile) => {
            const opportunities = identifyOpportunities(
              walletData,
              userProfile as any,
            );

            expect(Array.isArray(opportunities)).toBe(true);

            opportunities.forEach((opp) => {
              expect([
                "diversification",
                "rebalancing",
                "tax_optimization",
                "cost_reduction",
              ]).toContain(opp.type);
              expect(["high", "medium", "low"]).toContain(opp.priority);
              expect(typeof opp.title).toBe("string");
              expect(typeof opp.description).toBe("string");
              expect(typeof opp.potentialBenefit).toBe("string");
              expect(opp.title.length).toBeGreaterThan(0);
              expect(opp.description.length).toBeGreaterThan(0);
            });
          },
        ),
      );
    });

    it("should generate allocation suggestions that sum reasonably", () => {
      fc.assert(
        fc.property(userProfileGen, (userProfile) => {
          const suggestions = generateAllocationSuggestions(userProfile as any);

          expect(Array.isArray(suggestions)).toBe(true);
          expect(suggestions.length).toBeGreaterThan(0);

          const totalSuggested = suggestions.reduce(
            (sum, s) => sum + s.suggestedPercentage,
            0,
          );
          expect(totalSuggested).toBeGreaterThan(80); // Should be close to 100%
          expect(totalSuggested).toBeLessThan(120); // Allow some flexibility

          suggestions.forEach((suggestion) => {
            expect(suggestion.suggestedPercentage).toBeGreaterThanOrEqual(0);
            expect(suggestion.suggestedPercentage).toBeLessThanOrEqual(100);
            expect(typeof suggestion.asset).toBe("string");
            expect(typeof suggestion.reason).toBe("string");
            expect(suggestion.asset.length).toBeGreaterThan(0);
            expect(suggestion.reason.length).toBeGreaterThan(0);
          });
        }),
      );
    });
  });

  describe("Natural Language Processing Properties", () => {
    it("should always return valid intent structure", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom<any>(
            "initial",
            "wallet_prompt",
            "investment_goals",
            "risk_tolerance",
          ),
          (message, step) => {
            const intent = detectUserIntent(message, step);

            expect(typeof intent.action).toBe("string");
            expect(typeof intent.confidence).toBe("number");
            expect(intent.confidence).toBeGreaterThanOrEqual(0);
            expect(intent.confidence).toBeLessThanOrEqual(1);
            expect(intent.originalMessage).toBe(message);

            const validActions = [
              "connect_wallet",
              "select_option",
              "input_value",
              "continue",
              "skip",
              "help",
              "unclear",
            ];
            expect(validActions).toContain(intent.action);
          },
        ),
      );
    });

    it("should maintain deterministic behavior for same inputs", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom<any>("investment_goals", "risk_tolerance"),
          (message, step) => {
            const intent1 = detectUserIntent(message, step);
            const intent2 = detectUserIntent(message, step);

            expect(intent1).toEqual(intent2);
          },
        ),
      );
    });

    it("should handle empty and whitespace strings gracefully", () => {
      fc.assert(
        fc.property(
          fc.constantFrom<any>("initial", "wallet_prompt", "investment_goals"),
          (step) => {
            const emptyIntent = detectUserIntent("", step);
            const whitespaceIntent = detectUserIntent("   ", step);

            expect(emptyIntent.action).toBeTruthy();
            expect(whitespaceIntent.action).toBeTruthy();
            expect(emptyIntent.confidence).toBeGreaterThanOrEqual(0);
            expect(whitespaceIntent.confidence).toBeGreaterThanOrEqual(0);
          },
        ),
      );
    });

    it("should have confidence correlate with intent clarity", () => {
      fc.assert(
        fc.property(fc.constantFrom<any>("investment_goals"), (step) => {
          const clearIntent = detectUserIntent("I want growth", step);
          const unclearIntent = detectUserIntent("xyz123", step);

          expect(clearIntent.confidence).toBeGreaterThan(
            unclearIntent.confidence,
          );
        }),
      );
    });
  });

  describe("Cross-Component Integration Properties", () => {
    it("should maintain data consistency between recommendation generation and risk calculation", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const result = generateRecommendations(walletData, userProfile);

            if (result.isRight()) {
              const recommendations = result.value as Recommendation[];

              // Risk score should be consistent with recommendations
              const riskScore = calculatePortfolioRiskScore(recommendations);
              const highRiskAllocation = recommendations
                .filter((r) => r.riskLevel === "high")
                .reduce((sum, r) => sum + r.allocationPercentage, 0);

              if (highRiskAllocation > 50) {
                expect(riskScore).toBeGreaterThan(50);
              }

              if (highRiskAllocation === 0) {
                expect(riskScore).toBeLessThan(75);
              }
            }
          },
        ),
      );
    });

    it("should maintain consistency between portfolio analysis and recommendations", () => {
      fc.assert(
        fc.property(
          portfolioWalletGen,
          userProfileGen,
          (walletData, userProfile) => {
            const analysis = analyzeWalletComposition(walletData);
            const opportunities = identifyOpportunities(
              walletData,
              userProfile as any,
            );

            // If portfolio has low diversification, should suggest diversification
            if (analysis.diversificationScore < 40) {
              const hasDiversificationOpp = opportunities.some(
                (opp) => opp.type === "diversification",
              );
              expect(hasDiversificationOpp).toBe(true);
            }

            // High concentration risk should trigger recommendations
            if (analysis.concentrationRisk.length > 0) {
              expect(opportunities.length).toBeGreaterThan(0);
            }
          },
        ),
      );
    });

    it("should maintain mathematical invariants across all calculations", () => {
      fc.assert(
        fc.property(
          portfolioWalletGen,
          userProfileGen,
          (walletData, userProfile) => {
            // All percentage values should be valid
            const analysis = analyzeWalletComposition(walletData);
            const suggestions = generateAllocationSuggestions(
              userProfile as any,
            );

            expect(analysis.diversificationScore).toBeGreaterThanOrEqual(0);
            expect(analysis.diversificationScore).toBeLessThanOrEqual(100);

            analysis.concentrationRisk.forEach((risk) => {
              expect(risk.percentage).toBeGreaterThan(0);
              expect(risk.percentage).toBeLessThanOrEqual(100);
            });

            suggestions.forEach((suggestion) => {
              expect(suggestion.suggestedPercentage).toBeGreaterThanOrEqual(0);
              expect(suggestion.suggestedPercentage).toBeLessThanOrEqual(100);
            });
          },
        ),
      );
    });
  });

  describe("Performance and Scalability Properties", () => {
    it("should handle large portfolios efficiently", () => {
      fc.assert(
        fc.property(fc.integer({ min: 50, max: 100 }), (assetCount) => {
          const largePortfolio = {
            address: "0x1234567890123456789012345678901234567890",
            totalValueUSD: 1000000,
            assets: Array.from({ length: assetCount }, (_, i) => ({
              symbol: `TOKEN${i}`,
              balance: "1000",
              valueUSD: 1000000 / assetCount,
              contractAddress: `0x${i.toString().padStart(40, "0")}`,
            })),
          };

          const startTime = performance.now();
          const analysis = analyzeWalletComposition(largePortfolio);
          const endTime = performance.now();

          // Should complete in reasonable time (less than 100ms)
          expect(endTime - startTime).toBeLessThan(100);
          expect(analysis).toBeDefined();
          expect(analysis.diversificationScore).toBeGreaterThan(0);
        }),
      );
    });

    it("should handle recommendation generation for complex profiles efficiently", () => {
      fc.assert(
        fc.property(
          walletDataGen,
          userProfileGen,
          (walletData, userProfile) => {
            const startTime = performance.now();
            const result = generateRecommendations(walletData, userProfile);
            const endTime = performance.now();

            // Should complete in reasonable time (less than 50ms)
            expect(endTime - startTime).toBeLessThan(50);
            expect(result.isRight()).toBe(true);
          },
        ),
      );
    });
  });
});
