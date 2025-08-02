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

import { Result, Ok, Err } from "@nyxusd/fp-utils";
import {
  CDP,
  CDPError,
  CDPState,
  Amount,
  Timestamp,
  mkAmount,
  mkCollateralizationRatio,
} from "./types";

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
  readonly safetyBuffer: number; // In basis points
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
export const validateWithdrawCollateral = (
  params: WithdrawCollateralParams,
  context: WithdrawContext,
): Result<void, CDPError> => {
  // Check if system is in emergency shutdown
  if (context.emergencyShutdown) {
    return Result.err({
      type: "invalid_operation",
      operation: "withdraw",
      state: "emergency_shutdown",
    });
  }

  // Validate withdrawer authorization
  if (params.withdrawer !== params.cdp.owner) {
    return Result.err({
      type: "unauthorized",
      owner: params.cdp.owner,
      caller: params.withdrawer,
    });
  }

  // Validate withdrawal amount
  if (params.withdrawAmount <= 0n) {
    return Result.err({
      type: "invalid_amount",
      amount: params.withdrawAmount,
    });
  }

  // Check if CDP has sufficient collateral
  if (params.withdrawAmount > params.cdp.collateralAmount) {
    return Result.err({
      type: "insufficient_available_collateral",
      available: params.cdp.collateralAmount,
      requested: params.withdrawAmount,
    });
  }

  // Check maximum withdrawal limit
  if (params.withdrawAmount > context.maxWithdrawAmount) {
    return Result.err({
      type: "withdrawal_limit_exceeded",
      limit: context.maxWithdrawAmount,
      requested: params.withdrawAmount,
    });
  }

  // Validate CDP state - can only withdraw from active CDPs
  if (params.cdp.state.type !== "active") {
    return Result.err({
      type: "invalid_operation",
      operation: "withdraw",
      state: params.cdp.state.type,
    });
  }

  // Calculate collateralization ratio after withdrawal
  const remainingCollateral =
    params.cdp.collateralAmount - params.withdrawAmount;
  const collateralValue =
    (remainingCollateral * context.collateralPrice) / BigInt(10 ** 18);
  const newCollateralizationRatio =
    params.cdp.debtAmount > 0n
      ? Number((collateralValue * BigInt(10000)) / params.cdp.debtAmount)
      : Number.MAX_SAFE_INTEGER;

  // Include safety buffer in minimum requirement
  const requiredRatio =
    params.cdp.config.minCollateralizationRatio + context.safetyBuffer;

  // Check if withdrawal would violate minimum collateralization ratio
  if (newCollateralizationRatio < requiredRatio) {
    return Result.err({
      type: "below_min_collateral_ratio",
      current: mkCollateralizationRatio(newCollateralizationRatio),
      minimum: mkCollateralizationRatio(requiredRatio),
    });
  }

  return Result.ok(undefined);
};

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
export const calculateMaxWithdrawableAmount = (
  cdp: CDP,
  collateralPrice: bigint,
  safetyBuffer: number,
): Amount => {
  // If no debt, can withdraw all collateral
  if (cdp.debtAmount === 0n) {
    return cdp.collateralAmount;
  }

  const requiredRatio = cdp.config.minCollateralizationRatio + safetyBuffer;
  const requiredCollateralValue =
    (cdp.debtAmount * BigInt(requiredRatio)) / BigInt(10000);
  const requiredCollateralAmount =
    (requiredCollateralValue * BigInt(10 ** 18)) / collateralPrice;

  if (requiredCollateralAmount >= cdp.collateralAmount) {
    return mkAmount(0n); // Cannot withdraw anything
  }

  const maxWithdrawable = cdp.collateralAmount - requiredCollateralAmount;
  return mkAmount(maxWithdrawable);
};

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
export const calculateHealthFactorAfterWithdraw = (
  currentCollateral: Amount,
  withdrawAmount: Amount,
  debtAmount: Amount,
  collateralPrice: bigint,
  liquidationRatio: number,
): number => {
  if (debtAmount === 0n) {
    return Number.MAX_SAFE_INTEGER;
  }

  const remainingCollateral = currentCollateral - withdrawAmount;
  const collateralValue =
    (remainingCollateral * collateralPrice) / BigInt(10 ** 18);
  const liquidationThreshold =
    (collateralValue * BigInt(10000)) / BigInt(liquidationRatio);

  return Number(liquidationThreshold) / Number(debtAmount);
};

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
export const calculateCurrentHealthFactor = (
  cdp: CDP,
  collateralPrice: bigint,
): number => {
  if (cdp.debtAmount === 0n) {
    return Number.MAX_SAFE_INTEGER;
  }

  const collateralValue =
    (cdp.collateralAmount * collateralPrice) / BigInt(10 ** 18);
  const liquidationThreshold =
    (collateralValue * BigInt(10000)) / BigInt(cdp.config.liquidationRatio);

  return Number(liquidationThreshold) / Number(cdp.debtAmount);
};

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
export const updateCDPStateAfterWithdraw = (
  _currentState: CDPState,
  newHealthFactor: number,
  _liquidationRatio: number,
): CDPState => {
  // If health factor drops to critical levels, flag for liquidation
  if (newHealthFactor <= 1.0) {
    return {
      type: "liquidating",
      liquidationPrice: mkAmount(0n), // Will be calculated by liquidation system
    };
  }

  // If health factor is still reasonable, keep active
  if (newHealthFactor > 1.1) {
    // 10% buffer above liquidation threshold
    return {
      type: "active",
      healthFactor: newHealthFactor,
    };
  }

  // For borderline cases, maintain active state but with updated health factor
  return {
    type: "active",
    healthFactor: newHealthFactor,
  };
};

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
export const createUpdatedCDP = (
  cdp: CDP,
  withdrawAmount: Amount,
  newState: CDPState,
  timestamp: Timestamp,
): CDP => {
  return {
    ...cdp,
    collateralAmount: mkAmount(cdp.collateralAmount - withdrawAmount),
    state: newState,
    updatedAt: timestamp,
  };
};

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
export const withdrawCollateral = (
  params: WithdrawCollateralParams,
  context: WithdrawContext,
): Result<WithdrawResult, CDPError> => {
  // Validate withdrawal parameters and system state
  const validationResult = validateWithdrawCollateral(params, context);
  if (validationResult.isErr()) {
    return Result.err(validationResult.value);
  }

  // Calculate current health factor
  const previousHealthFactor = calculateCurrentHealthFactor(
    params.cdp,
    context.collateralPrice,
  );

  // Calculate new health factor after withdrawal
  const newHealthFactor = calculateHealthFactorAfterWithdraw(
    params.cdp.collateralAmount,
    params.withdrawAmount,
    params.cdp.debtAmount,
    context.collateralPrice,
    params.cdp.config.liquidationRatio,
  );

  // Update CDP state based on new health factor
  const newState = updateCDPStateAfterWithdraw(
    params.cdp.state,
    newHealthFactor,
    params.cdp.config.liquidationRatio,
  );

  // Create updated CDP with reduced collateral
  const updatedCDP = createUpdatedCDP(
    params.cdp,
    params.withdrawAmount,
    newState,
    params.timestamp,
  );

  // Calculate remaining available collateral for future withdrawals
  const remainingAvailableCollateral = calculateMaxWithdrawableAmount(
    updatedCDP,
    context.collateralPrice,
    context.safetyBuffer,
  );

  // Return successful withdrawal result
  const withdrawResult: WithdrawResult = {
    updatedCDP,
    withdrawnAmount: params.withdrawAmount,
    newHealthFactor,
    previousHealthFactor,
    remainingAvailableCollateral,
  };

  return Result.ok(withdrawResult);
};

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
export const withdrawCollateralBatch = (
  withdrawals: readonly WithdrawCollateralParams[],
  context: WithdrawContext,
): Result<readonly WithdrawResult[], CDPError> => {
  const results: WithdrawResult[] = [];

  for (const params of withdrawals) {
    const result = withdrawCollateral(params, context);
    if (result.isErr()) {
      return Result.err((result as Err<WithdrawResult, CDPError>).value);
    }
    results.push((result as Ok<WithdrawResult, CDPError>).value);
  }

  return Result.ok(results);
};

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
export const calculateHealthFactorImpact = (
  cdp: CDP,
  withdrawAmount: Amount,
  collateralPrice: bigint,
): {
  readonly current: number;
  readonly afterWithdraw: number;
  readonly decrease: number;
} => {
  const current = calculateCurrentHealthFactor(cdp, collateralPrice);
  const afterWithdraw = calculateHealthFactorAfterWithdraw(
    cdp.collateralAmount,
    withdrawAmount,
    cdp.debtAmount,
    collateralPrice,
    cdp.config.liquidationRatio,
  );

  const decrease =
    current > 0 ? ((current - afterWithdraw) / current) * 100 : 0;

  return {
    current,
    afterWithdraw,
    decrease,
  };
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
export const estimateFreedCollateralValue = (
  withdrawAmount: Amount,
  collateralPrice: bigint,
): bigint => {
  return (withdrawAmount * collateralPrice) / BigInt(10 ** 18);
};
