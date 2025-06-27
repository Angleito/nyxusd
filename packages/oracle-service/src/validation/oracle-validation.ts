/**
 * Oracle Validation
 * 
 * Comprehensive validation for oracle data using Zod schemas
 * with functional programming patterns for composable validation
 */

import { z } from 'zod';
import { pipe } from 'fp-ts/function';
import { Either, left, right, chain, map } from 'fp-ts/Either';
import { Option, some, none } from 'fp-ts/Option';
import * as A from 'fp-ts/Array';

import { 
  OraclePriceData,
  OraclePriceDataSchema,
  OracleQuery,
  OracleQuerySchema,
  PriceValidationResult
} from '../types/oracle-types';

import { 
  ChainlinkRoundData,
  ChainlinkRoundDataSchema 
} from '../types/chainlink-types';

import {
  AggregationResult,
  AggregationResultSchema,
  MultiOracleData,
  MultiOracleDataSchema,
  PriceValidationRules
} from '../types/aggregation-types';

import {
  ValidationError,
  OracleError,
  createDataValidationError,
  createStaleDataError,
  createPriceDeviationError
} from '../errors/oracle-errors';

/**
 * Extended oracle price validation schema with additional constraints
 */
export const ExtendedOraclePriceValidationSchema = OraclePriceDataSchema.extend({
  feedId: z.string().min(1).max(50).regex(/^[A-Z]{2,10}-[A-Z]{2,10}$/, 'Feed ID must be in format ASSET-QUOTE'),
  price: z.bigint().positive().refine(
    (val) => val < BigInt('999999999999999999999999999999'),
    'Price value too large'
  ),
  decimals: z.number().int().min(0).max(18),
  timestamp: z.number().int().positive().refine(
    (val) => val > 946684800, // After year 2000
    'Timestamp too old'
  ),
  confidence: z.number().min(0).max(100).multipleOf(0.1),
}).refine(
  (data) => {
    const now = Math.floor(Date.now() / 1000);
    return data.timestamp <= now + 300; // Allow 5 minutes in future for clock skew
  },
  'Timestamp cannot be in the future'
);

/**
 * Oracle query validation with enhanced rules
 */
export const ExtendedOracleQuerySchema = OracleQuerySchema.extend({
  feedId: z.string().min(1).max(50).regex(/^[A-Z]{2,10}-[A-Z]{2,10}$/),
  maxStaleness: z.number().int().positive().max(86400), // Max 24 hours
  minConfidence: z.number().min(0).max(100),
  timeout: z.number().int().positive().min(1000).max(30000), // 1-30 seconds
});

/**
 * Chainlink round data validation with business rules
 */
export const ExtendedChainlinkRoundDataSchema = ChainlinkRoundDataSchema.extend({
  answer: z.bigint().positive().refine(
    (val) => val > 0,
    'Price answer must be positive'
  ),
  updatedAt: z.bigint().refine(
    (val) => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      return val <= now + BigInt(300); // Allow 5 minutes in future
    },
    'UpdatedAt timestamp cannot be in the future'
  ),
}).refine(
  (data) => data.updatedAt <= data.startedAt + BigInt(3600), // Max 1 hour processing time
  'Round processing time too long'
);

/**
 * Multi-oracle data validation
 */
export const ValidatedMultiOracleDataSchema = MultiOracleDataSchema.extend({
  responses: z.array(z.object({
    provider: z.string().min(1).max(20),
    data: z.union([
      z.object({
        success: z.literal(true),
        priceData: ExtendedOraclePriceValidationSchema,
        responseTime: z.number().int().min(0).max(30000),
      }),
      z.object({
        success: z.literal(false),
        error: z.string().min(1).max(500),
        errorCode: z.string().min(1).max(50),
        responseTime: z.number().int().min(0).max(30000),
      }),
    ]),
    timestamp: z.number().int().positive(),
  })).min(1).max(10), // Support 1-10 oracle providers
}).refine(
  (data) => data.responses.some(r => r.data.success),
  'At least one successful response required'
);

/**
 * Price range validation rules
 */
export const createPriceRangeValidator = (
  minPrice: bigint,
  maxPrice: bigint,
  feedId: string
) => (price: bigint): Either<ValidationError, bigint> => {
  if (price < minPrice) {
    return left({
      code: 'VALIDATION_ERROR',
      message: `Price ${price} below minimum ${minPrice} for ${feedId}`,
      field: 'price',
      value: price,
    });
  }
  
  if (price > maxPrice) {
    return left({
      code: 'VALIDATION_ERROR',
      message: `Price ${price} above maximum ${maxPrice} for ${feedId}`,
      field: 'price',
      value: price,
    });
  }
  
  return right(price);
};

