/**
 * Collateral Validation Functions
 * 
 * This module provides pure validation functions for collateral-related operations
 * in the NyxUSD CDP system. All functions are pure, side-effect free, and use
 * functional composition for complex validations.
 * 
 * @packageDocumentation
 */

import { Result } from '@nyxusd/fp-utils'
import { Amount, mkAmount } from '../types/cdp'

/**
 * Validation error types for collateral operations
 */
export type CollateralValidationError = 
  | { readonly type: 'invalid_collateral_type'; readonly collateralType: string; readonly reason: string }
  | { readonly type: 'invalid_amount'; readonly amount: bigint; readonly reason: string }
  | { readonly type: 'insufficient_collateral'; readonly required: Amount; readonly provided: Amount }
  | { readonly type: 'exceeds_maximum_deposit'; readonly maximum: Amount; readonly requested: Amount }
  | { readonly type: 'below_minimum_ratio'; readonly current: number; readonly minimum: number }
  | { readonly type: 'zero_or_negative_amount'; readonly amount: bigint }
  | { readonly type: 'overflow_detected'; readonly operation: string }

/**
 * Known collateral types for validation
 */
const VALID_COLLATERAL_TYPES = new Set([
  'WETH',
  'WBTC', 
  'MATIC',
  'USDC',
  'DAI'
])

/**
 * Maximum safe integer for BigInt operations to prevent overflow
 */
const MAX_SAFE_AMOUNT = BigInt(Number.MAX_SAFE_INTEGER)

/**
 * Validates whether a collateral type is supported by the system
 * 
 * @param collateralType - The collateral type identifier to validate
 * @returns Result indicating validation success or specific failure reason
 * 
 * @example
 * ```typescript
 * const result1 = isValidCollateralType('WETH')
 * // Result.ok(true)
 * 
 * const result2 = isValidCollateralType('INVALID')
 * // Result.err({ type: 'invalid_collateral_type', ... })
 * ```
 */
export const isValidCollateralType = (
  collateralType: string
): Result<boolean, CollateralValidationError> => {
  if (typeof collateralType !== 'string') {
    return Result.err({
      type: 'invalid_collateral_type',
      collateralType: String(collateralType),
      reason: 'Collateral type must be a string'
    })
  }

  if (collateralType.trim().length === 0) {
    return Result.err({
      type: 'invalid_collateral_type',
      collateralType,
      reason: 'Collateral type cannot be empty'
    })
  }

  if (!VALID_COLLATERAL_TYPES.has(collateralType)) {
    return Result.err({
      type: 'invalid_collateral_type',
      collateralType,
      reason: `Unsupported collateral type. Supported types: ${Array.from(VALID_COLLATERAL_TYPES).join(', ')}`
    })
  }

  return Result.ok(true)
}

/**
 * Validates that a collateral amount meets minimum requirements
 * 
 * @param amount - The amount to validate (in smallest units)
 * @param minimumAmount - The minimum required amount (in smallest units)
 * @returns Result indicating validation success or specific failure reason
 * 
 * @example
 * ```typescript
 * const amount = mkAmount(BigInt(1000))
 * const minimum = mkAmount(BigInt(100))
 * const result = isValidCollateralAmount(amount, minimum)
 * // Result.ok(true)
 * ```
 */
export const isValidCollateralAmount = (
  amount: Amount,
  minimumAmount: Amount
): Result<boolean, CollateralValidationError> => {
  // Check for zero or negative amounts
  if (amount <= 0n) {
    return Result.err({
      type: 'zero_or_negative_amount',
      amount: amount as bigint
    })
  }

  if (minimumAmount < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: minimumAmount as bigint,
      reason: 'Minimum amount cannot be negative'
    })
  }

  // Check for overflow potential
  if (amount > MAX_SAFE_AMOUNT || minimumAmount > MAX_SAFE_AMOUNT) {
    return Result.err({
      type: 'overflow_detected',
      operation: 'amount comparison'
    })
  }

  // Validate amount meets minimum requirement
  if (amount < minimumAmount) {
    return Result.err({
      type: 'insufficient_collateral',
      required: minimumAmount,
      provided: amount
    })
  }

  return Result.ok(true)
}

/**
 * Validates that collateral value is sufficient for the debt amount given minimum ratio
 * 
 * @param collateralValue - USD value of collateral (scaled by decimals)
 * @param debtAmount - Amount of debt (in NYXUSD units)
 * @param minRatio - Minimum collateralization ratio (basis points, 10000 = 100%)
 * @returns Result indicating validation success or specific failure reason
 * 
 * @example
 * ```typescript
 * const collateralValue = mkAmount(BigInt(150000)) // $1500 worth
 * const debtAmount = mkAmount(BigInt(100000))      // $1000 debt
 * const minRatio = 15000                           // 150% minimum
 * const result = isCollateralSufficient(collateralValue, debtAmount, minRatio)
 * // Result.ok(true)
 * ```
 */
