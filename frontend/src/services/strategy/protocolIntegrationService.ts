/**
 * Protocol Integration Service
 *
 * Manages connections to various DeFi protocols and provides
 * unified interface for querying positions and calculating yields.
 */

import {
  Protocol,
  ProtocolId,
  ProtocolPosition,
  Asset,
  PositionType,
} from "../../types/strategy";

// Mock protocols data
const PROTOCOLS: Record<ProtocolId, Protocol> = {
  aave: {
    id: "aave",
    name: "Aave",
    description: "Decentralized lending protocol",
    logoURI: "/protocols/aave.svg",
    supportedChains: [1, 137, 42161],
    capabilities: ["lending", "borrowing"],
  },
  uniswap: {
    id: "uniswap",
    name: "Uniswap V3",
    description: "Concentrated liquidity DEX",
    logoURI: "/protocols/uniswap.svg",
    supportedChains: [1, 137, 42161, 10],
    capabilities: ["liquidity_provision"],
  },
  curve: {
    id: "curve",
    name: "Curve Finance",
    description: "Stablecoin and pegged asset DEX",
    logoURI: "/protocols/curve.svg",
    supportedChains: [1, 137, 42161],
    capabilities: ["liquidity_provision", "staking"],
  },
  compound: {
    id: "compound",
    name: "Compound",
    description: "Algorithmic money market protocol",
    logoURI: "/protocols/compound.svg",
    supportedChains: [1],
    capabilities: ["lending", "borrowing"],
  },
  yearn: {
    id: "yearn",
    name: "Yearn Finance",
    description: "Yield optimization vaults",
    logoURI: "/protocols/yearn.svg",
    supportedChains: [1],
    capabilities: ["vaults"],
  },
  convex: {
    id: "convex",
    name: "Convex Finance",
    description: "Curve yield booster",
    logoURI: "/protocols/convex.svg",
    supportedChains: [1],
    capabilities: ["staking", "farming"],
  },
  sushiswap: {
    id: "sushiswap",
    name: "SushiSwap",
    description: "Community-driven DEX",
    logoURI: "/protocols/sushi.svg",
    supportedChains: [1, 137, 42161],
    capabilities: ["liquidity_provision", "farming"],
  },
  balancer: {
    id: "balancer",
    name: "Balancer",
    description: "Programmable liquidity protocol",
    logoURI: "/protocols/balancer.svg",
    supportedChains: [1, 137, 42161],
    capabilities: ["liquidity_provision"],
  },
};

