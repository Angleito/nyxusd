/**
 * Centralized export for all test fixtures
 */

export { CDPFixtures } from "./cdp-fixtures";
export { CollateralFixtures } from "./collateral-fixtures";
export { OracleFixtures } from "./oracle-fixtures";

/**
 * Combined fixtures for comprehensive testing scenarios
 */
export const TestFixtures = {
  cdp: CDPFixtures,
  collateral: CollateralFixtures,
  oracle: OracleFixtures,

  /**
   * Cross-cutting test scenarios that use multiple fixture types
   */
  scenarios: {
    /**
     * Complete liquidation scenario with all related data
     */
    completeLiquidation: {
      cdp: CDPFixtures.samples.cdps[2], // Critical CDP
      collateral: CollateralFixtures.samples.balances[2], // Critical balance
      priceUpdate:
        CollateralFixtures.edgeCases.extremeVolatility.priceUpdates[0], // Price crash
      liquidation: CDPFixtures.samples.liquidations[0],
    },

    /**
     * Multi-asset portfolio stress test
     */
    portfolioStress: {
      portfolio: CDPFixtures.samples.portfolios[0],
      collateralAssets: CollateralFixtures.samples.assets.slice(0, 3),
      stressScenario: OracleFixtures.stress.blackSwan,
      expectedLiquidations: 2,
    },

    /**
     * Oracle failure recovery scenario
     */
    oracleFailureRecovery: {
      failure: OracleFixtures.failures.partialOutage,
      affectedCDPs: [CDPFixtures.samples.cdps[0], CDPFixtures.samples.cdps[1]],
      fallbackPrices: [
        { asset: "ETH-USD", price: 1600 },
        { asset: "BTC-USD", price: 42000 },
      ],
      recoveryTime: 3600,
    },

    /**
     * Flash crash with rapid recovery
     */
    flashCrashRecovery: {
      initialState: {
        cdps: CDPFixtures.samples.cdps.slice(0, 2),
        prices: [1600, 42000, 14.5], // ETH, BTC, LINK
      },
      crashPhase: OracleFixtures.stress.flashCrash.phases[0],
      recoveryPhase: OracleFixtures.stress.flashCrash.phases[1],
      expectedOutcome: "no_liquidations",
    },

    /**
     * Gradual market decline scenario
     */
    gradualDecline: {
      initialPortfolio: CollateralFixtures.samples.portfolios[0],
      priceDecline: OracleFixtures.stress.bearMarket.dailyDeclines,
      expectedRebalancing: true,
      expectedRiskIncrease: 25, // 25% increase in risk score
    },
  },

  /**
   * Helper functions for creating test data combinations
   */
  helpers: {
    /**
     * Create a CDP with specific risk level
     */
    createCDPWithRisk: (riskLevel: "low" | "medium" | "high" | "critical") => {
      const baseCDP = CDPFixtures.samples.cdps[0];
      const riskMultipliers = {
        low: { healthFactor: 2.0, collateralizationRatio: 200 },
        medium: { healthFactor: 1.5, collateralizationRatio: 150 },
        high: { healthFactor: 1.2, collateralizationRatio: 120 },
        critical: { healthFactor: 1.0, collateralizationRatio: 100 },
      };

      const multiplier = riskMultipliers[riskLevel];
      return {
        ...baseCDP,
        id: `cdp_${riskLevel}_risk`,
        healthFactor: multiplier.healthFactor,
        collateralizationRatio: multiplier.collateralizationRatio,
        riskLevel,
      };
    },

    /**
     * Create correlated price movements
     */
    createCorrelatedPrices: (
      basePrice: number,
      correlation: number,
      numPrices: number = 10,
    ) => {
      const prices: number[] = [basePrice];

      for (let i = 1; i < numPrices; i++) {
        const randomFactor = (Math.random() - 0.5) * 0.1; // ±5% random
        const correlatedFactor = (prices[i - 1] / basePrice - 1) * correlation;
        const change = randomFactor + correlatedFactor;
        prices.push(basePrice * (1 + change));
      }

      return prices;
    },

    /**
     * Create portfolio with specific allocation
     */
    createPortfolioWithAllocation: (
      totalValue: number,
      allocations: Record<string, number>, // asset -> percentage
    ) => {
      const assets = Object.entries(allocations).map(
        ([assetAddress, percentage]) => ({
          assetAddress,
          amount: BigInt(Math.floor((totalValue * percentage) / 100)),
          value: (totalValue * percentage) / 100,
          weight: percentage,
          allocationTarget: percentage,
        }),
      );

      return {
        ...CollateralFixtures.samples.portfolios[0],
        portfolioId: `portfolio_custom_${Date.now()}`,
        collateralAssets: assets,
        totalValue,
      };
    },

    /**
     * Create stress test scenario
     */
    createStressScenario: (
      priceShocks: Record<string, number>, // asset -> shock percentage
      duration: number = 3600,
    ) => {
      const shocks = Object.entries(priceShocks).map(
        ([feedId, shockPercent]) => ({
          feedId,
          shockPercent,
          newPrice: 0, // Will be calculated based on current price
          confidence: Math.max(95 - Math.abs(shockPercent), 80),
        }),
      );

      return {
        name: `Custom Stress Test ${Date.now()}`,
        description: `Custom stress scenario with shocks: ${JSON.stringify(priceShocks)}`,
        duration,
        priceShocks: shocks,
      };
    },
  },
};
