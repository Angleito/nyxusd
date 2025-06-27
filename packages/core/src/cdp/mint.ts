/**
 * NYXUSD Minting Functions
 *
 * This module implements pure functions for minting additional NYXUSD tokens
 * against existing Collateralized Debt Positions (CDPs) in the NyxUSD system.
 * All functions follow functional programming principles with immutable data
 * structures and explicit error handling using Result types.
 *
 * Key Features:
 * - Pure functional approach with no side effects
 * - BigInt arithmetic for precise financial calculations
 * - Comprehensive validation and error handling
 * - Collateralization ratio maintenance
 * - Debt ceiling enforcement
 * - Stability fee calculations
 * - Type-safe operations with branded types
 * - Immutable CDP state transitions
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
} from "../types/cdp";

/**
 * Parameters for minting NYXUSD from a CDP
 */
export interface MintNYXUSDParams {
  /** The CDP to mint NYXUSD from */
  readonly cdp: CDP;
  /** Amount of NYXUSD to mint */
  readonly mintAmount: Amount;
  /** Address initiating the mint */
  readonly minter: string;
  /** Current timestamp */
  readonly timestamp: Timestamp;
}

/**
 * Context required for NYXUSD minting operations
 */
export interface MintContext {
  /** Current collateral price in USD (scaled) */
  readonly collateralPrice: bigint;
  /** Maximum single mint amount allowed */
  readonly maxMintAmount: Amount;
  /** Global debt ceiling */
  readonly globalDebtCeiling: Amount;
  /** Current total debt in system */
  readonly currentTotalDebt: Amount;
  /** Annual stability fee rate (as decimal, e.g., 0.05 for 5%) */
  readonly stabilityFeeRate: number;
  /** Time elapsed since last fee accrual (in seconds) */
  readonly timeElapsed: number;
  /** Whether emergency shutdown is active */
  readonly emergencyShutdown: boolean;
  /** Current system timestamp */
  readonly currentTime: Timestamp;
}

/**
 * Result of a successful NYXUSD minting operation
 */
export interface MintResult {
  /** Updated CDP after minting */
  readonly updatedCDP: CDP;
  /** Amount actually minted */
  readonly mintedAmount: Amount;
  /** New health factor after minting */
  readonly newHealthFactor: number;
  /** Previous health factor before minting */
  readonly previousHealthFactor: number;
  /** Stability fees accrued during operation */
  readonly accruedFees: Amount;
  /** New total debt in CDP */
  readonly newTotalDebt: Amount;
}

/**
 * Calculates accrued stability fees for a CDP
 *
 * Computes the stability fees that have accumulated on the CDP's debt
 * based on the time elapsed and the stability fee rate.
 *
 * @param currentDebt - Current debt amount in the CDP
 * @param stabilityFeeRate - Annual stability fee rate (as decimal)
 * @param timeElapsed - Time elapsed since last accrual (in seconds)
 * @returns Amount of fees accrued
 *
 * @example
 * ```typescript
 * const fees = calculateAccruedFees(
 *   mkAmount(10000000000000000000000n), // 10,000 NYXUSD debt
 *   0.05, // 5% annual rate
 *   86400 // 1 day in seconds
 * )
 * console.log(`Accrued fees: ${fees}`)
 * ```
 */
export const calculateAccruedFees = (
  currentDebt: Amount,
  stabilityFeeRate: number,
  timeElapsed: number,
): Amount => {
  if (currentDebt === 0n || stabilityFeeRate === 0 || timeElapsed === 0) {
    return mkAmount(0n);
  }

  // Calculate fees using compound interest formula: A = P * (1 + r)^t
  // For small time periods, we can use simple interest approximation: A = P * r * t
  const secondsPerYear = 365.25 * 24 * 60 * 60; // Account for leap years
  const timeInYears = timeElapsed / secondsPerYear;

  // Use simple interest for small time periods to avoid precision issues
  const fees =
    (currentDebt *
      BigInt(Math.floor(stabilityFeeRate * timeInYears * 1000000))) /
    BigInt(1000000);

  return mkAmount(fees);
};

