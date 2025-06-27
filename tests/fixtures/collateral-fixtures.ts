/**
 * Collateral test fixtures and sample data
 */

import {
  CollateralAssetConfig,
  CollateralBalance,
  CollateralDeposit,
  CollateralWithdrawal,
  CollateralLiquidation,
  CollateralPriceUpdate,
  CollateralRiskAssessment,
  CollateralPortfolio,
} from "@nyxusd/validators";

/**
 * Sample collateral asset configurations
 */
export const sampleCollateralAssets: CollateralAssetConfig[] = [
  {
    address: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    assetType: "native",
    isActive: true,
    liquidationThreshold: 8000, // 80%
    liquidationPenalty: 1000, // 10%
    maxLoanToValue: 7500, // 75%
    minCollateralRatio: 15000, // 150%
    stabilityFee: 300, // 3%
    debtCeiling: 50000000000000000000000000n, // 50M tokens
    debtFloor: 1000000000000000000000n, // 1000 tokens
    oracleAddress: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    oraclePriceFeedId: "ETH-USD",
    priceValidityPeriod: 3600, // 1 hour
    chainId: 1,
    network: "mainnet",
    createdAt: 1703030400,
    updatedAt: 1703116800,
  },
  {
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    assetType: "wrapped",
    isActive: true,
    liquidationThreshold: 7500, // 75%
    liquidationPenalty: 1200, // 12%
    maxLoanToValue: 7000, // 70%
    minCollateralRatio: 16000, // 160%
    stabilityFee: 250, // 2.5%
    debtCeiling: 20000000000000000000000000n, // 20M tokens
    debtFloor: 2000000000000000000000n, // 2000 tokens
    oracleAddress: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
    oraclePriceFeedId: "BTC-USD",
    priceValidityPeriod: 3600,
    chainId: 1,
    network: "mainnet",
    createdAt: 1703030400,
    updatedAt: 1703116800,
  },
  {
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    assetType: "erc20",
    isActive: true,
    liquidationThreshold: 7000, // 70%
    liquidationPenalty: 1500, // 15%
    maxLoanToValue: 6500, // 65%
    minCollateralRatio: 18000, // 180%
    stabilityFee: 400, // 4%
    debtCeiling: 10000000000000000000000000n, // 10M tokens
    debtFloor: 500000000000000000000n, // 500 tokens
    oracleAddress: "0x2c1d072e956affc0d435cb7ac38ef18d24d9127c",
    oraclePriceFeedId: "LINK-USD",
    priceValidityPeriod: 3600,
    chainId: 1,
    network: "mainnet",
    createdAt: 1703030400,
    updatedAt: 1703116800,
  },
  {
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
    assetType: "erc20",
    isActive: true,
    liquidationThreshold: 6500, // 65%
    liquidationPenalty: 1800, // 18%
    maxLoanToValue: 6000, // 60%
    minCollateralRatio: 20000, // 200%
    stabilityFee: 500, // 5%
    debtCeiling: 5000000000000000000000000n, // 5M tokens
    debtFloor: 200000000000000000000n, // 200 tokens
    oracleAddress: "0x553303d460ee0afb37edff9be42922d8ff63220e",
    oraclePriceFeedId: "UNI-USD",
    priceValidityPeriod: 3600,
    chainId: 1,
    network: "mainnet",
    createdAt: 1703030400,
    updatedAt: 1703116800,
  },
  {
    // Inactive asset for testing
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    assetType: "erc20",
    isActive: false, // Disabled asset
    liquidationThreshold: 9000, // 90%
    liquidationPenalty: 500, // 5%
    maxLoanToValue: 8500, // 85%
    minCollateralRatio: 11000, // 110%
    stabilityFee: 100, // 1%
    debtCeiling: 0n, // No debt allowed
    debtFloor: 0n,
    oracleAddress: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
    oraclePriceFeedId: "USDT-USD",
    priceValidityPeriod: 1800, // 30 minutes
    chainId: 1,
    network: "mainnet",
    createdAt: 1703030400,
    updatedAt: 1703116800,
  },
];

/**
 * Sample collateral balances
 */
