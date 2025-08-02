/**
 * Collateral Deposit Functions
 *
 * This module implements pure functions for depositing additional collateral
 * into existing Collateralized Debt Positions (CDPs) in the NyxUSD system.
 * All functions follow functional programming principles with immutable data
 * structures and explicit error handling using Result types.
 *
 * Key Features:
 * - Pure functional approach with no side effects
 * - BigInt arithmetic for precise financial calculations
 * - Comprehensive validation and error handling
 * - Type-safe operations with branded types
 * - Immutable CDP state transitions
 * - Health factor recalculation after deposits
 *
 * @packageDocumentation
 */
import { Result } from "@nyxusd/fp-utils";
import { CDP, CDPError, CDPState, Amount, Timestamp } from "./types";
/**
 * Parameters for depositing collateral into a CDP
 */
export interface DepositCollateralParams {
    /** The CDP to deposit collateral into */
    readonly cdp: CDP;
    /** Amount of collateral to deposit */
    readonly depositAmount: Amount;
    /** Address initiating the deposit */
    readonly depositor: string;
    /** Current timestamp */
    readonly timestamp: Timestamp;
}
/**
 * Context required for collateral deposit operations
 */
export interface DepositContext {
    /** Current collateral price in USD (scaled) */
    readonly collateralPrice: bigint;
    /** Maximum single deposit amount allowed */
    readonly maxDepositAmount: Amount;
    /** Whether emergency shutdown is active */
    readonly emergencyShutdown: boolean;
    /** Current system timestamp */
    readonly currentTime: Timestamp;
}
/**
 * Result of a successful collateral deposit operation
 */
export interface DepositResult {
    /** Updated CDP after deposit */
    readonly updatedCDP: CDP;
    /** Amount actually deposited */
    readonly depositedAmount: Amount;
    /** New health factor after deposit */
    readonly newHealthFactor: number;
    /** Previous health factor before deposit */
    readonly previousHealthFactor: number;
}
/**
 * Validates collateral deposit parameters and system state
 *
 * Performs comprehensive validation of deposit request including
 * authorization, amounts, CDP state, and system conditions.
 *
 * @param params - Deposit parameters to validate
 * @param context - Current system context
 * @returns Result indicating validation success or specific error
 *
 * @example
 * ```typescript
 * const params: DepositCollateralParams = {
 *   cdp: existingCDP,
 *   depositAmount: mkAmount(500000000000000000n), // 0.5 ETH
 *   depositor: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 *
 * const context: DepositContext = {
 *   collateralPrice: 2000000000000000000000n,
 *   maxDepositAmount: mkAmount(10000000000000000000n), // 10 ETH
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 *
 * const validation = validateDepositCollateral(params, context)
 * if (validation.isOk()) {
 *   console.log("Deposit parameters are valid")
 * } else {
 *   console.error("Validation failed:", validation.value)
 * }
 * ```
 */
export declare const validateDepositCollateral: (params: DepositCollateralParams, context: DepositContext) => Result<void, CDPError>;
/**
 * Calculates the health factor after depositing additional collateral
 *
 * Computes the new health factor that would result from adding
 * the specified amount of collateral to the CDP.
 *
 * @param currentCollateral - Current collateral amount in CDP
 * @param depositAmount - Amount of collateral being deposited
 * @param debtAmount - Current debt amount in CDP
 * @param collateralPrice - Current price of collateral
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns New health factor after deposit
 *
 * @example
 * ```typescript
 * const newHealthFactor = calculateHealthFactorAfterDeposit(
 *   mkAmount(1000000000000000000n), // 1 ETH current
 *   mkAmount(500000000000000000n),  // 0.5 ETH deposit
 *   mkAmount(2000000000000000000000n), // 2000 NYXUSD debt
 *   2000000000000000000000n, // $2000 per ETH
 *   13000 // 130% liquidation ratio
 * )
 * console.log(`New health factor: ${newHealthFactor}`)
 * ```
 */
export declare const calculateHealthFactorAfterDeposit: (currentCollateral: Amount, depositAmount: Amount, debtAmount: Amount, collateralPrice: bigint, liquidationRatio: number) => number;
/**
 * Calculates the previous health factor from current CDP state
 *
 * Determines the health factor before the deposit operation
 * based on current collateral and debt amounts.
 *
 * @param cdp - The CDP to calculate health factor for
 * @param collateralPrice - Current price of collateral
 * @returns Current health factor
 *
 * @example
 * ```typescript
 * const currentHealth = calculateCurrentHealthFactor(
 *   existingCDP,
 *   2000000000000000000000n // $2000 per ETH
 * )
 * console.log(`Current health factor: ${currentHealth}`)
 * ```
 */
export declare const calculateCurrentHealthFactor: (cdp: CDP, collateralPrice: bigint) => number;
/**
 * Updates CDP state after collateral deposit
 *
 * Determines the new CDP state based on the updated health factor
 * and system conditions after the collateral deposit.
 *
 * @param currentState - Current CDP state
 * @param newHealthFactor - Health factor after deposit
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns Updated CDP state
 *
 * @example
 * ```typescript
 * const newState = updateCDPStateAfterDeposit(
 *   { type: 'liquidating', liquidationPrice: mkAmount(1900n) },
 *   1.8, // Improved health factor
 *   13000 // 130% liquidation ratio
 * )
 * console.log("New state:", newState) // Should be 'active' if health improved
 * ```
 */
