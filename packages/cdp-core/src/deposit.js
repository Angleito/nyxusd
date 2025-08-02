"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateMinDepositForHealthFactor = exports.calculateHealthFactorImprovement = exports.depositCollateralBatch = exports.depositCollateral = exports.createUpdatedCDP = exports.updateCDPStateAfterDeposit = exports.calculateCurrentHealthFactor = exports.calculateHealthFactorAfterDeposit = exports.validateDepositCollateral = void 0;
const fp_utils_1 = require("@nyxusd/fp-utils");
const types_1 = require("./types");
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
const validateDepositCollateral = (params, context) => {
    // Check if system is in emergency shutdown
    if (context.emergencyShutdown) {
        return fp_utils_1.Result.err({
            type: "invalid_operation",
            operation: "deposit",
            state: "emergency_shutdown",
        });
    }
    // Validate depositor authorization
    if (params.depositor !== params.cdp.owner) {
        return fp_utils_1.Result.err({
            type: "unauthorized",
            owner: params.cdp.owner,
            caller: params.depositor,
        });
    }
    // Validate deposit amount
    if (params.depositAmount <= 0n) {
        return fp_utils_1.Result.err({
            type: "invalid_amount",
            amount: params.depositAmount,
        });
    }
    // Check maximum deposit limit
    if (params.depositAmount > context.maxDepositAmount) {
        return fp_utils_1.Result.err({
            type: "deposit_limit_exceeded",
            limit: context.maxDepositAmount,
            requested: params.depositAmount,
        });
    }
    // Validate CDP state - can only deposit to active or liquidating CDPs
    if (params.cdp.state.type === "liquidated" ||
        params.cdp.state.type === "closed") {
        return fp_utils_1.Result.err({
            type: "invalid_operation",
            operation: "deposit",
            state: params.cdp.state.type,
        });
    }
    // Check if CDP is in emergency closure state
    // TypeScript ensures CDP state is active or liquidating
    // No need to check for liquidated or closed states
    return fp_utils_1.Result.ok(undefined);
};
exports.validateDepositCollateral = validateDepositCollateral;
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
const calculateHealthFactorAfterDeposit = (currentCollateral, depositAmount, debtAmount, collateralPrice, liquidationRatio) => {
    if (debtAmount === 0n) {
        return Number.MAX_SAFE_INTEGER;
    }
    const totalCollateral = currentCollateral + depositAmount;
    const collateralValue = (totalCollateral * collateralPrice) / BigInt(10 ** 18);
    const liquidationThreshold = (collateralValue * BigInt(10000)) / BigInt(liquidationRatio);
    return Number(liquidationThreshold) / Number(debtAmount);
};
exports.calculateHealthFactorAfterDeposit = calculateHealthFactorAfterDeposit;
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
const updateCDPStateAfterDeposit = (currentState, newHealthFactor, _liquidationRatio) => {
    // If health factor is still critical, keep in liquidating state
    if (newHealthFactor <= 1.0) {
        if (currentState.type === "liquidating") {
            return currentState; // Keep existing liquidation state
        }
        return {
            type: "liquidating",
            liquidationPrice: (0, types_1.mkAmount)(0n), // Will be calculated by liquidation system
        };
    }
    // If health factor improved sufficiently, move to active state
    if (newHealthFactor > 1.1) {
        // 10% buffer above liquidation threshold
        return {
            type: "active",
            healthFactor: newHealthFactor,
        };
    }
    // Health factor is borderline - keep current state but update health factor
    if (currentState.type === "active") {
        return {
            type: "active",
            healthFactor: newHealthFactor,
        };
    }
    // Default to keeping current state for edge cases
    return currentState;
};
exports.updateCDPStateAfterDeposit = updateCDPStateAfterDeposit;
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
const createUpdatedCDP = (cdp, depositAmount, newState, timestamp) => {
    return {
        ...cdp,
        collateralAmount: (0, types_1.mkAmount)(cdp.collateralAmount + depositAmount),
        state: newState,
        updatedAt: timestamp,
    };
};
exports.createUpdatedCDP = createUpdatedCDP;
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
const depositCollateral = (params, context) => {
    // Validate deposit parameters and system state
    const validationResult = (0, exports.validateDepositCollateral)(params, context);
    if (validationResult.isErr()) {
        return fp_utils_1.Result.err(validationResult.value);
    }
    // Calculate current health factor
    const previousHealthFactor = (0, exports.calculateCurrentHealthFactor)(params.cdp, context.collateralPrice);
    // Calculate new health factor after deposit
    const newHealthFactor = (0, exports.calculateHealthFactorAfterDeposit)(params.cdp.collateralAmount, params.depositAmount, params.cdp.debtAmount, context.collateralPrice, params.cdp.config.liquidationRatio);
    // Update CDP state based on new health factor
    const newState = (0, exports.updateCDPStateAfterDeposit)(params.cdp.state, newHealthFactor, params.cdp.config.liquidationRatio);
    // Create updated CDP with additional collateral
    const updatedCDP = (0, exports.createUpdatedCDP)(params.cdp, params.depositAmount, newState, params.timestamp);
    // Return successful deposit result
    const depositResult = {
        updatedCDP,
        depositedAmount: params.depositAmount,
        newHealthFactor,
        previousHealthFactor,
    };
    return fp_utils_1.Result.ok(depositResult);
};
exports.depositCollateral = depositCollateral;
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
const depositCollateralBatch = (deposits, context) => {
    const results = [];
    for (const params of deposits) {
        const result = (0, exports.depositCollateral)(params, context);
        if (result.isErr()) {
            return fp_utils_1.Result.err(result.value);
        }
        results.push(result.value);
    }
    return fp_utils_1.Result.ok(results);
};
exports.depositCollateralBatch = depositCollateralBatch;
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
const calculateHealthFactorImprovement = (cdp, depositAmount, collateralPrice) => {
    const current = (0, exports.calculateCurrentHealthFactor)(cdp, collateralPrice);
    const afterDeposit = (0, exports.calculateHealthFactorAfterDeposit)(cdp.collateralAmount, depositAmount, cdp.debtAmount, collateralPrice, cdp.config.liquidationRatio);
    const improvement = current > 0 ? ((afterDeposit - current) / current) * 100 : 0;
    return {
        current,
        afterDeposit,
        improvement,
    };
};
exports.calculateHealthFactorImprovement = calculateHealthFactorImprovement;
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
const estimateMinDepositForHealthFactor = (cdp, targetHealthFactor, collateralPrice) => {
    if (cdp.debtAmount === 0n) {
        return (0, types_1.mkAmount)(0n); // No debt means no deposit needed
    }
    const currentHealthFactor = (0, exports.calculateCurrentHealthFactor)(cdp, collateralPrice);
    // If already at or above target, no deposit needed
    if (currentHealthFactor >= targetHealthFactor) {
        return (0, types_1.mkAmount)(0n);
    }
    // Calculate required total collateral value for target health factor
    const requiredCollateralValue = (cdp.debtAmount *
        BigInt(Math.floor(targetHealthFactor * 100)) *
        BigInt(cdp.config.liquidationRatio)) /
        (BigInt(10000) * BigInt(100));
    // Calculate current collateral value
    const currentCollateralValue = (cdp.collateralAmount * collateralPrice) / BigInt(10 ** 18);
    // Calculate additional collateral value needed
    const additionalCollateralValue = requiredCollateralValue - currentCollateralValue;
    if (additionalCollateralValue <= 0n) {
        return (0, types_1.mkAmount)(0n);
    }
    // Convert additional collateral value to collateral amount
    const additionalCollateral = (additionalCollateralValue * BigInt(10 ** 18)) / collateralPrice;
    return (0, types_1.mkAmount)(additionalCollateral);
};
exports.estimateMinDepositForHealthFactor = estimateMinDepositForHealthFactor;
//# sourceMappingURL=deposit.js.map