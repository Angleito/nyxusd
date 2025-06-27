/**
 * Interest Rate and Compound Interest Calculations
 *
 * This module provides pure mathematical functions for calculating interest rates,
 * compound interest, and time-based financial metrics. All calculations use BigInt
 * arithmetic to maintain precision for financial operations.
 *
 * Mathematical formulas:
 * - Simple Interest = Principal × Rate × Time
 * - Compound Interest = Principal × (1 + Rate)^Time - Principal
 * - Continuous Compounding = Principal × e^(Rate × Time) - Principal
 * - APY = (1 + Rate/n)^n - 1 (where n is compounding frequency)
 *
 * @packageDocumentation
 */

import { Result } from "./types";

/**
 * Mathematical constants for interest calculations
 */
export const INTEREST_CONSTANTS = {
  /** Basis points multiplier (10,000 = 100%) */
  BASIS_POINTS: 10000n,
  /** Percentage multiplier (100 = 100%) */
  PERCENTAGE: 100n,
  /** Scale factor for high-precision calculations */
  PRECISION_SCALE: 1000000000000000000n, // 18 decimals
  /** Seconds in a year (365.25 days) */
  SECONDS_PER_YEAR: 31557600n,
  /** Seconds in a day */
  SECONDS_PER_DAY: 86400n,
  /** Zero value */
  ZERO: 0n,
  /** Euler's number approximation (scaled by PRECISION_SCALE) */
  EULER_SCALED: 2718281828459045235n, // e ≈ 2.718281828459045235
  /** Natural log of 2 approximation (scaled by PRECISION_SCALE) */
  LN2_SCALED: 693147180559945309n, // ln(2) ≈ 0.693147180559945309
} as const;

/**
 * Interest compounding frequency options
 */
export type CompoundingFrequency =
  | "continuous"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annually";

/**
 * Interest calculation parameters
 */
export interface InterestParams {
  /** Principal amount in wei units */
  readonly principal: bigint;
  /** Annual interest rate in basis points (100 = 1%) */
  readonly rate: number;
  /** Time period in seconds */
  readonly timeSeconds: bigint;
  /** Compounding frequency */
  readonly compounding?: CompoundingFrequency;
}

/**
 * Error types for interest calculations
 */
export type InterestError =
  | { readonly type: "negative_principal"; readonly principal: bigint }
  | { readonly type: "negative_rate"; readonly rate: number }
  | { readonly type: "negative_time"; readonly timeSeconds: bigint }
  | {
      readonly type: "invalid_rate";
      readonly rate: number;
      readonly maxRate: number;
    }
  | { readonly type: "overflow"; readonly operation: string }
  | { readonly type: "precision_loss"; readonly operation: string };

/**
 * Calculates simple interest for a given principal, rate, and time period.
 *
 * Formula: Interest = Principal × (Rate / 10000) × (Time / SECONDS_PER_YEAR)
 *
 * @param params - Interest calculation parameters
 * @returns Result containing the simple interest amount in wei
 *
 * @example
 * ```typescript
 * // $1000 principal, 5% annual rate, 180 days
 * const result = calculateSimpleInterest({
 *   principal: 1000000000000000000000n, // $1000 in wei
 *   rate: 500,                          // 5% in basis points
 *   timeSeconds: 15552000n              // 180 days in seconds
 * })
 * // Returns Ok(~24657534246575342465n) - ~$24.66 interest
 * ```
 */
export function calculateSimpleInterest(
  params: Omit<InterestParams, "compounding">,
): Result<bigint, InterestError> {
  const { principal, rate, timeSeconds } = params;

  // Validate inputs
  if (principal < INTEREST_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_principal" as const,
      principal,
    });
  }

  if (rate < 0) {
    return Result.err({
      type: "negative_rate" as const,
      rate,
    });
  }

  if (rate > 100000) {
    // Max 1000% annual rate
    return Result.err({
      type: "invalid_rate" as const,
      rate,
      maxRate: 100000,
    });
  }

  if (timeSeconds < INTEREST_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_time" as const,
      timeSeconds,
    });
  }

  try {
    // Calculate simple interest: principal * rate * time / (BASIS_POINTS * SECONDS_PER_YEAR)
    const numerator = principal * BigInt(rate) * timeSeconds;
    const denominator =
      INTEREST_CONSTANTS.BASIS_POINTS * INTEREST_CONSTANTS.SECONDS_PER_YEAR;
    const interest = numerator / denominator;

    return Result.ok(interest);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateSimpleInterest",
    });
  }
}