// Mock available positions
const MOCK_POSITIONS: ProtocolPosition[] = [
  // Aave positions
  {
    protocol: "aave",
    positionType: "lending",
    assets: [{ symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 }],
    currentAPY: 8.5,
    tvl: 2500000000,
    utilization: 82,
    risks: ["Smart contract risk", "Variable rates"],
    gasEstimate: 0.02,
  },
  {
    protocol: "aave",
    positionType: "lending",
    assets: [{ symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 }],
    currentAPY: 5.2,
    tvl: 5000000000,
    utilization: 68,
    risks: ["Smart contract risk", "Variable rates"],
    gasEstimate: 0.02,
  },
  // Uniswap positions
  {
    protocol: "uniswap",
    positionType: "liquidity_pool",
    assets: [
      { symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 },
      { symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 },
    ],
    currentAPY: 24.5,
    tvl: 850000000,
    risks: ["Impermanent loss", "Smart contract risk"],
    gasEstimate: 0.05,
  },
  {
    protocol: "uniswap",
    positionType: "liquidity_pool",
    assets: [
      { symbol: "WBTC", address: "0x...", decimals: 8, chainId: 1 },
      { symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 },
    ],
    currentAPY: 18.3,
    tvl: 450000000,
    risks: ["Impermanent loss", "Smart contract risk"],
    gasEstimate: 0.05,
  },
  // Curve positions
  {
    protocol: "curve",
    positionType: "liquidity_pool",
    assets: [
      { symbol: "DAI", address: "0x...", decimals: 18, chainId: 1 },
      { symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 },
      { symbol: "USDT", address: "0x...", decimals: 6, chainId: 1 },
    ],
    currentAPY: 12.3,
    tvl: 3200000000,
    risks: ["Smart contract risk", "Minimal impermanent loss"],
    gasEstimate: 0.04,
  },
  // Yearn vaults
  {
    protocol: "yearn",
    positionType: "vault",
    assets: [{ symbol: "USDC", address: "0x...", decimals: 6, chainId: 1 }],
    currentAPY: 15.8,
    tvl: 280000000,
    risks: ["Strategy risk", "Smart contract risk"],
    gasEstimate: 0.03,
  },
  {
    protocol: "yearn",
    positionType: "vault",
    assets: [{ symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 }],
    currentAPY: 12.4,
    tvl: 420000000,
    risks: ["Strategy risk", "Smart contract risk"],
    gasEstimate: 0.03,
  },
  // High APY farming positions
  {
    protocol: "sushiswap",
    positionType: "farming",
    assets: [
      { symbol: "SUSHI", address: "0x...", decimals: 18, chainId: 1 },
      { symbol: "ETH", address: "0x...", decimals: 18, chainId: 1 },
    ],
    currentAPY: 85.2,
    tvl: 45000000,
    risks: ["High impermanent loss", "Token volatility", "Smart contract risk"],
    gasEstimate: 0.08,
  },
  {
    protocol: "convex",
    positionType: "staking",
    assets: [{ symbol: "CVX", address: "0x...", decimals: 18, chainId: 1 }],
    currentAPY: 42.8,
    tvl: 680000000,
    risks: ["Token volatility", "Smart contract risk"],
    gasEstimate: 0.04,
  },
];

// Mock assets
const MOCK_ASSETS: Asset[] = [
  {
    symbol: "ETH",
    address: "0x...",
    decimals: 18,
    chainId: 1,
    logoURI: "/tokens/eth.svg",
  },
  {
    symbol: "WBTC",
    address: "0x...",
    decimals: 8,
    chainId: 1,
    logoURI: "/tokens/wbtc.svg",
  },
  {
    symbol: "USDC",
    address: "0x...",
    decimals: 6,
    chainId: 1,
    logoURI: "/tokens/usdc.svg",
  },
  {
    symbol: "USDT",
    address: "0x...",
    decimals: 6,
    chainId: 1,
    logoURI: "/tokens/usdt.svg",
  },
  {
    symbol: "DAI",
    address: "0x...",
    decimals: 18,
    chainId: 1,
    logoURI: "/tokens/dai.svg",
  },
  {
    symbol: "SUSHI",
    address: "0x...",
    decimals: 18,
    chainId: 1,
    logoURI: "/tokens/sushi.svg",
  },
  {
    symbol: "CRV",
    address: "0x...",
    decimals: 18,
    chainId: 1,
    logoURI: "/tokens/crv.svg",
  },
  {
    symbol: "CVX",
    address: "0x...",
    decimals: 18,
    chainId: 1,
    logoURI: "/tokens/cvx.svg",
  },
  {
    symbol: "BAL",
    address: "0x...",
    decimals: 18,
    chainId: 1,
    logoURI: "/tokens/bal.svg",
  },
];

