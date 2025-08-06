/**
 * CDP Leverage Service
 *
 * Manages CDP-based leverage for yield enhancement strategies.
 * Calculates optimal leverage ratios and monitors health factors.
 */

import { Strategy, LeverageConfig, Asset } from "../../types/strategy";

interface LeverageRecommendation {
  recommendedMultiplier: number;
  maxSafeMultiplier: number;
  projectedAPYBoost: number;
  additionalRisk: number;
  requiredCollateral: number;
  monthlyBorrowCost: number;
  breakEvenAPY: number;
  reasoning: string[];
}

interface HealthStatus {
  healthFactor: number;
  status: "healthy" | "warning" | "critical";
  liquidationPrice: number;
  safetyBuffer: number; // Percentage above liquidation
  recommendations: string[];
}

interface LeverageSimulation {
  multiplier: number;
  collateralRequired: number;
  borrowAmount: number;
  projectedAPY: number;
  monthlyRevenue: number;
  monthlyCost: number;
  netMonthlyProfit: number;
  riskScore: number;
}

const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock collateral prices
const COLLATERAL_PRICES: Record<string, number> = {
  ETH: 2000,
  WBTC: 45000,
  USDC: 1,
  DAI: 1,
};

// Mock borrow rates (annual)
const BORROW_RATES: Record<string, number> = {
  stable: 3.5,
  variable: 4.2,
  ETH: 2.8,
  USDC: 3.5,
};

export class CDPLeverageService {
  /**
   * Get leverage recommendations based on strategy
   */
  static async getRecommendations(
    strategy: Strategy,
    collateralAsset: Asset,
    userRiskTolerance: "conservative" | "moderate" | "aggressive",
  ): Promise<LeverageRecommendation> {
    await mockDelay(600);

    const baseAPY = this.calculateBaseAPY(strategy);
    const collateralPrice = COLLATERAL_PRICES[collateralAsset.symbol] || 1;
    const borrowRate =
      BORROW_RATES[collateralAsset.symbol] || BORROW_RATES.stable || 3.5;

    // Calculate recommended multipliers based on risk tolerance
    const multipliers = {
      conservative: 1.3,
      moderate: 1.8,
      aggressive: 2.5,
    };

    const recommendedMultiplier = multipliers[userRiskTolerance];
    const maxSafeMultiplier = userRiskTolerance === "aggressive" ? 3.0 : 2.0;

    // Calculate APY boost
    const projectedAPYBoost =
      baseAPY * recommendedMultiplier -
      baseAPY -
      borrowRate * (recommendedMultiplier - 1);

    // Calculate required collateral for $10,000 position
    const positionSize = 10000;
    const requiredCollateral = (positionSize * recommendedMultiplier) / 1.5; // 150% collateralization

    const monthlyBorrowCost =
      (positionSize * (recommendedMultiplier - 1) * borrowRate) / 100 / 12;
    const breakEvenAPY =
      (borrowRate * (recommendedMultiplier - 1)) / recommendedMultiplier;

    const reasoning = [];
    if (projectedAPYBoost > 5) {
      reasoning.push(`Leverage boosts APY by ${projectedAPYBoost.toFixed(1)}%`);
    }
    if (recommendedMultiplier < 2) {
      reasoning.push("Conservative leverage maintains safety");
    }
    if (baseAPY > borrowRate * 2) {
      reasoning.push("Base yield significantly exceeds borrow cost");
    }
    reasoning.push(`Monthly borrow cost: $${monthlyBorrowCost.toFixed(2)}`);

    return {
      recommendedMultiplier,
      maxSafeMultiplier,
      projectedAPYBoost,
      additionalRisk: (recommendedMultiplier - 1) * 25,
      requiredCollateral,
      monthlyBorrowCost,
      breakEvenAPY,
      reasoning,
    };
  }

