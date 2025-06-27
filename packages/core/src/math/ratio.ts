/**
 * Collateralization Ratio Calculations
 *
 * This module provides pure mathematical functions for calculating collateralization ratios,
 * liquidation prices, and related financial metrics. All calculations use BigInt arithmetic
 * to maintain precision for financial operations.
 *
 * Mathematical formulas:
 * - Collateralization Ratio = (Collateral Value / Debt Amount) × 100
 * - Liquidation Price = (Debt Amount × Liquidation Ratio) / Collateral Amount
 * - Health Factor = Current Ratio / Liquidation Ratio
 *
 * @packageDocumentation
 */

import { Result } from "./types";

/**
 * Mathematical constants for ratio calculations
 */
export const RATIO_CONSTANTS = {
  /** Basis points multiplier (10,000 = 100%) */
  BASIS_POINTS: 10000n,
  /** Percentage multiplier (100 = 100%) */
  PERCENTAGE: 100n,
  /** Scale factor for high-precision calculations */
  PRECISION_SCALE: 1000000000000000000n, // 18 decimals
  /** Zero value */
  ZERO: 0n,
  /** One in basis points */
  ONE_HUNDRED_PERCENT: 10000n,
} as const;

/**
 * Error types for ratio calculations
 */
export type RatioError =
  | { readonly type: "division_by_zero"; readonly operation: string }
  | {
      readonly type: "negative_value";
      readonly value: bigint;
      readonly field: string;
    }
  | { readonly type: "overflow"; readonly operation: string }
  | {
      readonly type: "invalid_ratio";
      readonly ratio: number;
      readonly bounds: [number, number];
    };

/**
 * Calculates the collateralization ratio given collateral value and debt amount.
 *
 * Formula: Collateralization Ratio = (Collateral Value / Debt Amount) × 10000
 *
 * @param collateralValue - Total value of collateral in wei units
 * @param debtAmount - Amount of debt in wei units
 * @returns Result containing the collateralization ratio in basis points (10000 = 100%)
 *
 * @example
 * ```typescript
 * // $150 collateral, $100 debt = 150% collateralization ratio
 * const result = calculateCollateralizationRatio(150000000000000000000n, 100000000000000000000n)
 * // Returns Ok(15000) - 150% in basis points
 * ```
 */
export function calculateCollateralizationRatio(
  collateralValue: bigint,
  debtAmount: bigint,
): Result<number, RatioError> {
  // Validate inputs
  if (collateralValue < RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_value" as const,
      value: collateralValue,
      field: "collateralValue",
    });
  }

  if (debtAmount < RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_value" as const,
      value: debtAmount,
      field: "debtAmount",
    });
  }

  if (debtAmount === RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "division_by_zero" as const,
      operation: "calculateCollateralizationRatio",
    });
  }

  try {
    // Calculate ratio with precision: (collateralValue * BASIS_POINTS) / debtAmount
    const numerator = collateralValue * RATIO_CONSTANTS.BASIS_POINTS;
    const ratio = numerator / debtAmount;

    // Convert to number (should be safe as ratios are typically small)
    if (ratio > BigInt(Number.MAX_SAFE_INTEGER)) {
      return Result.err({
        type: "overflow" as const,
        operation: "calculateCollateralizationRatio",
      });
    }

    return Result.ok(Number(ratio));
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateCollateralizationRatio",
    });
  }
}

/**
 * Calculates the liquidation price for a given debt amount, liquidation ratio, and collateral amount.
 *
 * Formula: Liquidation Price = (Debt Amount × Liquidation Ratio) / (Collateral Amount × 10000)
 *
 * @param debtAmount - Amount of debt in wei units
 * @param liquidationRatio - Liquidation ratio in basis points (15000 = 150%)
 * @param collateralAmount - Amount of collateral tokens
 * @returns Result containing the liquidation price per collateral token in wei
 *
 * @example
 * ```typescript
 * // $100 debt, 150% liquidation ratio, 1 ETH collateral
 * const result = calculateLiquidationPrice(
 *   100000000000000000000n, // $100 in wei
 *   15000,                   // 150% liquidation ratio
 *   1000000000000000000n     // 1 ETH in wei
 * )
 * // Returns Ok(150000000000000000000n) - $150 liquidation price
 * ```
 */
export function calculateLiquidationPrice(
  debtAmount: bigint,
  liquidationRatio: number,
  collateralAmount: bigint,
): Result<bigint, RatioError> {
  // Validate inputs
  if (debtAmount < RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_value" as const,
      value: debtAmount,
      field: "debtAmount",
    });
  }

  if (liquidationRatio < 0 || liquidationRatio > 100000) {
    // Max 1000% seems reasonable
    return Result.err({
      type: "invalid_ratio" as const,
      ratio: liquidationRatio,
      bounds: [0, 100000],
    });
  }

  if (collateralAmount < RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_value" as const,
      value: collateralAmount,
      field: "collateralAmount",
    });
  }

  if (collateralAmount === RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "division_by_zero" as const,
      operation: "calculateLiquidationPrice",
    });
  }

  try {
    // Calculate liquidation price: (debtAmount * liquidationRatio) / (collateralAmount * BASIS_POINTS)
    const numerator = debtAmount * BigInt(liquidationRatio);
    const denominator = collateralAmount * RATIO_CONSTANTS.BASIS_POINTS;
    const liquidationPrice = numerator / denominator;

    return Result.ok(liquidationPrice);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateLiquidationPrice",
    });
  }
}