/**
 * Validates NYXUSD minting parameters and system state
 *
 * Performs comprehensive validation of minting request including
 * authorization, amounts, CDP state, collateralization requirements,
 * debt ceilings, and system conditions.
 *
 * @param params - Minting parameters to validate
 * @param context - Current system context
 * @returns Result indicating validation success or specific error
 *
 * @example
 * ```typescript
 * const params: MintNYXUSDParams = {
 *   cdp: existingCDP,
 *   mintAmount: mkAmount(1000000000000000000000n), // 1000 NYXUSD
 *   minter: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 *
 * const context: MintContext = {
 *   collateralPrice: 2000000000000000000000n,
 *   maxMintAmount: mkAmount(50000000000000000000000n), // 50,000 NYXUSD
 *   globalDebtCeiling: mkAmount(1000000000000000000000000n), // 1M NYXUSD
 *   currentTotalDebt: mkAmount(500000000000000000000000n), // 500k NYXUSD
 *   stabilityFeeRate: 0.05,
 *   timeElapsed: 3600, // 1 hour
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 *
 * const validation = validateMintNYXUSD(params, context)
 * if (validation.isOk()) {
 *   console.log("Minting parameters are valid")
 * } else {
 *   console.error("Validation failed:", validation.value)
 * }
 * ```
 */
export const validateMintNYXUSD = (
  params: MintNYXUSDParams,
  context: MintContext,
): Result<void, CDPError> => {
  // Check if system is in emergency shutdown
  if (context.emergencyShutdown) {
    return Result.err({
      type: "invalid_operation",
      operation: "mint",
      state: "emergency_shutdown",
    });
  }

  // Validate minter authorization
  if (params.minter !== params.cdp.owner) {
    return Result.err({
      type: "unauthorized",
      owner: params.cdp.owner,
      caller: params.minter,
    });
  }

  // Validate mint amount
  if (params.mintAmount <= 0n) {
    return Result.err({
      type: "invalid_amount",
      amount: params.mintAmount,
    });
  }

  // Check maximum mint limit
  if (params.mintAmount > context.maxMintAmount) {
    return Result.err({
      type: "mint_limit_exceeded",
      limit: context.maxMintAmount,
      requested: params.mintAmount,
    });
  }

  // Validate CDP state - can only mint from active CDPs
  if (params.cdp.state.type !== "active") {
    return Result.err({
      type: "invalid_operation",
      operation: "mint",
      state: params.cdp.state.type,
    });
  }

  // Calculate accrued fees
  const accruedFees = calculateAccruedFees(
    params.cdp.debtAmount,
    context.stabilityFeeRate,
    context.timeElapsed,
  );

  // Calculate new total debt (existing + new mint + accrued fees)
  const newTotalDebt = params.cdp.debtAmount + params.mintAmount + accruedFees;

  // Check CDP debt ceiling
  if (newTotalDebt > params.cdp.config.debtCeiling) {
    return Result.err({
      type: "debt_ceiling_exceeded",
      ceiling: params.cdp.config.debtCeiling,
      requested: mkAmount(newTotalDebt),
    });
  }

  // Check global debt ceiling
  const newGlobalDebt =
    context.currentTotalDebt + params.mintAmount + accruedFees;
  if (newGlobalDebt > context.globalDebtCeiling) {
    return Result.err({
      type: "debt_ceiling_exceeded",
      ceiling: context.globalDebtCeiling,
      requested: mkAmount(newGlobalDebt),
    });
  }

  // Calculate collateralization ratio after minting
  const collateralValue =
    (params.cdp.collateralAmount * context.collateralPrice) / BigInt(10 ** 18);
  const newCollateralizationRatio = Number(
    (collateralValue * BigInt(10000)) / newTotalDebt,
  );

  // Check if minting would violate minimum collateralization ratio
  if (newCollateralizationRatio < params.cdp.config.minCollateralizationRatio) {
    return Result.err({
      type: "below_min_collateral_ratio",
      current: mkCollateralizationRatio(newCollateralizationRatio),
      minimum: params.cdp.config.minCollateralizationRatio,
    });
  }

  return Result.ok(undefined);
};

/**
 * Calculates the maximum amount of NYXUSD that can be minted from a CDP
 *
 * Determines the maximum minting amount while maintaining the required
 * collateralization ratio and considering accrued fees.
 *
 * @param cdp - CDP to evaluate for maximum minting
 * @param collateralPrice - Current price of collateral
 * @param stabilityFeeRate - Annual stability fee rate
 * @param timeElapsed - Time elapsed since last fee accrual
 * @returns Maximum amount that can be minted
 *
 * @example
 * ```typescript
 * const maxMint = calculateMaxMintableAmount(
 *   myCDP,
 *   2000000000000000000000n, // $2000 per ETH
 *   0.05, // 5% annual rate
 *   7200 // 2 hours
 * )
 * console.log(`Can mint up to ${maxMint} NYXUSD`)
 * ```
 */