/**
 * Calculates compound interest for a given principal, rate, time, and compounding frequency.
 *
 * Formula varies by compounding frequency:
 * - Discrete: Principal × (1 + Rate/n)^(n×Time) - Principal
 * - Continuous: Principal × e^(Rate×Time) - Principal
 *
 * @param params - Interest calculation parameters with compounding frequency
 * @returns Result containing the compound interest amount in wei
 *
 * @example
 * ```typescript
 * // $1000 principal, 5% annual rate, 1 year, monthly compounding
 * const result = calculateCompoundInterest({
 *   principal: 1000000000000000000000n,
 *   rate: 500,
 *   timeSeconds: 31557600n, // 1 year
 *   compounding: 'monthly'
 * })
 * // Returns Ok(~51161895810058563301n) - ~$51.16 compound interest
 * ```
 */
export function calculateCompoundInterest(
  params: InterestParams,
): Result<bigint, InterestError> {
  const { principal, rate, timeSeconds, compounding = "annually" } = params;

  // Validate inputs (reuse simple interest validation)
  const simpleResult = calculateSimpleInterest({
    principal,
    rate,
    timeSeconds,
  });
  if (simpleResult.isErr()) {
    return simpleResult;
  }

  if (compounding === "continuous") {
    return calculateContinuousCompoundInterest({
      principal,
      rate,
      timeSeconds,
    });
  }

  try {
    const compoundingPeriodsPerYear = getCompoundingPeriodsPerYear(compounding);
    const timeInYears = scaleTime(
      timeSeconds,
      INTEREST_CONSTANTS.SECONDS_PER_YEAR,
    );

    // Calculate (1 + rate/n)^(n*t) using precise arithmetic
    const ratePerPeriod =
      (BigInt(rate) * INTEREST_CONSTANTS.PRECISION_SCALE) /
      (INTEREST_CONSTANTS.BASIS_POINTS * BigInt(compoundingPeriodsPerYear));

    const totalPeriods =
      (BigInt(compoundingPeriodsPerYear) * timeInYears) /
      INTEREST_CONSTANTS.PRECISION_SCALE;

    // Use binomial approximation for (1 + x)^n when x is small
    const compoundFactor = calculateCompoundFactor(ratePerPeriod, totalPeriods);
    if (compoundFactor.isErr()) {
      return compoundFactor;
    }

    const finalAmount =
      (principal * compoundFactor.unwrap()) /
      INTEREST_CONSTANTS.PRECISION_SCALE;
    const interest = finalAmount - principal;

    // Ensure interest is non-negative
    if (interest < INTEREST_CONSTANTS.ZERO) {
      return Result.ok(INTEREST_CONSTANTS.ZERO);
    }

    return Result.ok(interest);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateCompoundInterest",
    });
  }
}

/**
 * Calculates continuous compound interest using e^(rt) formula.
 *
 * Formula: Interest = Principal × e^(Rate × Time) - Principal
 *
 * @param params - Interest calculation parameters
 * @returns Result containing the continuous compound interest amount
 */
function calculateContinuousCompoundInterest(
  params: Omit<InterestParams, "compounding">,
): Result<bigint, InterestError> {
  const { principal, rate, timeSeconds } = params;

  try {
    // Calculate rt (rate × time in years)
    const timeInYears = scaleTime(
      timeSeconds,
      INTEREST_CONSTANTS.SECONDS_PER_YEAR,
    );
    const exponent =
      (BigInt(rate) * timeInYears) /
      (INTEREST_CONSTANTS.BASIS_POINTS * INTEREST_CONSTANTS.PRECISION_SCALE);

    // Calculate e^(rt) using Taylor series approximation
    const ePowerResult = calculateExponential(exponent);
    if (ePowerResult.isErr()) {
      return ePowerResult;
    }

    const finalAmount =
      (principal * ePowerResult.unwrap()) / INTEREST_CONSTANTS.PRECISION_SCALE;
    const interest = finalAmount - principal;

    return Result.ok(interest);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateContinuousCompoundInterest",
    });
  }
}

