import { z } from "zod";
import { AddressSchema, BigIntSchema, AmountSchema, OptionalAmountSchema, PriceSchema, BasisPointsSchema, PercentageSchema, TimestampSchema, HashSchema, HealthFactorSchema, RiskLevelSchema, MetadataSchema, UUIDSchema, EventTypeSchema, } from "./common.js";
import { CollateralBalanceSchema, CollateralAssetConfigSchema, } from "./collateral.js";
/**
 * CDP (Collateralized Debt Position) validation schemas
 */
// CDP Status enumeration
export const CDPStatusSchema = z.enum([
    "active",
    "inactive",
    "liquidating",
    "liquidated",
    "closed",
    "frozen",
]);
// CDP core schema
export const CDPSchema = z.object({
    id: z.string().min(1, "CDP ID cannot be empty"),
    owner: AddressSchema,
    status: CDPStatusSchema,
    // Financial metrics
    collateralValue: z
        .number()
        .nonnegative("Collateral value cannot be negative"),
    debtAmount: AmountSchema,
    availableCredit: OptionalAmountSchema,
    // Risk metrics
    collateralizationRatio: PercentageSchema,
    healthFactor: HealthFactorSchema,
    liquidationPrice: PriceSchema,
    riskLevel: RiskLevelSchema,
    // Fee and interest
    stabilityFee: BasisPointsSchema,
    accruedFees: OptionalAmountSchema,
    lastFeeUpdate: TimestampSchema,
    // Timing
    createdAt: TimestampSchema,
    lastUpdated: TimestampSchema,
    // Optional metadata
    metadata: MetadataSchema.optional(),
});
// CDP creation schema
export const CreateCDPSchema = z.object({
    owner: AddressSchema,
    initialCollateral: z.object({
        assetAddress: AddressSchema,
        amount: AmountSchema,
    }),
    // Optional initial debt minting
    initialDebt: OptionalAmountSchema.optional(),
    // Risk parameters
    minCollateralizationRatio: BasisPointsSchema.default(15000), // 150% default
    maxLeverageRatio: z.number().positive().max(10).default(3), // 3x leverage max default
    // Transaction parameters
    maxGasPrice: z.number().int().positive().optional(),
    deadline: TimestampSchema.optional(),
    slippageTolerance: BasisPointsSchema.default(100), // 1% default
    // Metadata
    metadata: MetadataSchema.optional(),
});
// CDP update operations
export const CDPCollateralUpdateSchema = z.object({
    cdpId: z.string().min(1, "CDP ID cannot be empty"),
    operation: z.enum(["deposit", "withdraw"]),
    assetAddress: AddressSchema,
    amount: AmountSchema,
    // Validation parameters
    enforceHealthFactor: z.boolean().default(true),
    minHealthFactorAfter: z.number().positive().default(1.2),
    // Transaction details
    initiator: AddressSchema,
    transactionHash: HashSchema.optional(),
    blockNumber: z.number().int().positive().optional(),
    gasUsed: z.number().int().nonnegative().optional(),
    // Timing
    timestamp: TimestampSchema,
});
export const CDPDebtUpdateSchema = z.object({
    cdpId: z.string().min(1, "CDP ID cannot be empty"),
    operation: z.enum(["mint", "repay"]),
    amount: AmountSchema,
    // Validation parameters
    enforceCollateralizationRatio: z.boolean().default(true),
    minCollateralizationRatioAfter: BasisPointsSchema.default(15000), // 150%
    // Fee handling
    includeAccruedFees: z.boolean().default(true),
    maxFeeAmount: OptionalAmountSchema.optional(),
    // Transaction details
    initiator: AddressSchema,
    transactionHash: HashSchema.optional(),
    blockNumber: z.number().int().positive().optional(),
    gasUsed: z.number().int().nonnegative().optional(),
    // Timing
    timestamp: TimestampSchema,
});
// CDP liquidation schema
export const CDPLiquidationSchema = z.object({
    cdpId: z.string().min(1, "CDP ID cannot be empty"),
    liquidator: AddressSchema,
    cdpOwner: AddressSchema,
    // Liquidation trigger
    triggerReason: z.enum([
        "health_factor_below_threshold",
        "collateral_price_drop",
        "debt_ceiling_exceeded",
        "oracle_failure",
        "emergency_shutdown",
    ]),
    healthFactorAtLiquidation: HealthFactorSchema,
    // Liquidation details
    totalCollateralValue: z.number().nonnegative(),
    totalDebtAmount: AmountSchema,
    liquidationPenalty: AmountSchema,
    liquidatorReward: AmountSchema,
    // Asset-specific liquidation details
    collateralLiquidated: z.array(z.object({
        assetAddress: AddressSchema,
        amount: AmountSchema,
        price: PriceSchema,
        value: z.number().nonnegative(),
    })),
    // Post-liquidation state
    remainingCollateral: OptionalAmountSchema,
    remainingDebt: OptionalAmountSchema,
    finalStatus: CDPStatusSchema,
    // Transaction details
    transactionHash: HashSchema,
    blockNumber: z.number().int().positive(),
    gasUsed: z.number().int().nonnegative(),
    // Timing
    timestamp: TimestampSchema,
    liquidationStarted: TimestampSchema,
    liquidationCompleted: TimestampSchema,
});
// CDP portfolio and aggregation schemas
export const CDPPortfolioSchema = z.object({
    owner: AddressSchema,
    cdpIds: z.array(z.string().min(1)),
    // Aggregated metrics
    totalCollateralValue: z.number().nonnegative(),
    totalDebtAmount: AmountSchema,
    totalAvailableCredit: OptionalAmountSchema,
    averageHealthFactor: HealthFactorSchema,
    portfolioRiskLevel: RiskLevelSchema,
    // Diversification metrics
    collateralAssetDistribution: z.array(z.object({
        assetAddress: AddressSchema,
        value: z.number().nonnegative(),
        percentage: PercentageSchema,
    })),
    // Performance metrics
    totalReturn: z.number(), // Can be negative
    totalFeesPaid: AmountSchema,
    totalLiquidationLosses: OptionalAmountSchema,
    // Risk management
    aggregatedLiquidationPrice: PriceSchema.optional(),
    worstCaseScenario: z
        .object({
        priceShock: PercentageSchema,
        affectedCDPs: z.number().int().nonnegative(),
        potentialLoss: AmountSchema,
    })
        .optional(),
    // Timestamps
    lastUpdated: TimestampSchema,
});
// CDP history and events
export const CDPEventSchema = z.object({
    eventId: UUIDSchema,
    cdpId: z.string().min(1, "CDP ID cannot be empty"),
    eventType: EventTypeSchema,
    // Event details
    description: z.string().min(1, "Event description cannot be empty"),
    eventData: z.record(z.string(), z.unknown()),
    // Financial impact
    collateralChange: z.number().optional(), // Can be negative
    debtChange: BigIntSchema.optional(), // Can be negative
    healthFactorBefore: HealthFactorSchema.optional(),
    healthFactorAfter: HealthFactorSchema.optional(),
    // Transaction details
    transactionHash: HashSchema.optional(),
    blockNumber: z.number().int().positive().optional(),
    gasUsed: z.number().int().nonnegative().optional(),
    // Actor information
    initiator: AddressSchema,
    // Timing
    timestamp: TimestampSchema,
    blockTimestamp: TimestampSchema.optional(),
});
// CDP analytics and reporting
export const CDPAnalyticsSchema = z.object({
    cdpId: z.string().min(1, "CDP ID cannot be empty"),
    analysisDate: TimestampSchema,
    // Performance metrics
    profitAndLoss: z.object({
        realizedPnL: z.number(),
        unrealizedPnL: z.number(),
        totalReturn: z.number(),
        totalReturnPercent: z.number(),
    }),
    // Risk metrics
    riskMetrics: z.object({
        valueAtRisk: z.number().nonnegative(),
        expectedShortfall: z.number().nonnegative(),
        liquidationRisk: PercentageSchema,
        timeToLiquidation: z.number().positive().optional(), // Hours
    }),
    // Efficiency metrics
    capitalEfficiency: z.object({
        leverageRatio: z.number().positive(),
        capitalUtilization: PercentageSchema,
        costOfCapital: BasisPointsSchema,
        returnOnEquity: z.number(),
    }),
    // Historical analysis
    historicalMetrics: z.object({
        avgHealthFactor: HealthFactorSchema,
        minHealthFactor: HealthFactorSchema,
        maxLeverageUsed: z.number().positive(),
        timeInDanger: z.number().nonnegative(), // Hours spent with health factor < 1.5
        numberOfRebalances: z.number().int().nonnegative(),
    }),
    // Recommendations
    recommendations: z.array(z.object({
        type: z.enum([
            "increase_collateral",
            "reduce_debt",
            "diversify",
            "rebalance",
            "close_position",
        ]),
        priority: z.enum(["low", "medium", "high", "critical"]),
        description: z.string(),
        estimatedImpact: z.object({
            healthFactorChange: z.number(),
            riskReduction: PercentageSchema.optional(),
        }),
    })),
});
// Batch CDP operations
export const BatchCDPOperationSchema = z.object({
    batchId: UUIDSchema,
    operations: z.array(z.union([CreateCDPSchema, CDPCollateralUpdateSchema, CDPDebtUpdateSchema])),
    // Batch execution parameters
    atomicExecution: z.boolean().default(true),
    maxTotalGas: z.number().int().positive().optional(),
    deadline: TimestampSchema.optional(),
    // Risk management
    maxTotalRiskExposure: z.number().positive().optional(),
    emergencyStopConditions: z
        .array(z.object({
        condition: z.string(),
        threshold: z.number(),
    }))
        .optional(),
    // Batch metadata
    initiator: AddressSchema,
    createdAt: TimestampSchema,
});
// CDP system parameters and governance
export const CDPSystemParametersSchema = z.object({
    // Global parameters
    globalDebtCeiling: BigIntSchema,
    baseStabilityFee: BasisPointsSchema,
    liquidationRatio: BasisPointsSchema,
    liquidationPenalty: BasisPointsSchema,
    // Emergency parameters
    emergencyShutdownEnabled: z.boolean(),
    emergencyShutdownDelay: z.number().int().nonnegative(), // Seconds
    // Oracle parameters
    oraclePriceDelay: z.number().int().nonnegative(), // Seconds
    oracleSecurityModule: AddressSchema,
    // Fee parameters
    feeUpdateFrequency: z.number().int().positive(), // Seconds
    maxStabilityFee: BasisPointsSchema,
    feeCollector: AddressSchema,
    // Liquidation parameters
    liquidationBonusRate: BasisPointsSchema,
    liquidationAuctionDuration: z.number().int().positive(), // Seconds
    minLiquidationAmount: AmountSchema,
    // Governance parameters
    governanceDelay: z.number().int().nonnegative(), // Seconds for parameter changes
    parametersLastUpdated: TimestampSchema,
    updatedBy: AddressSchema,
});
/**
 * Derived schemas with enhanced validation
 */
