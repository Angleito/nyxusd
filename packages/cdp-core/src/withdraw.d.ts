/**
 * Collateral Withdrawal Functions
 *
 * This module implements pure functions for withdrawing collateral from
 * existing Collateralized Debt Positions (CDPs) in the NyxUSD system.
 * All functions follow functional programming principles with immutable data
 * structures and explicit error handling using Result types.
 *
 * Key Features:
 * - Pure functional approach with no side effects
 * - BigInt arithmetic for precise financial calculations
 * - Comprehensive validation and error handling
 * - Collateralization ratio maintenance
 * - Type-safe operations with branded types
 * - Immutable CDP state transitions
 * - Safety checks to prevent under-collateralization
 *
 * @packageDocumentation
 */
import { Result } from "@nyxusd/fp-utils";
import { CDP, CDPError, CDPState, Amount, Timestamp } from "./types";
/**
 * Parameters for withdrawing collateral from a CDP
 */
export interface WithdrawCollateralParams {
    /** The CDP to withdraw collateral from */
    readonly cdp: CDP;
    /** Amount of collateral to withdraw */
    readonly withdrawAmount: Amount;
    /** Address initiating the withdrawal */
    readonly withdrawer: string;
    /** Current timestamp */
    readonly timestamp: Timestamp;
}
/**
 * Context required for collateral withdrawal operations
 */
export interface WithdrawContext {
    /** Current collateral price in USD (scaled) */
    readonly collateralPrice: bigint;
    /** Maximum single withdrawal amount allowed */
    readonly maxWithdrawAmount: Amount;
    /** Safety buffer above minimum collateralization ratio */
    readonly safetyBuffer: number;
    /** Whether emergency shutdown is active */
    readonly emergencyShutdown: boolean;
    /** Current system timestamp */
    readonly currentTime: Timestamp;
}
/**
 * Result of a successful collateral withdrawal operation
 */
export interface WithdrawResult {
    /** Updated CDP after withdrawal */
    readonly updatedCDP: CDP;
    /** Amount actually withdrawn */
    readonly withdrawnAmount: Amount;
    /** New health factor after withdrawal */
    readonly newHealthFactor: number;
    /** Previous health factor before withdrawal */
    readonly previousHealthFactor: number;
    /** Remaining available collateral for withdrawal */
    readonly remainingAvailableCollateral: Amount;
}
/**
 * Validates collateral withdrawal parameters and system state
 *
 * Performs comprehensive validation of withdrawal request including
 * authorization, amounts, CDP state, collateralization requirements,
 * and system conditions.
 *
 * @param params - Withdrawal parameters to validate
 * @param context - Current system context
 * @returns Result indicating validation success or specific error
 *
 * @example
 * ```typescript
 * const params: WithdrawCollateralParams = {
 *   cdp: existingCDP,
 *   withdrawAmount: mkAmount(250000000000000000n), // 0.25 ETH
 *   withdrawer: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 *
 * const context: WithdrawContext = {
 *   collateralPrice: 2000000000000000000000n,
 *   maxWithdrawAmount: mkAmount(5000000000000000000n), // 5 ETH
 *   safetyBuffer: 500, // 5% buffer above minimum ratio
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 *
 * const validation = validateWithdrawCollateral(params, context)
 * if (validation.isOk()) {
 *   console.log("Withdrawal parameters are valid")
 * } else {
 *   console.error("Validation failed:", validation.value)
 * }
 * ```
 */
export declare const validateWithdrawCollateral: (params: WithdrawCollateralParams, context: WithdrawContext) => Result<void, CDPError>;
/**
 * Calculates the maximum amount of collateral that can be safely withdrawn
 *
 * Determines the maximum withdrawal amount while maintaining the required
 * collateralization ratio plus safety buffer.
 *
 * @param cdp - CDP to evaluate for maximum withdrawal
 * @param collateralPrice - Current price of collateral
 * @param safetyBuffer - Additional buffer above minimum ratio (basis points)
 * @returns Maximum amount that can be withdrawn safely
 *
 * @example
 * ```typescript
 * const maxWithdraw = calculateMaxWithdrawableAmount(
 *   myCDP,
 *   2000000000000000000000n, // $2000 per ETH
 *   500 // 5% safety buffer
 * )
 * console.log(`Can withdraw up to ${maxWithdraw} wei`)
 * ```
 */
