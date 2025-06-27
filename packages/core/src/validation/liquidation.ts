/**
 * Liquidation Validation Functions
 *
 * This module provides pure validation functions for liquidation conditions,
 * liquidator eligibility, and liquidation amounts in the NyxUSD CDP system.
 * All functions are pure, side-effect free, and follow functional programming principles.
 *
 * @packageDocumentation
 */

import { Result } from "@nyxusd/fp-utils";
import { Amount, mkAmount } from "../types/cdp";

/**
 * Validation error types for liquidation operations
 */
export type LiquidationValidationError =
  | {
      readonly type: "position_not_liquidatable";
      readonly currentRatio: number;
      readonly liquidationRatio: number;
    }
  | {
      readonly type: "invalid_liquidation_amount";
      readonly amount: bigint;
      readonly reason: string;
    }
  | {
      readonly type: "exceeds_maximum_liquidation";
      readonly maximum: Amount;
      readonly requested: Amount;
    }
  | {
      readonly type: "liquidator_insufficient_balance";
      readonly required: Amount;
      readonly available: Amount;
    }
  | {
      readonly type: "invalid_liquidator";
      readonly address: string;
      readonly reason: string;
    }
  | {
      readonly type: "liquidation_amount_too_small";
      readonly minimum: Amount;
      readonly provided: Amount;
    }
  | {
      readonly type: "invalid_amount";
      readonly amount: bigint;
      readonly reason: string;
    }
  | {
      readonly type: "invalid_ratio";
      readonly ratio: number;
      readonly reason: string;
    }
  | { readonly type: "zero_debt_position"; readonly reason: string }
  | { readonly type: "overflow_detected"; readonly operation: string }
  | { readonly type: "division_by_zero"; readonly operation: string };

/**
 * Maximum safe integer for BigInt operations
 */
const MAX_SAFE_AMOUNT = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Minimum liquidation amount to prevent dust liquidations
 */
const MIN_LIQUIDATION_AMOUNT = mkAmount(BigInt(1000)); // $10 minimum

/**
 * Maximum liquidation percentage in a single transaction (50% of debt)
 */
const MAX_LIQUIDATION_PERCENTAGE = 5000; // 50% in basis points

/**
 * Validates whether a CDP position is eligible for liquidation
 *
 * @param collateralValue - USD value of collateral (scaled by decimals)
 * @param debtAmount - Amount of debt in NYXUSD
 * @param liquidationRatio - Liquidation threshold ratio (basis points, 10000 = 100%)
 * @returns Result indicating if position can be liquidated
 *
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(120000)) // $1200 worth
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 debt
 * const liquidationRatio = 12500                   // 125% liquidation threshold
 * const result = isLiquidatable(collateralValue, debtAmount, liquidationRatio)
 * // Result.ok(true) - position is liquidatable at 120% ratio
 * ```
 */
export const isLiquidatable = (
  collateralValue: Amount,
  debtAmount: Amount,
  liquidationRatio: number,
): Result<boolean, LiquidationValidationError> => {
  // Validate inputs
  if (collateralValue < 0n) {
    return Result.err({
      type: "invalid_amount",
      amount: collateralValue as bigint,
      reason: "Collateral value cannot be negative",
    });
  }

  if (debtAmount <= 0n) {
    return Result.err({
      type: "zero_debt_position",
      reason: "Cannot liquidate position with zero or negative debt",
    });
  }

  if (liquidationRatio <= 0) {
    return Result.err({
      type: "invalid_ratio",
      ratio: liquidationRatio,
      reason: "Liquidation ratio must be positive",
    });
  }

  // Handle edge case of zero collateral with debt (definitely liquidatable)
  if (collateralValue === 0n && debtAmount > 0n) {
    return Result.ok(true);
  }

  try {
    // Calculate current ratio: (collateralValue * 10000) / debtAmount
    const currentRatioBigInt =
      ((collateralValue as bigint) * 10000n) / (debtAmount as bigint);
    const currentRatio = Number(currentRatioBigInt);

    // Check for overflow
    if (currentRatioBigInt > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: "overflow_detected",
        operation: "liquidation ratio calculation",
      });
    }

    // Position is liquidatable if current ratio is below liquidation threshold
    if (currentRatio < liquidationRatio) {
      return Result.ok(true);
    }

    return Result.err({
      type: "position_not_liquidatable",
      currentRatio,
      liquidationRatio,
    });
  } catch (error) {
    return Result.err({
      type: "division_by_zero",
      operation: "liquidation eligibility check",
    });
  }
};

