/**
 * CDP test fixtures and sample data
 */

import {
  CDP,
  CreateCDP,
  CDPCollateralUpdate,
  CDPDebtUpdate,
  CDPLiquidation,
  CDPPortfolio,
  CDPAnalytics,
  EnhancedCDP,
} from '@nyxusd/validators';

/**
 * Sample CDP configurations for testing
 */
export const sampleCDPs: CDP[] = [
  {
    id: 'cdp_001',
    owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    status: 'active',
    collateralValue: 10000,
    debtAmount: 6000n,
    availableCredit: 1000n,
    collateralizationRatio: 166.67,
    healthFactor: 1.67,
    liquidationPrice: 900,
    riskLevel: 'low',
    stabilityFee: 300, // 3%
    accruedFees: 50n,
    lastFeeUpdate: 1703030400, // 2023-12-20
    createdAt: 1703030400,
    lastUpdated: 1703116800, // 2023-12-21
  },
  {
    id: 'cdp_002',
    owner: '0x8ba1f109551bd432803012645hac136c0c8d2d57',
    status: 'active',
    collateralValue: 5000,
    debtAmount: 4000n,
    availableCredit: 0n,
    collateralizationRatio: 125,
    healthFactor: 1.25,
    liquidationPrice: 1000,
    riskLevel: 'medium',
    stabilityFee: 400, // 4%
    accruedFees: 100n,
    lastFeeUpdate: 1703030400,
    createdAt: 1703030400,
    lastUpdated: 1703116800,
  },
  {
    id: 'cdp_003',
    owner: '0x5aae7ac79bf69b4e7c3d90b6f7c7f7c7c7c7c7c7',
    status: 'liquidating',
    collateralValue: 3000,
    debtAmount: 2800n,
    availableCredit: 0n,
    collateralizationRatio: 107.14,
    healthFactor: 0.95,
    liquidationPrice: 1050,
    riskLevel: 'critical',
    stabilityFee: 500, // 5%
    accruedFees: 200n,
    lastFeeUpdate: 1703030400,
    createdAt: 1703030400,
    lastUpdated: 1703116800,
  },
  {
    id: 'cdp_004',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'closed',
    collateralValue: 0,
    debtAmount: 0n,
    availableCredit: 0n,
    collateralizationRatio: 0,
    healthFactor: 0,
    liquidationPrice: 0,
    riskLevel: 'low',
    stabilityFee: 250,
    accruedFees: 0n,
    lastFeeUpdate: 1703203200, // 2023-12-22
    createdAt: 1703030400,
    lastUpdated: 1703203200,
  },
];

/**
 * Sample CDP creation requests
 */
export const sampleCreateCDPs: CreateCDP[] = [
  {
    owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    initialCollateral: {
      assetAddress: '0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743',
      amount: 1000000000000000000n, // 1 ETH
    },
    initialDebt: 800000000000000000000n, // 800 USD
    minCollateralizationRatio: 15000, // 150%
    maxLeverageRatio: 3,
    slippageTolerance: 100, // 1%
    metadata: {
      purpose: 'liquidity_provision',
      referrer: '0x1234567890abcdef1234567890abcdef12345678',
    },
  },
  {
    owner: '0x8ba1f109551bd432803012645hac136c0c8d2d57',
    initialCollateral: {
      assetAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      amount: 50000000n, // 0.5 BTC
    },
    initialDebt: 8000000000000000000000n, // 8000 USD
    minCollateralizationRatio: 18000, // 180%
    maxLeverageRatio: 2,
    slippageTolerance: 200, // 2%
  },
];

/**
 * Sample collateral operations
 */
export const sampleCollateralUpdates: CDPCollateralUpdate[] = [
  {
    cdpId: 'cdp_001',
    operation: 'deposit',
    assetAddress: '0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743',
    amount: 500000000000000000n, // 0.5 ETH
    enforceHealthFactor: true,
    minHealthFactorAfter: 1.2,
    initiator: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 18500000,
    gasUsed: 150000,
    timestamp: 1703116800,
  },
  {
    cdpId: 'cdp_002',
    operation: 'withdraw',
    assetAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    amount: 10000000n, // 0.1 BTC
    enforceHealthFactor: true,
    minHealthFactorAfter: 1.3,
    initiator: '0x8ba1f109551bd432803012645hac136c0c8d2d57',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 18500001,
    gasUsed: 180000,
    timestamp: 1703117100,
  },
];

/**
 * Sample debt operations
 */
export const sampleDebtUpdates: CDPDebtUpdate[] = [
  {
    cdpId: 'cdp_001',
    operation: 'mint',
    amount: 1000000000000000000000n, // 1000 USD
    enforceCollateralizationRatio: true,
    minCollateralizationRatioAfter: 15000,
    includeAccruedFees: true,
    maxFeeAmount: 50000000000000000000n, // 50 USD max fees
    initiator: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    blockNumber: 18500002,
    gasUsed: 200000,
    timestamp: 1703117400,
  },
  {
    cdpId: 'cdp_002',
    operation: 'repay',
    amount: 500000000000000000000n, // 500 USD
    enforceCollateralizationRatio: false,
    includeAccruedFees: true,
    initiator: '0x8ba1f109551bd432803012645hac136c0c8d2d57',
    transactionHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    blockNumber: 18500003,
    gasUsed: 120000,
    timestamp: 1703117700,
  },
];

