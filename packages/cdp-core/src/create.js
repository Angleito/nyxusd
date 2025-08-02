"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateMinCollateral = exports.estimateMaxDebt = exports.createCDPBatch = exports.createCDP = exports.createInitialCDPState = exports.generateCDPId = exports.calculateHealthFactor = exports.validateCDPCreation = void 0;
const fp_utils_1 = require("@nyxusd/fp-utils");
const cdp_1 = require("../types/cdp");
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
const validateCDPCreation = (params, context) => {
    // Check if system is in emergency shutdown
    if (context.emergencyShutdown) {
        return fp_utils_1.Result.err({
            type: "invalid_operation",
            operation: "create",
            state: "emergency_shutdown",
        });
    }
    // Validate owner address
    if (!params.owner || params.owner.trim().length === 0) {
        return fp_utils_1.Result.err({
            type: "unauthorized",
            owner: params.owner,
            caller: params.owner,
        });
    }
    // Validate collateral amount
    if (params.collateralAmount < context.config.minCollateralAmount) {
        return fp_utils_1.Result.err({
            type: "insufficient_collateral",
            required: context.config.minCollateralAmount,
            provided: params.collateralAmount,
        });
    }
    // Validate debt amount limits
    if (params.debtAmount < context.config.minDebtAmount) {
        return fp_utils_1.Result.err({
            type: "below_min_debt",
            minimum: context.config.minDebtAmount,
            provided: params.debtAmount,
        });
    }
    if (params.debtAmount > context.config.maxDebtAmount) {
        return fp_utils_1.Result.err({
            type: "debt_ceiling_exceeded",
            ceiling: context.config.maxDebtAmount,
            requested: params.debtAmount,
        });
    }
    // Check debt ceiling constraint
    if (params.debtAmount > params.config.debtCeiling) {
        return fp_utils_1.Result.err({
            type: "debt_ceiling_exceeded",
            ceiling: params.config.debtCeiling,
            requested: params.debtAmount,
        });
    }
    // Calculate collateralization ratio
    const collateralValue = (params.collateralAmount * context.collateralPrice) / BigInt(10 ** 18); // Assuming 18 decimal scaling
    const collateralizationRatio = Number((collateralValue * BigInt(10000)) / params.debtAmount); // In basis points
    // Validate minimum collateralization ratio
    if (collateralizationRatio < context.config.minCollateralizationRatio) {
        return fp_utils_1.Result.err({
            type: "below_min_collateral_ratio",
            current: (0, cdp_1.mkCollateralizationRatio)(collateralizationRatio),
            minimum: (0, cdp_1.mkCollateralizationRatio)(context.config.minCollateralizationRatio),
        });
    }
    // Validate against CDP config minimum
    if (collateralizationRatio < params.config.minCollateralizationRatio) {
        return fp_utils_1.Result.err({
            type: "below_min_collateral_ratio",
            current: (0, cdp_1.mkCollateralizationRatio)(collateralizationRatio),
            minimum: params.config.minCollateralizationRatio,
        });
    }
    return fp_utils_1.Result.ok(undefined);
};
exports.validateCDPCreation = validateCDPCreation;
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
const calculateHealthFactor = (collateralAmount, debtAmount, collateralPrice, liquidationRatio) => {
    if (debtAmount === 0n) {
        return Number.MAX_SAFE_INTEGER;
    }
    const collateralValue = (collateralAmount * collateralPrice) / BigInt(10 ** 18);
    const liquidationThreshold = (collateralValue * BigInt(10000)) / BigInt(liquidationRatio);
    return Number(liquidationThreshold) / Number(debtAmount);
};
exports.calculateHealthFactor = calculateHealthFactor;
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
const generateCDPId = (owner, collateralType, timestamp) => {
    // Create a deterministic but unique identifier
    const hashInput = `${owner}-${collateralType}-${timestamp}`;
    // Simple hash function for demo - in production, use proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
        const char = hashInput.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const cdpId = `cdp_${Math.abs(hash).toString(16)}_${timestamp}`;
    return (0, cdp_1.mkCDPId)(cdpId);
};
exports.generateCDPId = generateCDPId;
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
const createInitialCDPState = (healthFactor, _liquidationRatio) => {
    // If health factor is too low, CDP should be flagged for liquidation
    if (healthFactor <= 1.0) {
        return {
            type: "liquidating",
            liquidationPrice: (0, cdp_1.mkAmount)(0n), // Will be calculated by liquidation system
        };
    }
    return {
        type: "active",
        healthFactor,
    };
};
exports.createInitialCDPState = createInitialCDPState;
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
const createCDP = (params, context) => {
    // Validate creation parameters
    const validationResult = (0, exports.validateCDPCreation)(params, context);
    if (validationResult.isErr()) {
        return fp_utils_1.Result.err(validationResult.value);
    }
    // Generate unique CDP ID
    const cdpId = (0, exports.generateCDPId)(params.owner, params.collateralType, context.currentTime);
    // Calculate health factor
    const healthFactor = (0, exports.calculateHealthFactor)(params.collateralAmount, params.debtAmount, context.collateralPrice, params.config.liquidationRatio);
    // Create initial state
    const initialState = (0, exports.createInitialCDPState)(healthFactor, params.config.liquidationRatio);
    // Create the CDP object
    const cdp = {
        id: cdpId,
        owner: params.owner,
        collateralType: params.collateralType,
        collateralAmount: params.collateralAmount,
        debtAmount: params.debtAmount,
        state: initialState,
        config: params.config,
        createdAt: context.currentTime,
        updatedAt: context.currentTime,
        accruedFees: (0, cdp_1.mkAmount)(0n),
    };
    return fp_utils_1.Result.ok(cdp);
};
exports.createCDP = createCDP;
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
const createCDPBatch = (requests, context) => {
    const cdps = [];
    for (const params of requests) {
        const result = (0, exports.createCDP)(params, context);
        if (result.isErr()) {
            return fp_utils_1.Result.err(result.value);
        }
        cdps.push(result.value);
    }
    return fp_utils_1.Result.ok(cdps);
};
exports.createCDPBatch = createCDPBatch;
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
const estimateMaxDebt = (collateralAmount, collateralPrice, minCollateralizationRatio) => {
    const collateralValue = (collateralAmount * collateralPrice) / BigInt(10 ** 18);
    const maxDebt = (collateralValue * BigInt(10000)) / BigInt(minCollateralizationRatio);
    return (0, cdp_1.mkAmount)(maxDebt);
};
exports.estimateMaxDebt = estimateMaxDebt;
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
const estimateMinCollateral = (debtAmount, collateralPrice, minCollateralizationRatio) => {
    const requiredCollateralValue = (debtAmount * BigInt(minCollateralizationRatio)) / BigInt(10000);
    const minCollateral = (requiredCollateralValue * BigInt(10 ** 18)) / collateralPrice;
    return (0, cdp_1.mkAmount)(minCollateral);
};
exports.estimateMinCollateral = estimateMinCollateral;
//# sourceMappingURL=create.js.map