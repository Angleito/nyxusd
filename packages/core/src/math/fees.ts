/**
 * Fee Calculation Functions
 *
 * This module provides pure mathematical functions for calculating various fees
 * in the CDP system including stability fees, liquidation penalties, and
 * transaction fees. All calculations use BigInt arithmetic for precision.
 *
 * Mathematical formulas:
 * - Stability Fee = Debt Amount × Fee Rate × (Time Elapsed / SECONDS_PER_YEAR)
 * - Liquidation Penalty = Collateral Value × Penalty Rate
 * - Percentage Fee = Amount × (Percentage / 10000)
 * - Progressive Fee = Base Fee + (Amount - Threshold) × Progressive Rate
 *
 * @packageDocumentation
 */

import { Result } from "./types";

/**
 * Mathematical constants for fee calculations
 */
export const FEE_CONSTANTS = {
  /** Basis points multiplier (10,000 = 100%) */
  BASIS_POINTS: 10000n,
  /** Percentage multiplier (100 = 100%) */
  PERCENTAGE: 100n,
  /** Scale factor for high-precision calculations */
  PRECISION_SCALE: 1000000000000000000n, // 18 decimals
  /** Seconds in a year (365.25 days) */
  SECONDS_PER_YEAR: 31557600n,
  /** Zero value */
  ZERO: 0n,
  /** Maximum reasonable fee rate (1000% in basis points) */
  MAX_FEE_RATE: 100000n,
} as const;

/**
 * Fee type discriminated union for different fee calculations
 */
export type FeeType =
  | { readonly type: "stability"; readonly annualRate: number }
  | { readonly type: "liquidation"; readonly penaltyRate: number }
  | {
      readonly type: "transaction";
      readonly flatFee: bigint;
      readonly percentageFee: number;
    }
  | {
      readonly type: "progressive";
      readonly baseRate: number;
      readonly progressiveRate: number;
      readonly threshold: bigint;
    };

/**
 * Fee calculation parameters
 */
export interface FeeParams {
  /** Amount subject to fee calculation */
  readonly amount: bigint;
  /** Fee type and parameters */
  readonly feeType: FeeType;
  /** Time elapsed in seconds (for time-based fees) */
  readonly timeElapsed?: bigint;
}

/**
 * Error types for fee calculations
 */
export type FeeError =
  | {
      readonly type: "negative_amount";
      readonly amount: bigint;
      readonly field: string;
    }
  | { readonly type: "negative_time"; readonly timeElapsed: bigint }
  | {
      readonly type: "invalid_fee_rate";
      readonly rate: number;
      readonly bounds: [number, number];
    }
  | { readonly type: "missing_time"; readonly feeType: string }
  | { readonly type: "overflow"; readonly operation: string };

/**
 * Calculates stability fee for a debt position over time.
 *
 * Formula: Stability Fee = Debt Amount × (Fee Rate / 10000) × (Time Elapsed / SECONDS_PER_YEAR)
 *
 * @param debtAmount - Current debt amount in wei
 * @param feeRate - Annual stability fee rate in basis points (100 = 1%)
 * @param timeElapsed - Time elapsed since last fee calculation in seconds
 * @returns Result containing the stability fee amount in wei
 *
 * @example
 * ```typescript
 * // $1000 debt, 2% annual stability fee, 30 days elapsed
 * const result = calculateStabilityFee(
 *   1000000000000000000000n, // $1000 in wei
 *   200,                     // 2% in basis points
 *   2592000n                 // 30 days in seconds
 * )
 * // Returns Ok(~4383561643835616438n) - ~$4.38 stability fee
 * ```
 */
export function calculateStabilityFee(
  debtAmount: bigint,
  feeRate: number,
  timeElapsed: bigint,
): Result<bigint, FeeError> {
  // Validate inputs
  if (debtAmount < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount: debtAmount,
      field: "debtAmount",
    });
  }

  if (feeRate < 0 || feeRate > Number(FEE_CONSTANTS.MAX_FEE_RATE)) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: feeRate,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  if (timeElapsed < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_time" as const,
      timeElapsed,
    });
  }

  try {
    // Calculate stability fee: debtAmount * feeRate * timeElapsed / (BASIS_POINTS * SECONDS_PER_YEAR)
    const numerator = debtAmount * BigInt(feeRate) * timeElapsed;
    const denominator =
      FEE_CONSTANTS.BASIS_POINTS * FEE_CONSTANTS.SECONDS_PER_YEAR;
    const stabilityFee = numerator / denominator;

    return Result.ok(stabilityFee);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateStabilityFee",
    });
  }
}

