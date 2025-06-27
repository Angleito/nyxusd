/**
 * CDP Position Validation Functions
 * 
 * This module provides pure validation functions for CDP position health,
 * collateralization ratios, and position state transitions. All functions
 * are pure, side-effect free, and use functional composition patterns.
 * 
 * @packageDocumentation
 */

import { Result } from '@nyxusd/fp-utils'
import { Amount, mkAmount } from '../types/cdp'

/**
 * Validation error types for position operations
 */
export type PositionValidationError = 
  | { readonly type: 'position_unhealthy'; readonly currentRatio: number; readonly minimumRatio: number }
  | { readonly type: 'position_undercollateralized'; readonly currentRatio: number; readonly liquidationRatio: number }
  | { readonly type: 'insufficient_collateral_for_mint'; readonly requiredCollateral: Amount; readonly availableCollateral: Amount }
  | { readonly type: 'insufficient_collateral_for_withdrawal'; readonly requiredCollateral: Amount; readonly availableAfterWithdrawal: Amount }
  | { readonly type: 'invalid_amount'; readonly amount: bigint; readonly reason: string }
  | { readonly type: 'invalid_ratio'; readonly ratio: number; readonly reason: string }
  | { readonly type: 'zero_debt_position'; readonly reason: string }
  | { readonly type: 'overflow_detected'; readonly operation: string }
  | { readonly type: 'division_by_zero'; readonly operation: string }

/**
 * Maximum safe integer for BigInt operations
 */
const MAX_SAFE_AMOUNT = BigInt(Number.MAX_SAFE_INTEGER)

/**
 * Validates whether a CDP position is healthy based on collateralization ratio
 * 
 * @param collateralValue - USD value of collateral (scaled by decimals)
 * @param debtAmount - Amount of debt in NYXUSD
 * @param minRatio - Minimum healthy collateralization ratio (basis points, 10000 = 100%)
 * @returns Result indicating if position is healthy or specific failure reason
 * 
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(200000)) // $2000 worth
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 debt  
 * const minRatio = 15000                           // 150% minimum
 * const result = isPositionHealthy(collateralValue, debtAmount, minRatio)
 * // Result.ok(true) - position is healthy at 200% ratio
 * ```
 */
export const isPositionHealthy = (
  collateralValue: Amount,
  debtAmount: Amount,
  minRatio: number
): Result<boolean, PositionValidationError> => {
  // Validate inputs
  if (collateralValue < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: collateralValue as bigint,
      reason: 'Collateral value cannot be negative'
    })
  }

  if (debtAmount < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: debtAmount as bigint,
      reason: 'Debt amount cannot be negative'
    })
  }

  if (minRatio <= 0) {
    return Result.err({
      type: 'invalid_ratio',
      ratio: minRatio,
      reason: 'Minimum ratio must be positive'
    })
  }

  // Handle edge case of zero debt (position is healthy by definition)
  if (debtAmount === 0n) {
    return Result.ok(true)
  }

  // Handle edge case of zero collateral with debt (definitely unhealthy)
  if (collateralValue === 0n && debtAmount > 0n) {
    return Result.err({
      type: 'position_unhealthy',
      currentRatio: 0,
      minimumRatio: minRatio
    })
  }

  try {
    // Calculate current ratio: (collateralValue * 10000) / debtAmount
    const currentRatioBigInt = (collateralValue as bigint) * 10000n / (debtAmount as bigint)
    const currentRatio = Number(currentRatioBigInt)

    // Check for overflow
    if (currentRatioBigInt > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: 'overflow_detected',
        operation: 'ratio calculation'
      })
    }

    if (currentRatio < minRatio) {
      return Result.err({
        type: 'position_unhealthy',
        currentRatio,
        minimumRatio: minRatio
      })
    }

    return Result.ok(true)
  } catch (error) {
    return Result.err({
      type: 'division_by_zero',
      operation: 'health ratio calculation'
    })
  }
}

/**
 * Validates whether a CDP position is undercollateralized and subject to liquidation
 * 
 * @param collateralValue - USD value of collateral (scaled by decimals)
 * @param debtAmount - Amount of debt in NYXUSD
 * @param liquidationRatio - Liquidation threshold ratio (basis points, 10000 = 100%)
 * @returns Result indicating if position is undercollateralized
 * 
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(120000)) // $1200 worth
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 debt
 * const liquidationRatio = 12500                   // 125% liquidation threshold
 * const result = isPositionUndercollateralized(collateralValue, debtAmount, liquidationRatio)
 * // Result.err(...) - position is undercollateralized at 120% ratio
 * ```
 */