/**
 * Calculates the effective annual percentage yield (APY) given a nominal rate and compounding frequency.
 *
 * Formula: APY = (1 + Rate/n)^n - 1
 *
 * @param nominalRate - Nominal annual rate in basis points
 * @param compounding - Compounding frequency
 * @returns Result containing the APY in basis points
 *
 * @example
 * ```typescript
 * // 5% nominal rate with monthly compounding
 * const result = calculateAPY(500, 'monthly')
 * // Returns Ok(512) - 5.12% APY
 * ```
 */
export function calculateAPY(
  nominalRate: number,
  compounding: CompoundingFrequency,
): Result<number, InterestError> {
  if (nominalRate < 0) {
    return Result.err({
      type: "negative_rate" as const,
      rate: nominalRate,
    });
  }

  if (nominalRate > 100000) {
    return Result.err({
      type: "invalid_rate" as const,
      rate: nominalRate,
      maxRate: 100000,
    });
  }

  if (compounding === "continuous") {
    try {
      // APY = e^r - 1
      const rateDecimal =
        (BigInt(nominalRate) * INTEREST_CONSTANTS.PRECISION_SCALE) /
        INTEREST_CONSTANTS.BASIS_POINTS;
      const eToTheR = calculateExponential(rateDecimal);
      if (eToTheR.isErr()) {
        return Result.err(eToTheR.value);
      }

      const apy =
        ((eToTheR.unwrap() - INTEREST_CONSTANTS.PRECISION_SCALE) *
          INTEREST_CONSTANTS.BASIS_POINTS) /
        INTEREST_CONSTANTS.PRECISION_SCALE;

      if (apy > BigInt(Number.MAX_SAFE_INTEGER)) {
        return Result.err({
          type: "overflow" as const,
          operation: "calculateAPY",
        });
      }

      return Result.ok(Number(apy));
    } catch (error) {
      return Result.err({
        type: "overflow" as const,
        operation: "calculateAPY",
      });
    }
  }

  try {
    const n = getCompoundingPeriodsPerYear(compounding);
    const ratePerPeriod =
      (BigInt(nominalRate) * INTEREST_CONSTANTS.PRECISION_SCALE) /
      (INTEREST_CONSTANTS.BASIS_POINTS * BigInt(n));

    const compoundFactor = calculateCompoundFactor(ratePerPeriod, BigInt(n));
    if (compoundFactor.isErr()) {
      return Result.err(compoundFactor.value);
    }

    const apy =
      ((compoundFactor.unwrap() - INTEREST_CONSTANTS.PRECISION_SCALE) *
        INTEREST_CONSTANTS.BASIS_POINTS) /
      INTEREST_CONSTANTS.PRECISION_SCALE;

    if (apy > BigInt(Number.MAX_SAFE_INTEGER)) {
      return Result.err({
        type: "overflow" as const,
        operation: "calculateAPY",
      });
    }

    return Result.ok(Number(apy));
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateAPY",
    });
  }
}

/**
 * Calculates accrued interest from a starting timestamp to current timestamp.
 *
 * @param principal - Principal amount in wei
 * @param annualRate - Annual interest rate in basis points
 * @param startTimestamp - Start timestamp in seconds
 * @param endTimestamp - End timestamp in seconds
 * @param compounding - Compounding frequency
 * @returns Result containing the accrued interest amount
 */
export function calculateAccruedInterest(
  principal: bigint,
  annualRate: number,
  startTimestamp: bigint,
  endTimestamp: bigint,
  compounding: CompoundingFrequency = "continuous",
): Result<bigint, InterestError> {
  if (endTimestamp < startTimestamp) {
    return Result.err({
      type: "negative_time" as const,
      timeSeconds: endTimestamp - startTimestamp,
    });
  }

  const timeElapsed = endTimestamp - startTimestamp;

  return calculateCompoundInterest({
    principal,
    rate: annualRate,
    timeSeconds: timeElapsed,
    compounding,
  });
}