export const isCollateralSufficient = (
  collateralValue: Amount,
  debtAmount: Amount,
  minRatio: number
): Result<boolean, CollateralValidationError> => {
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
      type: 'invalid_amount',
      amount: BigInt(Math.floor(minRatio)),
      reason: 'Minimum ratio must be positive'
    })
  }

  // Handle edge case of zero debt
  if (debtAmount === 0n) {
    return Result.ok(true)
  }

  // Check for overflow in calculations
  const maxSafeRatio = Number.MAX_SAFE_INTEGER / 10000
  if (minRatio > maxSafeRatio) {
    return Result.err({
      type: 'overflow_detected',
      operation: 'ratio calculation'
    })
  }

  try {
    // Calculate required collateral: debtAmount * minRatio / 10000
    // Using BigInt arithmetic to maintain precision
    const requiredCollateral = (debtAmount as bigint) * BigInt(minRatio) / 10000n
    
    if (collateralValue < requiredCollateral) {
      const currentRatio = Number((collateralValue as bigint) * 10000n / (debtAmount as bigint))
      return Result.err({
        type: 'below_minimum_ratio',
        current: currentRatio,
        minimum: minRatio
      })
    }

    return Result.ok(true)
  } catch (error) {
    return Result.err({
      type: 'overflow_detected',
      operation: 'collateral sufficiency calculation'
    })
  }
}

/**
 * Validates a collateral deposit against current balance and maximum limits
 * 
 * @param amount - Amount to deposit
 * @param currentBalance - Current collateral balance
 * @param maxDeposit - Maximum allowed deposit amount
 * @returns Result indicating validation success or specific failure reason
 * 
 * @example
 * ```typescript
 * const depositAmount = mkAmount(BigInt(1000))
 * const currentBalance = mkAmount(BigInt(5000))  
 * const maxDeposit = mkAmount(BigInt(10000))
 * const result = validateCollateralDeposit(depositAmount, currentBalance, maxDeposit)
 * // Result.ok(true)
 * ```
 */
export const validateCollateralDeposit = (
  amount: Amount,
  currentBalance: Amount,
  maxDeposit: Amount
): Result<boolean, CollateralValidationError> => {
  // Validate amount is positive
  if (amount <= 0n) {
    return Result.err({
      type: 'zero_or_negative_amount',
      amount: amount as bigint
    })
  }

  // Validate parameters are non-negative  
  if (currentBalance < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: currentBalance as bigint,
      reason: 'Current balance cannot be negative'
    })
  }

  if (maxDeposit < 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: maxDeposit as bigint,
      reason: 'Maximum deposit cannot be negative'
    })
  }

  // Check for overflow in addition
  try {
    const newBalance = (currentBalance as bigint) + (amount as bigint)
    
    // Check if new balance would exceed maximum
    if (newBalance > maxDeposit) {
      return Result.err({
        type: 'exceeds_maximum_deposit',
        maximum: maxDeposit,
        requested: mkAmount(newBalance)
      })
    }

    // Check for overflow
    if (newBalance > MAX_SAFE_AMOUNT) {
      return Result.err({
        type: 'overflow_detected',
        operation: 'balance addition'
      })
    }

    return Result.ok(true)
  } catch (error) {
    return Result.err({
      type: 'overflow_detected',
      operation: 'deposit validation'
    })
  }
}

/**
 * Higher-order function for composing collateral validations
 * 
 * @param validations - Array of validation functions to compose
 * @returns A single validation function that runs all validations
 * 
 * @example 
 * ```typescript
 * const composedValidation = composeCollateralValidations([
 *   (amount) => isValidCollateralAmount(amount, mkAmount(BigInt(100))),
 *   (amount) => validateCollateralDeposit(amount, mkAmount(BigInt(0)), mkAmount(BigInt(10000)))
 * ])
 * ```
 */
export const composeCollateralValidations = <T>(
  validations: Array<(input: T) => Result<boolean, CollateralValidationError>>
) => (input: T): Result<boolean, CollateralValidationError> => {
  for (const validation of validations) {
    const result = validation(input)
    if (result.isErr()) {
      return result
    }
  }
  return Result.ok(true)
}

/**
 * Utility function to check if a collateral type supports a specific feature
 * 
 * @param collateralType - The collateral type to check
 * @param feature - The feature to check support for
 * @returns Result indicating if feature is supported
 */
export const supportsFeature = (
  collateralType: string,
  feature: 'liquidation' | 'borrowing' | 'staking'
): Result<boolean, CollateralValidationError> => {
  const typeValidation = isValidCollateralType(collateralType)
  if (typeValidation.isErr()) {
    return typeValidation
  }

  // All supported collateral types support all features in this implementation
  // This can be extended with more sophisticated feature matrices
  const featureMatrix: Record<string, string[]> = {
    'WETH': ['liquidation', 'borrowing', 'staking'],
    'WBTC': ['liquidation', 'borrowing'], 
    'MATIC': ['liquidation', 'borrowing', 'staking'],
    'USDC': ['liquidation', 'borrowing'],
    'DAI': ['liquidation', 'borrowing']
  }

  const supportedFeatures = featureMatrix[collateralType] || []
  return Result.ok(supportedFeatures.includes(feature))
}