/**
 * Calculates the health factor of a CDP position.
 *
 * Formula: Health Factor = Current Collateralization Ratio / Liquidation Ratio
 *
 * @param currentRatio - Current collateralization ratio in basis points
 * @param liquidationRatio - Liquidation ratio in basis points
 * @returns Result containing the health factor (1.0 = at liquidation threshold)
 *
 * @example
 * ```typescript
 * // 200% current ratio, 150% liquidation ratio
 * const result = calculateHealthFactor(20000, 15000)
 * // Returns Ok(1.33) - healthy position
 * ```
 */
export function calculateHealthFactor(
  currentRatio: number,
  liquidationRatio: number,
): Result<number, RatioError> {
  // Validate inputs
  if (currentRatio < 0) {
    return Result.err({
      type: "negative_value" as const,
      value: BigInt(currentRatio),
      field: "currentRatio",
    });
  }

  if (liquidationRatio <= 0 || liquidationRatio > 100000) {
    return Result.err({
      type: "invalid_ratio" as const,
      ratio: liquidationRatio,
      bounds: [1, 100000],
    });
  }

  if (liquidationRatio === 0) {
    return Result.err({
      type: "division_by_zero" as const,
      operation: "calculateHealthFactor",
    });
  }

  try {
    const healthFactor = currentRatio / liquidationRatio;
    return Result.ok(healthFactor);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateHealthFactor",
    });
  }
}

/**
 * Calculates the maximum debt that can be borrowed given collateral value and minimum ratio.
 *
 * Formula: Max Debt = Collateral Value / (Min Collateralization Ratio / 10000)
 *
 * @param collateralValue - Total value of collateral in wei units
 * @param minCollateralizationRatio - Minimum required ratio in basis points
 * @returns Result containing the maximum borrowable debt amount in wei
 *
 * @example
 * ```typescript
 * // $200 collateral, 150% minimum ratio
 * const result = calculateMaxDebt(200000000000000000000n, 15000)
 * // Returns Ok(133333333333333333333n) - ~$133.33 max debt
 * ```
 */
export function calculateMaxDebt(
  collateralValue: bigint,
  minCollateralizationRatio: number,
): Result<bigint, RatioError> {
  // Validate inputs
  if (collateralValue < RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_value" as const,
      value: collateralValue,
      field: "collateralValue",
    });
  }

  if (minCollateralizationRatio <= 0 || minCollateralizationRatio > 100000) {
    return Result.err({
      type: "invalid_ratio" as const,
      ratio: minCollateralizationRatio,
      bounds: [1, 100000],
    });
  }

  try {
    // Calculate max debt: (collateralValue * BASIS_POINTS) / minCollateralizationRatio
    const numerator = collateralValue * RATIO_CONSTANTS.BASIS_POINTS;
    const maxDebt = numerator / BigInt(minCollateralizationRatio);

    return Result.ok(maxDebt);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateMaxDebt",
    });
  }
}

/**
 * Calculates the minimum collateral required for a given debt amount and ratio.
 *
 * Formula: Min Collateral = (Debt Amount × Min Collateralization Ratio) / 10000
 *
 * @param debtAmount - Amount of debt in wei units
 * @param minCollateralizationRatio - Minimum required ratio in basis points
 * @returns Result containing the minimum required collateral value in wei
 *
 * @example
 * ```typescript
 * // $100 debt, 150% minimum ratio
 * const result = calculateMinCollateral(100000000000000000000n, 15000)
 * // Returns Ok(150000000000000000000n) - $150 min collateral
 * ```
 */
export function calculateMinCollateral(
  debtAmount: bigint,
  minCollateralizationRatio: number,
): Result<bigint, RatioError> {
  // Validate inputs
  if (debtAmount < RATIO_CONSTANTS.ZERO) {
    return Result.err({
      type: "negative_value" as const,
      value: debtAmount,
      field: "debtAmount",
    });
  }

  if (minCollateralizationRatio <= 0 || minCollateralizationRatio > 100000) {
    return Result.err({
      type: "invalid_ratio" as const,
      ratio: minCollateralizationRatio,
      bounds: [1, 100000],
    });
  }

  try {
    // Calculate min collateral: (debtAmount * minCollateralizationRatio) / BASIS_POINTS
    const numerator = debtAmount * BigInt(minCollateralizationRatio);
    const minCollateral = numerator / RATIO_CONSTANTS.BASIS_POINTS;

    return Result.ok(minCollateral);
  } catch (error) {
    return Result.err({
      type: "overflow" as const,
      operation: "calculateMinCollateral",
    });
  }
}

/**
 * Determines if a position is safe given current and liquidation ratios.
 *
 * @param currentRatio - Current collateralization ratio in basis points
 * @param liquidationRatio - Liquidation ratio in basis points
 * @param safetyBuffer - Additional safety buffer in basis points (default: 500 = 5%)
 * @returns Result containing true if position is safe, false otherwise
 */
export function isPositionSafe(
  currentRatio: number,
  liquidationRatio: number,
  safetyBuffer: number = 500,
): Result<boolean, RatioError> {
  // Validate inputs
  if (currentRatio < 0) {
    return Result.err({
      type: "negative_value" as const,
      value: BigInt(currentRatio),
      field: "currentRatio",
    });
  }

  if (liquidationRatio <= 0 || liquidationRatio > 100000) {
    return Result.err({
      type: "invalid_ratio" as const,
      ratio: liquidationRatio,
      bounds: [1, 100000],
    });
  }

  if (safetyBuffer < 0 || safetyBuffer > 10000) {
    return Result.err({
      type: "invalid_ratio" as const,
      ratio: safetyBuffer,
      bounds: [0, 10000],
    });
  }

  const safeThreshold = liquidationRatio + safetyBuffer;
  return Result.ok(currentRatio >= safeThreshold);
}