export const calculateMaxMintableAmount = (
  cdp: CDP,
  collateralPrice: bigint,
  stabilityFeeRate: number,
  timeElapsed: number,
): Amount => {
  // Calculate accrued fees
  const accruedFees = calculateAccruedFees(
    cdp.debtAmount,
    stabilityFeeRate,
    timeElapsed,
  );

  // Calculate current debt including accrued fees
  const currentDebtWithFees = cdp.debtAmount + accruedFees;

  // Calculate maximum debt based on collateral value and minimum ratio
  const collateralValue =
    (cdp.collateralAmount * collateralPrice) / BigInt(10 ** 18);
  const maxTotalDebt =
    (collateralValue * BigInt(10000)) /
    BigInt(cdp.config.minCollateralizationRatio);

  // Check debt ceiling constraint
  const debtCeilingLimit = cdp.config.debtCeiling;

  // Use the most restrictive limit
  const effectiveMaxDebt =
    maxTotalDebt < debtCeilingLimit ? maxTotalDebt : debtCeilingLimit;

  if (effectiveMaxDebt <= currentDebtWithFees) {
    return mkAmount(0n); // Cannot mint anything
  }

  const maxMintable = effectiveMaxDebt - currentDebtWithFees;
  return mkAmount(maxMintable);
};

/**
 * Calculates the health factor after minting NYXUSD
 *
 * Computes the new health factor that would result from minting
 * the specified amount of NYXUSD from the CDP.
 *
 * @param collateralAmount - Current collateral amount in CDP
 * @param currentDebt - Current debt amount in CDP
 * @param mintAmount - Amount of NYXUSD being minted
 * @param accruedFees - Fees accrued during the operation
 * @param collateralPrice - Current price of collateral
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns New health factor after minting
 *
 * @example
 * ```typescript
 * const newHealthFactor = calculateHealthFactorAfterMint(
 *   mkAmount(2000000000000000000n), // 2 ETH
 *   mkAmount(2000000000000000000000n), // 2000 NYXUSD current debt
 *   mkAmount(500000000000000000000n),  // 500 NYXUSD new mint
 *   mkAmount(10000000000000000000n),   // 10 NYXUSD fees
 *   2000000000000000000000n, // $2000 per ETH
 *   13000 // 130% liquidation ratio
 * )
 * console.log(`New health factor: ${newHealthFactor}`)
 * ```
 */
export const calculateHealthFactorAfterMint = (
  collateralAmount: Amount,
  currentDebt: Amount,
  mintAmount: Amount,
  accruedFees: Amount,
  collateralPrice: bigint,
  liquidationRatio: number,
): number => {
  const newTotalDebt = currentDebt + mintAmount + accruedFees;

  if (newTotalDebt === 0n) {
    return Number.MAX_SAFE_INTEGER;
  }

  const collateralValue =
    (collateralAmount * collateralPrice) / BigInt(10 ** 18);
  const liquidationThreshold =
    (collateralValue * BigInt(10000)) / BigInt(liquidationRatio);

  return Number(liquidationThreshold) / Number(newTotalDebt);
};

/**
 * Calculates the current health factor from CDP state
 *
 * Determines the health factor before the minting operation
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
 * Updates CDP state after NYXUSD minting
 *
 * Determines the new CDP state based on the updated health factor
 * and system conditions after the NYXUSD minting.
 *
 * @param currentState - Current CDP state
 * @param newHealthFactor - Health factor after minting
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns Updated CDP state
 *
 * @example
 * ```typescript
 * const newState = updateCDPStateAfterMint(
 *   { type: 'active', healthFactor: 2.5 },
 *   1.8, // Reduced health factor due to more debt
 *   13000 // 130% liquidation ratio
 * )
 * console.log("New state:", newState)
 * ```
 */
