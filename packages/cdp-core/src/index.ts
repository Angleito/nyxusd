/**
 * CDP Business Logic Module
 *
 * This module contains the core CDP business logic implementations
 * including CDP operations, validation, and state management functions.
 * All functions follow functional programming principles with immutable
 * data structures and explicit error handling using Result types.
 *
 * @packageDocumentation
 */

// CDP Creation Functions
export {
  validateCDPCreation,
  calculateHealthFactor,
  generateCDPId,
  createInitialCDPState,
  createCDP,
  createCDPBatch,
  estimateMaxDebt,
  estimateMinCollateral,
} from "./create";

export type { CDPCreationConfig, CDPCreationContext } from "./create";

// Collateral Deposit Functions
export {
  validateDepositCollateral,
  calculateHealthFactorAfterDeposit,
  calculateCurrentHealthFactor as calculateCurrentHealthFactorForDeposit,
  updateCDPStateAfterDeposit,
  createUpdatedCDP as createUpdatedCDPForDeposit,
  depositCollateral,
  depositCollateralBatch,
  calculateHealthFactorImprovement as calculateDepositHealthFactorImprovement,
  estimateMinDepositForHealthFactor,
} from "./deposit";

export type {
  DepositCollateralParams,
  DepositContext,
  DepositResult,
} from "./deposit";

// Collateral Withdrawal Functions
export {
  validateWithdrawCollateral,
  calculateMaxWithdrawableAmount,
  calculateHealthFactorAfterWithdraw,
  calculateCurrentHealthFactor as calculateCurrentHealthFactorForWithdraw,
  updateCDPStateAfterWithdraw,
  createUpdatedCDP as createUpdatedCDPForWithdraw,
  withdrawCollateral,
  withdrawCollateralBatch,
  calculateHealthFactorImpact as calculateWithdrawHealthFactorImpact,
  estimateFreedCollateralValue,
} from "./withdraw";

export type {
  WithdrawCollateralParams,
  WithdrawContext,
  WithdrawResult,
} from "./withdraw";

// NYXUSD Minting Functions
export {
  calculateAccruedFees as calculateAccruedFeesForMint,
  validateMintNYXUSD,
  calculateMaxMintableAmount,
  calculateHealthFactorAfterMint,
  calculateCurrentHealthFactor as calculateCurrentHealthFactorForMint,
  updateCDPStateAfterMint,
  createUpdatedCDP as createUpdatedCDPForMint,
  mintNYXUSD,
  mintNYXUSDBatch,
  estimateAnnualBorrowingCost,
  calculateCollateralizationRatioAfterMint,
} from "./mint";

export type { MintNYXUSDParams, MintContext, MintResult } from "./mint";

// NYXUSD Burning Functions
export {
  calculateAccruedFees as calculateAccruedFeesForBurn,
  calculateBurnAllocation,
  validateBurnNYXUSD,
  calculateHealthFactorAfterBurn,
  calculateCurrentHealthFactor as calculateCurrentHealthFactorForBurn,
  updateCDPStateAfterBurn,
  createUpdatedCDP as createUpdatedCDPForBurn,
  burnNYXUSD,
  burnNYXUSDBatch,
  estimateMinBurnForHealthFactor,
  calculateHealthFactorImprovement as calculateBurnHealthFactorImprovement,
  calculateFullClosureAmount,
} from "./burn";

export type {
  BurnNYXUSDParams,
  BurnContext,
  BurnResult,
  BurnAllocation,
} from "./burn";

// Module version
export const CDP_MODULE_VERSION = "1.0.0";