/**
 * Sample liquidation scenarios
 */
export const sampleLiquidations: CDPLiquidation[] = [
  {
    cdpId: 'cdp_003',
    liquidator: '0x9999999999999999999999999999999999999999',
    cdpOwner: '0x5aae7ac79bf69b4e7c3d90b6f7c7f7c7c7c7c7c7',
    triggerReason: 'health_factor_below_threshold',
    healthFactorAtLiquidation: 0.95,
    totalCollateralValue: 3000,
    totalDebtAmount: 2800n,
    liquidationPenalty: 280n, // 10%
    liquidatorReward: 140n, // 5%
    collateralLiquidated: [
      {
        assetAddress: '0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743',
        amount: 2000000000000000000n, // 2 ETH
        price: 1500,
        value: 3000,
      },
    ],
    remainingCollateral: 0n,
    remainingDebt: 0n,
    finalStatus: 'liquidated',
    transactionHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    blockNumber: 18500004,
    gasUsed: 350000,
    timestamp: 1703118000,
    liquidationStarted: 1703117900,
    liquidationCompleted: 1703118000,
  },
];

/**
 * Sample CDP portfolios
 */
export const samplePortfolios: CDPPortfolio[] = [
  {
    owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    cdpIds: ['cdp_001', 'cdp_005', 'cdp_006'],
    totalCollateralValue: 25000,
    totalDebtAmount: 15000n,
    totalAvailableCredit: 3000n,
    averageHealthFactor: 1.67,
    portfolioRiskLevel: 'low',
    collateralAssetDistribution: [
      {
        assetAddress: '0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743',
        value: 15000,
        percentage: 60,
      },
      {
        assetAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        value: 10000,
        percentage: 40,
      },
    ],
    totalReturn: 1250.5,
    totalFeesPaid: 750n,
    totalLiquidationLosses: 0n,
    aggregatedLiquidationPrice: 1100,
    worstCaseScenario: {
      priceShock: 40,
      affectedCDPs: 1,
      potentialLoss: 2500n,
    },
    lastUpdated: 1703116800,
  },
];

/**
 * Sample CDP analytics
 */
export const sampleAnalytics: CDPAnalytics[] = [
  {
    cdpId: 'cdp_001',
    analysisDate: 1703116800,
    profitAndLoss: {
      realizedPnL: 250.75,
      unrealizedPnL: 125.50,
      totalReturn: 376.25,
      totalReturnPercent: 3.76,
    },
    riskMetrics: {
      valueAtRisk: 500,
      expectedShortfall: 750,
      liquidationRisk: 5.2,
      timeToLiquidation: 48,
    },
    capitalEfficiency: {
      leverageRatio: 1.67,
      capitalUtilization: 85.5,
      costOfCapital: 350,
      returnOnEquity: 12.5,
    },
    historicalMetrics: {
      avgHealthFactor: 1.85,
      minHealthFactor: 1.45,
      maxLeverageUsed: 2.1,
      timeInDanger: 2.5,
      numberOfRebalances: 3,
    },
    recommendations: [
      {
        type: 'increase_collateral',
        priority: 'low',
        description: 'Consider adding collateral to improve health factor buffer',
        estimatedImpact: {
          healthFactorChange: 0.2,
          riskReduction: 10,
        },
      },
    ],
  },
];

/**
 * Enhanced CDP samples with full risk analysis
 */
export const sampleEnhancedCDPs: Partial<EnhancedCDP>[] = [
  {
    ...sampleCDPs[0],
    collateralAssets: [
      {
        assetAddress: '0xa0b86a33e6e4fa1e4ca98cc37ae6c9e7fab80743',
        owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
        lockedAmount: 5000000000000000000n, // 5 ETH
        availableAmount: 1000000000000000000n, // 1 ETH
        totalAmount: 6000000000000000000n, // 6 ETH
        currentPrice: 1600,
        totalValue: 9600,
        utilizationRatio: 83.33,
        healthFactor: 1.67,
        riskLevel: 'low',
        lastUpdated: 1703116800,
        priceLastUpdated: 1703116700,
      },
    ],
    advancedRiskMetrics: {
      liquidationDistance: 25.5,
      stressTestResults: {
        mild: {
          priceShock: 10,
          resultingHealthFactor: 1.45,
        },
        moderate: {
          priceShock: 25,
          resultingHealthFactor: 1.15,
        },
        severe: {
          priceShock: 40,
          resultingHealthFactor: 0.85,
        },
      },
      correlationRisk: 0.65,
      concentrationRisk: 0.75,
    },
    performance: {
      ageInDays: 30,
      totalFeesGenerated: 150n,
      totalCollateralAdded: 2000000000000000000n, // 2 ETH
      totalDebtMinted: 8000000000000000000000n, // 8000 USD
      netPosition: 325.75,
    },
    optimizationSuggestions: [
      {
        suggestion: 'Diversify collateral across multiple assets',
        expectedBenefit: 'Reduce concentration risk by 30%',
        risk: 'low',
        implementationCost: 50000000000000000000n, // 50 USD gas costs
      },
      {
        suggestion: 'Increase collateral buffer during high volatility',
        expectedBenefit: 'Reduce liquidation risk by 50%',
        risk: 'low',
      },
    ],
  },
];