/**
 * Calculates liquidation penalty fee based on collateral value.
 *
 * Formula: Liquidation Penalty = Collateral Value × (Penalty Rate / 10000)
 *
 * @param collateralValue - Total collateral value in wei
 * @param penaltyRate - Liquidation penalty rate in basis points (1000 = 10%)
 * @returns Result containing the liquidation penalty amount in wei
 *
 * @example
 * ```typescript
 * // $1500 collateral value, 13% liquidation penalty
 * const result = calculateLiquidationPenalty(
 *   1500000000000000000000n, // $1500 in wei
 *   1300                     // 13% in basis points
 * )
 * // Returns Ok(195000000000000000000n) - $195 liquidation penalty
 * ```
 */
export function calculateLiquidationPenalty(
  collateralValue: bigint,
  penaltyRate: number,
): Result<bigint, FeeError> {
  // Validate inputs
  if (collateralValue < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount: collateralValue,
      field: "collateralValue",
    });
  }

  if (penaltyRate < 0 || penaltyRate > Number(FEE_CONSTANTS.MAX_FEE_RATE)) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: penaltyRate,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  try {
    // Calculate liquidation penalty: collateralValue * penaltyRate / BASIS_POINTS
    const numerator = collateralValue * BigInt(penaltyRate);
    const penalty = numerator / FEE_CONSTANTS.BASIS_POINTS;

    return Result.ok(penalty);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateLiquidationPenalty",
    });
  }
}

/**
 * Converts basis points to a decimal ratio.
 *
 * Formula: Ratio = Basis Points / 10000
 *
 * @param basisPoints - Value in basis points (10000 = 100%)
 * @returns Result containing the decimal ratio
 *
 * @example
 * ```typescript
 * const result = convertBasisPointsToRatio(250) // 2.5%
 * // Returns Ok(0.025)
 * ```
 */
export function convertBasisPointsToRatio(
  basisPoints: number,
): Result<number, FeeError> {
  if (basisPoints < 0) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: basisPoints,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  if (basisPoints > Number(FEE_CONSTANTS.MAX_FEE_RATE)) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: basisPoints,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  const ratio = basisPoints / Number(FEE_CONSTANTS.BASIS_POINTS);
  return Result.ok(ratio);
}

/**
 * Applies a percentage fee to an amount.
 *
 * Formula: Fee Amount = Amount × (Percentage / 10000)
 *
 * @param amount - Base amount in wei
 * @param percentage - Percentage in basis points (100 = 1%)
 * @returns Result containing the fee amount in wei
 *
 * @example
 * ```typescript
 * // Apply 0.3% fee to $1000
 * const result = applyPercentage(1000000000000000000000n, 30)
 * // Returns Ok(3000000000000000000n) - $3 fee
 * ```
 */
export function applyPercentage(
  amount: bigint,
  percentage: number,
): Result<bigint, FeeError> {
  // Validate inputs
  if (amount < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount,
      field: "amount",
    });
  }

  if (percentage < 0 || percentage > Number(FEE_CONSTANTS.MAX_FEE_RATE)) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: percentage,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  try {
    // Calculate percentage: amount * percentage / BASIS_POINTS
    const numerator = amount * BigInt(percentage);
    const feeAmount = numerator / FEE_CONSTANTS.BASIS_POINTS;

    return Result.ok(feeAmount);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "applyPercentage",
    });
  }
}

/**
 * Calculates a progressive fee structure where rates increase above thresholds.
 *
 * Formula:
 * - If amount <= threshold: Fee = Amount × (Base Rate / 10000)
 * - If amount > threshold: Fee = Threshold × (Base Rate / 10000) + (Amount - Threshold) × (Progressive Rate / 10000)
 *
 * @param amount - Amount subject to progressive fee
 * @param baseRate - Base fee rate in basis points
 * @param progressiveRate - Progressive fee rate in basis points (applied above threshold)
 * @param threshold - Threshold amount where progressive rate begins
 * @returns Result containing the total progressive fee amount
 *
 * @example
 * ```typescript
 * // $2000 amount, 1% base rate, 2% progressive rate, $1000 threshold
 * const result = calculateProgressiveFee(
 *   2000000000000000000000n, // $2000
 *   100,                     // 1% base rate
 *   200,                     // 2% progressive rate
 *   1000000000000000000000n  // $1000 threshold
 * )
 * // Returns Ok(30000000000000000000n) - $30 total fee ($10 base + $20 progressive)
 * ```
 */
export function calculateProgressiveFee(
  amount: bigint,
  baseRate: number,
  progressiveRate: number,
  threshold: bigint,
): Result<bigint, FeeError> {
  // Validate inputs
  if (amount < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount,
      field: "amount",
    });
  }

  if (threshold < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount: threshold,
      field: "threshold",
    });
  }

  if (baseRate < 0 || baseRate > Number(FEE_CONSTANTS.MAX_FEE_RATE)) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: baseRate,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  if (
    progressiveRate < 0 ||
    progressiveRate > Number(FEE_CONSTANTS.MAX_FEE_RATE)
  ) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: progressiveRate,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  try {
    if (amount <= threshold) {
      // Simple percentage calculation for amounts under threshold
      return applyPercentage(amount, baseRate);
    }

    // Calculate base fee on threshold amount
    const baseFeeResult = applyPercentage(threshold, baseRate);
    if (baseFeeResult.isErr()) {
      return baseFeeResult;
    }

    // Calculate progressive fee on amount above threshold
    const excessAmount = amount - threshold;
    const progressiveFeeResult = applyPercentage(excessAmount, progressiveRate);
    if (progressiveFeeResult.isErr()) {
      return progressiveFeeResult;
    }

    const totalFee = baseFeeResult.unwrap() + progressiveFeeResult.unwrap();
    return Result.ok(totalFee);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateProgressiveFee",
    });
  }
}