/**
 * Staleness validation
 */
export const createStalenessValidator = (
  maxAge: number
) => (timestamp: number): Either<ValidationError, number> => {
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  
  if (age > maxAge) {
    return left({
      code: 'VALIDATION_ERROR',
      message: `Data is ${age} seconds old, maximum allowed is ${maxAge}`,
      field: 'timestamp',
      value: timestamp,
    });
  }
  
  return right(timestamp);
};

/**
 * Confidence validation
 */
export const createConfidenceValidator = (
  minConfidence: number
) => (confidence: number): Either<ValidationError, number> => {
  if (confidence < minConfidence) {
    return left({
      code: 'VALIDATION_ERROR',
      message: `Confidence ${confidence}% below minimum ${minConfidence}%`,
      field: 'confidence',
      value: confidence,
    });
  }
  
  return right(confidence);
};

/**
 * Deviation validation against reference price
 */
export const createDeviationValidator = (
  referencePrice: bigint,
  maxDeviationPercent: number
) => (price: bigint): Either<ValidationError, bigint> => {
  const deviation = Number(price > referencePrice 
    ? ((price - referencePrice) * BigInt(10000)) / referencePrice
    : ((referencePrice - price) * BigInt(10000)) / referencePrice
  ) / 100;
  
  if (deviation > maxDeviationPercent) {
    return left({
      code: 'VALIDATION_ERROR',
      message: `Price deviation ${deviation.toFixed(2)}% exceeds maximum ${maxDeviationPercent}%`,
      field: 'price',
      value: price,
      details: [{
        path: ['price'],
        message: `Deviation: ${deviation.toFixed(2)}%`,
        code: 'PRICE_DEVIATION',
      }],
    });
  }
  
  return right(price);
};

/**
 * Composite price data validator
 */
export const validatePriceData = (
  data: unknown,
  rules?: PriceValidationRules
): Either<ValidationError[], PriceValidationResult> => {
  // First, validate schema
  const schemaResult = ExtendedOraclePriceValidationSchema.safeParse(data);
  if (!schemaResult.success) {
    const errors = schemaResult.error.errors.map(err => ({
      code: 'VALIDATION_ERROR' as const,
      message: err.message,
      field: err.path.join('.'),
      value: err.code,
    }));
    return left(errors);
  }
  
  const priceData = schemaResult.data;
  const validationIssues: Array<{
    code: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
  }> = [];
  
  let score = 100;
  
  // Apply additional rules if provided
  if (rules) {
    // Price range validation
    if (rules.minPrice && priceData.price < rules.minPrice) {
      validationIssues.push({
        code: 'PRICE_TOO_LOW',
        severity: 'error',
        message: `Price ${priceData.price} below minimum ${rules.minPrice}`,
      });
      score = 0;
    }
    
    if (rules.maxPrice && priceData.price > rules.maxPrice) {
      validationIssues.push({
        code: 'PRICE_TOO_HIGH',
        severity: 'error',
        message: `Price ${priceData.price} above maximum ${rules.maxPrice}`,
      });
      score = 0;
    }
    
    // Staleness validation
    if (rules.maxAge) {
      const now = Math.floor(Date.now() / 1000);
      const age = now - priceData.timestamp;
      if (age > rules.maxAge) {
        validationIssues.push({
          code: 'DATA_TOO_STALE',
          severity: 'error',
          message: `Data is ${age} seconds old, maximum allowed is ${rules.maxAge}`,
        });
        score -= Math.min(50, (age - rules.maxAge) / 60); // Reduce score based on excess staleness
      }
    }
    
    // Confidence validation
    if (rules.minConfidence && priceData.confidence < rules.minConfidence) {
      validationIssues.push({
        code: 'CONFIDENCE_TOO_LOW',
        severity: 'warning',
        message: `Confidence ${priceData.confidence}% below minimum ${rules.minConfidence}%`,
      });
      score -= (rules.minConfidence - priceData.confidence) * 2;
    }
    
    // Deviation validation
    if (rules.referencePrice && rules.maxDeviation) {
      const deviation = Number(priceData.price > rules.referencePrice
        ? ((priceData.price - rules.referencePrice) * BigInt(10000)) / rules.referencePrice
        : ((rules.referencePrice - priceData.price) * BigInt(10000)) / rules.referencePrice
      ) / 100;
      
      if (deviation > rules.maxDeviation) {
        validationIssues.push({
          code: 'PRICE_DEVIATION_HIGH',
          severity: 'error',
          message: `Price deviation ${deviation.toFixed(2)}% exceeds maximum ${rules.maxDeviation}%`,
        });
        score -= Math.min(50, deviation - rules.maxDeviation);
      }
    }
  }
  
  const result: PriceValidationResult = {
    isValid: score > 50 && validationIssues.filter(i => i.severity === 'error').length === 0,
    score: Math.max(0, Math.round(score)),
    issues: validationIssues,
    validatedData: score > 50 ? priceData : undefined,
  };
  
  return right(result);
};

