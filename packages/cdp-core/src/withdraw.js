"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateFreedCollateralValue = exports.calculateHealthFactorImpact = exports.withdrawCollateralBatch = exports.withdrawCollateral = exports.createUpdatedCDP = exports.updateCDPStateAfterWithdraw = exports.calculateCurrentHealthFactor = exports.calculateHealthFactorAfterWithdraw = exports.calculateMaxWithdrawableAmount = exports.validateWithdrawCollateral = void 0;
const fp_utils_1 = require("@nyxusd/fp-utils");
const cdp_1 = require("../types/cdp");
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
const validateWithdrawCollateral = (params, context) => {
    // Check if system is in emergency shutdown
    if (context.emergencyShutdown) {
        return fp_utils_1.Result.err({
            type: "invalid_operation",
            operation: "withdraw",
            state: "emergency_shutdown",
        });
    }
    // Validate withdrawer authorization
    if (params.withdrawer !== params.cdp.owner) {
        return fp_utils_1.Result.err({
            type: "unauthorized",
            owner: params.cdp.owner,
            caller: params.withdrawer,
        });
    }
    // Validate withdrawal amount
    if (params.withdrawAmount <= 0n) {
        return fp_utils_1.Result.err({
            type: "invalid_amount",
            amount: params.withdrawAmount,
        });
    }
    // Check if CDP has sufficient collateral
    if (params.withdrawAmount > params.cdp.collateralAmount) {
        return fp_utils_1.Result.err({
            type: "insufficient_available_collateral",
            available: params.cdp.collateralAmount,
            requested: params.withdrawAmount,
        });
    }
    // Check maximum withdrawal limit
    if (params.withdrawAmount > context.maxWithdrawAmount) {
        return fp_utils_1.Result.err({
            type: "withdrawal_limit_exceeded",
            limit: context.maxWithdrawAmount,
            requested: params.withdrawAmount,
        });
    }
    // Validate CDP state - can only withdraw from active CDPs
    if (params.cdp.state.type !== "active") {
        return fp_utils_1.Result.err({
            type: "invalid_operation",
            operation: "withdraw",
            state: params.cdp.state.type,
        });
    }
    // Calculate collateralization ratio after withdrawal
    const remainingCollateral = params.cdp.collateralAmount - params.withdrawAmount;
    const collateralValue = (remainingCollateral * context.collateralPrice) / BigInt(10 ** 18);
    const newCollateralizationRatio = params.cdp.debtAmount > 0n
        ? Number((collateralValue * BigInt(10000)) / params.cdp.debtAmount)
        : Number.MAX_SAFE_INTEGER;
    // Include safety buffer in minimum requirement
    const requiredRatio = params.cdp.config.minCollateralizationRatio + context.safetyBuffer;
    // Check if withdrawal would violate minimum collateralization ratio
    if (newCollateralizationRatio < requiredRatio) {
        return fp_utils_1.Result.err({
            type: "below_min_collateral_ratio",
            current: (0, cdp_1.mkCollateralizationRatio)(newCollateralizationRatio),
            minimum: (0, cdp_1.mkCollateralizationRatio)(requiredRatio),
        });
    }
    return fp_utils_1.Result.ok(undefined);
};
exports.validateWithdrawCollateral = validateWithdrawCollateral;
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
const calculateMaxWithdrawableAmount = (cdp, collateralPrice, safetyBuffer) => {
    // If no debt, can withdraw all collateral
    if (cdp.debtAmount === 0n) {
        return cdp.collateralAmount;
    }
    const requiredRatio = cdp.config.minCollateralizationRatio + safetyBuffer;
    const requiredCollateralValue = (cdp.debtAmount * BigInt(requiredRatio)) / BigInt(10000);
    const requiredCollateralAmount = (requiredCollateralValue * BigInt(10 ** 18)) / collateralPrice;
    if (requiredCollateralAmount >= cdp.collateralAmount) {
        return (0, cdp_1.mkAmount)(0n); // Cannot withdraw anything
    }
    const maxWithdrawable = cdp.collateralAmount - requiredCollateralAmount;
    return (0, cdp_1.mkAmount)(maxWithdrawable);
};
exports.calculateMaxWithdrawableAmount = calculateMaxWithdrawableAmount;
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
const calculateHealthFactorAfterWithdraw = (currentCollateral, withdrawAmount, debtAmount, collateralPrice, liquidationRatio) => {
    if (debtAmount === 0n) {
        return Number.MAX_SAFE_INTEGER;
    }
    const remainingCollateral = currentCollateral - withdrawAmount;
    const collateralValue = (remainingCollateral * collateralPrice) / BigInt(10 ** 18);
    const liquidationThreshold = (collateralValue * BigInt(10000)) / BigInt(liquidationRatio);
    return Number(liquidationThreshold) / Number(debtAmount);
};
exports.calculateHealthFactorAfterWithdraw = calculateHealthFactorAfterWithdraw;
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
const calculateCurrentHealthFactor = (cdp, collateralPrice) => {
    if (cdp.debtAmount === 0n) {
        return Number.MAX_SAFE_INTEGER;
    }
    const collateralValue = (cdp.collateralAmount * collateralPrice) / BigInt(10 ** 18);
    const liquidationThreshold = (collateralValue * BigInt(10000)) / BigInt(cdp.config.liquidationRatio);
    return Number(liquidationThreshold) / Number(cdp.debtAmount);
};
exports.calculateCurrentHealthFactor = calculateCurrentHealthFactor;
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
const updateCDPStateAfterWithdraw = (_currentState, newHealthFactor, _liquidationRatio) => {
    // If health factor drops to critical levels, flag for liquidation
    if (newHealthFactor <= 1.0) {
        return {
            type: "liquidating",
            liquidationPrice: (0, cdp_1.mkAmount)(0n), // Will be calculated by liquidation system
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
exports.updateCDPStateAfterWithdraw = updateCDPStateAfterWithdraw;
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
const createUpdatedCDP = (cdp, withdrawAmount, newState, timestamp) => {
    return {
        ...cdp,
        collateralAmount: (0, cdp_1.mkAmount)(cdp.collateralAmount - withdrawAmount),
        state: newState,
        updatedAt: timestamp,
    };
};
exports.createUpdatedCDP = createUpdatedCDP;
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
const withdrawCollateral = (params, context) => {
    // Validate withdrawal parameters and system state
    const validationResult = (0, exports.validateWithdrawCollateral)(params, context);
    if (validationResult.isErr()) {
        return fp_utils_1.Result.err(validationResult.value);
    }
    // Calculate current health factor
    const previousHealthFactor = (0, exports.calculateCurrentHealthFactor)(params.cdp, context.collateralPrice);
    // Calculate new health factor after withdrawal
    const newHealthFactor = (0, exports.calculateHealthFactorAfterWithdraw)(params.cdp.collateralAmount, params.withdrawAmount, params.cdp.debtAmount, context.collateralPrice, params.cdp.config.liquidationRatio);
    // Update CDP state based on new health factor
    const newState = (0, exports.updateCDPStateAfterWithdraw)(params.cdp.state, newHealthFactor, params.cdp.config.liquidationRatio);
    // Create updated CDP with reduced collateral
    const updatedCDP = (0, exports.createUpdatedCDP)(params.cdp, params.withdrawAmount, newState, params.timestamp);
    // Calculate remaining available collateral for future withdrawals
    const remainingAvailableCollateral = (0, exports.calculateMaxWithdrawableAmount)(updatedCDP, context.collateralPrice, context.safetyBuffer);
    // Return successful withdrawal result
    const withdrawResult = {
        updatedCDP,
        withdrawnAmount: params.withdrawAmount,
        newHealthFactor,
        previousHealthFactor,
        remainingAvailableCollateral,
    };
    return fp_utils_1.Result.ok(withdrawResult);
};
exports.withdrawCollateral = withdrawCollateral;
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
const withdrawCollateralBatch = (withdrawals, context) => {
    const results = [];
    for (const params of withdrawals) {
        const result = (0, exports.withdrawCollateral)(params, context);
        if (result.isErr()) {
            return fp_utils_1.Result.err(result.value);
        }
        results.push(result.value);
    }
    return fp_utils_1.Result.ok(results);
};
exports.withdrawCollateralBatch = withdrawCollateralBatch;
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
const calculateHealthFactorImpact = (cdp, withdrawAmount, collateralPrice) => {
    const current = (0, exports.calculateCurrentHealthFactor)(cdp, collateralPrice);
    const afterWithdraw = (0, exports.calculateHealthFactorAfterWithdraw)(cdp.collateralAmount, withdrawAmount, cdp.debtAmount, collateralPrice, cdp.config.liquidationRatio);
    const decrease = current > 0 ? ((current - afterWithdraw) / current) * 100 : 0;
    return {
        current,
        afterWithdraw,
        decrease,
    };
};
exports.calculateHealthFactorImpact = calculateHealthFactorImpact;
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
const estimateFreedCollateralValue = (withdrawAmount, collateralPrice) => {
    return (withdrawAmount * collateralPrice) / BigInt(10 ** 18);
};
exports.estimateFreedCollateralValue = estimateFreedCollateralValue;
//# sourceMappingURL=withdraw.js.map