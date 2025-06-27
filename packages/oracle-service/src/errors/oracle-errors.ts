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
export const OracleErrorSchema = z.object({
  /** Error type identifier */
  code: z.string().min(1),
  /** Human-readable error message */
  message: z.string().min(1),
  /** Error severity level */
  severity: z.enum(["low", "medium", "high", "critical"]),
  /** Timestamp when error occurred */
  timestamp: z.number().int().positive(),
  /** Additional error context */
  context: z.record(z.unknown()).optional(),
  /** Underlying error cause */
  cause: z.unknown().optional(),
  /** Suggested recovery actions */
  recoveryActions: z.array(z.string()).optional(),
});

export type OracleError = z.infer<typeof OracleErrorSchema>;

/**
 * Specific oracle error types
 */

/** Network/connectivity errors */
export const NetworkErrorSchema = OracleErrorSchema.extend({
  code: z.literal("NETWORK_ERROR"),
  severity: z.enum(["medium", "high"]),
  context: z
    .object({
      endpoint: z.string().optional(),
      statusCode: z.number().int().optional(),
      timeout: z.boolean().optional(),
    })
    .optional(),
});

export type NetworkError = z.infer<typeof NetworkErrorSchema>;

/** Invalid oracle data errors */
export const DataValidationErrorSchema = OracleErrorSchema.extend({
  code: z.literal("DATA_VALIDATION_ERROR"),
  severity: z.enum(["medium", "high"]),
  context: z
    .object({
      feedId: z.string().optional(),
      receivedData: z.unknown().optional(),
      validationRules: z.array(z.string()).optional(),
    })
    .optional(),
});

export type DataValidationError = z.infer<typeof DataValidationErrorSchema>;

/** Stale data errors */
export const StaleDataErrorSchema = OracleErrorSchema.extend({
  code: z.literal("STALE_DATA_ERROR"),
  severity: z.enum(["low", "medium"]),
  context: z
    .object({
      feedId: z.string().optional(),
      lastUpdate: z.number().int().optional(),
      maxAge: z.number().int().optional(),
      staleness: z.number().int().optional(),
    })
    .optional(),
});

export type StaleDataError = z.infer<typeof StaleDataErrorSchema>;

/** Price deviation errors */
export const PriceDeviationErrorSchema = OracleErrorSchema.extend({
  code: z.literal("PRICE_DEVIATION_ERROR"),
  severity: z.enum(["medium", "high", "critical"]),
  context: z
    .object({
      feedId: z.string().optional(),
      currentPrice: z.string().optional(),
      expectedPrice: z.string().optional(),
      deviation: z.number().optional(),
      threshold: z.number().optional(),
    })
    .optional(),
});

export type PriceDeviationError = z.infer<typeof PriceDeviationErrorSchema>;

/** Low confidence errors */
export const LowConfidenceErrorSchema = OracleErrorSchema.extend({
  code: z.literal("LOW_CONFIDENCE_ERROR"),
  severity: z.enum(["low", "medium"]),
  context: z
    .object({
      feedId: z.string().optional(),
      confidence: z.number().optional(),
      requiredConfidence: z.number().optional(),
      sources: z.array(z.string()).optional(),
    })
    .optional(),
});

export type LowConfidenceError = z.infer<typeof LowConfidenceErrorSchema>;

/** Circuit breaker errors */
export const CircuitBreakerErrorSchema = OracleErrorSchema.extend({
  code: z.literal("CIRCUIT_BREAKER_ERROR"),
  severity: z.enum(["high", "critical"]),
  context: z
    .object({
      feedId: z.string().optional(),
      state: z.enum(["open", "half_open"]).optional(),
      failureCount: z.number().int().optional(),
      lastFailure: z.number().int().optional(),
    })
    .optional(),
});

export type CircuitBreakerError = z.infer<typeof CircuitBreakerErrorSchema>;

/** Aggregation errors */
export const AggregationErrorSchema = OracleErrorSchema.extend({
  code: z.literal("AGGREGATION_ERROR"),
  severity: z.enum(["medium", "high"]),
  context: z
    .object({
      method: z.string().optional(),
      sourceCount: z.number().int().optional(),
      requiredSources: z.number().int().optional(),
      failures: z.array(z.string()).optional(),
    })
    .optional(),
});

export type AggregationError = z.infer<typeof AggregationErrorSchema>;

/** Configuration errors */
export const ConfigurationErrorSchema = OracleErrorSchema.extend({
  code: z.literal("CONFIGURATION_ERROR"),
  severity: z.enum(["medium", "high"]),
  context: z
    .object({
      parameter: z.string().optional(),
      value: z.unknown().optional(),
      expectedType: z.string().optional(),
    })
    .optional(),
});

export type ConfigurationError = z.infer<typeof ConfigurationErrorSchema>;

