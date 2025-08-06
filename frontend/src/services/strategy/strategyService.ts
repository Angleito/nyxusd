/**
 * Strategy Service
 *
 * Handles CRUD operations for investment strategies with mock data.
 * This service is designed to be easily replaceable with real API calls.
 */

import {
  Strategy,
  StrategyCreationParams,
  StrategyFilters,
  StrategyTemplate,
  SimulationResult,
  PerformanceDataPoint,
  RiskMetrics,
  PerformanceMetrics,
} from "../../types/strategy";
import { v4 as uuidv4 } from "uuid";

// Mock delay to simulate API calls
const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock strategy templates
const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "conservative-yield",
    name: "Conservative Yield Hunter",
    description:
      "Low-risk strategy focused on stable yields from lending and stablecoin pools",
    category: "conservative",
    allocations: [
      {
        protocol: "aave",
        positionType: "lending",
        assets: [{ symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 }],
        allocation: 40,
        currentAPY: 8.5,
        projectedAPY: 8.5,
        leveraged: false,
        metadata: { pool: "USDC" },
      },
      {
        protocol: "curve",
        positionType: "liquidity_pool",
        assets: [
          { symbol: "DAI", address: "0x...", decimals: 18, chainId: 1 },
          { symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 },
          { symbol: "USDT", address: "0x...", decimals: 6, chainId: 1 },
        ],
        allocation: 30,
        currentAPY: 12.3,
        projectedAPY: 12.3,
        leveraged: false,
        metadata: { pool: "3pool" },
      },
      {
        protocol: "compound",
        positionType: "lending",
        assets: [{ symbol: "DAI", address: "0x...", decimals: 18, chainId: 1 }],
        allocation: 30,
        currentAPY: 7.8,
        projectedAPY: 7.8,
        leveraged: false,
        metadata: { market: "cDAI" },
      },
    ],
    expectedAPY: { min: 8, max: 12 },
    riskLevel: "low",
    popularityScore: 85,
  },
  {
    id: "balanced-defi",
    name: "Balanced DeFi Portfolio",
    description:
      "Diversified strategy across major DeFi protocols with moderate leverage",
    category: "balanced",
    allocations: [
      {
        protocol: "aave",
        positionType: "lending",
        assets: [{ symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 }],
        allocation: 25,
        currentAPY: 5.2,
        projectedAPY: 5.2,
        leveraged: true,
        leverageMultiplier: 1.5,
        metadata: { pool: "ETH" },
      },
      {
        protocol: "uniswap",
        positionType: "liquidity_pool",
        assets: [
          { symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 },
          { symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 },
        ],
        allocation: 25,
        currentAPY: 24.5,
        projectedAPY: 24.5,
        leveraged: false,
        metadata: { pool: "ETH/USDC", fee: 0.3 },
      },
      {
        protocol: "yearn",
        positionType: "vault",
        assets: [{ symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 }],
        allocation: 25,
        currentAPY: 15.8,
        projectedAPY: 15.8,
        leveraged: false,
        metadata: { vault: "yvUSDC" },
      },
      {
        protocol: "convex",
        positionType: "staking",
        assets: [{ symbol: "CRV", address: "0x...", decimals: 18, chainId: 1 }],
        allocation: 25,
        currentAPY: 18.9,
        projectedAPY: 18.9,
        leveraged: false,
        metadata: { pool: "cvxCRV" },
      },
    ],
    suggestedLeverage: {
      enabled: true,
      leverageMultiplier: 1.5,
      collateralRatio: 200,
    },
    expectedAPY: { min: 15, max: 25 },
    riskLevel: "medium",
    popularityScore: 92,
  },
  {
    id: "aggressive-farmer",
    name: "Aggressive Yield Farmer",
    description:
      "High-risk, high-reward strategy with maximum leverage and yield farming",
    category: "aggressive",
    allocations: [
      {
        protocol: "sushiswap",
        positionType: "farming",
        assets: [
          { symbol: "SUSHI", address: "0x...", decimals: 18, chainId: 1 },
          { symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 },
        ],
        allocation: 40,
        currentAPY: 85.2,
        projectedAPY: 85.2,
        leveraged: true,
        leverageMultiplier: 2.5,
        metadata: { farm: "SUSHI/ETH", rewards: ["SUSHI"] },
      },
      {
        protocol: "convex",
        positionType: "farming",
        assets: [{ symbol: "CVX", address: "0x...", decimals: 18, chainId: 1 }],
        allocation: 30,
        currentAPY: 42.8,
        projectedAPY: 42.8,
        leveraged: true,
        leverageMultiplier: 2.0,
        metadata: { pool: "cvxCRV", boost: 2.5 },
      },
      {
        protocol: "balancer",
        positionType: "liquidity_pool",
        assets: [
          { symbol: "BAL", address: "0x...", decimals: 18, chainId: 1 },
          { symbol: "WETH", address: "0x...", decimals: 18, chainId: 1 },
        ],
        allocation: 30,
        currentAPY: 68.5,
        projectedAPY: 68.5,
        leveraged: true,
        leverageMultiplier: 2.0,
        metadata: { pool: "80BAL-20WETH", rewards: ["BAL"] },
      },
    ],
    suggestedLeverage: {
      enabled: true,
      leverageMultiplier: 2.5,
      collateralRatio: 150,
    },
    expectedAPY: { min: 30, max: 80 },
    riskLevel: "high",
    popularityScore: 76,
  },
];

