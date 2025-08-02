/**
 * CDP Creation Functions
 *
 * This module implements pure functions for creating new Collateralized Debt Positions (CDPs)
 * in the NyxUSD system. All functions follow functional programming principles with
 * immutable data structures and explicit error handling using Result types.
 *
 * Key Features:
 * - Pure functional approach with no side effects
 * - BigInt arithmetic for precise financial calculations
 * - Comprehensive validation and error handling
 * - Type-safe operations with branded types
 * - Composable functions for complex workflows
 *
 * @packageDocumentation
 */
import { Result } from "@nyxusd/fp-utils";
import { CDP, CDPId, CDPCreationParams, CDPError, CDPState, Amount, Timestamp } from "./types";
/**
 * Configuration for CDP creation validation
 */
export interface CDPCreationConfig {
    /** Minimum collateralization ratio required for new CDPs */
    readonly minCollateralizationRatio: number;
    /** Maximum debt-to-collateral ratio allowed */
    readonly maxDebtRatio: number;
    /** Minimum debt amount for new CDPs */
    readonly minDebtAmount: Amount;
    /** Maximum debt amount for new CDPs */
    readonly maxDebtAmount: Amount;
    /** Minimum collateral amount required */
    readonly minCollateralAmount: Amount;
}
/**
 * Context required for CDP creation operations
 */
export interface CDPCreationContext {
    /** Current collateral price in USD (scaled) */
    readonly collateralPrice: bigint;
    /** Current timestamp */
    readonly currentTime: Timestamp;
    /** System configuration */
    readonly config: CDPCreationConfig;
    /** Whether emergency shutdown is active */
    readonly emergencyShutdown: boolean;
}
/**
 * Validates CDP creation parameters against system requirements
 *
 * This function performs comprehensive validation of all parameters required
 * to create a new CDP, including collateralization ratios, debt limits,
 * and collateral requirements.
 *
 * @param params - The CDP creation parameters to validate
 * @param context - Current system context and configuration
 * @returns Result containing validation success or specific error
 *
 * @example
 * ```typescript
 * const params: CDPCreationParams = {
 *   owner: "0x123...",
 *   collateralType: "WETH",
 *   collateralAmount: mkAmount(1000000000000000000n), // 1 ETH
 *   debtAmount: mkAmount(1000000000000000000000n), // 1000 NYXUSD
 *   config: defaultConfig
 * }
 *
 * const context: CDPCreationContext = {
 *   collateralPrice: 2000000000000000000000n, // $2000
 *   currentTime: mkTimestamp(Date.now()),
 *   config: creationConfig,
 *   emergencyShutdown: false
 * }
 *
 * const validation = validateCDPCreation(params, context)
 * if (validation.isOk()) {
 *   console.log("Parameters are valid")
 * } else {
 *   console.error("Validation failed:", validation.value)
 * }
 * ```
 */
export declare const validateCDPCreation: (params: CDPCreationParams, context: CDPCreationContext) => Result<void, CDPError>;
/**
 * Calculates the health factor for a CDP based on collateral and debt
 *
 * The health factor is a measure of how close a CDP is to liquidation.
 * A health factor of 1.0 means the CDP is at the liquidation threshold.
 * Higher values indicate safer positions.
 *
 * @param collateralAmount - Amount of collateral in the CDP
 * @param debtAmount - Amount of debt in the CDP
 * @param collateralPrice - Current price of collateral
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns Health factor as a number
 *
 * @example
 * ```typescript
 * const healthFactor = calculateHealthFactor(
 *   mkAmount(1000000000000000000n), // 1 ETH
 *   mkAmount(1000000000000000000000n), // 1000 NYXUSD
 *   2000000000000000000000n, // $2000 per ETH
 *   15000 // 150% liquidation ratio
 * )
 * console.log(`Health factor: ${healthFactor}`) // Should be > 1.0 for safe CDP
 * ```
 */
export declare const calculateHealthFactor: (collateralAmount: Amount, debtAmount: Amount, collateralPrice: bigint, liquidationRatio: number) => number;
/**
 * Generates a unique CDP identifier
 *
 * Creates a deterministic but unique identifier for a new CDP based on
 * the owner address, collateral type, and current timestamp.
 *
 * @param owner - Owner's wallet address
 * @param collateralType - Type of collateral
 * @param timestamp - Creation timestamp
 * @returns Unique CDP identifier
 *
 * @example
 * ```typescript
 * const cdpId = generateCDPId(
 *   "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   "WETH",
 *   mkTimestamp(Date.now())
 * )
 * console.log("New CDP ID:", cdpId)
 * ```
 */
export declare const generateCDPId: (owner: string, collateralType: string, timestamp: Timestamp) => CDPId;
/**
 * Creates the initial CDP state for a new position
 *
 * Determines the appropriate initial state based on the CDP's health
 * and system conditions.
 *
 * @param healthFactor - Calculated health factor
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns Initial CDP state
 *
 * @example
 * ```typescript
 * const healthFactor = 1.8
 * const state = createInitialCDPState(healthFactor, 15000)
 * console.log("Initial state:", state) // { type: 'active', healthFactor: 1.8 }
 * ```
 */