  /**
   * Check CDP health status
   */
  static async checkHealth(
    leverageConfig: LeverageConfig,
  ): Promise<HealthStatus> {
    await mockDelay(400);

    const { healthFactor, collateralRatio, liquidationThreshold } =
      leverageConfig;

    let status: "healthy" | "warning" | "critical";
    if (healthFactor >= 2) {
      status = "healthy";
    } else if (healthFactor >= 1.5) {
      status = "warning";
    } else {
      status = "critical";
    }

    const collateralPrice =
      COLLATERAL_PRICES[leverageConfig.collateralAsset.symbol] || 1;
    const liquidationPrice =
      collateralPrice * (liquidationThreshold / collateralRatio);
    const safetyBuffer =
      ((collateralPrice - liquidationPrice) / collateralPrice) * 100;

    const recommendations = [];
    if (status === "critical") {
      recommendations.push("Add collateral immediately to avoid liquidation");
      recommendations.push("Consider reducing leverage");
    } else if (status === "warning") {
      recommendations.push("Monitor position closely");
      recommendations.push("Consider adding collateral as buffer");
    } else {
      recommendations.push("Position is healthy");
      if (healthFactor > 3) {
        recommendations.push(
          "You could safely increase leverage for higher yields",
        );
      }
    }

    return {
      healthFactor,
      status,
      liquidationPrice,
      safetyBuffer,
      recommendations,
    };
  }

  /**
   * Simulate different leverage scenarios
   */
  static async simulateLeverage(
    strategy: Strategy,
    collateralAmount: number,
    collateralAsset: Asset,
    multipliers: number[] = [1, 1.5, 2, 2.5, 3],
  ): Promise<LeverageSimulation[]> {
    await mockDelay(800);

    const baseAPY = this.calculateBaseAPY(strategy);
    const borrowRate =
      BORROW_RATES[collateralAsset.symbol] || BORROW_RATES.stable || 3.5;
    const monthlyInvestment = strategy.totalValueLocked || 10000;

    return multipliers.map((multiplier) => {
      const borrowAmount = collateralAmount * (multiplier - 1);
      const totalInvested = collateralAmount * multiplier;

      // Calculate returns
      const grossAPY = baseAPY * multiplier;
      const borrowCostAPY = borrowRate * (multiplier - 1);
      const projectedAPY = grossAPY - borrowCostAPY;

      const monthlyRevenue = (totalInvested * grossAPY) / 100 / 12;
      const monthlyCost = (borrowAmount * borrowRate) / 100 / 12;
      const netMonthlyProfit = monthlyRevenue - monthlyCost;

      // Risk increases exponentially with leverage
      const riskScore = Math.min(100, Math.pow(multiplier, 2) * 10);

      return {
        multiplier,
        collateralRequired: collateralAmount,
        borrowAmount,
        projectedAPY,
        monthlyRevenue,
        monthlyCost,
        netMonthlyProfit,
        riskScore,
      };
    });
  }

  /**
   * Calculate optimal leverage for target APY
   */
  static async calculateOptimalLeverage(
    currentAPY: number,
    targetAPY: number,
    borrowRate: number = 3.5,
    maxMultiplier: number = 3,
  ): Promise<{
    optimalMultiplier: number;
    achievableAPY: number;
    feasible: boolean;
    reason?: string;
  }> {
    await mockDelay(500);

    // Formula: targetAPY = currentAPY * multiplier - borrowRate * (multiplier - 1)
    // Solving for multiplier: multiplier = (targetAPY - borrowRate) / (currentAPY - borrowRate)

    const optimalMultiplier =
      (targetAPY - borrowRate) / (currentAPY - borrowRate);

    if (optimalMultiplier < 1) {
      return {
        optimalMultiplier: 1,
        achievableAPY: currentAPY,
        feasible: false,
        reason: "Target APY is lower than current APY",
      };
    }

    if (optimalMultiplier > maxMultiplier) {
      const achievableAPY =
        currentAPY * maxMultiplier - borrowRate * (maxMultiplier - 1);
      return {
        optimalMultiplier: maxMultiplier,
        achievableAPY,
        feasible: false,
        reason: `Target requires ${optimalMultiplier.toFixed(1)}x leverage, max safe is ${maxMultiplier}x`,
      };
    }

    const achievableAPY =
      currentAPY * optimalMultiplier - borrowRate * (optimalMultiplier - 1);

    return {
      optimalMultiplier: Math.round(optimalMultiplier * 10) / 10, // Round to 1 decimal
      achievableAPY,
      feasible: true,
    };
  }

