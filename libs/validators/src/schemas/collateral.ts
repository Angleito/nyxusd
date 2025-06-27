import { z } from "zod";
import {
  AddressSchema,
  BigIntSchema,
  AmountSchema,
  OptionalAmountSchema,
  PriceSchema,
  BasisPointsSchema,
  PercentageSchema,
  TimestampSchema,
  HashSchema,
  AssetTypeSchema,
  RiskLevelSchema,
  MetadataSchema,
  NetworkSchema,
  ChainIdSchema,
} from "./common.js";

/**
 * Collateral asset validation schemas
 */

// Collateral asset configuration
export const CollateralAssetConfigSchema = z.object({
  address: AddressSchema,
  symbol: z
    .string()
    .min(1, "Symbol cannot be empty")
    .max(10, "Symbol too long"),
  name: z.string().min(1, "Name cannot be empty").max(50, "Name too long"),
  decimals: z.number().int().min(0).max(18, "Invalid decimal places"),
  assetType: AssetTypeSchema,
  isActive: z.boolean(),

  // Risk parameters
  liquidationThreshold: BasisPointsSchema, // Basis points (e.g., 8000 = 80%)
  liquidationPenalty: BasisPointsSchema, // Basis points (e.g., 1000 = 10%)
  maxLoanToValue: BasisPointsSchema, // Basis points (e.g., 7500 = 75%)
  minCollateralRatio: BasisPointsSchema, // Basis points (e.g., 15000 = 150%)

  // Economic parameters
  stabilityFee: BasisPointsSchema, // Annual stability fee in basis points
  debtCeiling: BigIntSchema, // Maximum debt that can be backed by this collateral
  debtFloor: BigIntSchema, // Minimum debt position size

  // Oracle configuration
  oracleAddress: AddressSchema,
  oraclePriceFeedId: z.string().min(1, "Oracle price feed ID required"),
  priceValidityPeriod: z
    .number()
    .int()
    .positive("Price validity period must be positive"),

  // Network configuration
  chainId: ChainIdSchema,
  network: NetworkSchema,

  // Metadata
  metadata: MetadataSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

// Collateral balance and state
export const CollateralBalanceSchema = z.object({
  assetAddress: AddressSchema,
  owner: AddressSchema,

  // Balance information
  lockedAmount: AmountSchema,
  availableAmount: OptionalAmountSchema,
  totalAmount: AmountSchema,

  // Value information (in USD or base currency)
  currentPrice: PriceSchema,
  totalValue: z.number().nonnegative("Total value cannot be negative"),

  // Risk metrics
  utilizationRatio: PercentageSchema,
  healthFactor: z.number().nonnegative("Health factor cannot be negative"),
  riskLevel: RiskLevelSchema,

  // Timestamps
  lastUpdated: TimestampSchema,
  priceLastUpdated: TimestampSchema,
});

// Collateral operation schemas
export const CollateralDepositSchema = z.object({
  cdpId: z.string().min(1, "CDP ID cannot be empty"),
  assetAddress: AddressSchema,
  amount: AmountSchema,
  depositor: AddressSchema,

  // Transaction details
  transactionHash: HashSchema.optional(),
  blockNumber: z.number().int().positive().optional(),
  gasUsed: z.number().int().nonnegative().optional(),

  // Validation parameters
  minHealthFactor: z
    .number()
    .positive("Minimum health factor must be positive")
    .default(1.1),
  slippageTolerance: BasisPointsSchema.default(100), // 1% default

  // Metadata
  metadata: MetadataSchema.optional(),
  timestamp: TimestampSchema,
});

export const CollateralWithdrawalSchema = z.object({
  cdpId: z.string().min(1, "CDP ID cannot be empty"),
  assetAddress: AddressSchema,
  amount: AmountSchema,
  withdrawer: AddressSchema,

  // Validation parameters
  enforceMinCollateralRatio: z.boolean().default(true),
  minHealthFactorAfterWithdrawal: z
    .number()
    .positive("Minimum health factor must be positive")
    .default(1.2),

  // Transaction details
  transactionHash: HashSchema.optional(),
  blockNumber: z.number().int().positive().optional(),
  gasUsed: z.number().int().nonnegative().optional(),

  // Metadata
  metadata: MetadataSchema.optional(),
  timestamp: TimestampSchema,
});

// Collateral liquidation schemas
export const CollateralLiquidationSchema = z.object({
  cdpId: z.string().min(1, "CDP ID cannot be empty"),
  liquidator: AddressSchema,
  cdpOwner: AddressSchema,

  // Liquidation details
  collateralAsset: AddressSchema,
  collateralAmountLiquidated: AmountSchema,
  debtAmountRepaid: AmountSchema,
  liquidationPenalty: AmountSchema,

  // Pricing information
  collateralPrice: PriceSchema,
  liquidationPrice: PriceSchema,
  healthFactorBefore: z.number().nonnegative(),

  // Transaction details
  transactionHash: HashSchema,
  blockNumber: z.number().int().positive(),
  gasUsed: z.number().int().nonnegative(),

  // Timing
  timestamp: TimestampSchema,
  liquidationTriggeredAt: TimestampSchema,
});

// Collateral price feed and oracle schemas
export const CollateralPriceUpdateSchema = z.object({
  assetAddress: AddressSchema,
  newPrice: PriceSchema,
  previousPrice: PriceSchema.optional(),
  priceChange: z.number(), // Can be negative
  priceChangePercent: z.number(),

  // Oracle information
  oracleAddress: AddressSchema,
  oracleRound: z.number().int().positive(),
  confidence: PercentageSchema,

  // Validation
  isValidPrice: z.boolean(),
  priceDeviation: PercentageSchema.optional(),

  // Timing
  timestamp: TimestampSchema,
  oracleTimestamp: TimestampSchema,
});

// Collateral risk assessment
export const CollateralRiskAssessmentSchema = z.object({
  assetAddress: AddressSchema,
  assessmentId: z.string().min(1, "Assessment ID cannot be empty"),

  // Risk metrics
  volatility: PercentageSchema,
  liquidityScore: z.number().min(0).max(100),
  marketCapRank: z.number().int().positive().optional(),
  averageDailyVolume: z.number().nonnegative(),

  // Historical data
  priceVolatility30d: PercentageSchema,
  priceVolatility90d: PercentageSchema,
  maxDrawdown: PercentageSchema,

  // Correlation analysis
  correlationWithBtc: z.number().min(-1).max(1).optional(),
  correlationWithEth: z.number().min(-1).max(1).optional(),

  // Risk scoring
  overallRiskScore: z.number().min(0).max(100),
  riskLevel: RiskLevelSchema,
  recommendedLtv: BasisPointsSchema,

  // Assessment metadata
  assessedBy: z.string().min(1, "Assessor cannot be empty"),
  assessmentDate: TimestampSchema,
  validUntil: TimestampSchema,
  methodology: z.string().min(1, "Methodology cannot be empty"),

  // External ratings (optional)
  externalRatings: z
    .array(
      z.object({
        provider: z.string(),
        rating: z.string(),
        ratingDate: TimestampSchema,
      }),
    )
    .optional(),
});

// Collateral portfolio schemas
export const CollateralPortfolioSchema = z.object({
  owner: AddressSchema,
  portfolioId: z.string().min(1, "Portfolio ID cannot be empty"),

  // Portfolio composition
  collateralAssets: z.array(
    z.object({
      assetAddress: AddressSchema,
      amount: AmountSchema,
      value: z.number().nonnegative(),
      weight: PercentageSchema,
      allocationTarget: PercentageSchema.optional(),
    }),
  ),

  // Portfolio metrics
  totalValue: z.number().nonnegative(),
  averageHealthFactor: z.number().nonnegative(),
  portfolioRiskScore: z.number().min(0).max(100),
  diversificationScore: z.number().min(0).max(100),

  // Performance metrics
  totalReturn: z.number(), // Can be negative
  totalReturnPercent: z.number(),
  volatility: PercentageSchema,
  sharpeRatio: z.number().optional(),

  // Rebalancing
  needsRebalancing: z.boolean(),
  lastRebalanced: TimestampSchema.optional(),
  rebalancingThreshold: PercentageSchema.default(5), // 5% default

  // Timestamps
  createdAt: TimestampSchema,
  lastUpdated: TimestampSchema,
});

// Batch operations
export const BatchCollateralOperationSchema = z.object({
  batchId: z.string().min(1, "Batch ID cannot be empty"),
  operations: z.array(
    z.union([CollateralDepositSchema, CollateralWithdrawalSchema]),
  ),

  // Batch validation
  atomicExecution: z.boolean().default(true), // All or nothing
  maxGasPrice: z.number().int().positive().optional(),
  deadline: TimestampSchema.optional(),

  // Batch metadata
  initiator: AddressSchema,
  timestamp: TimestampSchema,
});

/**
 * Derived schemas with additional validation
 */

// Collateral with calculated risk metrics
export const EnrichedCollateralSchema = CollateralBalanceSchema.extend({
  riskMetrics: z.object({
    liquidationRisk: PercentageSchema,
    timeToLiquidation: z.number().positive().optional(), // Hours
    stressTestResults: z.object({
      priceDropToLiquidation: PercentageSchema,
      worstCaseScenario: z.object({
        priceShock: PercentageSchema,
        resultingHealthFactor: z.number().nonnegative(),
        liquidationAmount: AmountSchema.optional(),
      }),
    }),
  }),

  // Historical performance
  performanceMetrics: z
    .object({
      returns1d: z.number(),
      returns7d: z.number(),
      returns30d: z.number(),
      volatility: PercentageSchema,
      maxDrawdown: PercentageSchema,
    })
    .optional(),
});

/**
 * Type exports for TypeScript inference
 */
export type CollateralAssetConfig = z.infer<typeof CollateralAssetConfigSchema>;
export type CollateralBalance = z.infer<typeof CollateralBalanceSchema>;
export type CollateralDeposit = z.infer<typeof CollateralDepositSchema>;
export type CollateralWithdrawal = z.infer<typeof CollateralWithdrawalSchema>;
export type CollateralLiquidation = z.infer<typeof CollateralLiquidationSchema>;
export type CollateralPriceUpdate = z.infer<typeof CollateralPriceUpdateSchema>;
export type CollateralRiskAssessment = z.infer<
  typeof CollateralRiskAssessmentSchema
>;
export type CollateralPortfolio = z.infer<typeof CollateralPortfolioSchema>;
export type BatchCollateralOperation = z.infer<
  typeof BatchCollateralOperationSchema
>;
export type EnrichedCollateral = z.infer<typeof EnrichedCollateralSchema>;