export const sampleCollateralBalances: CollateralBalance[] = [
  {
    assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
    owner: "0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c",
    lockedAmount: 5000000000000000000n, // 5 ETH
    availableAmount: 1000000000000000000n, // 1 ETH
    totalAmount: 6000000000000000000n, // 6 ETH
    currentPrice: 1600,
    totalValue: 9600,
    utilizationRatio: 83.33,
    healthFactor: 1.67,
    riskLevel: "low",
    lastUpdated: 1703116800,
    priceLastUpdated: 1703116700,
  },
  {
    assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    owner: "0x8ba1f109551bd432803012645hac136c0c8d2d57",
    lockedAmount: 20000000n, // 0.2 BTC
    availableAmount: 5000000n, // 0.05 BTC
    totalAmount: 25000000n, // 0.25 BTC
    currentPrice: 42000,
    totalValue: 10500,
    utilizationRatio: 80.0,
    healthFactor: 1.25,
    riskLevel: "medium",
    lastUpdated: 1703116800,
    priceLastUpdated: 1703116650,
  },
  {
    assetAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    owner: "0x5aae7ac79bf69b4e7c3d90b6f7c7f7c7c7c7c7c7",
    lockedAmount: 2000000000000000000000n, // 2000 LINK
    availableAmount: 0n,
    totalAmount: 2000000000000000000000n,
    currentPrice: 14.5,
    totalValue: 29000,
    utilizationRatio: 100.0,
    healthFactor: 0.95,
    riskLevel: "critical",
    lastUpdated: 1703116800,
    priceLastUpdated: 1703116600,
  },
];

/**
 * Sample collateral deposits
 */
export const sampleCollateralDeposits: CollateralDeposit[] = [
  {
    cdpId: "cdp_001",
    assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
    amount: 2000000000000000000n, // 2 ETH
    depositor: "0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c",
    transactionHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    blockNumber: 18500000,
    gasUsed: 150000,
    minHealthFactor: 1.1,
    slippageTolerance: 100,
    metadata: {
      purpose: "health_factor_improvement",
      source: "user_wallet",
    },
    timestamp: 1703116800,
  },
  {
    cdpId: "cdp_002",
    assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    amount: 10000000n, // 0.1 BTC
    depositor: "0x8ba1f109551bd432803012645hac136c0c8d2d57",
    transactionHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    blockNumber: 18500001,
    gasUsed: 180000,
    minHealthFactor: 1.2,
    slippageTolerance: 200,
    timestamp: 1703117100,
  },
];

/**
 * Sample collateral withdrawals
 */
export const sampleCollateralWithdrawals: CollateralWithdrawal[] = [
  {
    cdpId: "cdp_001",
    assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
    amount: 500000000000000000n, // 0.5 ETH
    withdrawer: "0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c",
    enforceMinCollateralRatio: true,
    minHealthFactorAfterWithdrawal: 1.2,
    transactionHash:
      "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    blockNumber: 18500002,
    gasUsed: 140000,
    metadata: {
      purpose: "profit_taking",
      destination: "user_wallet",
    },
    timestamp: 1703117400,
  },
  {
    cdpId: "cdp_002",
    assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    amount: 5000000n, // 0.05 BTC
    withdrawer: "0x8ba1f109551bd432803012645hac136c0c8d2d57",
    enforceMinCollateralRatio: true,
    minHealthFactorAfterWithdrawal: 1.3,
    transactionHash:
      "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
    blockNumber: 18500003,
    gasUsed: 160000,
    timestamp: 1703117700,
  },
];

/**
 * Sample price updates
 */
export const samplePriceUpdates: CollateralPriceUpdate[] = [
  {
    assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
    newPrice: 1650,
    previousPrice: 1600,
    priceChange: 50,
    priceChangePercent: 3.125,
    oracleAddress: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    oracleRound: 18446744073709562345,
    confidence: 99.8,
    isValidPrice: true,
    priceDeviation: 2.1,
    timestamp: 1703116800,
    oracleTimestamp: 1703116795,
  },
  {
    assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    newPrice: 41500,
    previousPrice: 42000,
    priceChange: -500,
    priceChangePercent: -1.19,
    oracleAddress: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
    oracleRound: 18446744073709562346,
    confidence: 99.5,
    isValidPrice: true,
    priceDeviation: 1.8,
    timestamp: 1703116850,
    oracleTimestamp: 1703116845,
  },
  {
    assetAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    newPrice: 13.8,
    previousPrice: 14.5,
    priceChange: -0.7,
    priceChangePercent: -4.83,
    oracleAddress: "0x2c1d072e956affc0d435cb7ac38ef18d24d9127c",
    oracleRound: 18446744073709562347,
    confidence: 98.9,
    isValidPrice: true,
    priceDeviation: 3.2,
    timestamp: 1703116900,
    oracleTimestamp: 1703116895,
  },
];

