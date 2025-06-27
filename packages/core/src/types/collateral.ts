/**
 * Collateral type definitions for the NyxUSD CDP system
 *
 * This module defines types for collateral management, including different
 * collateral types, their properties, and operations. All types follow
 * functional programming principles with immutable data structures.
 *
 * @packageDocumentation
 */

// Temporary basic type definitions - will be replaced with fp-ts when dependencies are available
type Either<E, A> =
  | { readonly _tag: "Left"; readonly left: E }
  | { readonly _tag: "Right"; readonly right: A };
type Option<A> =
  | { readonly _tag: "None" }
  | { readonly _tag: "Some"; readonly value: A };
import { Amount, Timestamp } from "./cdp";

/**
 * Unique identifier for a collateral type
 */
export type CollateralTypeId = string & {
  readonly __brand: "CollateralTypeId";
};

/**
 * Creates a CollateralTypeId from a string
 * @param id - The string identifier
 * @returns A branded CollateralTypeId
 */
export const mkCollateralTypeId = (id: string): CollateralTypeId =>
  id as CollateralTypeId;

/**
 * Price of collateral in USD (scaled by decimals)
 */
export type Price = bigint & { readonly __brand: "Price" };

/**
 * Creates a Price from a BigInt
 * @param value - The price value
 * @returns A branded Price
 */
export const mkPrice = (value: bigint): Price => value as Price;

/**
 * Volatility score (0-100, higher means more volatile)
 */
export type VolatilityScore = number & { readonly __brand: "VolatilityScore" };

/**
 * Creates a VolatilityScore from a number
 * @param score - The volatility score (0-100)
 * @returns A branded VolatilityScore
 */
export const mkVolatilityScore = (score: number): VolatilityScore =>
  score as VolatilityScore;

/**
 * Collateral status discriminated union
 */
export type CollateralStatus =
  | { readonly type: "active" }
  | { readonly type: "deprecated"; readonly deprecatedAt: Timestamp }
  | { readonly type: "emergency_shutdown"; readonly shutdownAt: Timestamp };

/**
 * Risk parameters for a collateral type
 */
export interface CollateralRiskParams {
  /** Minimum collateralization ratio for this collateral */
  readonly minCollateralizationRatio: number;

  /** Liquidation ratio threshold */
  readonly liquidationRatio: number;

  /** Maximum liquidation penalty */
  readonly maxLiquidationPenalty: number;

  /** Debt ceiling for this collateral type */
  readonly debtCeiling: Amount;

  /** Stability fee rate (annual percentage) */
  readonly stabilityFeeRate: number;

  /** Volatility-based risk multiplier */
  readonly riskMultiplier: number;
}

/**
 * Oracle configuration for price feeds
 */
export interface OracleConfig {
  /** Primary oracle address/identifier */
  readonly primaryOracle: string;

  /** Backup oracle address/identifier */
  readonly backupOracle: Option<string>;

  /** Maximum price deviation allowed between oracles */
  readonly maxPriceDeviation: number;

  /** Price update frequency in seconds */
  readonly updateFrequency: number;

  /** Grace period for stale prices */
  readonly stalePriceGracePeriod: number;
}

/**
 * Core collateral type definition
 */
export interface CollateralType {
  /** Unique identifier */
  readonly id: CollateralTypeId;

  /** Human-readable name */
  readonly name: string;

  /** Symbol (e.g., "WETH", "WBTC") */
  readonly symbol: string;

  /** Number of decimal places for this token */
  readonly decimals: number;

  /** Contract address on Midnight network */
  readonly contractAddress: string;

  /** Current status */
  readonly status: CollateralStatus;

  /** Risk parameters */
  readonly riskParams: CollateralRiskParams;

  /** Oracle configuration */
  readonly oracleConfig: OracleConfig;

  /** Volatility score */
  readonly volatilityScore: VolatilityScore;

  /** Creation timestamp */
  readonly createdAt: Timestamp;

  /** Last update timestamp */
  readonly updatedAt: Timestamp;
}

/**
 * Current price information for a collateral type
 */
export interface CollateralPrice {
  /** Collateral type identifier */
  readonly collateralTypeId: CollateralTypeId;

  /** Current price in USD */
  readonly price: Price;

  /** Previous price for comparison */
  readonly previousPrice: Price;

  /** Price change percentage */
  readonly priceChange: number;

  /** Timestamp of price update */
  readonly updatedAt: Timestamp;

