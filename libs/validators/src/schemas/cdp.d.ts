import { z } from "zod";
/**
 * CDP (Collateralized Debt Position) validation schemas
 */
export declare const CDPStatusSchema: z.ZodEnum<["active", "inactive", "liquidating", "liquidated", "closed", "frozen"]>;
export declare const CDPSchema: z.ZodObject<{
    id: z.ZodString;
    owner: z.ZodEffects<z.ZodString, string, string>;
    status: z.ZodEnum<["active", "inactive", "liquidating", "liquidated", "closed", "frozen"]>;
    collateralValue: z.ZodNumber;
    debtAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    availableCredit: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    collateralizationRatio: z.ZodNumber;
    healthFactor: z.ZodNumber;
    liquidationPrice: z.ZodNumber;
    riskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
    stabilityFee: z.ZodNumber;
    accruedFees: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    lastFeeUpdate: z.ZodNumber;
    createdAt: z.ZodNumber;
    lastUpdated: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "liquidating" | "liquidated" | "closed" | "frozen";
    stabilityFee: number;
    createdAt: number;
    owner: string;
    healthFactor: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    lastUpdated: number;
    liquidationPrice: number;
    id: string;
    collateralValue: number;
    debtAmount: bigint;
    availableCredit: bigint;
    collateralizationRatio: number;
    accruedFees: bigint;
    lastFeeUpdate: number;
    metadata?: Record<string, unknown> | undefined;
}, {
    status: "active" | "inactive" | "liquidating" | "liquidated" | "closed" | "frozen";
    stabilityFee: number;
    createdAt: number;
    owner: string;
    healthFactor: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    lastUpdated: number;
    liquidationPrice: number;
    id: string;
    collateralValue: number;
    debtAmount: string | number | bigint;
    availableCredit: string | number | bigint;
    collateralizationRatio: number;
    accruedFees: string | number | bigint;
    lastFeeUpdate: number;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const CreateCDPSchema: z.ZodObject<{
    owner: z.ZodEffects<z.ZodString, string, string>;
    initialCollateral: z.ZodObject<{
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        assetAddress: string;
    }, {
        amount: string | number | bigint;
        assetAddress: string;
    }>;
    initialDebt: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>>;
    minCollateralizationRatio: z.ZodDefault<z.ZodNumber>;
    maxLeverageRatio: z.ZodDefault<z.ZodNumber>;
    maxGasPrice: z.ZodOptional<z.ZodNumber>;
    deadline: z.ZodOptional<z.ZodNumber>;
    slippageTolerance: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    owner: string;
    slippageTolerance: number;
    initialCollateral: {
        amount: bigint;
        assetAddress: string;
    };
    minCollateralizationRatio: number;
    maxLeverageRatio: number;
    metadata?: Record<string, unknown> | undefined;
    maxGasPrice?: number | undefined;
    deadline?: number | undefined;
    initialDebt?: bigint | undefined;
}, {
    owner: string;
    initialCollateral: {
        amount: string | number | bigint;
        assetAddress: string;
    };
    metadata?: Record<string, unknown> | undefined;
    slippageTolerance?: number | undefined;
    maxGasPrice?: number | undefined;
    deadline?: number | undefined;
    initialDebt?: string | number | bigint | undefined;
    minCollateralizationRatio?: number | undefined;
    maxLeverageRatio?: number | undefined;
}>;
export declare const CDPCollateralUpdateSchema: z.ZodObject<{
    cdpId: z.ZodString;
    operation: z.ZodEnum<["deposit", "withdraw"]>;
    assetAddress: z.ZodEffects<z.ZodString, string, string>;
    amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    enforceHealthFactor: z.ZodDefault<z.ZodBoolean>;
    minHealthFactorAfter: z.ZodDefault<z.ZodNumber>;
    initiator: z.ZodEffects<z.ZodString, string, string>;
    transactionHash: z.ZodOptional<z.ZodString>;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    gasUsed: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: bigint;
    timestamp: number;
    assetAddress: string;
    cdpId: string;
    initiator: string;
    operation: "deposit" | "withdraw";
    enforceHealthFactor: boolean;
    minHealthFactorAfter: number;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
}, {
    amount: string | number | bigint;
    timestamp: number;
    assetAddress: string;
    cdpId: string;
    initiator: string;
    operation: "deposit" | "withdraw";
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    enforceHealthFactor?: boolean | undefined;
    minHealthFactorAfter?: number | undefined;
}>;
export declare const CDPDebtUpdateSchema: z.ZodObject<{
    cdpId: z.ZodString;
    operation: z.ZodEnum<["mint", "repay"]>;
    amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    enforceCollateralizationRatio: z.ZodDefault<z.ZodBoolean>;
    minCollateralizationRatioAfter: z.ZodDefault<z.ZodNumber>;
    includeAccruedFees: z.ZodDefault<z.ZodBoolean>;
    maxFeeAmount: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>>;
    initiator: z.ZodEffects<z.ZodString, string, string>;
    transactionHash: z.ZodOptional<z.ZodString>;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    gasUsed: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: bigint;
    timestamp: number;
    cdpId: string;
    initiator: string;
    operation: "mint" | "repay";
    enforceCollateralizationRatio: boolean;
    minCollateralizationRatioAfter: number;
    includeAccruedFees: boolean;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    maxFeeAmount?: bigint | undefined;
}, {
    amount: string | number | bigint;
    timestamp: number;
    cdpId: string;
    initiator: string;
    operation: "mint" | "repay";
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    enforceCollateralizationRatio?: boolean | undefined;
    minCollateralizationRatioAfter?: number | undefined;
    includeAccruedFees?: boolean | undefined;
    maxFeeAmount?: string | number | bigint | undefined;
}>;
export declare const CDPLiquidationSchema: z.ZodObject<{
    cdpId: z.ZodString;
    liquidator: z.ZodEffects<z.ZodString, string, string>;
    cdpOwner: z.ZodEffects<z.ZodString, string, string>;
    triggerReason: z.ZodEnum<["health_factor_below_threshold", "collateral_price_drop", "debt_ceiling_exceeded", "oracle_failure", "emergency_shutdown"]>;
    healthFactorAtLiquidation: z.ZodNumber;
    totalCollateralValue: z.ZodNumber;
    totalDebtAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    liquidationPenalty: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    liquidatorReward: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    collateralLiquidated: z.ZodArray<z.ZodObject<{
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        price: z.ZodNumber;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        value: number;
        assetAddress: string;
        price: number;
    }, {
        amount: string | number | bigint;
        value: number;
        assetAddress: string;
        price: number;
    }>, "many">;
    remainingCollateral: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    remainingDebt: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    finalStatus: z.ZodEnum<["active", "inactive", "liquidating", "liquidated", "closed", "frozen"]>;
    transactionHash: z.ZodString;
    blockNumber: z.ZodNumber;
    gasUsed: z.ZodNumber;
    timestamp: z.ZodNumber;
    liquidationStarted: z.ZodNumber;
    liquidationCompleted: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    liquidationPenalty: bigint;
    cdpId: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    liquidator: string;
    cdpOwner: string;
    triggerReason: "health_factor_below_threshold" | "collateral_price_drop" | "debt_ceiling_exceeded" | "oracle_failure" | "emergency_shutdown";
    healthFactorAtLiquidation: number;
    totalCollateralValue: number;
    totalDebtAmount: bigint;
    liquidatorReward: bigint;
    collateralLiquidated: {
        amount: bigint;
        value: number;
        assetAddress: string;
        price: number;
    }[];
    remainingCollateral: bigint;
    remainingDebt: bigint;
    finalStatus: "active" | "inactive" | "liquidating" | "liquidated" | "closed" | "frozen";
    liquidationStarted: number;
    liquidationCompleted: number;
}, {
    timestamp: number;
    liquidationPenalty: string | number | bigint;
    cdpId: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    liquidator: string;
    cdpOwner: string;
    triggerReason: "health_factor_below_threshold" | "collateral_price_drop" | "debt_ceiling_exceeded" | "oracle_failure" | "emergency_shutdown";
    healthFactorAtLiquidation: number;
    totalCollateralValue: number;
    totalDebtAmount: string | number | bigint;
    liquidatorReward: string | number | bigint;
    collateralLiquidated: {
        amount: string | number | bigint;
        value: number;
        assetAddress: string;
        price: number;
    }[];
    remainingCollateral: string | number | bigint;
    remainingDebt: string | number | bigint;
    finalStatus: "active" | "inactive" | "liquidating" | "liquidated" | "closed" | "frozen";
    liquidationStarted: number;
    liquidationCompleted: number;
}>;
export declare const CDPPortfolioSchema: z.ZodObject<{
    owner: z.ZodEffects<z.ZodString, string, string>;
    cdpIds: z.ZodArray<z.ZodString, "many">;
    totalCollateralValue: z.ZodNumber;
    totalDebtAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    totalAvailableCredit: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    averageHealthFactor: z.ZodNumber;
    portfolioRiskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
    collateralAssetDistribution: z.ZodArray<z.ZodObject<{
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        value: z.ZodNumber;
        percentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        assetAddress: string;
        percentage: number;
    }, {
        value: number;
        assetAddress: string;
        percentage: number;
    }>, "many">;
    totalReturn: z.ZodNumber;
    totalFeesPaid: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    totalLiquidationLosses: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    aggregatedLiquidationPrice: z.ZodOptional<z.ZodNumber>;
    worstCaseScenario: z.ZodOptional<z.ZodObject<{
        priceShock: z.ZodNumber;
        affectedCDPs: z.ZodNumber;
        potentialLoss: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    }, "strip", z.ZodTypeAny, {
        priceShock: number;
        affectedCDPs: number;
        potentialLoss: bigint;
    }, {
        priceShock: number;
        affectedCDPs: number;
        potentialLoss: string | number | bigint;
    }>>;
    lastUpdated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    owner: string;
    lastUpdated: number;
    averageHealthFactor: number;
    totalReturn: number;
    totalCollateralValue: number;
    totalDebtAmount: bigint;
    cdpIds: string[];
    totalAvailableCredit: bigint;
    portfolioRiskLevel: "low" | "medium" | "high" | "critical";
    collateralAssetDistribution: {
        value: number;
        assetAddress: string;
        percentage: number;
    }[];
    totalFeesPaid: bigint;
    totalLiquidationLosses: bigint;
    worstCaseScenario?: {
        priceShock: number;
        affectedCDPs: number;
        potentialLoss: bigint;
    } | undefined;
    aggregatedLiquidationPrice?: number | undefined;
}, {
    owner: string;
    lastUpdated: number;
    averageHealthFactor: number;
    totalReturn: number;
    totalCollateralValue: number;
    totalDebtAmount: string | number | bigint;
    cdpIds: string[];
    totalAvailableCredit: string | number | bigint;
    portfolioRiskLevel: "low" | "medium" | "high" | "critical";
    collateralAssetDistribution: {
        value: number;
        assetAddress: string;
        percentage: number;
    }[];
    totalFeesPaid: string | number | bigint;
    totalLiquidationLosses: string | number | bigint;
    worstCaseScenario?: {
        priceShock: number;
        affectedCDPs: number;
        potentialLoss: string | number | bigint;
    } | undefined;
    aggregatedLiquidationPrice?: number | undefined;
}>;
export declare const CDPEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    cdpId: z.ZodString;
    eventType: z.ZodEnum<["cdp_created", "cdp_updated", "cdp_liquidated", "cdp_closed", "collateral_deposited", "collateral_withdrawn", "debt_minted", "debt_repaid", "price_updated", "system_parameter_changed"]>;
    description: z.ZodString;
    eventData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    collateralChange: z.ZodOptional<z.ZodNumber>;
    debtChange: z.ZodOptional<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>>;
    healthFactorBefore: z.ZodOptional<z.ZodNumber>;
    healthFactorAfter: z.ZodOptional<z.ZodNumber>;
    transactionHash: z.ZodOptional<z.ZodString>;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    gasUsed: z.ZodOptional<z.ZodNumber>;
    initiator: z.ZodEffects<z.ZodString, string, string>;
    timestamp: z.ZodNumber;
    blockTimestamp: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    cdpId: string;
    initiator: string;
    eventId: string;
    eventType: "cdp_created" | "cdp_updated" | "cdp_liquidated" | "cdp_closed" | "collateral_deposited" | "collateral_withdrawn" | "debt_minted" | "debt_repaid" | "price_updated" | "system_parameter_changed";
    description: string;
    eventData: Record<string, unknown>;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    healthFactorBefore?: number | undefined;
    collateralChange?: number | undefined;
    debtChange?: bigint | undefined;
    healthFactorAfter?: number | undefined;
    blockTimestamp?: number | undefined;
}, {
    timestamp: number;
    cdpId: string;
    initiator: string;
    eventId: string;
    eventType: "cdp_created" | "cdp_updated" | "cdp_liquidated" | "cdp_closed" | "collateral_deposited" | "collateral_withdrawn" | "debt_minted" | "debt_repaid" | "price_updated" | "system_parameter_changed";
    description: string;
    eventData: Record<string, unknown>;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    healthFactorBefore?: number | undefined;
    collateralChange?: number | undefined;
    debtChange?: string | number | bigint | undefined;
    healthFactorAfter?: number | undefined;
    blockTimestamp?: number | undefined;
}>;
export declare const CDPAnalyticsSchema: z.ZodObject<{
    cdpId: z.ZodString;
    analysisDate: z.ZodNumber;
    profitAndLoss: z.ZodObject<{
        realizedPnL: z.ZodNumber;
        unrealizedPnL: z.ZodNumber;
        totalReturn: z.ZodNumber;
        totalReturnPercent: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalReturn: number;
        totalReturnPercent: number;
        realizedPnL: number;
        unrealizedPnL: number;
    }, {
        totalReturn: number;
        totalReturnPercent: number;
        realizedPnL: number;
        unrealizedPnL: number;
    }>;
    riskMetrics: z.ZodObject<{
        valueAtRisk: z.ZodNumber;
        expectedShortfall: z.ZodNumber;
        liquidationRisk: z.ZodNumber;
        timeToLiquidation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        liquidationRisk: number;
        valueAtRisk: number;
        expectedShortfall: number;
        timeToLiquidation?: number | undefined;
    }, {
        liquidationRisk: number;
        valueAtRisk: number;
        expectedShortfall: number;
        timeToLiquidation?: number | undefined;
    }>;
    capitalEfficiency: z.ZodObject<{
        leverageRatio: z.ZodNumber;
        capitalUtilization: z.ZodNumber;
        costOfCapital: z.ZodNumber;
        returnOnEquity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        leverageRatio: number;
        capitalUtilization: number;
        costOfCapital: number;
        returnOnEquity: number;
    }, {
        leverageRatio: number;
        capitalUtilization: number;
        costOfCapital: number;
        returnOnEquity: number;
    }>;
    historicalMetrics: z.ZodObject<{
        avgHealthFactor: z.ZodNumber;
        minHealthFactor: z.ZodNumber;
        maxLeverageUsed: z.ZodNumber;
        timeInDanger: z.ZodNumber;
        numberOfRebalances: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        minHealthFactor: number;
        avgHealthFactor: number;
        maxLeverageUsed: number;
        timeInDanger: number;
        numberOfRebalances: number;
    }, {
        minHealthFactor: number;
        avgHealthFactor: number;
        maxLeverageUsed: number;
        timeInDanger: number;
        numberOfRebalances: number;
    }>;
    recommendations: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["increase_collateral", "reduce_debt", "diversify", "rebalance", "close_position"]>;
        priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
        description: z.ZodString;
        estimatedImpact: z.ZodObject<{
            healthFactorChange: z.ZodNumber;
            riskReduction: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            healthFactorChange: number;
            riskReduction?: number | undefined;
        }, {
            healthFactorChange: number;
            riskReduction?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "increase_collateral" | "reduce_debt" | "diversify" | "rebalance" | "close_position";
        description: string;
        priority: "low" | "medium" | "high" | "critical";
        estimatedImpact: {
            healthFactorChange: number;
            riskReduction?: number | undefined;
        };
    }, {
        type: "increase_collateral" | "reduce_debt" | "diversify" | "rebalance" | "close_position";
        description: string;
        priority: "low" | "medium" | "high" | "critical";
        estimatedImpact: {
            healthFactorChange: number;
            riskReduction?: number | undefined;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cdpId: string;
    riskMetrics: {
        liquidationRisk: number;
        valueAtRisk: number;
        expectedShortfall: number;
        timeToLiquidation?: number | undefined;
    };
    analysisDate: number;
    profitAndLoss: {
        totalReturn: number;
        totalReturnPercent: number;
        realizedPnL: number;
        unrealizedPnL: number;
    };
    capitalEfficiency: {
        leverageRatio: number;
        capitalUtilization: number;
        costOfCapital: number;
        returnOnEquity: number;
    };
    historicalMetrics: {
        minHealthFactor: number;
        avgHealthFactor: number;
        maxLeverageUsed: number;
        timeInDanger: number;
        numberOfRebalances: number;
    };
    recommendations: {
        type: "increase_collateral" | "reduce_debt" | "diversify" | "rebalance" | "close_position";
        description: string;
        priority: "low" | "medium" | "high" | "critical";
        estimatedImpact: {
            healthFactorChange: number;
            riskReduction?: number | undefined;
        };
    }[];
}, {
    cdpId: string;
    riskMetrics: {
        liquidationRisk: number;
        valueAtRisk: number;
        expectedShortfall: number;
        timeToLiquidation?: number | undefined;
    };
    analysisDate: number;
    profitAndLoss: {
        totalReturn: number;
        totalReturnPercent: number;
        realizedPnL: number;
        unrealizedPnL: number;
    };
    capitalEfficiency: {
        leverageRatio: number;
        capitalUtilization: number;
        costOfCapital: number;
        returnOnEquity: number;
    };
    historicalMetrics: {
        minHealthFactor: number;
        avgHealthFactor: number;
        maxLeverageUsed: number;
        timeInDanger: number;
        numberOfRebalances: number;
    };
    recommendations: {
        type: "increase_collateral" | "reduce_debt" | "diversify" | "rebalance" | "close_position";
        description: string;
        priority: "low" | "medium" | "high" | "critical";
        estimatedImpact: {
            healthFactorChange: number;
            riskReduction?: number | undefined;
        };
    }[];
}>;
export declare const BatchCDPOperationSchema: z.ZodObject<{
    batchId: z.ZodString;
    operations: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        owner: z.ZodEffects<z.ZodString, string, string>;
        initialCollateral: z.ZodObject<{
            assetAddress: z.ZodEffects<z.ZodString, string, string>;
            amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        }, "strip", z.ZodTypeAny, {
            amount: bigint;
            assetAddress: string;
        }, {
            amount: string | number | bigint;
            assetAddress: string;
        }>;
        initialDebt: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>>;
        minCollateralizationRatio: z.ZodDefault<z.ZodNumber>;
        maxLeverageRatio: z.ZodDefault<z.ZodNumber>;
        maxGasPrice: z.ZodOptional<z.ZodNumber>;
        deadline: z.ZodOptional<z.ZodNumber>;
        slippageTolerance: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        owner: string;
        slippageTolerance: number;
        initialCollateral: {
            amount: bigint;
            assetAddress: string;
        };
        minCollateralizationRatio: number;
        maxLeverageRatio: number;
        metadata?: Record<string, unknown> | undefined;
        maxGasPrice?: number | undefined;
        deadline?: number | undefined;
        initialDebt?: bigint | undefined;
    }, {
        owner: string;
        initialCollateral: {
            amount: string | number | bigint;
            assetAddress: string;
        };
        metadata?: Record<string, unknown> | undefined;
        slippageTolerance?: number | undefined;
        maxGasPrice?: number | undefined;
        deadline?: number | undefined;
        initialDebt?: string | number | bigint | undefined;
        minCollateralizationRatio?: number | undefined;
        maxLeverageRatio?: number | undefined;
    }>, z.ZodObject<{
        cdpId: z.ZodString;
        operation: z.ZodEnum<["deposit", "withdraw"]>;
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        enforceHealthFactor: z.ZodDefault<z.ZodBoolean>;
        minHealthFactorAfter: z.ZodDefault<z.ZodNumber>;
        initiator: z.ZodEffects<z.ZodString, string, string>;
        transactionHash: z.ZodOptional<z.ZodString>;
        blockNumber: z.ZodOptional<z.ZodNumber>;
        gasUsed: z.ZodOptional<z.ZodNumber>;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        initiator: string;
        operation: "deposit" | "withdraw";
        enforceHealthFactor: boolean;
        minHealthFactorAfter: number;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
    }, {
        amount: string | number | bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        initiator: string;
        operation: "deposit" | "withdraw";
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        enforceHealthFactor?: boolean | undefined;
        minHealthFactorAfter?: number | undefined;
    }>, z.ZodObject<{
        cdpId: z.ZodString;
        operation: z.ZodEnum<["mint", "repay"]>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        enforceCollateralizationRatio: z.ZodDefault<z.ZodBoolean>;
        minCollateralizationRatioAfter: z.ZodDefault<z.ZodNumber>;
        includeAccruedFees: z.ZodDefault<z.ZodBoolean>;
        maxFeeAmount: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>>;
        initiator: z.ZodEffects<z.ZodString, string, string>;
        transactionHash: z.ZodOptional<z.ZodString>;
        blockNumber: z.ZodOptional<z.ZodNumber>;
        gasUsed: z.ZodOptional<z.ZodNumber>;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        timestamp: number;
        cdpId: string;
        initiator: string;
        operation: "mint" | "repay";
        enforceCollateralizationRatio: boolean;
        minCollateralizationRatioAfter: number;
        includeAccruedFees: boolean;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        maxFeeAmount?: bigint | undefined;
    }, {
        amount: string | number | bigint;
        timestamp: number;
        cdpId: string;
        initiator: string;
        operation: "mint" | "repay";
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        enforceCollateralizationRatio?: boolean | undefined;
        minCollateralizationRatioAfter?: number | undefined;
        includeAccruedFees?: boolean | undefined;
        maxFeeAmount?: string | number | bigint | undefined;
    }>]>, "many">;
    atomicExecution: z.ZodDefault<z.ZodBoolean>;
    maxTotalGas: z.ZodOptional<z.ZodNumber>;
    deadline: z.ZodOptional<z.ZodNumber>;
    maxTotalRiskExposure: z.ZodOptional<z.ZodNumber>;
    emergencyStopConditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        threshold: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        condition: string;
        threshold: number;
    }, {
        condition: string;
        threshold: number;
    }>, "many">>;
    initiator: z.ZodEffects<z.ZodString, string, string>;
    createdAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    createdAt: number;
    batchId: string;
    operations: ({
        owner: string;
        slippageTolerance: number;
        initialCollateral: {
            amount: bigint;
            assetAddress: string;
        };
        minCollateralizationRatio: number;
        maxLeverageRatio: number;
        metadata?: Record<string, unknown> | undefined;
        maxGasPrice?: number | undefined;
        deadline?: number | undefined;
        initialDebt?: bigint | undefined;
    } | {
        amount: bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        initiator: string;
        operation: "deposit" | "withdraw";
        enforceHealthFactor: boolean;
        minHealthFactorAfter: number;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
    } | {
        amount: bigint;
        timestamp: number;
        cdpId: string;
        initiator: string;
        operation: "mint" | "repay";
        enforceCollateralizationRatio: boolean;
        minCollateralizationRatioAfter: number;
        includeAccruedFees: boolean;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        maxFeeAmount?: bigint | undefined;
    })[];
    atomicExecution: boolean;
    initiator: string;
    deadline?: number | undefined;
    maxTotalGas?: number | undefined;
    maxTotalRiskExposure?: number | undefined;
    emergencyStopConditions?: {
        condition: string;
        threshold: number;
    }[] | undefined;
}, {
    createdAt: number;
    batchId: string;
    operations: ({
        owner: string;
        initialCollateral: {
            amount: string | number | bigint;
            assetAddress: string;
        };
        metadata?: Record<string, unknown> | undefined;
        slippageTolerance?: number | undefined;
        maxGasPrice?: number | undefined;
        deadline?: number | undefined;
        initialDebt?: string | number | bigint | undefined;
        minCollateralizationRatio?: number | undefined;
        maxLeverageRatio?: number | undefined;
    } | {
        amount: string | number | bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        initiator: string;
        operation: "deposit" | "withdraw";
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        enforceHealthFactor?: boolean | undefined;
        minHealthFactorAfter?: number | undefined;
    } | {
        amount: string | number | bigint;
        timestamp: number;
        cdpId: string;
        initiator: string;
        operation: "mint" | "repay";
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        enforceCollateralizationRatio?: boolean | undefined;
        minCollateralizationRatioAfter?: number | undefined;
        includeAccruedFees?: boolean | undefined;
        maxFeeAmount?: string | number | bigint | undefined;
    })[];
    initiator: string;
    atomicExecution?: boolean | undefined;
    deadline?: number | undefined;
    maxTotalGas?: number | undefined;
    maxTotalRiskExposure?: number | undefined;
    emergencyStopConditions?: {
        condition: string;
        threshold: number;
    }[] | undefined;
}>;
export declare const CDPSystemParametersSchema: z.ZodObject<{
    globalDebtCeiling: z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>;
    baseStabilityFee: z.ZodNumber;
    liquidationRatio: z.ZodNumber;
    liquidationPenalty: z.ZodNumber;
    emergencyShutdownEnabled: z.ZodBoolean;
    emergencyShutdownDelay: z.ZodNumber;
    oraclePriceDelay: z.ZodNumber;
    oracleSecurityModule: z.ZodEffects<z.ZodString, string, string>;
    feeUpdateFrequency: z.ZodNumber;
    maxStabilityFee: z.ZodNumber;
    feeCollector: z.ZodEffects<z.ZodString, string, string>;
    liquidationBonusRate: z.ZodNumber;
    liquidationAuctionDuration: z.ZodNumber;
    minLiquidationAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    governanceDelay: z.ZodNumber;
    parametersLastUpdated: z.ZodNumber;
    updatedBy: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    liquidationPenalty: number;
    globalDebtCeiling: bigint;
    baseStabilityFee: number;
    liquidationRatio: number;
    emergencyShutdownEnabled: boolean;
    emergencyShutdownDelay: number;
    oraclePriceDelay: number;
    oracleSecurityModule: string;
    feeUpdateFrequency: number;
    maxStabilityFee: number;
    feeCollector: string;
    liquidationBonusRate: number;
    liquidationAuctionDuration: number;
    minLiquidationAmount: bigint;
    governanceDelay: number;
    parametersLastUpdated: number;
    updatedBy: string;
}, {
    liquidationPenalty: number;
    globalDebtCeiling: string | number | bigint;
    baseStabilityFee: number;
    liquidationRatio: number;
    emergencyShutdownEnabled: boolean;
    emergencyShutdownDelay: number;
    oraclePriceDelay: number;
    oracleSecurityModule: string;
    feeUpdateFrequency: number;
    maxStabilityFee: number;
    feeCollector: string;
    liquidationBonusRate: number;
    liquidationAuctionDuration: number;
    minLiquidationAmount: string | number | bigint;
    governanceDelay: number;
    parametersLastUpdated: number;
    updatedBy: string;
}>;
/**
 * Derived schemas with enhanced validation
 */