// Enhanced CDP with full risk analysis
export const EnhancedCDPSchema = CDPSchema.extend({
    // Enhanced collateral information
    collateralAssets: z.array(CollateralBalanceSchema),
    collateralConfigs: z.array(CollateralAssetConfigSchema),
    // Advanced risk metrics
    advancedRiskMetrics: z.object({
        liquidationDistance: PercentageSchema,
        stressTestResults: z.object({
            mild: z.object({
                priceShock: PercentageSchema,
                resultingHealthFactor: HealthFactorSchema,
            }),
            moderate: z.object({
                priceShock: PercentageSchema,
                resultingHealthFactor: HealthFactorSchema,
            }),
            severe: z.object({
                priceShock: PercentageSchema,
                resultingHealthFactor: HealthFactorSchema,
            }),
        }),
        correlationRisk: z.number().min(0).max(1),
        concentrationRisk: z.number().min(0).max(1),
    }),
    // Historical performance
    performance: z.object({
        ageInDays: z.number().nonnegative(),
        totalFeesGenerated: AmountSchema,
        totalCollateralAdded: AmountSchema,
        totalDebtMinted: AmountSchema,
        netPosition: z.number(), // Can be negative
    }),
    // Optimization suggestions
    optimizationSuggestions: z.array(z.object({
        suggestion: z.string(),
        expectedBenefit: z.string(),
        risk: RiskLevelSchema,
        implementationCost: OptionalAmountSchema.optional(),
    })),
});
//# sourceMappingURL=cdp.js.map