// Mock user strategies storage
let mockStrategies: Strategy[] = [];
let strategyIdCounter = 1;

export class StrategyService {
  /**
   * Create a new strategy
   */
  static async createStrategy(
    params: StrategyCreationParams,
  ): Promise<Strategy> {
    await mockDelay(800);

    const strategy: Strategy = {
      id: `strategy-${strategyIdCounter++}`,
      name: params.name,
      description: params.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: "0x742d...8963", // Mock user address
      allocations: params.allocations.map((alloc, index) => ({
        ...alloc,
        id: `alloc-${Date.now()}-${index}`,
        currentAPY: Math.random() * 30 + 5,
        projectedAPY: Math.random() * 30 + 5,
      })),
      leverage: {
        enabled: params.leverage?.enabled || false,
        collateralAsset: {
          symbol: "ETH",
          address: "0x...",
          decimals: 18,
          chainId: 1,
        },
        collateralAmount: 0,
        borrowedAmount: 0,
        collateralRatio: params.leverage?.collateralRatio || 200,
        leverageMultiplier: params.leverage?.leverageMultiplier || 1,
        healthFactor: 2.5,
        liquidationThreshold: 150,
        ...params.leverage,
      },
      performanceMetrics: this.generateMockPerformanceMetrics(),
      riskMetrics: this.generateMockRiskMetrics(),
      targetAPY: params.targetAPY || 15,
      minAPY: 5,
      maxAPY: 50,
      totalValueLocked: 10000,
      isPublic: params.isPublic || false,
      tags: params.tags || [],
    };

    mockStrategies.push(strategy);
    return strategy;
  }

  /**
   * Get strategy by ID
   */
  static async getStrategy(strategyId: string): Promise<Strategy | null> {
    await mockDelay(500);
    return mockStrategies.find((s) => s.id === strategyId) || null;
  }

  /**
   * Get all user strategies
   */
  static async getUserStrategies(userId: string): Promise<Strategy[]> {
    await mockDelay(600);
    return mockStrategies.filter((s) => s.owner === userId);
  }

  /**
   * Get public strategies with filters
   */
  static async getPublicStrategies(
    filters?: StrategyFilters,
  ): Promise<Strategy[]> {
    await mockDelay(700);

    let strategies = mockStrategies.filter((s) => s.isPublic);

    if (filters) {
      if (filters.minAPY) {
        strategies = strategies.filter(
          (s) => s.performanceMetrics.currentAPY >= filters.minAPY!,
        );
      }
      if (filters.maxAPY) {
        strategies = strategies.filter(
          (s) => s.performanceMetrics.currentAPY <= filters.maxAPY!,
        );
      }
      if (filters.protocols?.length) {
        strategies = strategies.filter((s) =>
          s.allocations.some((a) => filters.protocols!.includes(a.protocol)),
        );
      }
      if (filters.leveraged !== undefined) {
        strategies = strategies.filter(
          (s) => s.leverage.enabled === filters.leveraged,
        );
      }
    }

    return strategies;
  }

  /**
   * Update strategy allocations
   */
  static async updateStrategy(
    strategyId: string,
    updates: Partial<Strategy>,
  ): Promise<Strategy> {
    await mockDelay(600);

    const index = mockStrategies.findIndex((s) => s.id === strategyId);
    if (index === -1) {
      throw new Error("Strategy not found");
    }

    mockStrategies[index] = {
      ...mockStrategies[index],
      ...updates,
      updatedAt: new Date(),
    } as Strategy;

    return mockStrategies[index] as Strategy;
  }

