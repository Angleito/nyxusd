/**
 * Strategy Management Type Definitions
 *
 * Core types for the direct investing platform where users can create
 * custom investment strategies and leverage CDPs for enhanced yield.
 */

/**
 * Supported DeFi protocols for strategy allocation
 */
export type ProtocolId =
  | "aave"
  | "uniswap"
  | "curve"
  | "compound"
  | "yearn"
  | "convex"
  | "sushiswap"
  | "balancer";

/**
 * Asset types supported across protocols
 */
export interface Asset {
  symbol: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

/**
 * Protocol information and capabilities
 */
export interface Protocol {
  id: ProtocolId;
  name: string;
  description: string;
  logoURI: string;
  supportedChains: number[];
  capabilities: ProtocolCapability[];
}

/**
 * What a protocol can do
 */
export type ProtocolCapability =
  | "lending"
  | "borrowing"
  | "liquidity_provision"
  | "staking"
  | "farming"
  | "vaults";

/**
 * Position types across different protocols
 */
export type PositionType =
  | "lending"
  | "borrowing"
  | "liquidity_pool"
  | "staking"
  | "farming"
  | "vault";

/**
 * Individual allocation within a strategy
 */
export interface StrategyAllocation {
  id: string;
  protocol: ProtocolId;
  positionType: PositionType;
  assets: Asset[];
  allocation: number; // Percentage (0-100)
  currentAPY: number;
  projectedAPY: number;
  leveraged: boolean;
  leverageMultiplier?: number;
  metadata: Record<string, any>; // Protocol-specific data
}

/**
 * CDP leverage configuration for yield enhancement
 */
export interface LeverageConfig {
  enabled: boolean;
  cdpId?: string;
  collateralAsset: Asset;
  collateralAmount: number;
  borrowedAmount: number;
  collateralRatio: number;
  leverageMultiplier: number;
  healthFactor: number;
  liquidationThreshold: number;
}

/**
 * Performance metrics for a strategy
 */
export interface PerformanceMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  currentAPY: number;
  averageAPY: number;
  highestAPY: number;
  lowestAPY: number;
  lastUpdated: Date;
}

/**
 * Risk metrics for strategy evaluation
 */
export interface RiskMetrics {
  riskScore: number; // 0-100
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
  diversificationScore: number;
  liquidationRisk: number; // 0-100
  impermanentLossRisk: number; // 0-100
}

/**
 * Main strategy interface
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  allocations: StrategyAllocation[];
  leverage: LeverageConfig;
  performanceMetrics: PerformanceMetrics;
  riskMetrics: RiskMetrics;
  targetAPY: number;
  minAPY: number;
  maxAPY: number;
  totalValueLocked: number;
  isPublic: boolean;
  tags: string[];
}

/**
 * Strategy creation parameters
 */
export interface StrategyCreationParams {
  name: string;
  description: string;
  allocations: Omit<StrategyAllocation, "id" | "currentAPY" | "projectedAPY">[];
  leverage?: Partial<LeverageConfig>;
  targetAPY?: number;
  isPublic?: boolean;
  tags?: string[];
}

/**
 * Strategy template for quick starts
 */
export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: "conservative" | "balanced" | "aggressive" | "custom";
  allocations: Omit<StrategyAllocation, "id">[];
  suggestedLeverage?: Partial<LeverageConfig>;
  expectedAPY: {
    min: number;
    max: number;
  };
  riskLevel: "low" | "medium" | "high";
  popularityScore: number;
}

/**
 * Historical performance data point
 */
export interface PerformanceDataPoint {
  timestamp: Date;
  totalValue: number;
  apy: number;
  allocations: {
    allocationId: string;
    value: number;
    apy: number;
  }[];
}

/**
 * Transaction types for strategy management
 */
export type StrategyTransaction =
  | { type: "deposit"; amount: number; asset: Asset }
  | { type: "withdraw"; amount: number; asset: Asset }
  | { type: "rebalance"; from: string; to: string; amount: number }
  | { type: "leverage_increase"; amount: number }
  | { type: "leverage_decrease"; amount: number }
  | { type: "emergency_exit"; reason: string };

/**
 * Strategy simulation result
 */
export interface SimulationResult {
  projectedAPY: number;
  projectedValue: number;
  riskMetrics: RiskMetrics;
  gasEstimate: number;
  warnings: string[];
  recommendations: string[];
}

/**
 * Filters for strategy discovery
 */
export interface StrategyFilters {
  minAPY?: number;
  maxAPY?: number;
  protocols?: ProtocolId[];
  riskLevel?: "low" | "medium" | "high";
  leveraged?: boolean;
  minTVL?: number;
  tags?: string[];
}

/**
 * Protocol position details
 */
export interface ProtocolPosition {
  protocol: ProtocolId;
  positionType: PositionType;
  assets: Asset[];
  currentAPY: number;
  tvl: number;
  utilization?: number;
  risks: string[];
  gasEstimate: number;
}

/**
 * User's strategy portfolio
 */
export interface StrategyPortfolio {
  strategies: Strategy[];
  totalValue: number;
  totalPnL: number;
  averageAPY: number;
  riskScore: number;
  cdpPositions: LeverageConfig[];
}