/**
 * Sample risk assessments
 */
export const sampleRiskAssessments: CollateralRiskAssessment[] = [
  {
    assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
    assessmentId: "risk_eth_2023_12",
    volatility: 75.5,
    liquidityScore: 95,
    marketCapRank: 2,
    averageDailyVolume: 15000000000,
    priceVolatility30d: 68.2,
    priceVolatility90d: 72.8,
    maxDrawdown: 45.3,
    correlationWithBtc: 0.75,
    correlationWithEth: 1.0,
    overallRiskScore: 25,
    riskLevel: "low",
    recommendedLtv: 7500,
    assessedBy: "NYXUSD Risk Committee",
    assessmentDate: 1703030400,
    validUntil: 1705622400, // 2024-01-19
    methodology: "VaR-based assessment with 30/90 day volatility analysis",
    externalRatings: [
      {
        provider: "CryptoRiskRating",
        rating: "A+",
        ratingDate: 1703020000,
      },
      {
        provider: "DeFiPulse",
        rating: "Excellent",
        ratingDate: 1703010000,
      },
    ],
  },
  {
    assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    assessmentId: "risk_wbtc_2023_12",
    volatility: 70.2,
    liquidityScore: 88,
    marketCapRank: 1,
    averageDailyVolume: 25000000000,
    priceVolatility30d: 65.8,
    priceVolatility90d: 69.1,
    maxDrawdown: 42.1,
    correlationWithBtc: 0.98,
    correlationWithEth: 0.75,
    overallRiskScore: 30,
    riskLevel: "low",
    recommendedLtv: 7000,
    assessedBy: "NYXUSD Risk Committee",
    assessmentDate: 1703030400,
    validUntil: 1705622400,
    methodology: "VaR-based assessment with 30/90 day volatility analysis",
  },
  {
    assetAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    assessmentId: "risk_link_2023_12",
    volatility: 85.7,
    liquidityScore: 75,
    marketCapRank: 12,
    averageDailyVolume: 500000000,
    priceVolatility30d: 82.3,
    priceVolatility90d: 88.9,
    maxDrawdown: 65.4,
    correlationWithBtc: 0.65,
    correlationWithEth: 0.7,
    overallRiskScore: 55,
    riskLevel: "medium",
    recommendedLtv: 6500,
    assessedBy: "NYXUSD Risk Committee",
    assessmentDate: 1703030400,
    validUntil: 1705622400,
    methodology: "VaR-based assessment with 30/90 day volatility analysis",
  },
];

/**
 * Sample collateral portfolios
 */
export const sampleCollateralPortfolios: CollateralPortfolio[] = [
  {
    owner: "0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c",
    portfolioId: "portfolio_001",
    collateralAssets: [
      {
        assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
        amount: 6000000000000000000n, // 6 ETH
        value: 9600,
        weight: 60,
        allocationTarget: 55,
      },
      {
        assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        amount: 15000000n, // 0.15 BTC
        value: 6300,
        weight: 40,
        allocationTarget: 45,
      },
    ],
    totalValue: 15900,
    averageHealthFactor: 1.67,
    portfolioRiskScore: 35,
    diversificationScore: 75,
    totalReturn: 1250.5,
    totalReturnPercent: 8.5,
    volatility: 65.2,
    sharpeRatio: 1.35,
    needsRebalancing: true,
    lastRebalanced: 1702944000, // 2023-12-19
    rebalancingThreshold: 5,
    createdAt: 1702857600, // 2023-12-18
    lastUpdated: 1703116800,
  },
];

/**
 * Edge case scenarios
 */