  /**
   * Delete a strategy
   */
  static async deleteStrategy(strategyId: string): Promise<void> {
    await mockDelay(500);
    mockStrategies = mockStrategies.filter((s) => s.id !== strategyId);
  }

  /**
   * Get strategy templates
   */
  static async getTemplates(
    category?: "conservative" | "balanced" | "aggressive",
  ): Promise<StrategyTemplate[]> {
    await mockDelay(400);

    if (category) {
      return STRATEGY_TEMPLATES.filter((t) => t.category === category);
    }
    return STRATEGY_TEMPLATES;
  }

  /**
   * Simulate strategy performance
   */
  static async simulateStrategy(
    params: StrategyCreationParams,
  ): Promise<SimulationResult> {
    await mockDelay(1000);

    const totalAPY = params.allocations.reduce(
      (sum, alloc) => sum + 10 * (alloc.allocation / 100),
      0,
    );

    const leverageMultiplier = params.leverage?.leverageMultiplier || 1;
    const projectedAPY = totalAPY * leverageMultiplier;

    return {
      projectedAPY,
      projectedValue: 10000 * (1 + projectedAPY / 100),
      riskMetrics: this.generateMockRiskMetrics(),
      gasEstimate: 0.05, // ETH
      warnings:
        leverageMultiplier > 2
          ? ["High leverage increases liquidation risk"]
          : [],
      recommendations: [
        "Consider diversifying across more protocols",
        "Monitor positions daily with high leverage",
      ],
    };
  }

  /**
   * Get historical performance data
   */
  static async getPerformanceHistory(
    strategyId: string,
    days: number = 30,
  ): Promise<PerformanceDataPoint[]> {
    await mockDelay(600);

    const dataPoints: PerformanceDataPoint[] = [];
    const now = Date.now();
    const interval = 24 * 60 * 60 * 1000; // 1 day

    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(now - i * interval);
      const baseValue = 10000;
      const growth = (days - i) * 0.1; // 0.1% daily growth
      const volatility = Math.sin(i * 0.5) * 2; // Add some volatility

      dataPoints.push({
        timestamp,
        totalValue: baseValue * (1 + (growth + volatility) / 100),
        apy: 15 + volatility,
        allocations: [],
      });
    }

    return dataPoints;
  }

  /**
   * Clone an existing strategy
   */
  static async cloneStrategy(
    strategyId: string,
    newName: string,
  ): Promise<Strategy> {
    await mockDelay(700);

    const original = await this.getStrategy(strategyId);
    if (!original) {
      throw new Error("Strategy not found");
    }

    const params: StrategyCreationParams = {
      name: newName,
      description: `Cloned from: ${original.name}`,
      allocations: original.allocations.map((a) => ({
        protocol: a.protocol,
        positionType: a.positionType,
        assets: a.assets,
        allocation: a.allocation,
        leveraged: a.leveraged,
        leverageMultiplier: a.leverageMultiplier,
        metadata: a.metadata,
      })),
      leverage: original.leverage,
      targetAPY: original.targetAPY,
      tags: [...original.tags, "cloned"],
    };

    return this.createStrategy(params);
  }

  // Helper methods
  private static generateMockPerformanceMetrics(): PerformanceMetrics {
    const currentAPY = Math.random() * 30 + 5;
    return {
      totalValue: 10000 + Math.random() * 5000,
      totalCost: 10000,
      unrealizedPnL: Math.random() * 2000 - 500,
      unrealizedPnLPercent: Math.random() * 20 - 5,
      realizedPnL: Math.random() * 1000,
      currentAPY,
      averageAPY: currentAPY * 0.9,
      highestAPY: currentAPY * 1.5,
      lowestAPY: currentAPY * 0.5,
      lastUpdated: new Date(),
    };
  }

  private static generateMockRiskMetrics(): RiskMetrics {
    return {
      riskScore: Math.floor(Math.random() * 50) + 25,
      volatility: Math.random() * 30 + 10,
      maxDrawdown: Math.random() * 20 + 5,
      sharpeRatio: Math.random() * 2 + 0.5,
      diversificationScore: Math.floor(Math.random() * 40) + 60,
      liquidationRisk: Math.floor(Math.random() * 30),
      impermanentLossRisk: Math.floor(Math.random() * 40) + 10,
    };
  }
}