export declare const calculateMaxWithdrawableAmount: (cdp: CDP, collateralPrice: bigint, safetyBuffer: number) => Amount;
/**
 * Calculates the health factor after withdrawing collateral
 *
 * Computes the new health factor that would result from removing
 * the specified amount of collateral from the CDP.
 *
 * @param currentCollateral - Current collateral amount in CDP
 * @param withdrawAmount - Amount of collateral being withdrawn
 * @param debtAmount - Current debt amount in CDP
 * @param collateralPrice - Current price of collateral
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns New health factor after withdrawal
 *
 * @example
 * ```typescript
 * const newHealthFactor = calculateHealthFactorAfterWithdraw(
 *   mkAmount(2000000000000000000n), // 2 ETH current
 *   mkAmount(500000000000000000n),  // 0.5 ETH withdrawal
 *   mkAmount(2000000000000000000000n), // 2000 NYXUSD debt
 *   2000000000000000000000n, // $2000 per ETH
 *   13000 // 130% liquidation ratio
 * )
 * console.log(`New health factor: ${newHealthFactor}`)
 * ```
 */
export declare const calculateHealthFactorAfterWithdraw: (currentCollateral: Amount, withdrawAmount: Amount, debtAmount: Amount, collateralPrice: bigint, liquidationRatio: number) => number;
/**
 * Calculates the current health factor from CDP state
 *
 * Determines the health factor before the withdrawal operation
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
 * Updates CDP state after collateral withdrawal
 *
 * Determines the new CDP state based on the updated health factor
 * and system conditions after the collateral withdrawal.
 *
 * @param currentState - Current CDP state
 * @param newHealthFactor - Health factor after withdrawal
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns Updated CDP state
 *
 * @example
 * ```typescript
 * const newState = updateCDPStateAfterWithdraw(
 *   { type: 'active', healthFactor: 2.5 },
 *   1.8, // Reduced health factor
 *   13000 // 130% liquidation ratio
 * )
 * console.log("New state:", newState) // Still active if above threshold
 * ```
 */
export declare const updateCDPStateAfterWithdraw: (_currentState: CDPState, newHealthFactor: number, _liquidationRatio: number) => CDPState;
/**
 * Creates an updated CDP with reduced collateral
 *
 * Produces a new CDP object with the withdrawn collateral amount
 * subtracted from the existing collateral, along with updated timestamps
 * and recalculated state.
 *
 * @param cdp - Original CDP to update
 * @param withdrawAmount - Amount of collateral being withdrawn
 * @param newState - Updated CDP state after withdrawal
 * @param timestamp - Timestamp of the withdrawal operation
 * @returns New CDP object with reduced collateral
 *
 * @example
 * ```typescript
 * const updatedCDP = createUpdatedCDP(
 *   originalCDP,
 *   mkAmount(500000000000000000n), // 0.5 ETH
 *   { type: 'active', healthFactor: 1.6 },
 *   mkTimestamp(Date.now())
 * )
 * console.log("Updated collateral:", updatedCDP.collateralAmount)
 * ```
 */