/**
 * Validates a liquidation amount against debt limits and system constraints
 *
 * @param debtAmount - Total debt amount of the position
 * @param liquidationAmount - Amount to liquidate
 * @param maxLiquidation - Maximum allowed liquidation amount
 * @returns Result indicating if liquidation amount is valid
 *
 * @example
 * ```typescript
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 total debt
 * const liquidationAmount = mkAmount(BigInt(40000)) // $400 to liquidate
 * const maxLiquidation = mkAmount(BigInt(50000))   // $500 max allowed
 * const result = validateLiquidationAmount(debtAmount, liquidationAmount, maxLiquidation)
 * // Result.ok(true) - liquidation amount is valid
 * ```
 */
export const validateLiquidationAmount = (
  debtAmount: Amount,
  liquidationAmount: Amount,
  maxLiquidation: Amount,
): Result<boolean, LiquidationValidationError> => {
  // Validate inputs
  if (debtAmount <= 0n) {
    return Result.err({
      type: "zero_debt_position",
      reason: "Cannot liquidate position with zero or negative debt",
    });
  }

  if (liquidationAmount <= 0n) {
    return Result.err({
      type: "invalid_liquidation_amount",
      amount: liquidationAmount as bigint,
      reason: "Liquidation amount must be positive",
    });
  }

  if (maxLiquidation < 0n) {
    return Result.err({
      type: "invalid_amount",
      amount: maxLiquidation as bigint,
      reason: "Maximum liquidation cannot be negative",
    });
  }

  // Check minimum liquidation amount to prevent dust liquidations
  if (liquidationAmount < MIN_LIQUIDATION_AMOUNT) {
    return Result.err({
      type: "liquidation_amount_too_small",
      minimum: MIN_LIQUIDATION_AMOUNT,
      provided: liquidationAmount,
    });
  }

  // Check that liquidation amount doesn't exceed total debt
  if (liquidationAmount > debtAmount) {
    return Result.err({
      type: "invalid_liquidation_amount",
      amount: liquidationAmount as bigint,
      reason: "Liquidation amount cannot exceed total debt",
    });
  }

  // Check against system-imposed maximum
  if (liquidationAmount > maxLiquidation) {
    return Result.err({
      type: "exceeds_maximum_liquidation",
      maximum: maxLiquidation,
      requested: liquidationAmount,
    });
  }

  try {
    // Check maximum liquidation percentage (50% of total debt)
    const maxAllowedByPercentage =
      ((debtAmount as bigint) * BigInt(MAX_LIQUIDATION_PERCENTAGE)) / 10000n;

    if (liquidationAmount > mkAmount(maxAllowedByPercentage)) {
      return Result.err({
        type: "exceeds_maximum_liquidation",
        maximum: mkAmount(maxAllowedByPercentage),
        requested: liquidationAmount,
      });
    }

    return Result.ok(true);
  } catch (error) {
    return Result.err({
      type: "overflow_detected",
      operation: "liquidation amount validation",
    });
  }
};

/**
 * Validates whether a liquidator is eligible to perform liquidation
 *
 * @param liquidatorAddress - Address of the liquidator
 * @param minBalance - Minimum balance required for liquidation
 * @param liquidatorBalance - Current balance of the liquidator (optional)
 * @returns Result indicating if liquidator is valid
 *
 * @example
 * ```typescript
 * const liquidatorAddress = '0x742d35Cc6634C0532925a3b8C17f77a1C0E12345'
 * const minBalance = mkAmount(BigInt(50000)) // $500 minimum
 * const result = isValidLiquidator(liquidatorAddress, minBalance)
 * // Result.ok(true) - liquidator address is valid
 * ```
 */