// Helper functions

function getCompoundingPeriodsPerYear(
  compounding: CompoundingFrequency,
): number {
  switch (compounding) {
    case "daily":
      return 365;
    case "weekly":
      return 52;
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "annually":
      return 1;
    default:
      return 1;
  }
}

function scaleTime(timeSeconds: bigint, divisor: bigint): bigint {
  return (timeSeconds * INTEREST_CONSTANTS.PRECISION_SCALE) / divisor;
}

/**
 * Calculates (1 + rate)^periods using binomial expansion for small rates
 * or iterative multiplication for larger exponents.
 */
function calculateCompoundFactor(
  ratePerPeriod: bigint,
  periods: bigint,
): Result<bigint, InterestError> {
  try {
    if (periods === INTEREST_CONSTANTS.ZERO) {
      return Result.ok(INTEREST_CONSTANTS.PRECISION_SCALE);
    }

    if (periods === 1n) {
      return Result.ok(INTEREST_CONSTANTS.PRECISION_SCALE + ratePerPeriod);
    }

    // For small rates, use binomial expansion: (1+x)^n ≈ 1 + nx + n(n-1)x²/2 + ...
    if (ratePerPeriod < INTEREST_CONSTANTS.PRECISION_SCALE / 100n) {
      // Less than 1%
      const firstTerm = INTEREST_CONSTANTS.PRECISION_SCALE;
      const secondTerm = periods * ratePerPeriod;
      const thirdTerm =
        (periods * (periods - 1n) * ratePerPeriod * ratePerPeriod) /
        (2n * INTEREST_CONSTANTS.PRECISION_SCALE);

      return Result.ok(firstTerm + secondTerm + thirdTerm);
    }

    // For larger rates or periods, use iterative approach with overflow protection
    let result = INTEREST_CONSTANTS.PRECISION_SCALE;
    let base = INTEREST_CONSTANTS.PRECISION_SCALE + ratePerPeriod;
    let exp = periods;

    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) / INTEREST_CONSTANTS.PRECISION_SCALE;
      }
      base = (base * base) / INTEREST_CONSTANTS.PRECISION_SCALE;
      exp = exp / 2n;

      // Check for reasonable bounds to prevent overflow
      if (result > INTEREST_CONSTANTS.PRECISION_SCALE * 1000000n) {
        return Result.err({
          type: "overflow" as const,
          operation: "calculateCompoundFactor",
        });
      }
    }

    return Result.ok(result);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateCompoundFactor",
    });
  }
}

/**
 * Calculates e^x using Taylor series expansion: e^x = 1 + x + x²/2! + x³/3! + ...
 */
function calculateExponential(x: bigint): Result<bigint, InterestError> {
  try {
    if (x === INTEREST_CONSTANTS.ZERO) {
      return Result.ok(INTEREST_CONSTANTS.PRECISION_SCALE);
    }

    // Limit input to reasonable range to prevent overflow
    if (
      x > 20n * INTEREST_CONSTANTS.PRECISION_SCALE ||
      x < -20n * INTEREST_CONSTANTS.PRECISION_SCALE
    ) {
      return Result.err({
        type: "overflow" as const,
        operation: "calculateExponential",
      });
    }

    let result = INTEREST_CONSTANTS.PRECISION_SCALE; // 1
    let term = INTEREST_CONSTANTS.PRECISION_SCALE; // Current term in series

    // Calculate first 20 terms of Taylor series
    for (let i = 1n; i <= 20n; i++) {
      term = (term * x) / (i * INTEREST_CONSTANTS.PRECISION_SCALE);
      result += term;

      // Stop when terms become negligible
      if (term < INTEREST_CONSTANTS.PRECISION_SCALE / 1000000000000n) {
        break;
      }
    }

    return Result.ok(result);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateExponential",
    });
  }
}
