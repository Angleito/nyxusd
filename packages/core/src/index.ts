/**
 * NyxUSD Core Package
 *
 * This package contains the core business logic types and interfaces for the
 * NyxUSD CDP system on the Midnight protocol. It follows functional programming
 * principles with immutable data structures and comprehensive type safety.
 *
 * @packageDocumentation
 */

// Export all CDP-related functions and types
export * from "./cdp";

// Export math ratio calculations with aliases to avoid conflicts
export {
  calculateCollateralizationRatio as mathCalculateCollateralizationRatio,
  calculateHealthFactor as mathCalculateHealthFactor,
  calculateLiquidationPrice,
  calculateMaxDebt,
  calculateMinCollateral,
  isPositionSafe,
  RATIO_CONSTANTS,
} from "./math/ratio";

export * from "./math/types";
export * from "./math/interest";
export * from "./math/fees";

// Export types with explicit naming to avoid conflicts
export * from "./types/cdp";
export * from "./types/collateral";
export type {
  ValidationError as StateValidationError,
} from "./types/state";

// Export validation utilities with explicit naming
export type {
  ValidationError as ValidationErrorGeneral,
} from "./validation";
export * from "./validation/collateral";
export * from "./validation/liquidation";
export * from "./validation/position";

// Note: fp-ts re-exports will be added once dependencies are properly installed