export const isValidLiquidator = (
  liquidatorAddress: string,
  minBalance: Amount,
  liquidatorBalance?: Amount,
): Result<boolean, LiquidationValidationError> => {
  // Validate liquidator address format
  if (typeof liquidatorAddress !== "string") {
    return Result.err({
      type: "invalid_liquidator",
      address: String(liquidatorAddress),
      reason: "Liquidator address must be a string",
    });
  }

  if (liquidatorAddress.trim().length === 0) {
    return Result.err({
      type: "invalid_liquidator",
      address: liquidatorAddress,
      reason: "Liquidator address cannot be empty",
    });
  }

  // Basic address format validation (simplified)
  const addressPattern = /^0x[a-fA-F0-9]{40}$/;
  if (!addressPattern.test(liquidatorAddress)) {
    return Result.err({
      type: "invalid_liquidator",
      address: liquidatorAddress,
      reason:
        "Invalid address format. Expected 42-character hex string starting with 0x",
    });
  }

  // Validate minimum balance requirement
  if (minBalance < 0n) {
    return Result.err({
      type: "invalid_amount",
      amount: minBalance as bigint,
      reason: "Minimum balance cannot be negative",
    });
  }

  // Check liquidator balance if provided
  if (liquidatorBalance !== undefined) {
    if (liquidatorBalance < 0n) {
      return Result.err({
        type: "invalid_amount",
        amount: liquidatorBalance as bigint,
        reason: "Liquidator balance cannot be negative",
      });
    }

    if (liquidatorBalance < minBalance) {
      return Result.err({
        type: "liquidator_insufficient_balance",
        required: minBalance,
        available: liquidatorBalance,
      });
    }
  }

  return Result.ok(true);
};

/**
 * Calculates the liquidation bonus for a liquidator
 *
 * @param liquidationAmount - Amount being liquidated
 * @param bonusPercentage - Bonus percentage (basis points, 10000 = 100%)
 * @returns Result containing the liquidation bonus amount
 *
 * @example
 * ```typescript
 * const liquidationAmount = mkAmount(BigInt(40000)) // $400 liquidated
 * const bonusPercentage = 500                       // 5% bonus
 * const result = calculateLiquidationBonus(liquidationAmount, bonusPercentage)
 * // Result.ok(mkAmount(BigInt(2000))) - $20 bonus
 * ```
 */
export const calculateLiquidationBonus = (
  liquidationAmount: Amount,
  bonusPercentage: number,
): Result<Amount, LiquidationValidationError> => {
  // Validate inputs
  if (liquidationAmount <= 0n) {
    return Result.err({
      type: "invalid_liquidation_amount",
      amount: liquidationAmount as bigint,
      reason: "Liquidation amount must be positive",
    });
  }

  if (bonusPercentage < 0) {
    return Result.err({
      type: "invalid_ratio",
      ratio: bonusPercentage,
      reason: "Bonus percentage cannot be negative",
    });
  }

  if (bonusPercentage > 2000) {
    // Max 20% bonus
    return Result.err({
      type: "invalid_ratio",
      ratio: bonusPercentage,
      reason: "Bonus percentage cannot exceed 20%",
    });
  }

  try {
    // Calculate bonus: liquidationAmount * bonusPercentage / 10000
    const bonus =
      ((liquidationAmount as bigint) * BigInt(bonusPercentage)) / 10000n;

    // Check for overflow
    if (bonus > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: "overflow_detected",
        operation: "liquidation bonus calculation",
      });
    }

    return Result.ok(mkAmount(bonus));
  } catch (error) {
    return Result.err({
      type: "overflow_detected",
      operation: "liquidation bonus calculation",
    });
  }
};

/**
 * Validates liquidation timing constraints
 *
 * @param lastLiquidationTime - Timestamp of last liquidation (milliseconds)
 * @param currentTime - Current timestamp (milliseconds)
 * @param cooldownPeriod - Minimum time between liquidations (milliseconds)
 * @returns Result indicating if liquidation timing is valid
 *
 * @example
 * ```typescript
 * const lastLiquidation = 1640995200000    // Jan 1, 2022
 * const currentTime = 1640995260000        // Jan 1, 2022 + 60 seconds
 * const cooldown = 30000                   // 30 second cooldown
 * const result = validateLiquidationTiming(lastLiquidation, currentTime, cooldown)
 * // Result.ok(true) - sufficient time has passed
 * ```
 */