  /**
   * Monitor and suggest rebalancing
   */
  static async getRebalancingSuggestions(
    leverageConfig: LeverageConfig,
    currentMarketConditions: {
      volatility: "low" | "medium" | "high";
      trend: "bullish" | "neutral" | "bearish";
    },
  ): Promise<{
    action: "increase" | "decrease" | "maintain";
    reason: string;
    suggestedMultiplier?: number;
  }> {
    await mockDelay(400);

    const { healthFactor, leverageMultiplier } = leverageConfig;
    const { volatility, trend } = currentMarketConditions;

    // Decision logic
    if (healthFactor < 1.5) {
      return {
        action: "decrease",
        reason: "Health factor too low - reduce leverage to avoid liquidation",
        suggestedMultiplier: Math.max(1, leverageMultiplier - 0.5),
      };
    }

    if (volatility === "high" && leverageMultiplier > 2) {
      return {
        action: "decrease",
        reason: "High market volatility - reduce leverage for safety",
        suggestedMultiplier: Math.min(2, leverageMultiplier),
      };
    }

    if (trend === "bullish" && healthFactor > 3 && leverageMultiplier < 2) {
      return {
        action: "increase",
        reason:
          "Strong market conditions and healthy position - can increase leverage",
        suggestedMultiplier: Math.min(2.5, leverageMultiplier + 0.5),
      };
    }

    return {
      action: "maintain",
      reason: "Current leverage is optimal for market conditions",
    };
  }

  /**
   * Calculate liquidation scenarios
   */
  static async calculateLiquidationScenarios(
    leverageConfig: LeverageConfig,
  ): Promise<{
    currentPrice: number;
    liquidationPrice: number;
    priceDropToLiquidation: number;
    scenarios: Array<{
      priceChange: number;
      newHealthFactor: number;
      status: string;
    }>;
  }> {
    await mockDelay(500);

    const collateralPrice =
      COLLATERAL_PRICES[leverageConfig.collateralAsset.symbol] || 1;
    const { collateralAmount, borrowedAmount, liquidationThreshold } =
      leverageConfig;

    // Liquidation occurs when: collateral value * threshold < borrowed amount
    const liquidationPrice =
      borrowedAmount / collateralAmount / (liquidationThreshold / 100);
    const priceDropToLiquidation =
      ((collateralPrice - liquidationPrice) / collateralPrice) * 100;

    const scenarios = [-50, -30, -20, -10, -5, 0, 5, 10].map((priceChange) => {
      const newPrice = collateralPrice * (1 + priceChange / 100);
      const newCollateralValue = collateralAmount * newPrice;
      const newHealthFactor =
        (newCollateralValue * (liquidationThreshold / 100)) / borrowedAmount;

      let status;
      if (newHealthFactor < 1) status = "Liquidated";
      else if (newHealthFactor < 1.5) status = "Critical";
      else if (newHealthFactor < 2) status = "Warning";
      else status = "Healthy";

      return {
        priceChange,
        newHealthFactor: Math.max(0, newHealthFactor),
        status,
      };
    });

    return {
      currentPrice: collateralPrice,
      liquidationPrice,
      priceDropToLiquidation,
      scenarios,
    };
  }

  // Helper methods
  private static calculateBaseAPY(strategy: Strategy): number {
    return strategy.allocations.reduce((total, allocation) => {
      return total + (allocation.currentAPY * allocation.allocation) / 100;
    }, 0);
  }
}