export const updateCDPStateAfterMint = (
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
 * Creates an updated CDP with increased debt
 *
 * Produces a new CDP object with the minted NYXUSD amount and accrued fees
 * added to the existing debt, along with updated timestamps and state.
 *
 * @param cdp - Original CDP to update
 * @param mintAmount - Amount of NYXUSD being minted
 * @param accruedFees - Fees accrued during the operation
 * @param newState - Updated CDP state after minting
 * @param timestamp - Timestamp of the mint operation
 * @returns New CDP object with increased debt
 *
 * @example
 * ```typescript
 * const updatedCDP = createUpdatedCDP(
 *   originalCDP,
 *   mkAmount(1000000000000000000000n), // 1000 NYXUSD
 *   mkAmount(5000000000000000000n), // 5 NYXUSD fees
 *   { type: 'active', healthFactor: 1.8 },
 *   mkTimestamp(Date.now())
 * )
 * console.log("Updated debt:", updatedCDP.debtAmount)
 * ```
 */
export const createUpdatedCDP = (
  cdp: CDP,
  mintAmount: Amount,
  accruedFees: Amount,
  newState: CDPState,
  timestamp: Timestamp,
): CDP => {
  return {
    ...cdp,
    debtAmount: mkAmount(cdp.debtAmount + mintAmount),
    accruedFees: mkAmount(cdp.accruedFees + accruedFees),
    state: newState,
    updatedAt: timestamp,
  };
};

/**
 * Mints NYXUSD from a CDP
 *
 * This is the main NYXUSD minting function that orchestrates validation,
 * fee calculation, and CDP state updates. It performs all necessary checks
 * including collateralization ratio maintenance and debt ceiling compliance.
 *
 * @param params - NYXUSD minting parameters
 * @param context - Current system context
 * @returns Result containing minting details or error
 *
 * @example
 * ```typescript
 * const params: MintNYXUSDParams = {
 *   cdp: existingCDP,
 *   mintAmount: mkAmount(1500000000000000000000n), // 1500 NYXUSD
 *   minter: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 *
 * const context: MintContext = {
 *   collateralPrice: 2100000000000000000000n, // $2100 per ETH
 *   maxMintAmount: mkAmount(10000000000000000000000n), // 10,000 NYXUSD max
 *   globalDebtCeiling: mkAmount(10000000000000000000000000n), // 10M global ceiling
 *   currentTotalDebt: mkAmount(5000000000000000000000000n), // 5M current debt
 *   stabilityFeeRate: 0.05,
 *   timeElapsed: 86400, // 1 day
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 *
 * const result = mintNYXUSD(params, context)
 * if (result.isOk()) {
 *   const mintResult = result.value
 *   console.log(`Minted ${mintResult.mintedAmount} NYXUSD`)
 *   console.log(`Accrued ${mintResult.accruedFees} in fees`)
 *   console.log(`Health factor changed from ${mintResult.previousHealthFactor} to ${mintResult.newHealthFactor}`)
 * } else {
 *   console.error("Minting failed:", result.value)
 * }
 * ```
 */
export const mintNYXUSD = (
  params: MintNYXUSDParams,
  context: MintContext,
): Result<MintResult, CDPError> => {
  // Validate minting parameters and system state
  const validationResult = validateMintNYXUSD(params, context);
  if (validationResult.isErr()) {
    return Result.err(validationResult.value);
  }

  // Calculate accrued fees
  const accruedFees = calculateAccruedFees(
    params.cdp.debtAmount,
    context.stabilityFeeRate,
    context.timeElapsed,
  );

  // Calculate current health factor
  const previousHealthFactor = calculateCurrentHealthFactor(
    params.cdp,
    context.collateralPrice,
  );

  // Calculate new health factor after minting
  const newHealthFactor = calculateHealthFactorAfterMint(
    params.cdp.collateralAmount,
    params.cdp.debtAmount,
    params.mintAmount,
    accruedFees,
    context.collateralPrice,
    params.cdp.config.liquidationRatio,
  );

  // Update CDP state based on new health factor
  const newState = updateCDPStateAfterMint(
    params.cdp.state,
    newHealthFactor,
    params.cdp.config.liquidationRatio,
  );

  // Create updated CDP with increased debt
  const updatedCDP = createUpdatedCDP(
    params.cdp,
    params.mintAmount,
    accruedFees,
    newState,
    params.timestamp,
  );

  // Calculate new total debt
  const newTotalDebt = params.cdp.debtAmount + params.mintAmount + accruedFees;

  // Return successful minting result
  const mintResult: MintResult = {
    updatedCDP,
    mintedAmount: params.mintAmount,
    newHealthFactor,
    previousHealthFactor,
    accruedFees,
    newTotalDebt: mkAmount(newTotalDebt),
  };

  return Result.ok(mintResult);
};

/**
 * Mints NYXUSD from multiple CDPs in batch
 *
 * Processes an array of NYXUSD minting requests, validating each one
 * and returning results for all operations. This function maintains
 * transaction-like semantics - if any mint fails, the entire batch fails.
 *
 * @param mints - Array of minting parameter sets
 * @param context - Shared system context for all operations
 * @returns Result containing array of minting results or first error encountered
 *
 * @example
 * ```typescript
 * const mints = [
 *   { cdp: cdp1, mintAmount: mkAmount(1000000000000000000000n), ... },
 *   { cdp: cdp2, mintAmount: mkAmount(500000000000000000000n), ... }
 * ]
 *
 * const result = mintNYXUSDBatch(mints, context)
 * if (result.isOk()) {
 *   console.log(`Processed ${result.value.length} mints`)
 * } else {
 *   console.error("Batch mint failed:", result.value)
 * }
 * ```
 */
export const mintNYXUSDBatch = (
  mints: readonly MintNYXUSDParams[],
  context: MintContext,
): Result<readonly MintResult[], CDPError> => {
  const results: MintResult[] = [];
  let runningTotalDebt = context.currentTotalDebt;

  for (const params of mints) {
    // Update context with running total for debt ceiling checks
    const updatedContext = {
      ...context,
      currentTotalDebt: runningTotalDebt,
    };

    const result = mintNYXUSD(params, updatedContext);
    if (result.isErr()) {
      return Result.err((result as Err<MintResult, CDPError>).value);
    }

    const mintResult = (result as Ok<MintResult, CDPError>).value;
    results.push(mintResult);

    // Update running total for next iteration
    runningTotalDebt = mkAmount(
      runningTotalDebt + mintResult.mintedAmount + mintResult.accruedFees,
    );
  }

  return Result.ok(results);
};

/**
 * Estimates the annual cost of borrowing for a given amount
 *
 * Calculates the annual stability fees that would be charged
 * on a specific debt amount at the current stability fee rate.
 *
 * @param debtAmount - Amount of debt to calculate fees for
 * @param stabilityFeeRate - Annual stability fee rate (as decimal)
 * @returns Annual fee amount
 *
 * @example
 * ```typescript
 * const annualCost = estimateAnnualBorrowingCost(
 *   mkAmount(10000000000000000000000n), // 10,000 NYXUSD
 *   0.05 // 5% annual rate
 * )
 * console.log(`Annual borrowing cost: ${annualCost} NYXUSD`)
 * ```
 */
export const estimateAnnualBorrowingCost = (
  debtAmount: Amount,
  stabilityFeeRate: number,
): Amount => {
  const annualFees =
    (debtAmount * BigInt(Math.floor(stabilityFeeRate * 1000000))) /
    BigInt(1000000);
  return mkAmount(annualFees);
};

/**
 * Calculates the collateralization ratio after minting
 *
 * Computes the new collateralization ratio that would result from
 * minting additional NYXUSD, including accrued fees.
 *
 * @param cdp - CDP to evaluate
 * @param mintAmount - Amount of NYXUSD to mint
 * @param collateralPrice - Current collateral price
 * @param stabilityFeeRate - Annual stability fee rate
 * @param timeElapsed - Time elapsed since last fee accrual
 * @returns New collateralization ratio (in basis points)
 *
 * @example
 * ```typescript
 * const newRatio = calculateCollateralizationRatioAfterMint(
 *   myCDP,
 *   mkAmount(1000000000000000000000n), // 1000 NYXUSD
 *   2000000000000000000000n, // $2000 per ETH
 *   0.05, // 5% annual rate
 *   3600 // 1 hour
 * )
 * console.log(`New ratio: ${newRatio / 100}%`) // Convert basis points to percentage
 * ```
 */
export const calculateCollateralizationRatioAfterMint = (
  cdp: CDP,
  mintAmount: Amount,
  collateralPrice: bigint,
  stabilityFeeRate: number,
  timeElapsed: number,
): number => {
  const accruedFees = calculateAccruedFees(
    cdp.debtAmount,
    stabilityFeeRate,
    timeElapsed,
  );
  const newTotalDebt = cdp.debtAmount + mintAmount + accruedFees;

  if (newTotalDebt === 0n) {
    return Number.MAX_SAFE_INTEGER;
  }

  const collateralValue =
    (cdp.collateralAmount * collateralPrice) / BigInt(10 ** 18);
  return Number((collateralValue * BigInt(10000)) / newTotalDebt);
};
