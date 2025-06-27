/**
 * Oracle Error Types
 *
 * Comprehensive error handling for oracle operations following
 * functional programming patterns with detailed error information
 */
import { z } from "zod";
/**
 * Base oracle error schema
 */
export declare const OracleErrorSchema: z.ZodObject<{
    /** Error type identifier */
    code: z.ZodString;
    /** Human-readable error message */
    message: z.ZodString;
    /** Error severity level */
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    /** Timestamp when error occurred */
    timestamp: z.ZodNumber;
    /** Additional error context */
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    /** Underlying error cause */
    cause: z.ZodOptional<z.ZodUnknown>;
    /** Suggested recovery actions */
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: number;
    context?: Record<string, unknown> | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: number;
    context?: Record<string, unknown> | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type OracleError = z.infer<typeof OracleErrorSchema>;
/**
 * Specific oracle error types
 */
/** Network/connectivity errors */
export declare const NetworkErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"NETWORK_ERROR">;
    severity: z.ZodEnum<["medium", "high"]>;
    context: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodOptional<z.ZodString>;
        statusCode: z.ZodOptional<z.ZodNumber>;
        timeout: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        endpoint?: string | undefined;
        statusCode?: number | undefined;
        timeout?: boolean | undefined;
    }, {
        endpoint?: string | undefined;
        statusCode?: number | undefined;
        timeout?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "NETWORK_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        endpoint?: string | undefined;
        statusCode?: number | undefined;
        timeout?: boolean | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "NETWORK_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        endpoint?: string | undefined;
        statusCode?: number | undefined;
        timeout?: boolean | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type NetworkError = z.infer<typeof NetworkErrorSchema>;
/** Invalid oracle data errors */
export declare const DataValidationErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"DATA_VALIDATION_ERROR">;
    severity: z.ZodEnum<["medium", "high"]>;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        receivedData: z.ZodOptional<z.ZodUnknown>;
        validationRules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    }, {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "DATA_VALIDATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "DATA_VALIDATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        receivedData?: unknown;
        validationRules?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type DataValidationError = z.infer<typeof DataValidationErrorSchema>;
/** Stale data errors */
export declare const StaleDataErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"STALE_DATA_ERROR">;
    severity: z.ZodEnum<["low", "medium"]>;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        lastUpdate: z.ZodOptional<z.ZodNumber>;
        maxAge: z.ZodOptional<z.ZodNumber>;
        staleness: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        maxAge?: number | undefined;
        staleness?: number | undefined;
    }, {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        maxAge?: number | undefined;
        staleness?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "STALE_DATA_ERROR";
    message: string;
    severity: "low" | "medium";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        maxAge?: number | undefined;
        staleness?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "STALE_DATA_ERROR";
    message: string;
    severity: "low" | "medium";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        lastUpdate?: number | undefined;
        maxAge?: number | undefined;
        staleness?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type StaleDataError = z.infer<typeof StaleDataErrorSchema>;
/** Price deviation errors */
export declare const PriceDeviationErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"PRICE_DEVIATION_ERROR">;
    severity: z.ZodEnum<["medium", "high", "critical"]>;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        currentPrice: z.ZodOptional<z.ZodString>;
        expectedPrice: z.ZodOptional<z.ZodString>;
        deviation: z.ZodOptional<z.ZodNumber>;
        threshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        currentPrice?: string | undefined;
        expectedPrice?: string | undefined;
        deviation?: number | undefined;
        threshold?: number | undefined;
    }, {
        feedId?: string | undefined;
        currentPrice?: string | undefined;
        expectedPrice?: string | undefined;
        deviation?: number | undefined;
        threshold?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "PRICE_DEVIATION_ERROR";
    message: string;
    severity: "medium" | "high" | "critical";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        currentPrice?: string | undefined;
        expectedPrice?: string | undefined;
        deviation?: number | undefined;
        threshold?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "PRICE_DEVIATION_ERROR";
    message: string;
    severity: "medium" | "high" | "critical";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        currentPrice?: string | undefined;
        expectedPrice?: string | undefined;
        deviation?: number | undefined;
        threshold?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type PriceDeviationError = z.infer<typeof PriceDeviationErrorSchema>;
/** Low confidence errors */
export declare const LowConfidenceErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"LOW_CONFIDENCE_ERROR">;
    severity: z.ZodEnum<["low", "medium"]>;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        confidence: z.ZodOptional<z.ZodNumber>;
        requiredConfidence: z.ZodOptional<z.ZodNumber>;
        sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        confidence?: number | undefined;
        requiredConfidence?: number | undefined;
        sources?: string[] | undefined;
    }, {
        feedId?: string | undefined;
        confidence?: number | undefined;
        requiredConfidence?: number | undefined;
        sources?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "LOW_CONFIDENCE_ERROR";
    message: string;
    severity: "low" | "medium";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        confidence?: number | undefined;
        requiredConfidence?: number | undefined;
        sources?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "LOW_CONFIDENCE_ERROR";
    message: string;
    severity: "low" | "medium";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        confidence?: number | undefined;
        requiredConfidence?: number | undefined;
        sources?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type LowConfidenceError = z.infer<typeof LowConfidenceErrorSchema>;
/** Circuit breaker errors */
export declare const CircuitBreakerErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"CIRCUIT_BREAKER_ERROR">;
    severity: z.ZodEnum<["high", "critical"]>;
    context: z.ZodOptional<z.ZodObject<{
        feedId: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodEnum<["open", "half_open"]>>;
        failureCount: z.ZodOptional<z.ZodNumber>;
        lastFailure: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        feedId?: string | undefined;
        state?: "open" | "half_open" | undefined;
        failureCount?: number | undefined;
        lastFailure?: number | undefined;
    }, {
        feedId?: string | undefined;
        state?: "open" | "half_open" | undefined;
        failureCount?: number | undefined;
        lastFailure?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "CIRCUIT_BREAKER_ERROR";
    message: string;
    severity: "high" | "critical";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        state?: "open" | "half_open" | undefined;
        failureCount?: number | undefined;
        lastFailure?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "CIRCUIT_BREAKER_ERROR";
    message: string;
    severity: "high" | "critical";
    timestamp: number;
    context?: {
        feedId?: string | undefined;
        state?: "open" | "half_open" | undefined;
        failureCount?: number | undefined;
        lastFailure?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type CircuitBreakerError = z.infer<typeof CircuitBreakerErrorSchema>;
/** Aggregation errors */
export declare const AggregationErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"AGGREGATION_ERROR">;
    severity: z.ZodEnum<["medium", "high"]>;
    context: z.ZodOptional<z.ZodObject<{
        method: z.ZodOptional<z.ZodString>;
        sourceCount: z.ZodOptional<z.ZodNumber>;
        requiredSources: z.ZodOptional<z.ZodNumber>;
        failures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        method?: string | undefined;
        sourceCount?: number | undefined;
        requiredSources?: number | undefined;
        failures?: string[] | undefined;
    }, {
        method?: string | undefined;
        sourceCount?: number | undefined;
        requiredSources?: number | undefined;
        failures?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "AGGREGATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        method?: string | undefined;
        sourceCount?: number | undefined;
        requiredSources?: number | undefined;
        failures?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "AGGREGATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        method?: string | undefined;
        sourceCount?: number | undefined;
        requiredSources?: number | undefined;
        failures?: string[] | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type AggregationError = z.infer<typeof AggregationErrorSchema>;
/** Configuration errors */
export declare const ConfigurationErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"CONFIGURATION_ERROR">;
    severity: z.ZodEnum<["medium", "high"]>;
    context: z.ZodOptional<z.ZodObject<{
        parameter: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodUnknown>;
        expectedType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value?: unknown;
        parameter?: string | undefined;
        expectedType?: string | undefined;
    }, {
        value?: unknown;
        parameter?: string | undefined;
        expectedType?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "CONFIGURATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        value?: unknown;
        parameter?: string | undefined;
        expectedType?: string | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "CONFIGURATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        value?: unknown;
        parameter?: string | undefined;
        expectedType?: string | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type ConfigurationError = z.infer<typeof ConfigurationErrorSchema>;
/** Rate limiting errors */
export declare const RateLimitErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"RATE_LIMIT_ERROR">;
    severity: z.ZodEnum<["low", "medium"]>;
    context: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
        resetTime: z.ZodOptional<z.ZodNumber>;
        retryAfter: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        endpoint?: string | undefined;
        limit?: number | undefined;
        resetTime?: number | undefined;
        retryAfter?: number | undefined;
    }, {
        endpoint?: string | undefined;
        limit?: number | undefined;
        resetTime?: number | undefined;
        retryAfter?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "RATE_LIMIT_ERROR";
    message: string;
    severity: "low" | "medium";
    timestamp: number;
    context?: {
        endpoint?: string | undefined;
        limit?: number | undefined;
        resetTime?: number | undefined;
        retryAfter?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "RATE_LIMIT_ERROR";
    message: string;
    severity: "low" | "medium";
    timestamp: number;
    context?: {
        endpoint?: string | undefined;
        limit?: number | undefined;
        resetTime?: number | undefined;
        retryAfter?: number | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type RateLimitError = z.infer<typeof RateLimitErrorSchema>;
/** Authentication errors */
export declare const AuthenticationErrorSchema: z.ZodObject<{
    message: z.ZodString;
    timestamp: z.ZodNumber;
    cause: z.ZodOptional<z.ZodUnknown>;
    recoveryActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    code: z.ZodLiteral<"AUTHENTICATION_ERROR">;
    severity: z.ZodEnum<["medium", "high"]>;
    context: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        endpoint: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        endpoint?: string | undefined;
        provider?: string | undefined;
    }, {
        endpoint?: string | undefined;
        provider?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: "AUTHENTICATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        endpoint?: string | undefined;
        provider?: string | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}, {
    code: "AUTHENTICATION_ERROR";
    message: string;
    severity: "medium" | "high";
    timestamp: number;
    context?: {
        endpoint?: string | undefined;
        provider?: string | undefined;
    } | undefined;
    cause?: unknown;
    recoveryActions?: string[] | undefined;
}>;
export type AuthenticationError = z.infer<typeof AuthenticationErrorSchema>;
/**
 * Generic validation error for schema validation
 */
export declare const ValidationErrorSchema: z.ZodObject<{
    code: z.ZodLiteral<"VALIDATION_ERROR">;
    message: z.ZodString;
    field: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodUnknown>;
    details: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">;
        message: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        path: (string | number)[];
    }, {
        code: string;
        message: string;
        path: (string | number)[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: "VALIDATION_ERROR";
    message: string;
    value?: unknown;
    field?: string | undefined;
    details?: {
        code: string;
        message: string;
        path: (string | number)[];
    }[] | undefined;
}, {
    code: "VALIDATION_ERROR";
    message: string;
    value?: unknown;
    field?: string | undefined;
    details?: {
        code: string;
        message: string;
        path: (string | number)[];
    }[] | undefined;
}>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
/**
 * Union type for all oracle errors
 */
export type AnyOracleError = NetworkError | DataValidationError | StaleDataError | PriceDeviationError | LowConfidenceError | CircuitBreakerError | AggregationError | ConfigurationError | RateLimitError | AuthenticationError;
/**
 * Error factory functions for creating well-formed errors
 */
export declare const createNetworkError: (message: string, context?: {
    endpoint?: string;
    statusCode?: number;
    timeout?: boolean;
}) => NetworkError;
export declare const createDataValidationError: (message: string, context?: {
    feedId?: string;
    receivedData?: unknown;
    validationRules?: string[];
}) => DataValidationError;
export declare const createStaleDataError: (message: string, context?: {
    feedId?: string;
    lastUpdate?: number;
    maxAge?: number;
    staleness?: number;
}) => StaleDataError;
export declare const createPriceDeviationError: (message: string, context?: {
    feedId?: string;
    currentPrice?: string;
    expectedPrice?: string;
    deviation?: number;
    threshold?: number;
}) => PriceDeviationError;
export declare const createCircuitBreakerError: (message: string, context?: {
    feedId?: string;
    state?: "open" | "half_open";
    failureCount?: number;
    lastFailure?: number;
}) => CircuitBreakerError;
/**
 * Error categorization utilities
 */
export declare const isRecoverableError: (error: OracleError) => boolean;
export declare const isCriticalError: (error: OracleError) => boolean;
export declare const getErrorRetryDelay: (error: OracleError) => number;
//# sourceMappingURL=oracle-errors.d.ts.map