export declare const EnhancedCDPSchema: z.ZodObject<{
    id: z.ZodString;
    owner: z.ZodEffects<z.ZodString, string, string>;
    status: z.ZodEnum<["active", "inactive", "liquidating", "liquidated", "closed", "frozen"]>;
    collateralValue: z.ZodNumber;
    debtAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    availableCredit: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    collateralizationRatio: z.ZodNumber;
    healthFactor: z.ZodNumber;
    liquidationPrice: z.ZodNumber;
    riskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
    stabilityFee: z.ZodNumber;
    accruedFees: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    lastFeeUpdate: z.ZodNumber;
    createdAt: z.ZodNumber;
    lastUpdated: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
} & {
    collateralAssets: z.ZodArray<z.ZodObject<{
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        owner: z.ZodEffects<z.ZodString, string, string>;
        lockedAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        availableAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        totalAmount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        currentPrice: z.ZodNumber;
        totalValue: z.ZodNumber;
        utilizationRatio: z.ZodNumber;
        healthFactor: z.ZodNumber;
        riskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
        lastUpdated: z.ZodNumber;
        priceLastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        assetAddress: string;
        owner: string;
        lockedAmount: bigint;
        availableAmount: bigint;
        totalAmount: bigint;
        currentPrice: number;
        totalValue: number;
        utilizationRatio: number;
        healthFactor: number;
        riskLevel: "low" | "medium" | "high" | "critical";
        lastUpdated: number;
        priceLastUpdated: number;
    }, {
        assetAddress: string;
        owner: string;
        lockedAmount: string | number | bigint;
        availableAmount: string | number | bigint;
        totalAmount: string | number | bigint;
        currentPrice: number;
        totalValue: number;
        utilizationRatio: number;
        healthFactor: number;
        riskLevel: "low" | "medium" | "high" | "critical";
        lastUpdated: number;
        priceLastUpdated: number;
    }>, "many">;
    collateralConfigs: z.ZodArray<z.ZodObject<{
        address: z.ZodEffects<z.ZodString, string, string>;
        symbol: z.ZodString;
        name: z.ZodString;
        decimals: z.ZodNumber;
        assetType: z.ZodEnum<["native", "erc20", "wrapped", "synthetic"]>;
        isActive: z.ZodBoolean;
        liquidationThreshold: z.ZodNumber;
        liquidationPenalty: z.ZodNumber;
        maxLoanToValue: z.ZodNumber;
        minCollateralRatio: z.ZodNumber;
        stabilityFee: z.ZodNumber;
        debtCeiling: z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>;
        debtFloor: z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>;
        oracleAddress: z.ZodEffects<z.ZodString, string, string>;
        oraclePriceFeedId: z.ZodString;
        priceValidityPeriod: z.ZodNumber;
        chainId: z.ZodNumber;
        network: z.ZodEnum<["mainnet", "testnet", "devnet", "local"]>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        assetType: "native" | "erc20" | "wrapped" | "synthetic";
        isActive: boolean;
        liquidationThreshold: number;
        liquidationPenalty: number;
        maxLoanToValue: number;
        minCollateralRatio: number;
        stabilityFee: number;
        debtCeiling: bigint;
        debtFloor: bigint;
        oracleAddress: string;
        oraclePriceFeedId: string;
        priceValidityPeriod: number;
        chainId: number;
        network: "mainnet" | "testnet" | "devnet" | "local";
        createdAt: number;
        updatedAt: number;
        metadata?: Record<string, unknown> | undefined;
    }, {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        assetType: "native" | "erc20" | "wrapped" | "synthetic";
        isActive: boolean;
        liquidationThreshold: number;
        liquidationPenalty: number;
        maxLoanToValue: number;
        minCollateralRatio: number;
        stabilityFee: number;
        debtCeiling: string | number | bigint;
        debtFloor: string | number | bigint;
        oracleAddress: string;
        oraclePriceFeedId: string;
        priceValidityPeriod: number;
        chainId: number;
        network: "mainnet" | "testnet" | "devnet" | "local";
        createdAt: number;
        updatedAt: number;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
    advancedRiskMetrics: z.ZodObject<{
        liquidationDistance: z.ZodNumber;
        stressTestResults: z.ZodObject<{
            mild: z.ZodObject<{
                priceShock: z.ZodNumber;
                resultingHealthFactor: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                priceShock: number;
                resultingHealthFactor: number;
            }, {
                priceShock: number;
                resultingHealthFactor: number;
            }>;
            moderate: z.ZodObject<{
                priceShock: z.ZodNumber;
                resultingHealthFactor: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                priceShock: number;
                resultingHealthFactor: number;
            }, {
                priceShock: number;
                resultingHealthFactor: number;
            }>;
            severe: z.ZodObject<{
                priceShock: z.ZodNumber;
                resultingHealthFactor: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                priceShock: number;
                resultingHealthFactor: number;
            }, {
                priceShock: number;
                resultingHealthFactor: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            mild: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            moderate: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            severe: {
                priceShock: number;
                resultingHealthFactor: number;
            };
        }, {
            mild: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            moderate: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            severe: {
                priceShock: number;
                resultingHealthFactor: number;
            };
        }>;
        correlationRisk: z.ZodNumber;
        concentrationRisk: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        stressTestResults: {
            mild: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            moderate: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            severe: {
                priceShock: number;
                resultingHealthFactor: number;
            };
        };
        liquidationDistance: number;
        correlationRisk: number;
        concentrationRisk: number;
    }, {
        stressTestResults: {
            mild: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            moderate: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            severe: {
                priceShock: number;
                resultingHealthFactor: number;
            };
        };
        liquidationDistance: number;
        correlationRisk: number;
        concentrationRisk: number;
    }>;
    performance: z.ZodObject<{
        ageInDays: z.ZodNumber;
        totalFeesGenerated: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        totalCollateralAdded: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        totalDebtMinted: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        netPosition: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ageInDays: number;
        totalFeesGenerated: bigint;
        totalCollateralAdded: bigint;
        totalDebtMinted: bigint;
        netPosition: number;
    }, {
        ageInDays: number;
        totalFeesGenerated: string | number | bigint;
        totalCollateralAdded: string | number | bigint;
        totalDebtMinted: string | number | bigint;
        netPosition: number;
    }>;
    optimizationSuggestions: z.ZodArray<z.ZodObject<{
        suggestion: z.ZodString;
        expectedBenefit: z.ZodString;
        risk: z.ZodEnum<["low", "medium", "high", "critical"]>;
        implementationCost: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>>;
    }, "strip", z.ZodTypeAny, {
        suggestion: string;
        expectedBenefit: string;
        risk: "low" | "medium" | "high" | "critical";
        implementationCost?: bigint | undefined;
    }, {
        suggestion: string;
        expectedBenefit: string;
        risk: "low" | "medium" | "high" | "critical";
        implementationCost?: string | number | bigint | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "liquidating" | "liquidated" | "closed" | "frozen";
    stabilityFee: number;
    createdAt: number;
    owner: string;
    healthFactor: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    lastUpdated: number;
    liquidationPrice: number;
    collateralAssets: {
        assetAddress: string;
        owner: string;
        lockedAmount: bigint;
        availableAmount: bigint;
        totalAmount: bigint;
        currentPrice: number;
        totalValue: number;
        utilizationRatio: number;
        healthFactor: number;
        riskLevel: "low" | "medium" | "high" | "critical";
        lastUpdated: number;
        priceLastUpdated: number;
    }[];
    id: string;
    collateralValue: number;
    debtAmount: bigint;
    availableCredit: bigint;
    collateralizationRatio: number;
    accruedFees: bigint;
    lastFeeUpdate: number;
    collateralConfigs: {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        assetType: "native" | "erc20" | "wrapped" | "synthetic";
        isActive: boolean;
        liquidationThreshold: number;
        liquidationPenalty: number;
        maxLoanToValue: number;
        minCollateralRatio: number;
        stabilityFee: number;
        debtCeiling: bigint;
        debtFloor: bigint;
        oracleAddress: string;
        oraclePriceFeedId: string;
        priceValidityPeriod: number;
        chainId: number;
        network: "mainnet" | "testnet" | "devnet" | "local";
        createdAt: number;
        updatedAt: number;
        metadata?: Record<string, unknown> | undefined;
    }[];
    advancedRiskMetrics: {
        stressTestResults: {
            mild: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            moderate: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            severe: {
                priceShock: number;
                resultingHealthFactor: number;
            };
        };
        liquidationDistance: number;
        correlationRisk: number;
        concentrationRisk: number;
    };
    performance: {
        ageInDays: number;
        totalFeesGenerated: bigint;
        totalCollateralAdded: bigint;
        totalDebtMinted: bigint;
        netPosition: number;
    };
    optimizationSuggestions: {
        suggestion: string;
        expectedBenefit: string;
        risk: "low" | "medium" | "high" | "critical";
        implementationCost?: bigint | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
}, {
    status: "active" | "inactive" | "liquidating" | "liquidated" | "closed" | "frozen";
    stabilityFee: number;
    createdAt: number;
    owner: string;
    healthFactor: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    lastUpdated: number;
    liquidationPrice: number;
    collateralAssets: {
        assetAddress: string;
        owner: string;
        lockedAmount: string | number | bigint;
        availableAmount: string | number | bigint;
        totalAmount: string | number | bigint;
        currentPrice: number;
        totalValue: number;
        utilizationRatio: number;
        healthFactor: number;
        riskLevel: "low" | "medium" | "high" | "critical";
        lastUpdated: number;
        priceLastUpdated: number;
    }[];
    id: string;
    collateralValue: number;
    debtAmount: string | number | bigint;
    availableCredit: string | number | bigint;
    collateralizationRatio: number;
    accruedFees: string | number | bigint;
    lastFeeUpdate: number;
    collateralConfigs: {
        symbol: string;
        address: string;
        name: string;
        decimals: number;
        assetType: "native" | "erc20" | "wrapped" | "synthetic";
        isActive: boolean;
        liquidationThreshold: number;
        liquidationPenalty: number;
        maxLoanToValue: number;
        minCollateralRatio: number;
        stabilityFee: number;
        debtCeiling: string | number | bigint;
        debtFloor: string | number | bigint;
        oracleAddress: string;
        oraclePriceFeedId: string;
        priceValidityPeriod: number;
        chainId: number;
        network: "mainnet" | "testnet" | "devnet" | "local";
        createdAt: number;
        updatedAt: number;
        metadata?: Record<string, unknown> | undefined;
    }[];
    advancedRiskMetrics: {
        stressTestResults: {
            mild: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            moderate: {
                priceShock: number;
                resultingHealthFactor: number;
            };
            severe: {
                priceShock: number;
                resultingHealthFactor: number;
            };
        };
        liquidationDistance: number;
        correlationRisk: number;
        concentrationRisk: number;
    };
    performance: {
        ageInDays: number;
        totalFeesGenerated: string | number | bigint;
        totalCollateralAdded: string | number | bigint;
        totalDebtMinted: string | number | bigint;
        netPosition: number;
    };
    optimizationSuggestions: {
        suggestion: string;
        expectedBenefit: string;
        risk: "low" | "medium" | "high" | "critical";
        implementationCost?: string | number | bigint | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
}>;
/**
 * Type exports for TypeScript inference
 */
export type CDPStatus = z.infer<typeof CDPStatusSchema>;
export type CDP = z.infer<typeof CDPSchema>;
export type CreateCDP = z.infer<typeof CreateCDPSchema>;
export type CDPCollateralUpdate = z.infer<typeof CDPCollateralUpdateSchema>;
export type CDPDebtUpdate = z.infer<typeof CDPDebtUpdateSchema>;
export type CDPLiquidation = z.infer<typeof CDPLiquidationSchema>;
export type CDPPortfolio = z.infer<typeof CDPPortfolioSchema>;
export type CDPEvent = z.infer<typeof CDPEventSchema>;
export type CDPAnalytics = z.infer<typeof CDPAnalyticsSchema>;
export type BatchCDPOperation = z.infer<typeof BatchCDPOperationSchema>;
export type CDPSystemParameters = z.infer<typeof CDPSystemParametersSchema>;
export type EnhancedCDP = z.infer<typeof EnhancedCDPSchema>;
//# sourceMappingURL=cdp.d.ts.map