export const isPositionUndercollateralized = (
  collateralValue: Amount,
  debtAmount: Amount,
  liquidationRatio: number
): Result<boolean, PositionValidationError> => {
  // Validate inputs
  if (collateralValue < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: collateralValue as bigint,
      reason: 'Collateral value cannot be negative'
    })
  }

  if (debtAmount < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: debtAmount as bigint,
      reason: 'Debt amount cannot be negative'
    })
  }

  if (liquidationRatio <= 0) {
    return Result.err({
      type: 'invalid_ratio',
      ratio: liquidationRatio,
      reason: 'Liquidation ratio must be positive'
    })
  }

  // Handle edge case of zero debt (cannot be undercollateralized)
  if (debtAmount === 0n) {
    return Result.ok(false)
  }

  // Handle edge case of zero collateral with debt (definitely undercollateralized)
  if (collateralValue === 0n && debtAmount > 0n) {
    return Result.err({
      type: 'position_undercollateralized',
      currentRatio: 0,
      liquidationRatio
    })
  }

  try {
    // Calculate current ratio: (collateralValue * 10000) / debtAmount
    const currentRatioBigInt = (collateralValue as bigint) * 10000n / (debtAmount as bigint)
    const currentRatio = Number(currentRatioBigInt)

    // Check for overflow
    if (currentRatioBigInt > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: 'overflow_detected',
        operation: 'liquidation ratio calculation'
      })
    }

    if (currentRatio < liquidationRatio) {
      return Result.err({
        type: 'position_undercollateralized',
        currentRatio,
        liquidationRatio
      })
    }

    return Result.ok(false)
  } catch (error) {
    return Result.err({
      type: 'division_by_zero',
      operation: 'undercollateralization check'
    })
  }
}

/**
 * Validates whether additional debt can be minted without violating minimum collateralization
 * 
 * @param collateralValue - USD value of collateral (scaled by decimals)
 * @param currentDebt - Current debt amount in NYXUSD
 * @param newDebt - Additional debt amount to mint
 * @param minRatio - Minimum collateralization ratio (basis points, 10000 = 100%)
 * @returns Result indicating if debt can be minted or specific failure reason
 * 
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(300000)) // $3000 worth
 * const currentDebt = mkAmount(BigInt(100000))     // $1000 current debt
 * const newDebt = mkAmount(BigInt(50000))          // $500 additional debt
 * const minRatio = 15000                           // 150% minimum
 * const result = canMintDebt(collateralValue, currentDebt, newDebt, minRatio)
 * // Result.ok(true) - can mint, final ratio would be 200%
 * ```
 */
export const canMintDebt = (
  collateralValue: Amount,
  currentDebt: Amount,
  newDebt: Amount,
  minRatio: number
): Result<boolean, PositionValidationError> => {
  // Validate inputs
  if (collateralValue < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: collateralValue as bigint,
      reason: 'Collateral value cannot be negative'
    })
  }

  if (currentDebt < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: currentDebt as bigint,
      reason: 'Current debt cannot be negative'
    })
  }

  if (newDebt <= 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: newDebt as bigint,
      reason: 'New debt amount must be positive'
    })
  }

  if (minRatio <= 0) {
    return Result.err({
      type: 'invalid_ratio',
      ratio: minRatio,
      reason: 'Minimum ratio must be positive'
    })
  }

  try {
    // Calculate total debt after minting
    const totalDebt = (currentDebt as bigint) + (newDebt as bigint)

    // Check for overflow
    if (totalDebt > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: 'overflow_detected',
        operation: 'debt addition'
      })
    }

    // Calculate required collateral for total debt
    const requiredCollateral = totalDebt * BigInt(minRatio) / 10000n

    if (collateralValue < requiredCollateral) {
      return Result.err({
        type: 'insufficient_collateral_for_mint',
        requiredCollateral: mkAmount(requiredCollateral),
        availableCollateral: collateralValue
      })
    }

    return Result.ok(true)
  } catch (error) {
    return Result.err({
      type: 'overflow_detected',
      operation: 'debt minting validation'
    })
  }
}

/**
 * Validates whether collateral can be withdrawn without violating minimum collateralization
 * 
 * @param collateralValue - Current USD value of collateral (scaled by decimals)
 * @param withdrawAmount - USD value of collateral to withdraw
 * @param debtAmount - Current debt amount in NYXUSD
 * @param minRatio - Minimum collateralization ratio (basis points, 10000 = 100%)
 * @returns Result indicating if collateral can be withdrawn
 * 
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(300000)) // $3000 worth
 * const withdrawAmount = mkAmount(BigInt(50000))   // $500 to withdraw
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 debt
 * const minRatio = 15000                           // 150% minimum
 * const result = canWithdrawCollateral(collateralValue, withdrawAmount, debtAmount, minRatio)
 * // Result.ok(true) - can withdraw, final ratio would be 250%
 * ```
 */