/**
 * Edge case and stress test scenarios
 */
export const edgeCaseScenarios = {
  /**
   * Minimal viable CDP
   */
  minimalCDP: {
    id: 'cdp_minimal',
    owner: '0x0000000000000000000000000000000000000001',
    status: 'active' as const,
    collateralValue: 150, // Just above minimum
    debtAmount: 100n,
    availableCredit: 0n,
    collateralizationRatio: 150,
    healthFactor: 1.0,
    liquidationPrice: 100,
    riskLevel: 'critical' as const,
    stabilityFee: 0,
    accruedFees: 0n,
    lastFeeUpdate: 1703030400,
    createdAt: 1703030400,
    lastUpdated: 1703030400,
  },

  /**
   * Maximum scale CDP
   */
  maximalCDP: {
    id: 'cdp_maximal',
    owner: '0xffffffffffffffffffffffffffffffffffffffff',
    status: 'active' as const,
    collateralValue: 100000000, // 100M USD
    debtAmount: 50000000000000000000000000n, // 50M USD
    availableCredit: 10000000000000000000000000n, // 10M USD
    collateralizationRatio: 200,
    healthFactor: 2.0,
    liquidationPrice: 25000,
    riskLevel: 'low' as const,
    stabilityFee: 100, // 1%
    accruedFees: 1000000000000000000000n, // 1000 USD
    lastFeeUpdate: 1703030400,
    createdAt: 1703030400,
    lastUpdated: 1703116800,
  },

  /**
   * Zero debt CDP (collateral only)
   */
  zeroDebtCDP: {
    id: 'cdp_zero_debt',
    owner: '0x1111111111111111111111111111111111111111',
    status: 'active' as const,
    collateralValue: 5000,
    debtAmount: 0n,
    availableCredit: 0n,
    collateralizationRatio: Infinity,
    healthFactor: Infinity,
    liquidationPrice: 0,
    riskLevel: 'low' as const,
    stabilityFee: 0,
    accruedFees: 0n,
    lastFeeUpdate: 1703030400,
    createdAt: 1703030400,
    lastUpdated: 1703030400,
  },

  /**
   * Multi-asset collateral CDP
   */
  multiAssetCDP: {
    id: 'cdp_multi_asset',
    owner: '0x2222222222222222222222222222222222222222',
    status: 'active' as const,
    collateralValue: 20000,
    debtAmount: 12000n,
    availableCredit: 2000n,
    collateralizationRatio: 166.67,
    healthFactor: 1.67,
    liquidationPrice: 900,
    riskLevel: 'medium' as const,
    stabilityFee: 250,
    accruedFees: 75n,
    lastFeeUpdate: 1703030400,
    createdAt: 1703030400,
    lastUpdated: 1703116800,
    metadata: {
      collateralTypes: ['ETH', 'BTC', 'LINK', 'UNI'],
      diversificationScore: 85,
    },
  },
};

/**
 * Error scenarios for negative testing
 */
export const errorScenarios = {
  /**
   * Invalid CDP data
   */
  invalidCDPs: [
    {
      id: '', // Empty ID
      owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
      status: 'active',
      collateralValue: 10000,
      debtAmount: 6000n,
    },
    {
      id: 'cdp_invalid',
      owner: 'invalid_address', // Invalid address
      status: 'active',
      collateralValue: 10000,
      debtAmount: 6000n,
    },
    {
      id: 'cdp_negative',
      owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
      status: 'active',
      collateralValue: -1000, // Negative collateral
      debtAmount: 6000n,
    },
  ],

  /**
   * Liquidation failures
   */
  liquidationErrors: [
    {
      cdpId: 'nonexistent_cdp',
      reason: 'CDP not found',
    },
    {
      cdpId: 'cdp_001',
      reason: 'CDP not liquidatable (health factor > 1)',
    },
    {
      cdpId: 'cdp_closed',
      reason: 'CDP already closed',
    },
  ],
};

/**
 * Export all fixtures
 */
export const CDPFixtures = {
  samples: {
    cdps: sampleCDPs,
    createRequests: sampleCreateCDPs,
    collateralUpdates: sampleCollateralUpdates,
    debtUpdates: sampleDebtUpdates,
    liquidations: sampleLiquidations,
    portfolios: samplePortfolios,
    analytics: sampleAnalytics,
    enhanced: sampleEnhancedCDPs,
  },
  edgeCases: edgeCaseScenarios,
  errors: errorScenarios,
};