export const edgeCaseScenarios = {
  /**
   * Extreme price volatility
   */
  extremeVolatility: {
    priceUpdates: [
      {
        assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
        newPrice: 800, // 50% drop
        previousPrice: 1600,
        priceChange: -800,
        priceChangePercent: -50,
        oracleAddress: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
        oracleRound: 18446744073709562400,
        confidence: 95.0,
        isValidPrice: true,
        priceDeviation: 15.5,
        timestamp: 1703120000,
        oracleTimestamp: 1703119995,
      },
      {
        assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        newPrice: 21000, // 50% drop
        previousPrice: 42000,
        priceChange: -21000,
        priceChangePercent: -50,
        oracleAddress: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
        oracleRound: 18446744073709562401,
        confidence: 95.0,
        isValidPrice: true,
        priceDeviation: 18.2,
        timestamp: 1703120050,
        oracleTimestamp: 1703120045,
      },
    ],
  },

  /**
   * Oracle failure scenarios
   */
  oracleFailures: [
    {
      assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
      newPrice: 0, // Invalid price
      previousPrice: 1600,
      priceChange: -1600,
      priceChangePercent: -100,
      oracleAddress: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
      oracleRound: 18446744073709562500,
      confidence: 0,
      isValidPrice: false,
      priceDeviation: 100,
      timestamp: 1703125000,
      oracleTimestamp: 1703124980,
    },
    {
      assetAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      newPrice: 1000000, // Unrealistic price
      previousPrice: 42000,
      priceChange: 958000,
      priceChangePercent: 2280.95,
      oracleAddress: "0xf4030086522a5beea4988f8ca5b36dbc97bee88c",
      oracleRound: 18446744073709562501,
      confidence: 45.0,
      isValidPrice: false,
      priceDeviation: 95.8,
      timestamp: 1703125100,
      oracleTimestamp: 1703125080,
    },
  ],

  /**
   * Minimal collateral amounts
   */
  minimalAmounts: {
    balance: {
      assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
      owner: "0x0000000000000000000000000000000000000001",
      lockedAmount: 1n, // Minimal amount
      availableAmount: 0n,
      totalAmount: 1n,
      currentPrice: 1600,
      totalValue: 0.0000000000000016,
      utilizationRatio: 100.0,
      healthFactor: 0.01,
      riskLevel: "critical" as const,
      lastUpdated: 1703116800,
      priceLastUpdated: 1703116700,
    },
  },

  /**
   * Maximum collateral amounts
   */
  maximalAmounts: {
    balance: {
      assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
      owner: "0xffffffffffffffffffffffffffffffffffffffff",
      lockedAmount: 1000000000000000000000000n, // 1M ETH
      availableAmount: 100000000000000000000000n, // 100K ETH
      totalAmount: 1100000000000000000000000n, // 1.1M ETH
      currentPrice: 1600,
      totalValue: 1760000000000,
      utilizationRatio: 90.91,
      healthFactor: 2.5,
      riskLevel: "low" as const,
      lastUpdated: 1703116800,
      priceLastUpdated: 1703116700,
    },
  },
};

/**
 * Error scenarios
 */
export const errorScenarios = {
  /**
   * Invalid asset configurations
   */
  invalidAssets: [
    {
      address: "", // Empty address
      symbol: "INVALID",
      name: "Invalid Asset",
      decimals: 18,
      assetType: "erc20",
      isActive: true,
    },
    {
      address: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
      symbol: "", // Empty symbol
      name: "Invalid Asset",
      decimals: 18,
      assetType: "erc20",
      isActive: true,
    },
    {
      address: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
      symbol: "INVALID",
      name: "Invalid Asset",
      decimals: 25, // Invalid decimals
      assetType: "erc20",
      isActive: true,
    },
  ],

  /**
   * Invalid operations
   */
  invalidOperations: [
    {
      type: "deposit",
      error: "Negative amount",
      data: {
        cdpId: "cdp_001",
        assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
        amount: -1000000000000000000n,
      },
    },
    {
      type: "withdrawal",
      error: "Insufficient balance",
      data: {
        cdpId: "cdp_001",
        assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
        amount: 10000000000000000000000n, // More than available
      },
    },
    {
      type: "price_update",
      error: "Stale oracle data",
      data: {
        assetAddress: "0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743",
        timestamp: 1703030400, // Old timestamp
        oracleTimestamp: 1703020000, // Very old oracle timestamp
      },
    },
  ],
};

/**
 * Export all collateral fixtures
 */
export const CollateralFixtures = {
  samples: {
    assets: sampleCollateralAssets,
    balances: sampleCollateralBalances,
    deposits: sampleCollateralDeposits,
    withdrawals: sampleCollateralWithdrawals,
    priceUpdates: samplePriceUpdates,
    riskAssessments: sampleRiskAssessments,
    portfolios: sampleCollateralPortfolios,
  },
  edgeCases: edgeCaseScenarios,
  errors: errorScenarios,
};