export const validateLiquidationTiming = (
  lastLiquidationTime: number,
  currentTime: number,
  cooldownPeriod: number,
): Result<boolean, LiquidationValidationError> => {
  // Validate inputs
  if (lastLiquidationTime < 0) {
    return Result.err({
      type: "invalid_amount",
      amount: BigInt(lastLiquidationTime),
      reason: "Last liquidation time cannot be negative",
    });
  }

  if (currentTime < 0) {
    return Result.err({
      type: "invalid_amount",
      amount: BigInt(currentTime),
      reason: "Current time cannot be negative",
    });
  }

  if (cooldownPeriod < 0) {
    return Result.err({
      type: "invalid_amount",
      amount: BigInt(cooldownPeriod),
      reason: "Cooldown period cannot be negative",
    });
  }

  // Check if current time is before last liquidation (clock skew)
  if (currentTime < lastLiquidationTime) {
    return Result.err({
      type: "invalid_amount",
      amount: BigInt(currentTime - lastLiquidationTime),
      reason: "Current time cannot be before last liquidation time",
    });
  }

  // Check cooldown period
  const timeSinceLastLiquidation = currentTime - lastLiquidationTime;
  if (timeSinceLastLiquidation < cooldownPeriod) {
    return Result.err({
      type: "invalid_amount",
      amount: BigInt(cooldownPeriod - timeSinceLastLiquidation),
      reason: `Cooldown period not met. Need to wait ${cooldownPeriod - timeSinceLastLiquidation}ms more`,
    });
  }

  return Result.ok(true);
};

/**
 * Validates complete liquidation scenario
 *
 * @param params - Complete liquidation parameters
 * @returns Result indicating if the entire liquidation is valid
 */
export interface LiquidationParams {
  readonly collateralValue: Amount;
  readonly debtAmount: Amount;
  readonly liquidationAmount: Amount;
  readonly liquidationRatio: number;
  readonly maxLiquidation: Amount;
  readonly liquidatorAddress: string;
  readonly liquidatorBalance: Amount;
  readonly minLiquidatorBalance: Amount;
}

export const validateLiquidation = (
  params: LiquidationParams,
): Result<boolean, LiquidationValidationError> => {
  const {
    collateralValue,
    debtAmount,
    liquidationAmount,
    liquidationRatio,
    maxLiquidation,
    liquidatorAddress,
    liquidatorBalance,
    minLiquidatorBalance,
  } = params;

  // Check if position is liquidatable
  const liquidatableCheck = isLiquidatable(
    collateralValue,
    debtAmount,
    liquidationRatio,
  );
  if (liquidatableCheck.isErr()) {
    return liquidatableCheck;
  }

  // Validate liquidation amount
  const amountCheck = validateLiquidationAmount(
    debtAmount,
    liquidationAmount,
    maxLiquidation,
  );
  if (amountCheck.isErr()) {
    return amountCheck;
  }

  // Validate liquidator
  const liquidatorCheck = isValidLiquidator(
    liquidatorAddress,
    minLiquidatorBalance,
    liquidatorBalance,
  );
  if (liquidatorCheck.isErr()) {
    return liquidatorCheck;
  }

  return Result.ok(true);
};

/**
 * Higher-order function for composing liquidation validations
 *
 * @param validations - Array of validation functions to compose
 * @returns A single validation function that runs all validations
 */
export const composeLiquidationValidations =
  <T>(
    validations: Array<
      (input: T) => Result<boolean, LiquidationValidationError>
    >,
  ) =>
  (input: T): Result<boolean, LiquidationValidationError> => {
    for (const validation of validations) {
      const result = validation(input);
      if (result.isErr()) {
        return result;
      }
    }
    return Result.ok(true);
  };
