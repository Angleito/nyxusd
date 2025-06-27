/**
 * Yield Aggregator Service
 *
 * Optimizes yield generation across multiple protocols by finding
 * the best opportunities and rebalancing strategies.
 */

import {
  Strategy,
  StrategyAllocation,
  ProtocolPosition,
  Asset,
  ProtocolId,
} from "../../types/strategy";

interface YieldOpportunity {
  protocol: ProtocolId;
  position: ProtocolPosition;
  projectedAPY: number;
  riskAdjustedAPY: number;
  gasEfficiency: number; // APY per gas unit
  recommendation: string;
  score: number; // Overall opportunity score
}

interface RebalanceRecommendation {
  from: StrategyAllocation;
  to: ProtocolPosition;
  reason: string;
  apyImprovement: number;
  gasEstimate: number;
  urgency: "low" | "medium" | "high";
}

interface YieldOptimizationResult {
  currentAPY: number;
  optimizedAPY: number;
  improvement: number;
  recommendations: RebalanceRecommendation[];
  gasEstimate: number;
}

const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class YieldAggregatorService {
  /**
   * Find best yield opportunities based on user preferences
   */
  static async findBestOpportunities(
    assets: Asset[],
    riskTolerance: "low" | "medium" | "high",
    minAPY: number = 0,
  ): Promise<YieldOpportunity[]> {
    await mockDelay(800);

    // Mock yield opportunities
    const opportunities: YieldOpportunity[] = [
      {
        protocol: "aave",
        position: {
          protocol: "aave",
          positionType: "lending",
          assets: [assets[0]],
          currentAPY: 8.5,
          tvl: 2500000000,
          utilization: 82,
          risks: ["Smart contract risk"],
          gasEstimate: 0.02,
        },
        projectedAPY: 8.5,
        riskAdjustedAPY: 7.8,
        gasEfficiency: 425, // 8.5% / 0.02 ETH
        recommendation: "Stable yields with high liquidity",
        score: 85,
      },
      {
        protocol: "curve",
        position: {
          protocol: "curve",
          positionType: "liquidity_pool",
          assets: assets.filter((a) =>
            ["USDC", "USDT", "DAI"].includes(a.symbol),
          ),
          currentAPY: 12.3,
          tvl: 3200000000,
          risks: ["Smart contract risk"],
          gasEstimate: 0.04,
        },
        projectedAPY: 12.3,
        riskAdjustedAPY: 11.5,
        gasEfficiency: 307.5,
        recommendation: "Low IL risk for stablecoin pools",
        score: 92,
      },
      {
        protocol: "yearn",
        position: {
          protocol: "yearn",
          positionType: "vault",
          assets: [assets[0]],
          currentAPY: 15.8,
          tvl: 280000000,
          risks: ["Strategy risk", "Smart contract risk"],
          gasEstimate: 0.03,
        },
        projectedAPY: 15.8,
        riskAdjustedAPY: 13.2,
        gasEfficiency: 526.7,
        recommendation: "Auto-compounding vault strategy",
        score: 88,
      },
    ];

    // Filter by minimum APY
    let filtered = opportunities.filter((o) => o.projectedAPY >= minAPY);

    // Adjust for risk tolerance
    if (riskTolerance === "low") {
      filtered = filtered.filter((o) => o.position.risks.length <= 2);
    } else if (riskTolerance === "medium") {
      filtered = filtered.filter((o) => o.position.risks.length <= 3);
    }

    // Sort by score
    filtered.sort((a, b) => b.score - a.score);

    return filtered;
  }

  /**
   * Optimize yield for an existing strategy
   */
  static async optimizeStrategy(
    strategy: Strategy,
  ): Promise<YieldOptimizationResult> {
    await mockDelay(1000);

    const currentAPY = this.calculateStrategyAPY(strategy);
    const recommendations: RebalanceRecommendation[] = [];

    // Analyze each allocation for optimization opportunities
    for (const allocation of strategy.allocations) {
      // Mock finding better opportunities
      if (allocation.currentAPY < 10 && Math.random() > 0.5) {
        recommendations.push({
          from: allocation,
          to: {
            protocol: "yearn",
            positionType: "vault",
            assets: allocation.assets,
            currentAPY: allocation.currentAPY + 5,
            tvl: 500000000,
            risks: ["Strategy risk"],
            gasEstimate: 0.03,
          },
          reason: "Higher yield vault available",
          apyImprovement: 5,
          gasEstimate: 0.05,
          urgency: "medium",
        });
      }
    }

    // Calculate optimized APY
    let optimizedAPY = currentAPY;
    recommendations.forEach((rec) => {
      const allocationWeight =
        strategy.allocations.find((a) => a.id === rec.from.id)?.allocation || 0;
      optimizedAPY += (rec.apyImprovement * allocationWeight) / 100;
    });

    const totalGas = recommendations.reduce(
      (sum, rec) => sum + rec.gasEstimate,
      0,
    );

    return {
      currentAPY,
      optimizedAPY,
      improvement: optimizedAPY - currentAPY,
      recommendations,
      gasEstimate: totalGas,
    };
  }

  /**
   * Calculate optimal allocation percentages
   */
  static async calculateOptimalAllocations(
    positions: ProtocolPosition[],
    targetAPY: number,
    maxRisk: number,
  ): Promise<Map<ProtocolPosition, number>> {
    await mockDelay(600);

    const allocations = new Map<ProtocolPosition, number>();

    // Simple optimization: allocate more to higher APY positions
    const totalAPY = positions.reduce((sum, p) => sum + p.currentAPY, 0);

    positions.forEach((position) => {
      const weight = position.currentAPY / totalAPY;
      const allocation = Math.round(weight * 100);
      allocations.set(position, allocation);
    });

    // Normalize to 100%
    const total = Array.from(allocations.values()).reduce(
      (sum, a) => sum + a,
      0,
    );
    if (total !== 100) {
      const largestPosition = Array.from(allocations.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      allocations.set(largestPosition[0], largestPosition[1] + (100 - total));
    }

    return allocations;
  }

  /**
   * Monitor yield changes and alert on opportunities
   */
  static async monitorYieldChanges(strategy: Strategy): Promise<{
    alerts: Array<{
      type: "opportunity" | "risk" | "info";
      message: string;
      allocation?: StrategyAllocation;
      urgency: "low" | "medium" | "high";
    }>;
  }> {
    await mockDelay(500);

    const alerts: any[] = [];

    // Check each allocation for changes
    strategy.allocations.forEach((allocation) => {
      // Mock APY changes
      const apyChange = (Math.random() - 0.5) * 10;

      if (apyChange > 3) {
        alerts.push({
          type: "opportunity",
          message: `${allocation.protocol} APY increased by ${apyChange.toFixed(1)}%`,
          allocation,
          urgency: "medium",
        });
      } else if (apyChange < -3) {
        alerts.push({
          type: "risk",
          message: `${allocation.protocol} APY decreased by ${Math.abs(apyChange).toFixed(1)}%`,
          allocation,
          urgency: "high",
        });
      }
    });

    // Add general alerts
    if (strategy.leverage.enabled && strategy.leverage.healthFactor < 1.5) {
      alerts.push({
        type: "risk",
        message: "CDP health factor is low, consider reducing leverage",
        urgency: "high",
      });
    }

    return { alerts };
  }

  /**
   * Compare strategy performance against benchmarks
   */
  static async compareWithBenchmarks(strategy: Strategy): Promise<{
    performance: "underperforming" | "matching" | "outperforming";
    benchmarkAPY: number;
    strategyAPY: number;
    suggestions: string[];
  }> {
    await mockDelay(400);

    const strategyAPY = this.calculateStrategyAPY(strategy);

    // Mock benchmark based on risk level
    const benchmarks = {
      low: 8,
      medium: 15,
      high: 25,
    };

    const riskLevel =
      strategy.riskMetrics.riskScore < 30
        ? "low"
        : strategy.riskMetrics.riskScore < 60
          ? "medium"
          : "high";

    const benchmarkAPY = benchmarks[riskLevel];
    const performance =
      strategyAPY < benchmarkAPY * 0.9
        ? "underperforming"
        : strategyAPY > benchmarkAPY * 1.1
          ? "outperforming"
          : "matching";

    const suggestions = [];
    if (performance === "underperforming") {
      suggestions.push("Consider rebalancing to higher yield protocols");
      suggestions.push("Review allocation percentages");
      if (!strategy.leverage.enabled) {
        suggestions.push("Consider using leverage to boost returns");
      }
    }

    return {
      performance,
      benchmarkAPY,
      strategyAPY,
      suggestions,
    };
  }

  /**
   * Calculate APY impact of adding leverage
   */
  static async calculateLeverageImpact(
    strategy: Strategy,
    leverageMultiplier: number,
  ): Promise<{
    baseAPY: number;
    leveragedAPY: number;
    additionalRisk: number;
    liquidationPrice?: number;
    recommendation: string;
  }> {
    await mockDelay(500);

    const baseAPY = this.calculateStrategyAPY(strategy);
    const borrowRate = 3.5; // Mock borrow rate
    const leveragedAPY =
      baseAPY * leverageMultiplier - borrowRate * (leverageMultiplier - 1);

    const additionalRisk = (leverageMultiplier - 1) * 20; // Simplified risk calculation

    let recommendation = "";
    if (leverageMultiplier > 2) {
      recommendation = "High leverage - monitor position closely";
    } else if (leverageMultiplier > 1.5) {
      recommendation = "Moderate leverage - good risk/reward balance";
    } else {
      recommendation = "Conservative leverage - lower risk";
    }

    return {
      baseAPY,
      leveragedAPY,
      additionalRisk,
      liquidationPrice: leverageMultiplier > 1 ? 1500 : undefined, // Mock liquidation price
      recommendation,
    };
  }

  /**
   * Find arbitrage opportunities between protocols
   */
  static async findArbitrageOpportunities(asset: Asset): Promise<
    Array<{
      buyProtocol: ProtocolId;
      sellProtocol: ProtocolId;
      profitPercent: number;
      gasEstimate: number;
      netProfit: number;
    }>
  > {
    await mockDelay(700);

    // Mock arbitrage opportunities
    const opportunities = [
      {
        buyProtocol: "curve" as ProtocolId,
        sellProtocol: "uniswap" as ProtocolId,
        profitPercent: 0.5,
        gasEstimate: 0.08,
        netProfit: 0.3,
      },
    ];

    return opportunities.filter((o) => o.netProfit > 0);
  }

  // Helper methods
  private static calculateStrategyAPY(strategy: Strategy): number {
    return strategy.allocations.reduce((total, allocation) => {
      const weight = allocation.allocation / 100;
      const apy =
        allocation.currentAPY *
        (allocation.leveraged ? allocation.leverageMultiplier || 1 : 1);
      return total + apy * weight;
    }, 0);
  }
}