/**
 * Calculates a combined transaction fee with both flat and percentage components.
 *
 * Formula: Total Fee = Flat Fee + (Amount × Percentage Fee / 10000)
 *
 * @param amount - Transaction amount in wei
 * @param flatFee - Fixed fee amount in wei
 * @param percentageFee - Percentage fee in basis points
 * @returns Result containing the total transaction fee
 *
 * @example
 * ```typescript
 * // $100 transaction, $2 flat fee, 0.5% percentage fee
 * const result = calculateTransactionFee(
 *   100000000000000000000n, // $100
 *   2000000000000000000n,   // $2 flat fee
 *   50                      // 0.5% percentage fee
 * )
 * // Returns Ok(2500000000000000000n) - $2.50 total fee
 * ```
 */
export function calculateTransactionFee(
  amount: bigint,
  flatFee: bigint,
  percentageFee: number,
): Result<bigint, FeeError> {
  // Validate inputs
  if (amount < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount,
      field: "amount",
    });
  }

  if (flatFee < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount: flatFee,
      field: "flatFee",
    });
  }

  if (percentageFee < 0 || percentageFee > Number(FEE_CONSTANTS.MAX_FEE_RATE)) {
    return Result.err({
      type: "invalid_fee_rate" as const,
      rate: percentageFee,
      bounds: [0, Number(FEE_CONSTANTS.MAX_FEE_RATE)],
    });
  }

  try {
    // Calculate percentage component
    const percentageFeeResult = applyPercentage(amount, percentageFee);
    if (percentageFeeResult.isErr()) {
      return percentageFeeResult;
    }

    const totalFee = flatFee + percentageFeeResult.unwrap();
    return Result.ok(totalFee);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateTransactionFee",
    });
  }
}

/**
 * Calculates fee with a minimum and maximum cap.
 *
 * @param amount - Base amount for fee calculation
 * @param feeRate - Fee rate in basis points
 * @param minFee - Minimum fee amount in wei
 * @param maxFee - Maximum fee amount in wei
 * @returns Result containing the capped fee amount
 *
 * @example
 * ```typescript
 * // 1% fee on $50, min $2, max $10
 * const result = calculateCappedFee(
 *   50000000000000000000n,  // $50
 *   100,                    // 1%
 *   2000000000000000000n,   // $2 min
 *   10000000000000000000n   // $10 max
 * )
 * // Returns Ok(2000000000000000000n) - $2 (hits minimum)
 * ```
 */
export function calculateCappedFee(
  amount: bigint,
  feeRate: number,
  minFee: bigint,
  maxFee: bigint,
): Result<bigint, FeeError> {
  // Validate inputs
  if (amount < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount,
      field: "amount",
    });
  }

  if (minFee < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount: minFee,
      field: "minFee",
    });
  }

  if (maxFee < FEE_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_amount" as const,
      amount: maxFee,
      field: "maxFee",
    });
  }

  if (minFee > maxFee) {
    return Result.err({
      type: "negative_amount" as const,
      amount: minFee - maxFee,
      field: "minFee_exceeds_maxFee",
    });
  }

  // Calculate base fee
  const baseFeeResult = applyPercentage(amount, feeRate);
  if (baseFeeResult.isErr()) {
    return baseFeeResult;
  }

  const baseFee = baseFeeResult.unwrap();

  // Apply caps
  if (baseFee < minFee) {
    return Result.ok(minFee);
  }

  if (baseFee > maxFee) {
    return Result.ok(maxFee);
  }

  return Result.ok(baseFee);
}

/**
 * Utility function to calculate multiple fees and return their sum.
 *
 * @param feeCalculations - Array of fee calculation functions
 * @returns Result containing the total of all fees
 */
export function calculateTotalFees(
  feeCalculations: Array<() => Result<bigint, FeeError>>,
): Result<bigint, FeeError> {
  let totalFees = FEE_CONSTANTS.ZERO;

  for (const calculation of feeCalculations) {
    const feeResult = calculation();
    if (feeResult.isErr()) {
      return feeResult;
    }

    try {
      totalFees += feeResult.unwrap();
    } catch (error) {
      return Result.err({
        type: "overflow" as const,
        operation: "calculateTotalFees",
      });
    }
  }

  return Result.ok(totalFees);
}