  /** Source oracle identifier */
  readonly oracleSource: string;

  /** Whether price is considered stale */
  readonly isStale: boolean;
}

/**
 * Individual collateral position
 */
export interface Collateral {
  /** Owner's address */
  readonly owner: string;

  /** Collateral type */
  readonly collateralType: CollateralTypeId;

  /** Amount of collateral */
  readonly amount: Amount;

  /** Locked amount (used as collateral in CDPs) */
  readonly lockedAmount: Amount;

  /** Available amount (not locked) */
  readonly availableAmount: Amount;

  /** Deposit timestamp */
  readonly depositedAt: Timestamp;

  /** Last update timestamp */
  readonly updatedAt: Timestamp;
}

/**
 * Collateral operation types
 */
export type CollateralOperation =
  | { readonly type: "deposit"; readonly amount: Amount }
  | { readonly type: "withdraw"; readonly amount: Amount }
  | { readonly type: "lock"; readonly amount: Amount; readonly cdpId: string }
  | { readonly type: "unlock"; readonly amount: Amount; readonly cdpId: string }
  | {
      readonly type: "liquidate";
      readonly amount: Amount;
      readonly liquidationPrice: Price;
    };

/**
 * Result type for collateral operations
 */
export type CollateralOperationResult = Either<CollateralError, Collateral>;

/**
 * Collateral-specific error types
 */
export type CollateralError =
  | {
      readonly type: "insufficient_balance";
      readonly available: Amount;
      readonly requested: Amount;
    }
  | {
      readonly type: "insufficient_available";
      readonly available: Amount;
      readonly requested: Amount;
    }
  | {
      readonly type: "collateral_type_not_found";
      readonly id: CollateralTypeId;
    }
  | {
      readonly type: "collateral_type_deprecated";
      readonly id: CollateralTypeId;
    }
  | {
      readonly type: "price_feed_stale";
      readonly collateralType: CollateralTypeId;
      readonly lastUpdate: Timestamp;
    }
  | {
      readonly type: "price_feed_unavailable";
      readonly collateralType: CollateralTypeId;
    }
  | {
      readonly type: "oracle_deviation_too_high";
      readonly deviation: number;
      readonly maxDeviation: number;
    }
  | {
      readonly type: "emergency_shutdown";
      readonly collateralType: CollateralTypeId;
    }
  | {
      readonly type: "unauthorized";
      readonly owner: string;
      readonly caller: string;
    }
  | { readonly type: "invalid_amount"; readonly amount: Amount };

/**
 * Collateral statistics for monitoring
 */
export interface CollateralStats {
  /** Total number of collateral types */
  readonly totalCollateralTypes: number;

  /** Active collateral types */
  readonly activeCollateralTypes: number;

  /** Total collateral value locked (USD) */
  readonly totalValueLocked: Amount;

  /** Total available collateral */
  readonly totalAvailableCollateral: Amount;

  /** Total locked collateral */
  readonly totalLockedCollateral: Amount;

  /** Average collateral utilization rate */
  readonly averageUtilizationRate: number;
}

/**
 * Collateral query parameters
 */
export interface CollateralQueryParams {
  readonly owner?: Option<string>;
  readonly collateralType?: Option<CollateralTypeId>;
  readonly minAmount?: Option<Amount>;
  readonly maxAmount?: Option<Amount>;
  readonly hasLockedAmount?: Option<boolean>;
  readonly limit?: Option<number>;
  readonly offset?: Option<number>;
}

/**
 * Parameters for adding a new collateral type
 */
export interface AddCollateralTypeParams {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly contractAddress: string;
  readonly riskParams: CollateralRiskParams;
  readonly oracleConfig: OracleConfig;
  readonly volatilityScore: VolatilityScore;
}

/**
 * Parameters for updating collateral type risk
 */
export interface UpdateRiskParamsRequest {
  readonly collateralTypeId: CollateralTypeId;
  readonly riskParams: Partial<CollateralRiskParams>;
  readonly effectiveAt?: Option<Timestamp>;
}

/**
 * Collateral liquidation information
 */
export interface CollateralLiquidation {
  readonly collateralType: CollateralTypeId;
  readonly amount: Amount;
  readonly liquidationPrice: Price;
  readonly penalty: Amount;
  readonly liquidatedAt: Timestamp;
  readonly liquidator: string;
  readonly cdpId: string;
}