/**
 * Validate oracle query
 */
export const validateOracleQuery = (query: unknown): Either<ValidationError[], OracleQuery> => {
  const result = ExtendedOracleQuerySchema.safeParse(query);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      code: 'VALIDATION_ERROR' as const,
      message: err.message,
      field: err.path.join('.'),
      value: err.code,
    }));
    return left(errors);
  }
  
  return right(result.data);
};

/**
 * Validate Chainlink round data
 */
export const validateChainlinkRoundData = (data: unknown): Either<ValidationError[], ChainlinkRoundData> => {
  const result = ExtendedChainlinkRoundDataSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      code: 'VALIDATION_ERROR' as const,
      message: err.message,
      field: err.path.join('.'),
      value: err.code,
    }));
    return left(errors);
  }
  
  return right(result.data);
};

/**
 * Validate multi-oracle aggregation data
 */
export const validateMultiOracleData = (data: unknown): Either<ValidationError[], MultiOracleData> => {
  const result = ValidatedMultiOracleDataSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      code: 'VALIDATION_ERROR' as const,
      message: err.message,
      field: err.path.join('.'),
      value: err.code,
    }));
    return left(errors);
  }
  
  return right(result.data);
};

/**
 * Validate aggregation result
 */
export const validateAggregationResult = (data: unknown): Either<ValidationError[], AggregationResult> => {
  const result = AggregationResultSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      code: 'VALIDATION_ERROR' as const,
      message: err.message,
      field: err.path.join('.'),
      value: err.code,
    }));
    return left(errors);
  }
  
  return right(result.data);
};

/**
 * Functional composition utilities for validation chains
 */

/** Compose multiple validators */
export const composeValidators = <T>(...validators: Array<(value: T) => Either<ValidationError, T>>) =>
  (value: T): Either<ValidationError[], T> => {
    const errors: ValidationError[] = [];
    let currentValue = value;
    
    for (const validator of validators) {
      const result = validator(currentValue);
      if (Either.isLeft(result)) {
        errors.push(result.left);
      } else {
        currentValue = result.right;
      }
    }
    
    return errors.length > 0 ? left(errors) : right(currentValue);
  };

/** Chain validators with early termination on error */
export const chainValidators = <T>(...validators: Array<(value: T) => Either<ValidationError, T>>) =>
  (value: T): Either<ValidationError, T> => {
    return pipe(
      right(value),
      ...validators.map(validator => chain(validator))
    );
  };

/** Validate array of items */
export const validateArray = <T>(
  validator: (item: unknown) => Either<ValidationError[], T>
) => (items: unknown[]): Either<ValidationError[], T[]> => {
  const results = items.map(validator);
  const errors = results.filter(Either.isLeft).flatMap(r => r.left);
  const values = results.filter(Either.isRight).map(r => r.right);
  
  return errors.length > 0 ? left(errors) : right(values);
};

/**
 * Asset-specific validation presets
 */
export const ASSET_VALIDATION_PRESETS = {
  'ETH-USD': {
    minPrice: BigInt('1000000000'), // $10.00 with 8 decimals
    maxPrice: BigInt('10000000000000'), // $100,000 with 8 decimals
    maxDeviation: 20.0, // 20%
    maxAge: 3600, // 1 hour
    minConfidence: 95.0,
  },
  'BTC-USD': {
    minPrice: BigInt('500000000000'), // $5,000 with 8 decimals
    maxPrice: BigInt('50000000000000'), // $500,000 with 8 decimals
    maxDeviation: 15.0, // 15%
    maxAge: 3600, // 1 hour
    minConfidence: 95.0,
  },
  'USDC-USD': {
    minPrice: BigInt('95000000'), // $0.95 with 8 decimals
    maxPrice: BigInt('105000000'), // $1.05 with 8 decimals
    maxDeviation: 2.0, // 2%
    maxAge: 86400, // 24 hours
    minConfidence: 99.0,
  },
} as const;

/**
 * Get validation preset for asset
 */
export const getValidationPreset = (feedId: string): Option<PriceValidationRules> => {
  const preset = ASSET_VALIDATION_PRESETS[feedId as keyof typeof ASSET_VALIDATION_PRESETS];
  return preset ? some(preset) : none;
};