export declare const createUpdatedCDP: (cdp: CDP, withdrawAmount: Amount, newState: CDPState, timestamp: Timestamp) => CDP;
/**
 * Withdraws collateral from a CDP
 *
 * This is the main collateral withdrawal function that orchestrates validation,
 * calculation, and CDP state updates. It performs all necessary checks including
 * collateralization ratio maintenance and returns either a successful withdrawal
 * result or a detailed error.
 *
 * @param params - Collateral withdrawal parameters
 * @param context - Current system context
 * @returns Result containing withdrawal details or error
 *
 * @example
 * ```typescript
 * const params: WithdrawCollateralParams = {
 *   cdp: existingCDP,
 *   withdrawAmount: mkAmount(300000000000000000n), // 0.3 ETH
 *   withdrawer: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 *
 * const context: WithdrawContext = {
 *   collateralPrice: 2100000000000000000000n, // $2100 per ETH
 *   maxWithdrawAmount: mkAmount(10000000000000000000n), // 10 ETH max
 *   safetyBuffer: 300, // 3% safety buffer
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 *
 * const result = withdrawCollateral(params, context)
 * if (result.isOk()) {
 *   const withdrawResult = result.value
 *   console.log(`Withdrew ${withdrawResult.withdrawnAmount} collateral`)
 *   console.log(`Health factor changed from ${withdrawResult.previousHealthFactor} to ${withdrawResult.newHealthFactor}`)
 *   console.log(`Can still withdraw ${withdrawResult.remainingAvailableCollateral} more`)
 * } else {
 *   console.error("Withdrawal failed:", result.value)
 * }
 * ```
 */
export declare const withdrawCollateral: (params: WithdrawCollateralParams, context: WithdrawContext) => Result<WithdrawResult, CDPError>;
/**
 * Withdraws collateral from multiple CDPs in batch
 *
 * Processes an array of collateral withdrawal requests, validating each one
 * and returning results for all operations. This function maintains
 * transaction-like semantics - if any withdrawal fails, the entire batch fails.
 *
 * @param withdrawals - Array of withdrawal parameter sets
 * @param context - Shared system context for all operations
 * @returns Result containing array of withdrawal results or first error encountered
 *
 * @example
 * ```typescript
 * const withdrawals = [
 *   { cdp: cdp1, withdrawAmount: mkAmount(500000000000000000n), ... },
 *   { cdp: cdp2, withdrawAmount: mkAmount(250000000000000000n), ... }
 * ]
 *
 * const result = withdrawCollateralBatch(withdrawals, context)
 * if (result.isOk()) {
 *   console.log(`Processed ${result.value.length} withdrawals`)
 * } else {
 *   console.error("Batch withdrawal failed:", result.value)
 * }
 * ```
 */
export declare const withdrawCollateralBatch: (withdrawals: readonly WithdrawCollateralParams[], context: WithdrawContext) => Result<readonly WithdrawResult[], CDPError>;
/**
 * Calculates the health factor impact of a potential withdrawal
 *
 * Estimates how much the health factor would decrease if a specific
 * amount of collateral were withdrawn, without actually performing
 * the withdrawal operation.
 *
 * @param cdp - CDP to evaluate
 * @param withdrawAmount - Potential withdrawal amount
 * @param collateralPrice - Current collateral price
 * @returns Object with current and projected health factors
 *
 * @example
 * ```typescript
 * const impact = calculateHealthFactorImpact(
 *   myCDP,
 *   mkAmount(750000000000000000n), // 0.75 ETH
 *   2000000000000000000000n // $2000 per ETH
 * )
 *
 * console.log(`Current: ${impact.current}, After withdrawal: ${impact.afterWithdraw}`)
 * console.log(`Decrease: ${impact.decrease}%`)
 * ```
 */
export declare const calculateHealthFactorImpact: (cdp: CDP, withdrawAmount: Amount, collateralPrice: bigint) => {
    readonly current: number;
    readonly afterWithdraw: number;
    readonly decrease: number;
};
/**
 * Estimates collateral value that would be freed by a withdrawal
 *
 * Calculates the USD value of collateral that would be released
 * and available to the user after a withdrawal operation.
 *
 * @param withdrawAmount - Amount of collateral to withdraw
 * @param collateralPrice - Current price of collateral
 * @returns USD value of the withdrawn collateral
 *
 * @example
 * ```typescript
 * const freedValue = estimateFreedCollateralValue(
 *   mkAmount(1000000000000000000n), // 1 ETH
 *   2000000000000000000000n // $2000 per ETH
 * )
 * console.log(`Withdrawing would free $${freedValue} worth of collateral`)
 * ```
 */
export declare const estimateFreedCollateralValue: (withdrawAmount: Amount, collateralPrice: bigint) => bigint;
//# sourceMappingURL=withdraw.d.ts.map