const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class ProtocolIntegrationService {
  /**
   * Get all supported protocols
   */
  static async getProtocols(): Promise<Protocol[]> {
    await mockDelay(300);
    return Object.values(PROTOCOLS);
  }

  /**
   * Get protocol by ID
   */
  static async getProtocol(protocolId: ProtocolId): Promise<Protocol | null> {
    await mockDelay(200);
    return PROTOCOLS[protocolId] || null;
  }

  /**
   * Get available positions for a protocol
   */
  static async getProtocolPositions(
    protocolId?: ProtocolId,
    positionType?: PositionType,
  ): Promise<ProtocolPosition[]> {
    await mockDelay(500);

    let positions = [...MOCK_POSITIONS];

    if (protocolId) {
      positions = positions.filter((p) => p.protocol === protocolId);
    }

    if (positionType) {
      positions = positions.filter((p) => p.positionType === positionType);
    }

    // Sort by TVL descending
    positions.sort((a, b) => b.tvl - a.tvl);

    return positions;
  }

  /**
   * Get top yield opportunities
   */
  static async getTopYieldOpportunities(
    limit: number = 10,
  ): Promise<ProtocolPosition[]> {
    await mockDelay(600);

    const positions = [...MOCK_POSITIONS];
    positions.sort((a, b) => b.currentAPY - a.currentAPY);

    return positions.slice(0, limit);
  }

  /**
   * Get supported assets
   */
  static async getSupportedAssets(chainId?: number): Promise<Asset[]> {
    await mockDelay(300);

    if (chainId) {
      return MOCK_ASSETS.filter((a) => a.chainId === chainId);
    }

    return MOCK_ASSETS;
  }

  /**
   * Calculate gas costs for multiple positions
   */
  static async estimateGasCost(positions: ProtocolPosition[]): Promise<number> {
    await mockDelay(400);

    const totalGas = positions.reduce((sum, pos) => sum + pos.gasEstimate, 0);
    const setupGas = 0.01; // Base transaction cost

    return totalGas + setupGas;
  }

  /**
   * Get protocol TVL and stats
   */
  static async getProtocolStats(protocolId: ProtocolId): Promise<{
    tvl: number;
    users: number;
    avgAPY: number;
    positions: number;
  }> {
    await mockDelay(500);

    const protocolPositions = MOCK_POSITIONS.filter(
      (p) => p.protocol === protocolId,
    );
    const totalTVL = protocolPositions.reduce((sum, p) => sum + p.tvl, 0);
    const avgAPY =
      protocolPositions.reduce((sum, p) => sum + p.currentAPY, 0) /
      protocolPositions.length;

    return {
      tvl: totalTVL,
      users: Math.floor(totalTVL / 50000), // Mock user count
      avgAPY: avgAPY || 0,
      positions: protocolPositions.length,
    };
  }

  /**
   * Search positions by assets
   */
  static async searchPositions(assets: string[]): Promise<ProtocolPosition[]> {
    await mockDelay(400);

    const positions = MOCK_POSITIONS.filter((pos) =>
      assets.some((asset) =>
        pos.assets.some((a) => a.symbol.toLowerCase() === asset.toLowerCase()),
      ),
    );

    return positions;
  }

  /**
   * Get risk-adjusted opportunities
   */
  static async getRiskAdjustedOpportunities(
    maxRiskScore: number = 50,
  ): Promise<ProtocolPosition[]> {
    await mockDelay(500);

    // Filter by risk level (simplified - in reality would use more complex scoring)
    const positions = MOCK_POSITIONS.filter((pos) => {
      const riskScore = pos.risks.length * 15; // Simple risk scoring
      return riskScore <= maxRiskScore;
    });

    // Sort by risk-adjusted return (APY / risk score)
    positions.sort((a, b) => {
      const aRiskScore = a.risks.length * 15;
      const bRiskScore = b.risks.length * 15;
      const aRiskAdjusted = a.currentAPY / (aRiskScore || 1);
      const bRiskAdjusted = b.currentAPY / (bRiskScore || 1);
      return bRiskAdjusted - aRiskAdjusted;
    });

    return positions;
  }

  /**
   * Get protocol health status
   */
  static async getProtocolHealth(protocolId: ProtocolId): Promise<{
    status: "healthy" | "warning" | "critical";
    message: string;
    lastChecked: Date;
  }> {
    await mockDelay(300);

    // Mock health check
    const statuses: Array<"healthy" | "warning" | "critical"> = [
      "healthy",
      "healthy",
      "warning",
    ];
    const status = statuses[Math.floor(Math.random() * statuses.length)] || "healthy";

    const messages = {
      healthy: "Protocol operating normally",
      warning: "Elevated gas fees detected",
      critical: "Protocol under maintenance",
    };

    return {
      status,
      message: messages[status],
      lastChecked: new Date(),
    };
  }
}
