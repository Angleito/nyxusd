/**
 * Core CDP (Collateralized Debt Position) type definitions
 * 
 * This module defines the fundamental types for CDP operations in the NyxUSD system.
 * All types follow functional programming principles with immutable data structures
 * and discriminated unions for type safety.
 * 
 * @packageDocumentation
 */

// Temporary basic type definitions - will be replaced with fp-ts when dependencies are available
type Either<E, A> = { readonly _tag: 'Left'; readonly left: E } | { readonly _tag: 'Right'; readonly right: A }
type Option<A> = { readonly _tag: 'None' } | { readonly _tag: 'Some'; readonly value: A }

/**
 * Unique identifier for a CDP
 * Uses newtype pattern for type safety
 */
export type CDPId = string & { readonly __brand: 'CDPId' }

/**
 * Creates a CDP identifier from a string
 * @param id - The string identifier
 * @returns A branded CDP identifier
 */
export const mkCDPId = (id: string): CDPId => id as CDPId

/**
 * Amount of collateral or debt, using BigInt for precision
 * All financial calculations use BigInt to avoid floating point errors
 */
export type Amount = bigint & { readonly __brand: 'Amount' }

/**
 * Creates an Amount from a BigInt
 * @param value - The BigInt value
 * @returns A branded Amount
 */
export const mkAmount = (value: bigint): Amount => value as Amount

/**
 * Collateralization ratio as a percentage (basis points)
 * 10000 = 100%, 15000 = 150%
 */
export type CollateralizationRatio = number & { readonly __brand: 'CollateralizationRatio' }

/**
 * Creates a CollateralizationRatio from a number
 * @param ratio - The ratio in basis points
 * @returns A branded CollateralizationRatio
 */
export const mkCollateralizationRatio = (ratio: number): CollateralizationRatio => 
  ratio as CollateralizationRatio

/**
 * Timestamp in milliseconds since Unix epoch
 */
export type Timestamp = number & { readonly __brand: 'Timestamp' }

/**
 * Creates a Timestamp from a number
 * @param ms - Milliseconds since Unix epoch
 * @returns A branded Timestamp
 */
export const mkTimestamp = (ms: number): Timestamp => ms as Timestamp

/**
 * CDP state discriminated union
 * Each state represents a distinct phase in the CDP lifecycle
 */
export type CDPState = 
  | { readonly type: 'active'; readonly healthFactor: number }
  | { readonly type: 'liquidating'; readonly liquidationPrice: Amount }
  | { readonly type: 'liquidated'; readonly liquidatedAt: Timestamp }
  | { readonly type: 'closed'; readonly closedAt: Timestamp }

/**
 * Configuration parameters for CDP operations
 * All parameters are readonly to ensure immutability
 */
export interface CDPConfig {
  /** Minimum collateralization ratio required */
  readonly minCollateralizationRatio: CollateralizationRatio
  
  /** Liquidation threshold ratio */
  readonly liquidationRatio: CollateralizationRatio
  
  /** Stability fee rate (annual percentage) */
  readonly stabilityFeeRate: number
  
  /** Liquidation penalty percentage */
  readonly liquidationPenalty: number
  
  /** Debt ceiling for this CDP type */
  readonly debtCeiling: Amount
  
  /** Minimum debt amount */
  readonly minDebtAmount: Amount
}

/**
 * Core CDP data structure
 * Represents a Collateralized Debt Position with immutable properties
 */
export interface CDP {
  /** Unique identifier for this CDP */
  readonly id: CDPId
  
  /** Owner's address */
  readonly owner: string
  
  /** Type of collateral used */
  readonly collateralType: string
  
  /** Amount of collateral deposited */
  readonly collateralAmount: Amount
  
  /** Amount of NYXUSD debt */
  readonly debtAmount: Amount
  
  /** Current state of the CDP */
  readonly state: CDPState
  
  /** Configuration parameters */
  readonly config: CDPConfig
  
  /** Creation timestamp */
  readonly createdAt: Timestamp
  
  /** Last update timestamp */
  readonly updatedAt: Timestamp
  
  /** Accumulated stability fees */
  readonly accruedFees: Amount
}

/**
 * CDP creation parameters
 * Used when opening a new CDP
 */
export interface CDPCreationParams {
  readonly owner: string
  readonly collateralType: string
  readonly collateralAmount: Amount
  readonly debtAmount: Amount
  readonly config: CDPConfig
}

/**
 * CDP operation types for state transitions
 */
export type CDPOperation = 
  | { readonly type: 'deposit'; readonly amount: Amount }
  | { readonly type: 'withdraw'; readonly amount: Amount }
  | { readonly type: 'borrow'; readonly amount: Amount }
  | { readonly type: 'repay'; readonly amount: Amount }
  | { readonly type: 'liquidate'; readonly liquidationPrice: Amount }
  | { readonly type: 'close' }

/**
 * Result type for CDP operations
 * Uses Either for functional error handling
 */
export type CDPOperationResult = Either<CDPError, CDP>

/**
 * CDP-specific error types
 */
export type CDPError = 
  | { readonly type: 'insufficient_collateral'; readonly required: Amount; readonly provided: Amount }
  | { readonly type: 'below_min_collateral_ratio'; readonly current: CollateralizationRatio; readonly minimum: CollateralizationRatio }
  | { readonly type: 'debt_ceiling_exceeded'; readonly ceiling: Amount; readonly requested: Amount }
  | { readonly type: 'below_min_debt'; readonly minimum: Amount; readonly provided: Amount }
  | { readonly type: 'cdp_not_found'; readonly id: CDPId }
  | { readonly type: 'cdp_already_liquidated'; readonly id: CDPId }
  | { readonly type: 'cdp_already_closed'; readonly id: CDPId }
  | { readonly type: 'unauthorized'; readonly owner: string; readonly caller: string }
  | { readonly type: 'invalid_operation'; readonly operation: string; readonly state: CDPState['type'] | string }
  | { readonly type: 'invalid_amount'; readonly amount: Amount }
  | { readonly type: 'deposit_limit_exceeded'; readonly limit: Amount; readonly requested: Amount }
  | { readonly type: 'withdrawal_limit_exceeded'; readonly limit: Amount; readonly requested: Amount }
  | { readonly type: 'insufficient_available_collateral'; readonly available: Amount; readonly requested: Amount }
  | { readonly type: 'mint_limit_exceeded'; readonly limit: Amount; readonly requested: Amount }
  | { readonly type: 'burn_amount_exceeds_debt'; readonly debt: Amount; readonly requested: Amount }

/**
 * CDP query parameters for filtering and searching
 */
export interface CDPQueryParams {
  readonly owner?: Option<string>
  readonly collateralType?: Option<string>
  readonly state?: Option<CDPState['type']>
  readonly minCollateralizationRatio?: Option<CollateralizationRatio>
  readonly maxCollateralizationRatio?: Option<CollateralizationRatio>
  readonly limit?: Option<number>
  readonly offset?: Option<number>
}

/**
 * CDP statistics for system monitoring
 */
export interface CDPStats {
  readonly totalCDPs: number
  readonly activeCDPs: number
  readonly totalCollateral: Amount
  readonly totalDebt: Amount
  readonly averageCollateralizationRatio: CollateralizationRatio
  readonly totalAccruedFees: Amount
}