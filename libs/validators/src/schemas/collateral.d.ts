import { z } from "zod";
/**
 * Collateral asset validation schemas
 */
export declare const CollateralAssetConfigSchema: z.ZodObject<{
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
}>;
export declare const CollateralBalanceSchema: z.ZodObject<{
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
}>;
export declare const CollateralDepositSchema: z.ZodObject<{
    cdpId: z.ZodString;
    assetAddress: z.ZodEffects<z.ZodString, string, string>;
    amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    depositor: z.ZodEffects<z.ZodString, string, string>;
    transactionHash: z.ZodOptional<z.ZodString>;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    gasUsed: z.ZodOptional<z.ZodNumber>;
    minHealthFactor: z.ZodDefault<z.ZodNumber>;
    slippageTolerance: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: bigint;
    timestamp: number;
    assetAddress: string;
    cdpId: string;
    depositor: string;
    minHealthFactor: number;
    slippageTolerance: number;
    metadata?: Record<string, unknown> | undefined;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
}, {
    amount: string | number | bigint;
    timestamp: number;
    assetAddress: string;
    cdpId: string;
    depositor: string;
    metadata?: Record<string, unknown> | undefined;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    minHealthFactor?: number | undefined;
    slippageTolerance?: number | undefined;
}>;
export declare const CollateralWithdrawalSchema: z.ZodObject<{
    cdpId: z.ZodString;
    assetAddress: z.ZodEffects<z.ZodString, string, string>;
    amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    withdrawer: z.ZodEffects<z.ZodString, string, string>;
    enforceMinCollateralRatio: z.ZodDefault<z.ZodBoolean>;
    minHealthFactorAfterWithdrawal: z.ZodDefault<z.ZodNumber>;
    transactionHash: z.ZodOptional<z.ZodString>;
    blockNumber: z.ZodOptional<z.ZodNumber>;
    gasUsed: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: bigint;
    timestamp: number;
    assetAddress: string;
    cdpId: string;
    withdrawer: string;
    enforceMinCollateralRatio: boolean;
    minHealthFactorAfterWithdrawal: number;
    metadata?: Record<string, unknown> | undefined;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
}, {
    amount: string | number | bigint;
    timestamp: number;
    assetAddress: string;
    cdpId: string;
    withdrawer: string;
    metadata?: Record<string, unknown> | undefined;
    transactionHash?: string | undefined;
    blockNumber?: number | undefined;
    gasUsed?: number | undefined;
    enforceMinCollateralRatio?: boolean | undefined;
    minHealthFactorAfterWithdrawal?: number | undefined;
}>;
export declare const CollateralLiquidationSchema: z.ZodObject<{
    cdpId: z.ZodString;
    liquidator: z.ZodEffects<z.ZodString, string, string>;
    cdpOwner: z.ZodEffects<z.ZodString, string, string>;
    collateralAsset: z.ZodEffects<z.ZodString, string, string>;
    collateralAmountLiquidated: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    debtAmountRepaid: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    liquidationPenalty: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
    collateralPrice: z.ZodNumber;
    liquidationPrice: z.ZodNumber;
    healthFactorBefore: z.ZodNumber;
    transactionHash: z.ZodString;
    blockNumber: z.ZodNumber;
    gasUsed: z.ZodNumber;
    timestamp: z.ZodNumber;
    liquidationTriggeredAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    liquidationPenalty: bigint;
    cdpId: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    liquidator: string;
    cdpOwner: string;
    collateralAsset: string;
    collateralAmountLiquidated: bigint;
    debtAmountRepaid: bigint;
    collateralPrice: number;
    liquidationPrice: number;
    healthFactorBefore: number;
    liquidationTriggeredAt: number;
}, {
    timestamp: number;
    liquidationPenalty: string | number | bigint;
    cdpId: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    liquidator: string;
    cdpOwner: string;
    collateralAsset: string;
    collateralAmountLiquidated: string | number | bigint;
    debtAmountRepaid: string | number | bigint;
    collateralPrice: number;
    liquidationPrice: number;
    healthFactorBefore: number;
    liquidationTriggeredAt: number;
}>;
export declare const CollateralPriceUpdateSchema: z.ZodObject<{
    assetAddress: z.ZodEffects<z.ZodString, string, string>;
    newPrice: z.ZodNumber;
    previousPrice: z.ZodOptional<z.ZodNumber>;
    priceChange: z.ZodNumber;
    priceChangePercent: z.ZodNumber;
    oracleAddress: z.ZodEffects<z.ZodString, string, string>;
    oracleRound: z.ZodNumber;
    confidence: z.ZodNumber;
    isValidPrice: z.ZodBoolean;
    priceDeviation: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodNumber;
    oracleTimestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    oracleAddress: string;
    assetAddress: string;
    newPrice: number;
    priceChange: number;
    priceChangePercent: number;
    oracleRound: number;
    confidence: number;
    isValidPrice: boolean;
    oracleTimestamp: number;
    previousPrice?: number | undefined;
    priceDeviation?: number | undefined;
}, {
    timestamp: number;
    oracleAddress: string;
    assetAddress: string;
    newPrice: number;
    priceChange: number;
    priceChangePercent: number;
    oracleRound: number;
    confidence: number;
    isValidPrice: boolean;
    oracleTimestamp: number;
    previousPrice?: number | undefined;
    priceDeviation?: number | undefined;
}>;
export declare const CollateralRiskAssessmentSchema: z.ZodObject<{
    assetAddress: z.ZodEffects<z.ZodString, string, string>;
    assessmentId: z.ZodString;
    volatility: z.ZodNumber;
    liquidityScore: z.ZodNumber;
    marketCapRank: z.ZodOptional<z.ZodNumber>;
    averageDailyVolume: z.ZodNumber;
    priceVolatility30d: z.ZodNumber;
    priceVolatility90d: z.ZodNumber;
    maxDrawdown: z.ZodNumber;
    correlationWithBtc: z.ZodOptional<z.ZodNumber>;
    correlationWithEth: z.ZodOptional<z.ZodNumber>;
    overallRiskScore: z.ZodNumber;
    riskLevel: z.ZodEnum<["low", "medium", "high", "critical"]>;
    recommendedLtv: z.ZodNumber;
    assessedBy: z.ZodString;
    assessmentDate: z.ZodNumber;
    validUntil: z.ZodNumber;
    methodology: z.ZodString;
    externalRatings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        rating: z.ZodString;
        ratingDate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        rating: string;
        ratingDate: number;
    }, {
        provider: string;
        rating: string;
        ratingDate: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    assetAddress: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    assessmentId: string;
    volatility: number;
    liquidityScore: number;
    averageDailyVolume: number;
    priceVolatility30d: number;
    priceVolatility90d: number;
    maxDrawdown: number;
    overallRiskScore: number;
    recommendedLtv: number;
    assessedBy: string;
    assessmentDate: number;
    validUntil: number;
    methodology: string;
    marketCapRank?: number | undefined;
    correlationWithBtc?: number | undefined;
    correlationWithEth?: number | undefined;
    externalRatings?: {
        provider: string;
        rating: string;
        ratingDate: number;
    }[] | undefined;
}, {
    assetAddress: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    assessmentId: string;
    volatility: number;
    liquidityScore: number;
    averageDailyVolume: number;
    priceVolatility30d: number;
    priceVolatility90d: number;
    maxDrawdown: number;
    overallRiskScore: number;
    recommendedLtv: number;
    assessedBy: string;
    assessmentDate: number;
    validUntil: number;
    methodology: string;
    marketCapRank?: number | undefined;
    correlationWithBtc?: number | undefined;
    correlationWithEth?: number | undefined;
    externalRatings?: {
        provider: string;
        rating: string;
        ratingDate: number;
    }[] | undefined;
}>;
export declare const CollateralPortfolioSchema: z.ZodObject<{
    owner: z.ZodEffects<z.ZodString, string, string>;
    portfolioId: z.ZodString;
    collateralAssets: z.ZodArray<z.ZodObject<{
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        value: z.ZodNumber;
        weight: z.ZodNumber;
        allocationTarget: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        value: number;
        assetAddress: string;
        weight: number;
        allocationTarget?: number | undefined;
    }, {
        amount: string | number | bigint;
        value: number;
        assetAddress: string;
        weight: number;
        allocationTarget?: number | undefined;
    }>, "many">;
    totalValue: z.ZodNumber;
    averageHealthFactor: z.ZodNumber;
    portfolioRiskScore: z.ZodNumber;
    diversificationScore: z.ZodNumber;
    totalReturn: z.ZodNumber;
    totalReturnPercent: z.ZodNumber;
    volatility: z.ZodNumber;
    sharpeRatio: z.ZodOptional<z.ZodNumber>;
    needsRebalancing: z.ZodBoolean;
    lastRebalanced: z.ZodOptional<z.ZodNumber>;
    rebalancingThreshold: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodNumber;
    lastUpdated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    createdAt: number;
    owner: string;
    totalValue: number;
    lastUpdated: number;
    volatility: number;
    portfolioId: string;
    collateralAssets: {
        amount: bigint;
        value: number;
        assetAddress: string;
        weight: number;
        allocationTarget?: number | undefined;
    }[];
    averageHealthFactor: number;
    portfolioRiskScore: number;
    diversificationScore: number;
    totalReturn: number;
    totalReturnPercent: number;
    needsRebalancing: boolean;
    rebalancingThreshold: number;
    sharpeRatio?: number | undefined;
    lastRebalanced?: number | undefined;
}, {
    createdAt: number;
    owner: string;
    totalValue: number;
    lastUpdated: number;
    volatility: number;
    portfolioId: string;
    collateralAssets: {
        amount: string | number | bigint;
        value: number;
        assetAddress: string;
        weight: number;
        allocationTarget?: number | undefined;
    }[];
    averageHealthFactor: number;
    portfolioRiskScore: number;
    diversificationScore: number;
    totalReturn: number;
    totalReturnPercent: number;
    needsRebalancing: boolean;
    sharpeRatio?: number | undefined;
    lastRebalanced?: number | undefined;
    rebalancingThreshold?: number | undefined;
}>;
export declare const BatchCollateralOperationSchema: z.ZodObject<{
    batchId: z.ZodString;
    operations: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        cdpId: z.ZodString;
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        depositor: z.ZodEffects<z.ZodString, string, string>;
        transactionHash: z.ZodOptional<z.ZodString>;
        blockNumber: z.ZodOptional<z.ZodNumber>;
        gasUsed: z.ZodOptional<z.ZodNumber>;
        minHealthFactor: z.ZodDefault<z.ZodNumber>;
        slippageTolerance: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        depositor: string;
        minHealthFactor: number;
        slippageTolerance: number;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
    }, {
        amount: string | number | bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        depositor: string;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        minHealthFactor?: number | undefined;
        slippageTolerance?: number | undefined;
    }>, z.ZodObject<{
        cdpId: z.ZodString;
        assetAddress: z.ZodEffects<z.ZodString, string, string>;
        amount: z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>;
        withdrawer: z.ZodEffects<z.ZodString, string, string>;
        enforceMinCollateralRatio: z.ZodDefault<z.ZodBoolean>;
        minHealthFactorAfterWithdrawal: z.ZodDefault<z.ZodNumber>;
        transactionHash: z.ZodOptional<z.ZodString>;
        blockNumber: z.ZodOptional<z.ZodNumber>;
        gasUsed: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        withdrawer: string;
        enforceMinCollateralRatio: boolean;
        minHealthFactorAfterWithdrawal: number;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
    }, {
        amount: string | number | bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        withdrawer: string;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        enforceMinCollateralRatio?: boolean | undefined;
        minHealthFactorAfterWithdrawal?: number | undefined;
    }>]>, "many">;
    atomicExecution: z.ZodDefault<z.ZodBoolean>;
    maxGasPrice: z.ZodOptional<z.ZodNumber>;
    deadline: z.ZodOptional<z.ZodNumber>;
    initiator: z.ZodEffects<z.ZodString, string, string>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: number;
    batchId: string;
    operations: ({
        amount: bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        depositor: string;
        minHealthFactor: number;
        slippageTolerance: number;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
    } | {
        amount: bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        withdrawer: string;
        enforceMinCollateralRatio: boolean;
        minHealthFactorAfterWithdrawal: number;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
    })[];
    atomicExecution: boolean;
    initiator: string;
    maxGasPrice?: number | undefined;
    deadline?: number | undefined;
}, {
    timestamp: number;
    batchId: string;
    operations: ({
        amount: string | number | bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        depositor: string;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        minHealthFactor?: number | undefined;
        slippageTolerance?: number | undefined;
    } | {
        amount: string | number | bigint;
        timestamp: number;
        assetAddress: string;
        cdpId: string;
        withdrawer: string;
        metadata?: Record<string, unknown> | undefined;
        transactionHash?: string | undefined;
        blockNumber?: number | undefined;
        gasUsed?: number | undefined;
        enforceMinCollateralRatio?: boolean | undefined;
        minHealthFactorAfterWithdrawal?: number | undefined;
    })[];
    initiator: string;
    atomicExecution?: boolean | undefined;
    maxGasPrice?: number | undefined;
    deadline?: number | undefined;
}>;
/**
 * Derived schemas with additional validation
 */
