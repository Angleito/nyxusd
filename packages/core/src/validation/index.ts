/**
 * Validation Module
 * 
 * This module contains pure validation functions for CDP operations,
 * user inputs, and system parameters. All validation functions are
 * pure, side-effect free, and use functional composition patterns.
 * 
 * @packageDocumentation
 */

import { Result } from '../../../libs/fp-utils/src/result'

// Re-export all validation functions and types
export * from './collateral'
export * from './position'
export * from './liquidation'

// Module version for compatibility tracking
export const VALIDATION_MODULE_VERSION = '1.0.0'

/**
 * Combined validation error types for convenience
 */
export type ValidationError = 
  | import('./collateral').CollateralValidationError
  | import('./position').PositionValidationError
  | import('./liquidation').LiquidationValidationError

/**
 * Utility function to compose multiple validation functions from different modules
 * 
 * @param validations - Array of validation functions to compose
 * @returns A single validation function that runs all validations
 * 
 * @example
 * ```typescript
 * import { composeValidations, isValidCollateralType, isPositionHealthy } from './validation'
 * 
 * const composedValidation = composeValidations([
 *   () => isValidCollateralType('WETH'),
 *   () => isPositionHealthy(collateralValue, debtAmount, minRatio)
 * ])
 * ```
 */
export const composeValidations = <T>(
  validations: Array<(input: T) => Result<boolean, ValidationError>>
) => (input: T): Result<boolean, ValidationError> => {
  for (const validation of validations) {
    const result = validation(input)
    if (result.isErr()) {
      return result
    }
  }
  return Result.ok(true)
}