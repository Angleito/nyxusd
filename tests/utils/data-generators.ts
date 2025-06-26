/**
 * Data generators for testing NYXUSD types
 */

import * as fc from 'fast-check';
import {
  Address,
  Hash,
  Timestamp,
  BasisPoints,
  Percentage,
  Price,
  Amount,
  HealthFactor,
  RiskLevel,
  AssetType,
  Network,
  CDPStatus,
} from '@nyxusd/validators';

/**
 * Basic type generators
 */
export const BasicGenerators = {
  /**
   * Generate valid Ethereum addresses
   */
  address: (): fc.Arbitrary<Address> =>
    fc.hexaString({ minLength: 40, maxLength: 40 })
      .map(hex => `0x${hex}` as Address),

  /**
   * Generate valid transaction hashes
   */
  hash: (): fc.Arbitrary<Hash> =>
    fc.hexaString({ minLength: 64, maxLength: 64 })
      .map(hex => `0x${hex}` as Hash),

  /**
   * Generate valid timestamps
   */
  timestamp: (): fc.Arbitrary<Timestamp> =>
    fc.integer({ min: 1640995200, max: 4102444800 }) as fc.Arbitrary<Timestamp>,

  /**
   * Generate basis points (0-10000)
   */
  basisPoints: (): fc.Arbitrary<BasisPoints> =>
    fc.integer({ min: 0, max: 10000 }) as fc.Arbitrary<BasisPoints>,

  /**
   * Generate percentages (0-100)
   */
  percentage: (): fc.Arbitrary<Percentage> =>
    fc.float({ min: 0, max: 100 }) as fc.Arbitrary<Percentage>,

  /**
   * Generate positive prices
   */
  price: (): fc.Arbitrary<Price> =>
    fc.float({ min: 0.000001, max: 1000000, noNaN: true })
      .map(p => Math.round(p * 1000000) / 1000000) as fc.Arbitrary<Price>,

  /**
   * Generate positive amounts as BigInt
   */
  amount: (): fc.Arbitrary<Amount> =>
    fc.bigUint64Array(1)
      .map(arr => arr[0])
      .filter(n => n > 0n) as fc.Arbitrary<Amount>,

  /**
   * Generate health factors
   */
  healthFactor: (): fc.Arbitrary<HealthFactor> =>
    fc.float({ min: 0, max: 10, noNaN: true }) as fc.Arbitrary<HealthFactor>,

  /**
   * Generate risk levels
   */
  riskLevel: (): fc.Arbitrary<RiskLevel> =>
    fc.constantFrom('low', 'medium', 'high', 'critical') as fc.Arbitrary<RiskLevel>,

  /**
   * Generate asset types
   */
  assetType: (): fc.Arbitrary<AssetType> =>
    fc.constantFrom('native', 'erc20', 'wrapped', 'synthetic') as fc.Arbitrary<AssetType>,

  /**
   * Generate networks
   */
  network: (): fc.Arbitrary<Network> =>
    fc.constantFrom('mainnet', 'testnet', 'devnet', 'local') as fc.Arbitrary<Network>,

  /**
   * Generate CDP statuses
   */
  cdpStatus: (): fc.Arbitrary<CDPStatus> =>
    fc.constantFrom('active', 'inactive', 'liquidating', 'liquidated', 'closed', 'frozen') as fc.Arbitrary<CDPStatus>,

  /**
   * Generate UUID strings
   */
  uuid: (): fc.Arbitrary<string> =>
    fc.uuid(),

  /**
   * Generate metadata objects
   */
  metadata: (): fc.Arbitrary<Record<string, unknown>> =>
    fc.dictionary(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.oneof(
        fc.string(),
        fc.integer(),
        fc.float(),
        fc.boolean(),
        fc.constant(null)
      )
    ),
};

/**
 * Financial data generators
 */
export const FinancialGenerators = {
  /**
   * Generate realistic collateralization ratios (120% - 300%)
   */
  collateralizationRatio: (): fc.Arbitrary<Percentage> =>
    fc.float({ min: 120, max: 300 }) as fc.Arbitrary<Percentage>,

  /**
   * Generate realistic stability fees (0-20% APR)
   */
  stabilityFee: (): fc.Arbitrary<BasisPoints> =>
    fc.integer({ min: 0, max: 2000 }) as fc.Arbitrary<BasisPoints>,

  /**
   * Generate realistic liquidation thresholds (75-90%)
   */
  liquidationThreshold: (): fc.Arbitrary<BasisPoints> =>
    fc.integer({ min: 7500, max: 9000 }) as fc.Arbitrary<BasisPoints>,

  /**
   * Generate realistic price movements (-50% to +100%)
   */
  priceChange: (): fc.Arbitrary<number> =>
    fc.float({ min: -0.5, max: 1.0 }),

  /**
   * Generate correlated prices for stress testing
   */
  correlatedPrices: (basePrice: number, correlation: number): fc.Arbitrary<number[]> =>
    fc.array(
      fc.float({ min: basePrice * 0.5, max: basePrice * 2 }),
      { minLength: 2, maxLength: 10 }
    ),

  /**
   * Generate realistic debt amounts
   */
  debtAmount: (): fc.Arbitrary<Amount> =>
    fc.bigInt({ min: 1000n, max: 10000000n }) as fc.Arbitrary<Amount>,

  /**
   * Generate realistic collateral amounts
   */
  collateralAmount: (): fc.Arbitrary<Amount> =>
    fc.bigInt({ min: 100n, max: 100000000n }) as fc.Arbitrary<Amount>,
};