export const canWithdrawCollateral = (
  collateralValue: Amount,
  withdrawAmount: Amount,
  debtAmount: Amount,
  minRatio: number
): Result<boolean, PositionValidationError> => {
  // Validate inputs
  if (collateralValue < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: collateralValue as bigint,
      reason: 'Collateral value cannot be negative'
    })
  }

  if (withdrawAmount <= 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: withdrawAmount as bigint,
      reason: 'Withdraw amount must be positive'
    })
  }

  if (debtAmount < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: debtAmount as bigint,
      reason: 'Debt amount cannot be negative'
    })
  }

  if (minRatio <= 0) {
    return Result.err({
      type: 'invalid_ratio',
      ratio: minRatio,
      reason: 'Minimum ratio must be positive'
    })
  }

  // Handle edge case of zero debt (can withdraw any amount)
  if (debtAmount === 0n) {
    return Result.ok(true)
  }

  // Check if withdraw amount exceeds available collateral
  if (withdrawAmount > collateralValue) {
    return Result.err({
      type: 'invalid_amount',
      amount: withdrawAmount as bigint,
      reason: 'Withdraw amount exceeds available collateral'
    })
  }

  try {
    // Calculate remaining collateral after withdrawal
    const remainingCollateral = (collateralValue as bigint) - (withdrawAmount as bigint)

    // Calculate required collateral for current debt
    const requiredCollateral = (debtAmount as bigint) * BigInt(minRatio) / 10000n

    if (remainingCollateral < requiredCollateral) {
      return Result.err({
        type: 'insufficient_collateral_for_withdrawal',
        requiredCollateral: mkAmount(requiredCollateral),
        availableAfterWithdrawal: mkAmount(remainingCollateral)
      })
    }

    return Result.ok(true)
  } catch (error) {
    return Result.err({
      type: 'overflow_detected',
      operation: 'collateral withdrawal validation'
    })
  }
}

/**
 * Calculates the current collateralization ratio for a position
 * 
 * @param collateralValue - USD value of collateral (scaled by decimals)
 * @param debtAmount - Amount of debt in NYXUSD
 * @returns Result containing the collateralization ratio in basis points
 * 
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(200000)) // $2000 worth
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 debt
 * const result = calculateCollateralizationRatio(collateralValue, debtAmount)
 * // Result.ok(20000) - 200% ratio
 * ```
 */
export const calculateCollateralizationRatio = (
  collateralValue: Amount,
  debtAmount: Amount
): Result<number, PositionValidationError> => {
  // Validate inputs
  if (collateralValue < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: collateralValue as bigint,
      reason: 'Collateral value cannot be negative'
    })
  }

  if (debtAmount < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: debtAmount as bigint,
      reason: 'Debt amount cannot be negative'
    })
  }

  // Handle edge case of zero debt
  if (debtAmount === 0n) {
    return Result.err({
      type: 'zero_debt_position',
      reason: 'Cannot calculate ratio for position with zero debt'
    })
  }

  try {
    // Calculate ratio: (collateralValue * 10000) / debtAmount
    const ratioBigInt = (collateralValue as bigint) * 10000n / (debtAmount as bigint)
    const ratio = Number(ratioBigInt)

    // Check for overflow
    if (ratioBigInt > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: 'overflow_detected',
        operation: 'ratio calculation'
      })
    }

    return Result.ok(ratio)
  } catch (error) {
    return Result.err({
      type: 'division_by_zero',
      operation: 'collateralization ratio calculation'
    })
  }
}

/**
 * Validates position state transitions
 * 
 * @param currentState - Current position state
 * @param targetState - Target position state
 * @param collateralValue - Current collateral value
 * @param debtAmount - Current debt amount
 * @param minRatio - Minimum collateralization ratio
 * @returns Result indicating if state transition is valid
 */
export const validateStateTransition = (
  currentState: 'active' | 'liquidating' | 'liquidated' | 'closed',
  targetState: 'active' | 'liquidating' | 'liquidated' | 'closed',
  collateralValue: Amount,
  debtAmount: Amount,
  minRatio: number
): Result<boolean, PositionValidationError> => {
  // Define valid state transitions
  const validTransitions: Record<string, string[]> = {
    'active': ['liquidating', 'closed'],
    'liquidating': ['liquidated', 'active'], // Can recover from liquidation
    'liquidated': [], // Terminal state
    'closed': [] // Terminal state
  }

  if (!validTransitions[currentState]?.includes(targetState)) {
    return Result.err({
      type: 'invalid_amount',
      amount: BigInt(0),
      reason: `Invalid state transition from ${currentState} to ${targetState}`
    })
  }

  // Validate specific transition conditions
  if (targetState === 'liquidating') {
    // Must be undercollateralized to enter liquidation
    const undercollateralizedCheck = isPositionUndercollateralized(collateralValue, debtAmount, minRatio)
    if (undercollateralizedCheck.isOk() && !undercollateralizedCheck.unwrap()) {
      return Result.err({
        type: 'invalid_amount',
        amount: BigInt(0),
        reason: 'Position is not undercollateralized, cannot liquidate'
      })
    }
  }

  return Result.ok(true)
}

/**
 * Higher-order function for composing position validations
 * 
 * @param validations - Array of validation functions to compose
 * @returns A single validation function that runs all validations
 */
export const composePositionValidations = <T>(
  validations: Array<(input: T) => Result<boolean, PositionValidationError>>
) => (input: T): Result<boolean, PositionValidationError> => {
  for (const validation of validations) {
    const result = validation(input)
    if (result.isErr()) {
      return result
    }
  }
  return Result.ok(true)
}