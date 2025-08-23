/**
 * @nyxusd/validators - Shared validation library with Zod schemas
 *
 * This library provides comprehensive validation schemas and utilities for the NyxUSD CDP system.
 * It includes runtime type validation, data sanitization, and functional composition patterns.
 */
export * from "./schemas/common.js";
export * from "./schemas/collateral.js";
export * from "./schemas/cdp.js";
export * from "./schemas/oracle.js";
export * from "./utils/validate.js";
export * from "./utils/sanitize.js";
export type { ValidationError as ValidatorError } from "./utils/validate.js";
export { z } from "zod";
/**
 * Validation presets for common use cases
 */
import { z } from "zod";
export declare const CommonValidators: {
    address: (data: unknown) => import("./utils/validate.js").Result<string, import("./utils/validate.js").ValidationError>;
    amount: (data: unknown) => import("./utils/validate.js").Result<string | number | bigint, import("./utils/validate.js").ValidationError>;
    price: (data: unknown) => import("./utils/validate.js").Result<number, import("./utils/validate.js").ValidationError>;
    bigint: (data: unknown) => import("./utils/validate.js").Result<string | number | bigint, import("./utils/validate.js").ValidationError>;
    timestamp: (data: unknown) => import("./utils/validate.js").Result<number, import("./utils/validate.js").ValidationError>;
    hash: (data: unknown) => import("./utils/validate.js").Result<string, import("./utils/validate.js").ValidationError>;
    collateralDeposit: (data: unknown) => import("./utils/validate.js").Result<{
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
    }, import("./utils/validate.js").ValidationError>;
    collateralWithdrawal: (data: unknown) => import("./utils/validate.js").Result<{
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
    }, import("./utils/validate.js").ValidationError>;
    createCDP: (data: unknown) => import("./utils/validate.js").Result<{
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
    }, import("./utils/validate.js").ValidationError>;
    cdpCollateralUpdate: (data: unknown) => import("./utils/validate.js").Result<{
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
    }, import("./utils/validate.js").ValidationError>;
    cdpDebtUpdate: (data: unknown) => import("./utils/validate.js").Result<{
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
    }, import("./utils/validate.js").ValidationError>;
    oraclePriceData: (data: unknown) => import("./utils/validate.js").Result<{
        timestamp: number;
        decimals: number;
        confidence: number;
        price: bigint;
        feedId: string;
        roundId: bigint;
        source: string;
    }, import("./utils/validate.js").ValidationError>;
    oracleQuery: (data: unknown) => import("./utils/validate.js").Result<{
        feedId: string;
        maxStaleness?: number | undefined;
        minConfidence?: number | undefined;
        allowCached?: boolean | undefined;
        timeout?: number | undefined;
    }, import("./utils/validate.js").ValidationError>;
    oracleFeedConfig: (data: unknown) => import("./utils/validate.js").Result<{
        address: string;
        decimals: number;
        isActive: boolean;
        description: string;
        priority: number;
        feedId: string;
        minConfidence: number;
        heartbeat: number;
        deviationThreshold: number;
        category?: "crypto" | "stablecoin" | "commodity" | "forex" | undefined;
    }, import("./utils/validate.js").ValidationError>;
    chainlinkRoundData: (data: unknown) => import("./utils/validate.js").Result<{
        updatedAt: bigint;
        roundId: bigint;
        answer: bigint;
        startedAt: bigint;
        answeredInRound: bigint;
    }, import("./utils/validate.js").ValidationError>;
    priceValidationResult: (data: unknown) => import("./utils/validate.js").Result<{
        issues: {
            code: string;
            message: string;
            severity: "info" | "error" | "warning";
            metadata?: Record<string, unknown> | undefined;
        }[];
        isValid: boolean;
        score: number;
        validatedData?: {
            timestamp: number;
            decimals: number;
            confidence: number;
            price: bigint;
            feedId: string;
            roundId: bigint;
            source: string;
        } | undefined;
    }, import("./utils/validate.js").ValidationError>;
};
export declare const CommonSanitizers: {
    address: (address: unknown) => string;
    amount: (input: unknown) => string;
    price: (input: unknown) => number;
};
/**
 * High-level validation functions for common workflows
 */
export declare const validateTransaction: (transaction: unknown) => import("./utils/validate.js").Result<{
    to: string;
    from: string;
    timestamp: number;
    value: string | number | bigint;
    hash: string;
    gasPrice: string | number | bigint;
    gasLimit: string | number | bigint;
    nonce: number;
}, import("./utils/validate.js").ValidationError>;
export declare const validateUserInput: <T>(schema: z.ZodSchema<T>, input: unknown, sanitize?: boolean) => import("./utils/validate.js").Result<T, import("./utils/validate.js").ValidationError>;
export declare const validateApiRequest: <T>(schema: z.ZodSchema<T>, request: unknown, options?: {
    sanitize?: boolean;
    maxSize?: number;
    requireAuth?: boolean;
}) => import("./utils/validate.js").Result<T, import("./utils/validate.js").ValidationError>;
/**
 * Batch validation utilities
 */
export declare const validateBatch: <T>(schema: z.ZodSchema<T>, items: unknown[], options?: {
    maxItems?: number;
    failFast?: boolean;
}) => {
    success: false;
    error: {
        code: string;
        message: string;
        details?: never;
    };
    data?: never;
} | {
    success: false;
    error: {
        code: string;
        message: string;
        details: {
            errors: {
                readonly success: false;
                readonly error: import("./utils/validate.js").ValidationError;
            }[];
            totalItems: number;
        };
    };
    data?: never;
} | {
    success: true;
    data: T[];
    error?: never;
};
/**
 * Schema composition utilities
 */
export declare const createConditionalSchema: <T, U>(condition: (data: unknown) => boolean, schemaA: z.ZodSchema<T>, schemaB: z.ZodSchema<U>) => z.ZodSchema<T | U>;
export declare const createVersionedSchema: <T>(schemas: Record<string, z.ZodSchema<T>>, defaultVersion?: string) => z.ZodEffects<z.ZodObject<{
    version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    data: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    version: string;
    data?: unknown;
}, {
    data?: unknown;
    version?: string | undefined;
}>, {
    version: string;
    data?: unknown;
}, {
    data?: unknown;
    version?: string | undefined;
}>;
/**
 * Validation middleware patterns
 */
export type ValidationMiddleware<T = unknown> = (data: unknown, next: (validatedData: T) => void, error: (err: Error) => void) => void;
export declare const createValidationMiddleware: <T>(schema: z.ZodSchema<T>, options?: {
    sanitize?: boolean;
}) => ValidationMiddleware<T>;
/**
 * Testing utilities
 */
export declare const generateSampleData: <T>(schema: z.ZodSchema<T>) => Partial<T>;
/**
 * Performance monitoring
 */
export interface ValidationMetrics {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    averageValidationTime: number;
    schemaUsageStats: Record<string, number>;
}
export declare class ValidationMetricsCollector {
    private metrics;
    recordValidation(schemaName: string, success: boolean, duration: number): void;
    getMetrics(): ValidationMetrics;
    reset(): void;
}
export declare const validationMetrics: ValidationMetricsCollector;
//# sourceMappingURL=index.d.ts.map