export declare const createInitialCDPState: (healthFactor: number, _liquidationRatio: number) => CDPState;
/**
 * Creates a new CDP with the given parameters
 *
 * This is the main CDP creation function that orchestrates validation,
 * calculation, and CDP object creation. It performs all necessary checks
 * and returns either a successfully created CDP or a detailed error.
 *
 * @param params - CDP creation parameters
 * @param context - Current system context
 * @returns Result containing the new CDP or creation error
 *
 * @example
 * ```typescript
 * const params: CDPCreationParams = {
 *   owner: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   collateralType: "WETH",
 *   collateralAmount: mkAmount(1500000000000000000n), // 1.5 ETH
 *   debtAmount: mkAmount(2000000000000000000000n), // 2000 NYXUSD
 *   config: {
 *     minCollateralizationRatio: 15000, // 150%
 *     liquidationRatio: 13000, // 130%
 *     stabilityFeeRate: 0.05, // 5% annual
 *     liquidationPenalty: 0.1, // 10%
 *     debtCeiling: mkAmount(1000000000000000000000000n), // 1M NYXUSD
 *     minDebtAmount: mkAmount(100000000000000000000n) // 100 NYXUSD
 *   }
 * }
 *
 * const context: CDPCreationContext = {
 *   collateralPrice: 2000000000000000000000n, // $2000 per ETH
 *   currentTime: mkTimestamp(Date.now()),
 *   config: {
 *     minCollateralizationRatio: 15000,
 *     maxDebtRatio: 8000, // 80%
 *     minDebtAmount: mkAmount(100000000000000000000n),
 *     maxDebtAmount: mkAmount(10000000000000000000000000n),
 *     minCollateralAmount: mkAmount(100000000000000000n) // 0.1 ETH
 *   },
 *   emergencyShutdown: false
 * }
 *
 * const result = createCDP(params, context)
 * if (result.isOk()) {
 *   const cdp = result.value
 *   console.log(`Created CDP ${cdp.id} for ${cdp.owner}`)
 * } else {
 *   console.error("CDP creation failed:", result.value)
 * }
 * ```
 */
export declare const createCDP: (params: CDPCreationParams, context: CDPCreationContext) => Result<CDP, CDPError>;
/**
 * Creates multiple CDPs in batch with validation
 *
 * Processes an array of CDP creation requests, validating each one
 * and returning results for all operations. This function is useful
 * for bulk CDP creation scenarios.
 *
 * @param requests - Array of CDP creation parameter sets
 * @param context - Shared system context for all operations
 * @returns Result containing array of created CDPs or first error encountered
 *
 * @example
 * ```typescript
 * const requests = [
 *   { owner: "0x123...", collateralType: "WETH", ... },
 *   { owner: "0x456...", collateralType: "WBTC", ... }
 * ]
 *
 * const result = createCDPBatch(requests, context)
 * if (result.isOk()) {
 *   console.log(`Created ${result.value.length} CDPs`)
 * } else {
 *   console.error("Batch creation failed:", result.value)
 * }
 * ```
 */
export declare const createCDPBatch: (requests: readonly CDPCreationParams[], context: CDPCreationContext) => Result<readonly CDP[], CDPError>;
/**
 * Estimates the maximum debt that can be borrowed against given collateral
 *
 * Calculates the maximum amount of NYXUSD that can be minted against
 * a specific amount of collateral while maintaining the minimum
 * collateralization ratio.
 *
 * @param collateralAmount - Amount of collateral to evaluate
 * @param collateralPrice - Current price of collateral
 * @param minCollateralizationRatio - Minimum required ratio (basis points)
 * @returns Maximum debt amount that can be borrowed
 *
 * @example
 * ```typescript
 * const maxDebt = estimateMaxDebt(
 *   mkAmount(2000000000000000000n), // 2 ETH
 *   2000000000000000000000n, // $2000 per ETH
 *   15000 // 150% minimum ratio
 * )
 * console.log(`Max debt: ${maxDebt} NYXUSD`)
 * ```
 */
export declare const estimateMaxDebt: (collateralAmount: Amount, collateralPrice: bigint, minCollateralizationRatio: number) => Amount;
/**
 * Estimates the minimum collateral needed for a given debt amount
 *
 * Calculates the minimum amount of collateral required to maintain
 * a specified debt amount while meeting collateralization requirements.
 *
 * @param debtAmount - Desired debt amount
 * @param collateralPrice - Current price of collateral
 * @param minCollateralizationRatio - Minimum required ratio (basis points)
 * @returns Minimum collateral amount needed
 *
 * @example
 * ```typescript
 * const minCollateral = estimateMinCollateral(
 *   mkAmount(3000000000000000000000n), // 3000 NYXUSD
 *   2000000000000000000000n, // $2000 per ETH
 *   15000 // 150% minimum ratio
 * )
 * console.log(`Min collateral: ${minCollateral} ETH`)
 * ```
 */
export declare const estimateMinCollateral: (debtAmount: Amount, collateralPrice: bigint, minCollateralizationRatio: number) => Amount;
//# sourceMappingURL=create.d.ts.map