export declare const EnrichedCollateralSchema: z.ZodObject<{
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
} & {
    riskMetrics: z.ZodObject<{
        liquidationRisk: z.ZodNumber;
        timeToLiquidation: z.ZodOptional<z.ZodNumber>;
        stressTestResults: z.ZodObject<{
            priceDropToLiquidation: z.ZodNumber;
            worstCaseScenario: z.ZodObject<{
                priceShock: z.ZodNumber;
                resultingHealthFactor: z.ZodNumber;
                liquidationAmount: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodBigInt, z.ZodEffects<z.ZodEffects<z.ZodString, bigint, string>, bigint, string>, z.ZodEffects<z.ZodNumber, bigint, number>]>, bigint, string | number | bigint>>;
            }, "strip", z.ZodTypeAny, {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: bigint | undefined;
            }, {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: string | number | bigint | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            priceDropToLiquidation: number;
            worstCaseScenario: {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: bigint | undefined;
            };
        }, {
            priceDropToLiquidation: number;
            worstCaseScenario: {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: string | number | bigint | undefined;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        liquidationRisk: number;
        stressTestResults: {
            priceDropToLiquidation: number;
            worstCaseScenario: {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: bigint | undefined;
            };
        };
        timeToLiquidation?: number | undefined;
    }, {
        liquidationRisk: number;
        stressTestResults: {
            priceDropToLiquidation: number;
            worstCaseScenario: {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: string | number | bigint | undefined;
            };
        };
        timeToLiquidation?: number | undefined;
    }>;
    performanceMetrics: z.ZodOptional<z.ZodObject<{
        returns1d: z.ZodNumber;
        returns7d: z.ZodNumber;
        returns30d: z.ZodNumber;
        volatility: z.ZodNumber;
        maxDrawdown: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        volatility: number;
        maxDrawdown: number;
        returns1d: number;
        returns7d: number;
        returns30d: number;
    }, {
        volatility: number;
        maxDrawdown: number;
        returns1d: number;
        returns7d: number;
        returns30d: number;
    }>>;
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
    riskMetrics: {
        liquidationRisk: number;
        stressTestResults: {
            priceDropToLiquidation: number;
            worstCaseScenario: {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: bigint | undefined;
            };
        };
        timeToLiquidation?: number | undefined;
    };
    performanceMetrics?: {
        volatility: number;
        maxDrawdown: number;
        returns1d: number;
        returns7d: number;
        returns30d: number;
    } | undefined;
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
    riskMetrics: {
        liquidationRisk: number;
        stressTestResults: {
            priceDropToLiquidation: number;
            worstCaseScenario: {
                priceShock: number;
                resultingHealthFactor: number;
                liquidationAmount?: string | number | bigint | undefined;
            };
        };
        timeToLiquidation?: number | undefined;
    };
    performanceMetrics?: {
        volatility: number;
        maxDrawdown: number;
        returns1d: number;
        returns7d: number;
        returns30d: number;
    } | undefined;
}>;
/**
 * Type exports for TypeScript inference
 */
export type CollateralAssetConfig = z.infer<typeof CollateralAssetConfigSchema>;
export type CollateralBalance = z.infer<typeof CollateralBalanceSchema>;
export type CollateralDeposit = z.infer<typeof CollateralDepositSchema>;
export type CollateralWithdrawal = z.infer<typeof CollateralWithdrawalSchema>;
export type CollateralLiquidation = z.infer<typeof CollateralLiquidationSchema>;
export type CollateralPriceUpdate = z.infer<typeof CollateralPriceUpdateSchema>;
export type CollateralRiskAssessment = z.infer<typeof CollateralRiskAssessmentSchema>;
export type CollateralPortfolio = z.infer<typeof CollateralPortfolioSchema>;
export type BatchCollateralOperation = z.infer<typeof BatchCollateralOperationSchema>;
export type EnrichedCollateral = z.infer<typeof EnrichedCollateralSchema>;
//# sourceMappingURL=collateral.d.ts.map