/** Rate limiting errors */
export const RateLimitErrorSchema = OracleErrorSchema.extend({
  code: z.literal("RATE_LIMIT_ERROR"),
  severity: z.enum(["low", "medium"]),
  context: z
    .object({
      endpoint: z.string().optional(),
      limit: z.number().int().optional(),
      resetTime: z.number().int().optional(),
      retryAfter: z.number().int().optional(),
    })
    .optional(),
});

export type RateLimitError = z.infer<typeof RateLimitErrorSchema>;

/** Authentication errors */
export const AuthenticationErrorSchema = OracleErrorSchema.extend({
  code: z.literal("AUTHENTICATION_ERROR"),
  severity: z.enum(["medium", "high"]),
  context: z
    .object({
      provider: z.string().optional(),
      endpoint: z.string().optional(),
    })
    .optional(),
});

export type AuthenticationError = z.infer<typeof AuthenticationErrorSchema>;

/**
 * Generic validation error for schema validation
 */
export const ValidationErrorSchema = z.object({
  code: z.literal("VALIDATION_ERROR"),
  message: z.string(),
  field: z.string().optional(),
  value: z.unknown().optional(),
  details: z
    .array(
      z.object({
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
        code: z.string(),
      }),
    )
    .optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

/**
 * Union type for all oracle errors
 */
export type AnyOracleError =
  | NetworkError
  | DataValidationError
  | StaleDataError
  | PriceDeviationError
  | LowConfidenceError
  | CircuitBreakerError
  | AggregationError
  | ConfigurationError
  | RateLimitError
  | AuthenticationError;

/**
 * Error factory functions for creating well-formed errors
 */

export const createNetworkError = (
  message: string,
  context?: {
    endpoint?: string;
    statusCode?: number;
    timeout?: boolean;
  },
): NetworkError => ({
  code: "NETWORK_ERROR",
  message,
  severity: context?.timeout ? "high" : "medium",
  timestamp: Date.now(),
  context,
  recoveryActions: [
    "Retry request",
    "Check network connectivity",
    "Verify endpoint availability",
  ],
});

export const createDataValidationError = (
  message: string,
  context?: {
    feedId?: string;
    receivedData?: unknown;
    validationRules?: string[];
  },
): DataValidationError => ({
  code: "DATA_VALIDATION_ERROR",
  message,
  severity: "high",
  timestamp: Date.now(),
  context,
  recoveryActions: [
    "Verify data format",
    "Check oracle configuration",
    "Contact oracle provider",
  ],
});

export const createStaleDataError = (
  message: string,
  context?: {
    feedId?: string;
    lastUpdate?: number;
    maxAge?: number;
    staleness?: number;
  },
): StaleDataError => ({
  code: "STALE_DATA_ERROR",
  message,
  severity: context?.staleness && context.staleness > 3600 ? "medium" : "low",
  timestamp: Date.now(),
  context,
  recoveryActions: [
    "Wait for fresh data",
    "Use alternative oracle",
    "Increase staleness tolerance",
  ],
});

export const createPriceDeviationError = (
  message: string,
  context?: {
    feedId?: string;
    currentPrice?: string;
    expectedPrice?: string;
    deviation?: number;
    threshold?: number;
  },
): PriceDeviationError => ({
  code: "PRICE_DEVIATION_ERROR",
  message,
  severity: context?.deviation && context.deviation > 50 ? "critical" : "high",
  timestamp: Date.now(),
  context,
  recoveryActions: [
    "Cross-validate with other oracles",
    "Check for market events",
    "Adjust deviation thresholds",
    "Trigger circuit breaker",
  ],
});

export const createCircuitBreakerError = (
  message: string,
  context?: {
    feedId?: string;
    state?: "open" | "half_open";
    failureCount?: number;
    lastFailure?: number;
  },
): CircuitBreakerError => ({
  code: "CIRCUIT_BREAKER_ERROR",
  message,
  severity: "critical",
  timestamp: Date.now(),
  context,
  recoveryActions: [
    "Wait for circuit breaker reset",
    "Use fallback oracle",
    "Manual override if safe",
  ],
});

/**
 * Error categorization utilities
 */

export const isRecoverableError = (error: OracleError): boolean => {
  const recoverableErrors = [
    "NETWORK_ERROR",
    "RATE_LIMIT_ERROR",
    "STALE_DATA_ERROR",
  ];
  return recoverableErrors.includes(error.code);
};

export const isCriticalError = (error: OracleError): boolean => {
  return (
    error.severity === "critical" || error.code === "CIRCUIT_BREAKER_ERROR"
  );
};

export const getErrorRetryDelay = (error: OracleError): number => {
  switch (error.code) {
    case "NETWORK_ERROR":
      return 1000; // 1 second
    case "RATE_LIMIT_ERROR":
      return (error.context as any)?.retryAfter * 1000 || 60000; // Default 1 minute
    case "STALE_DATA_ERROR":
      return 5000; // 5 seconds
    default:
      return 0; // No retry
  }
};