/**
 * CDP-specific generators
 */
export const CDPGenerators = {
  /**
   * Generate valid CDP configuration
   */
  cdpConfig: () =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 32 }),
      owner: BasicGenerators.address(),
      status: BasicGenerators.cdpStatus(),
      collateralValue: fc.float({ min: 1000, max: 10000000 }),
      debtAmount: FinancialGenerators.debtAmount(),
      collateralizationRatio: FinancialGenerators.collateralizationRatio(),
      healthFactor: BasicGenerators.healthFactor(),
      liquidationPrice: BasicGenerators.price(),
      riskLevel: BasicGenerators.riskLevel(),
      stabilityFee: FinancialGenerators.stabilityFee(),
      createdAt: BasicGenerators.timestamp(),
      lastUpdated: BasicGenerators.timestamp(),
    }),

  /**
   * Generate collateral asset configuration
   */
  collateralAssetConfig: () =>
    fc.record({
      address: BasicGenerators.address(),
      symbol: fc.string({ minLength: 1, maxLength: 10 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      decimals: fc.integer({ min: 0, max: 18 }),
      assetType: BasicGenerators.assetType(),
      isActive: fc.boolean(),
      liquidationThreshold: FinancialGenerators.liquidationThreshold(),
      liquidationPenalty: fc.integer({ min: 500, max: 2000 }),
      maxLoanToValue: fc.integer({ min: 6000, max: 8000 }),
      minCollateralRatio: fc.integer({ min: 12000, max: 20000 }),
      stabilityFee: FinancialGenerators.stabilityFee(),
      debtCeiling: fc.bigInt({ min: 1000000n, max: 100000000n }),
      debtFloor: fc.bigInt({ min: 100n, max: 10000n }),
      oracleAddress: BasicGenerators.address(),
      oraclePriceFeedId: fc.string({ minLength: 1, maxLength: 32 }),
      priceValidityPeriod: fc.integer({ min: 300, max: 3600 }),
      chainId: fc.integer({ min: 1, max: 999999 }),
      network: BasicGenerators.network(),
      createdAt: BasicGenerators.timestamp(),
      updatedAt: BasicGenerators.timestamp(),
    }),

  /**
   * Generate CDP operations
   */
  cdpOperation: () =>
    fc.record({
      cdpId: fc.string({ minLength: 1, maxLength: 32 }),
      operation: fc.constantFrom('deposit', 'withdraw', 'mint', 'repay'),
      amount: FinancialGenerators.collateralAmount(),
      initiator: BasicGenerators.address(),
      timestamp: BasicGenerators.timestamp(),
      transactionHash: BasicGenerators.hash(),
    }),
};

/**
 * Edge case generators
 */
export const EdgeCaseGenerators = {
  /**
   * Generate extreme but valid values
   */
  extremeValues: {
    /**
     * Very small amounts
     */
    smallAmount: (): fc.Arbitrary<Amount> =>
      fc.constantFrom(1n, 2n, 10n, 100n) as fc.Arbitrary<Amount>,

    /**
     * Very large amounts
     */
    largeAmount: (): fc.Arbitrary<Amount> =>
      fc.bigInt({ min: 10n ** 18n, max: 10n ** 30n }) as fc.Arbitrary<Amount>,

    /**
     * Near-liquidation health factors
     */
    criticalHealthFactor: (): fc.Arbitrary<HealthFactor> =>
      fc.float({ min: 0.9, max: 1.1 }) as fc.Arbitrary<HealthFactor>,

    /**
     * Extreme price volatility
     */
    volatilePrice: (basePrice: number): fc.Arbitrary<Price> =>
      fc.float({ 
        min: basePrice * 0.01, 
        max: basePrice * 100 
      }) as fc.Arbitrary<Price>,
  },

  /**
   * Generate boundary values
   */
  boundaryValues: {
    /**
     * Minimum valid values
     */
    minimumValues: () =>
      fc.record({
        amount: fc.constant(1n),
        price: fc.constant(0.000001),
        percentage: fc.constant(0),
        basisPoints: fc.constant(0),
        healthFactor: fc.constant(0),
      }),

    /**
     * Maximum valid values
     */
    maximumValues: () =>
      fc.record({
        percentage: fc.constant(100),
        basisPoints: fc.constant(10000),
        price: fc.constant(1000000),
      }),
  },

  /**
   * Generate invalid inputs for negative testing
   */
  invalidInputs: {
    /**
     * Invalid addresses
     */
    invalidAddress: (): fc.Arbitrary<string> =>
      fc.oneof(
        fc.constant(''),
        fc.constant('0x'),
        fc.string({ minLength: 1, maxLength: 39 }),
        fc.string({ minLength: 43, maxLength: 100 }),
        fc.string().filter(s => !s.startsWith('0x'))
      ),

    /**
     * Invalid amounts
     */
    invalidAmount: (): fc.Arbitrary<bigint> =>
      fc.oneof(
        fc.constant(0n),
        fc.constant(-1n),
        fc.bigInt({ min: -1000n, max: -1n })
      ),

    /**
     * Invalid percentages
     */
    invalidPercentage: (): fc.Arbitrary<number> =>
      fc.oneof(
        fc.float({ min: -100, max: -0.1 }),
        fc.float({ min: 100.1, max: 1000 }),
        fc.constant(Infinity),
        fc.constant(-Infinity),
        fc.constant(NaN)
      ),
  },
};

/**
 * Constraint generators for property testing
 */
export const ConstraintGenerators = {
  /**
   * Generate values satisfying mathematical invariants
   */
  satisfyingInvariants: {
    /**
     * Collateral value > debt value for healthy CDPs
     */
    healthyCDP: () =>
      fc.tuple(
        fc.float({ min: 1000, max: 1000000 }), // collateral value
        fc.float({ min: 1.2, max: 5.0 }) // collateralization ratio
      ).map(([collateralValue, ratio]) => ({
        collateralValue,
        debtValue: collateralValue / ratio,
        healthFactor: ratio,
      })),

    /**
     * Price movements preserving relative order
     */
    orderedPrices: () =>
      fc.array(fc.float({ min: 1, max: 1000 }), { minLength: 2, maxLength: 10 })
        .map(prices => prices.sort((a, b) => a - b)),

    /**
     * Liquidation scenarios
     */
    liquidationScenario: () =>
      fc.record({
        initialPrice: fc.float({ min: 100, max: 1000 }),
        priceDropPercent: fc.float({ min: 0.1, max: 0.8 }),
        liquidationThreshold: fc.integer({ min: 7500, max: 9000 }),
      }).map(({ initialPrice, priceDropPercent, liquidationThreshold }) => ({
        initialPrice,
        liquidationPrice: initialPrice * (1 - priceDropPercent),
        liquidationThreshold: liquidationThreshold / 10000,
        shouldLiquidate: priceDropPercent > (1 - liquidationThreshold / 10000),
      })),
  },
};

/**
 * Compose generators for complex scenarios
 */
export const ScenarioGenerators = {
  /**
   * Generate multi-asset portfolio
   */
  multiAssetPortfolio: (numAssets: number = 3) =>
    fc.array(CDPGenerators.collateralAssetConfig(), { 
      minLength: numAssets, 
      maxLength: numAssets 
    }),

  /**
   * Generate time series of price updates
   */
  priceTimeSeries: (length: number = 10) =>
    fc.array(
      fc.record({
        timestamp: BasicGenerators.timestamp(),
        price: BasicGenerators.price(),
      }),
      { minLength: length, maxLength: length }
    ).map(series => series.sort((a, b) => a.timestamp - b.timestamp)),

  /**
   * Generate market stress scenario
   */
  marketStressScenario: () =>
    fc.record({
      initialPrices: fc.array(BasicGenerators.price(), { minLength: 3, maxLength: 10 }),
      stressLevel: fc.constantFrom('mild', 'moderate', 'severe'),
      correlations: fc.array(fc.float({ min: -1, max: 1 }), { minLength: 3, maxLength: 10 }),
      duration: fc.integer({ min: 3600, max: 86400 }), // 1 hour to 1 day
    }),

  /**
   * Generate liquidation cascade scenario
   */
  liquidationCascade: () =>
    fc.record({
      cdps: fc.array(CDPGenerators.cdpConfig(), { minLength: 5, maxLength: 20 }),
      triggerPriceShock: fc.float({ min: 0.1, max: 0.5 }),
      marketDepth: fc.float({ min: 0.1, max: 1.0 }),
    }),
};

/**
 * Export all generators
 */
export const DataGenerators = {
  basic: BasicGenerators,
  financial: FinancialGenerators,
  cdp: CDPGenerators,
  edgeCase: EdgeCaseGenerators,
  constraint: ConstraintGenerators,
  scenario: ScenarioGenerators,
};

// Export fast-check for convenience
export { fc };