export declare const updateCDPStateAfterDeposit: (currentState: CDPState, newHealthFactor: number, _liquidationRatio: number) => CDPState;
/**
 * Creates an updated CDP with additional collateral
 *
 * Produces a new CDP object with the deposited collateral amount
 * added to the existing collateral, along with updated timestamps
 * and recalculated state.
 *
 * @param cdp - Original CDP to update
 * @param depositAmount - Amount of collateral being deposited
 * @param newState - Updated CDP state after deposit
 * @param timestamp - Timestamp of the deposit operation
 * @returns New CDP object with deposited collateral
 *
 * @example
 * ```typescript
 * const updatedCDP = createUpdatedCDP(
 *   originalCDP,
 *   mkAmount(500000000000000000n), // 0.5 ETH
 *   { type: 'active', healthFactor: 1.8 },
 *   mkTimestamp(Date.now())
 * )
 * console.log("Updated collateral:", updatedCDP.collateralAmount)
 * ```
 */
export declare const createUpdatedCDP: (cdp: CDP, depositAmount: Amount, newState: CDPState, timestamp: Timestamp) => CDP;
/**
 * Deposits collateral into a CDP
 *
 * This is the main collateral deposit function that orchestrates validation,
 * calculation, and CDP state updates. It performs all necessary checks
 * and returns either a successful deposit result or a detailed error.
 *
 * @param params - Collateral deposit parameters
 * @param context - Current system context
 * @returns Result containing deposit details or error
 *
 * @example
 * ```typescript
 * const params: DepositCollateralParams = {
 *   cdp: existingCDP,
 *   depositAmount: mkAmount(750000000000000000n), // 0.75 ETH
 *   depositor: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 *
 * const context: DepositContext = {
 *   collateralPrice: 2100000000000000000000n, // $2100 per ETH
 *   maxDepositAmount: mkAmount(5000000000000000000n), // 5 ETH max
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 *
 * const result = depositCollateral(params, context)
 * if (result.isOk()) {
 *   const depositResult = result.value
 *   console.log(`Deposited ${depositResult.depositedAmount} collateral`)
 *   console.log(`Health factor improved from ${depositResult.previousHealthFactor} to ${depositResult.newHealthFactor}`)
 * } else {
 *   console.error("Deposit failed:", result.value)
 * }
 * ```
 */
export declare const depositCollateral: (params: DepositCollateralParams, context: DepositContext) => Result<DepositResult, CDPError>;
/**
 * Deposits collateral into multiple CDPs in batch
 *
 * Processes an array of collateral deposit requests, validating each one
 * and returning results for all operations. This function maintains
 * transaction-like semantics - if any deposit fails, the entire batch fails.
 *
 * @param deposits - Array of deposit parameter sets
 * @param context - Shared system context for all operations
 * @returns Result containing array of deposit results or first error encountered
 *
 * @example
 * ```typescript
 * const deposits = [
 *   { cdp: cdp1, depositAmount: mkAmount(1000000000000000000n), ... },
 *   { cdp: cdp2, depositAmount: mkAmount(500000000000000000n), ... }
 * ]
 *
 * const result = depositCollateralBatch(deposits, context)
 * if (result.isOk()) {
 *   console.log(`Processed ${result.value.length} deposits`)
 * } else {
 *   console.error("Batch deposit failed:", result.value)
 * }
 * ```
 */
export declare const depositCollateralBatch: (deposits: readonly DepositCollateralParams[], context: DepositContext) => Result<readonly DepositResult[], CDPError>;
/**
 * Calculates the health factor improvement from a potential deposit
 *
 * Estimates how much the health factor would improve if a specific
 * amount of collateral were deposited, without actually performing
 * the deposit operation.
 *
 * @param cdp - CDP to evaluate
 * @param depositAmount - Potential deposit amount
 * @param collateralPrice - Current collateral price
 * @returns Object with current and projected health factors
 *
 * @example
 * ```typescript
 * const improvement = calculateHealthFactorImprovement(
 *   myCDP,
 *   mkAmount(1000000000000000000n), // 1 ETH
 *   2000000000000000000000n // $2000 per ETH
 * )
 *
 * console.log(`Current: ${improvement.current}, After deposit: ${improvement.afterDeposit}`)
 * console.log(`Improvement: ${improvement.improvement}%`)
 * ```
 */
export declare const calculateHealthFactorImprovement: (cdp: CDP, depositAmount: Amount, collateralPrice: bigint) => {
    readonly current: number;
    readonly afterDeposit: number;
    readonly improvement: number;
};
/**
 * Estimates the minimum deposit needed to reach a target health factor
 *
 * Calculates the minimum amount of collateral that needs to be deposited
 * to achieve a specific health factor target for the CDP.
 *
 * @param cdp - CDP to evaluate
 * @param targetHealthFactor - Desired health factor
 * @param collateralPrice - Current collateral price
 * @returns Minimum deposit amount needed, or 0 if target is already met
 *
 * @example
 * ```typescript
 * const minDeposit = estimateMinDepositForHealthFactor(
 *   riskyCDP,
 *   2.0, // Target 200% health factor
 *   2000000000000000000000n // $2000 per ETH
 * )
 *
 * if (minDeposit > 0n) {
 *   console.log(`Need to deposit at least ${minDeposit} wei to reach target`)
 * } else {
 *   console.log("Target health factor already achieved")
 * }
 * ```
 */
export declare const estimateMinDepositForHealthFactor: (cdp: CDP, targetHealthFactor: number, collateralPrice: bigint) => Amount;
//# sourceMappingURL=deposit.d.ts.map