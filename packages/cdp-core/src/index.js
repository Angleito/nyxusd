"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFullClosureAmount = exports.calculateBurnHealthFactorImprovement = exports.estimateMinBurnForHealthFactor = exports.burnNYXUSDBatch = exports.burnNYXUSD = exports.createUpdatedCDPForBurn = exports.updateCDPStateAfterBurn = exports.calculateCurrentHealthFactorForBurn = exports.calculateHealthFactorAfterBurn = exports.validateBurnNYXUSD = exports.calculateBurnAllocation = exports.calculateAccruedFeesForBurn = exports.calculateCollateralizationRatioAfterMint = exports.estimateAnnualBorrowingCost = exports.mintNYXUSDBatch = exports.mintNYXUSD = exports.createUpdatedCDPForMint = exports.updateCDPStateAfterMint = exports.calculateCurrentHealthFactorForMint = exports.calculateHealthFactorAfterMint = exports.calculateMaxMintableAmount = exports.validateMintNYXUSD = exports.calculateAccruedFeesForMint = exports.estimateFreedCollateralValue = exports.calculateWithdrawHealthFactorImpact = exports.withdrawCollateralBatch = exports.withdrawCollateral = exports.createUpdatedCDPForWithdraw = exports.updateCDPStateAfterWithdraw = exports.calculateCurrentHealthFactorForWithdraw = exports.calculateHealthFactorAfterWithdraw = exports.calculateMaxWithdrawableAmount = exports.validateWithdrawCollateral = exports.estimateMinDepositForHealthFactor = exports.calculateDepositHealthFactorImprovement = exports.depositCollateralBatch = exports.depositCollateral = exports.createUpdatedCDPForDeposit = exports.updateCDPStateAfterDeposit = exports.calculateCurrentHealthFactorForDeposit = exports.calculateHealthFactorAfterDeposit = exports.validateDepositCollateral = exports.estimateMinCollateral = exports.estimateMaxDebt = exports.createCDPBatch = exports.createCDP = exports.createInitialCDPState = exports.generateCDPId = exports.calculateHealthFactor = exports.validateCDPCreation = void 0;
exports.CDP_MODULE_VERSION = void 0;
// CDP Creation Functions
var create_1 = require("./create");
Object.defineProperty(exports, "validateCDPCreation", { enumerable: true, get: function () { return create_1.validateCDPCreation; } });
Object.defineProperty(exports, "calculateHealthFactor", { enumerable: true, get: function () { return create_1.calculateHealthFactor; } });
Object.defineProperty(exports, "generateCDPId", { enumerable: true, get: function () { return create_1.generateCDPId; } });
Object.defineProperty(exports, "createInitialCDPState", { enumerable: true, get: function () { return create_1.createInitialCDPState; } });
Object.defineProperty(exports, "createCDP", { enumerable: true, get: function () { return create_1.createCDP; } });
Object.defineProperty(exports, "createCDPBatch", { enumerable: true, get: function () { return create_1.createCDPBatch; } });
Object.defineProperty(exports, "estimateMaxDebt", { enumerable: true, get: function () { return create_1.estimateMaxDebt; } });
Object.defineProperty(exports, "estimateMinCollateral", { enumerable: true, get: function () { return create_1.estimateMinCollateral; } });
// Collateral Deposit Functions
var deposit_1 = require("./deposit");
Object.defineProperty(exports, "validateDepositCollateral", { enumerable: true, get: function () { return deposit_1.validateDepositCollateral; } });
Object.defineProperty(exports, "calculateHealthFactorAfterDeposit", { enumerable: true, get: function () { return deposit_1.calculateHealthFactorAfterDeposit; } });
Object.defineProperty(exports, "calculateCurrentHealthFactorForDeposit", { enumerable: true, get: function () { return deposit_1.calculateCurrentHealthFactor; } });
Object.defineProperty(exports, "updateCDPStateAfterDeposit", { enumerable: true, get: function () { return deposit_1.updateCDPStateAfterDeposit; } });
Object.defineProperty(exports, "createUpdatedCDPForDeposit", { enumerable: true, get: function () { return deposit_1.createUpdatedCDP; } });
Object.defineProperty(exports, "depositCollateral", { enumerable: true, get: function () { return deposit_1.depositCollateral; } });
Object.defineProperty(exports, "depositCollateralBatch", { enumerable: true, get: function () { return deposit_1.depositCollateralBatch; } });
Object.defineProperty(exports, "calculateDepositHealthFactorImprovement", { enumerable: true, get: function () { return deposit_1.calculateHealthFactorImprovement; } });
Object.defineProperty(exports, "estimateMinDepositForHealthFactor", { enumerable: true, get: function () { return deposit_1.estimateMinDepositForHealthFactor; } });
// Collateral Withdrawal Functions
var withdraw_1 = require("./withdraw");
Object.defineProperty(exports, "validateWithdrawCollateral", { enumerable: true, get: function () { return withdraw_1.validateWithdrawCollateral; } });
Object.defineProperty(exports, "calculateMaxWithdrawableAmount", { enumerable: true, get: function () { return withdraw_1.calculateMaxWithdrawableAmount; } });
Object.defineProperty(exports, "calculateHealthFactorAfterWithdraw", { enumerable: true, get: function () { return withdraw_1.calculateHealthFactorAfterWithdraw; } });
Object.defineProperty(exports, "calculateCurrentHealthFactorForWithdraw", { enumerable: true, get: function () { return withdraw_1.calculateCurrentHealthFactor; } });
Object.defineProperty(exports, "updateCDPStateAfterWithdraw", { enumerable: true, get: function () { return withdraw_1.updateCDPStateAfterWithdraw; } });
Object.defineProperty(exports, "createUpdatedCDPForWithdraw", { enumerable: true, get: function () { return withdraw_1.createUpdatedCDP; } });
Object.defineProperty(exports, "withdrawCollateral", { enumerable: true, get: function () { return withdraw_1.withdrawCollateral; } });
Object.defineProperty(exports, "withdrawCollateralBatch", { enumerable: true, get: function () { return withdraw_1.withdrawCollateralBatch; } });
Object.defineProperty(exports, "calculateWithdrawHealthFactorImpact", { enumerable: true, get: function () { return withdraw_1.calculateHealthFactorImpact; } });
Object.defineProperty(exports, "estimateFreedCollateralValue", { enumerable: true, get: function () { return withdraw_1.estimateFreedCollateralValue; } });
// NYXUSD Minting Functions
var mint_1 = require("./mint");
Object.defineProperty(exports, "calculateAccruedFeesForMint", { enumerable: true, get: function () { return mint_1.calculateAccruedFees; } });
Object.defineProperty(exports, "validateMintNYXUSD", { enumerable: true, get: function () { return mint_1.validateMintNYXUSD; } });
Object.defineProperty(exports, "calculateMaxMintableAmount", { enumerable: true, get: function () { return mint_1.calculateMaxMintableAmount; } });
Object.defineProperty(exports, "calculateHealthFactorAfterMint", { enumerable: true, get: function () { return mint_1.calculateHealthFactorAfterMint; } });
Object.defineProperty(exports, "calculateCurrentHealthFactorForMint", { enumerable: true, get: function () { return mint_1.calculateCurrentHealthFactor; } });
Object.defineProperty(exports, "updateCDPStateAfterMint", { enumerable: true, get: function () { return mint_1.updateCDPStateAfterMint; } });
Object.defineProperty(exports, "createUpdatedCDPForMint", { enumerable: true, get: function () { return mint_1.createUpdatedCDP; } });
Object.defineProperty(exports, "mintNYXUSD", { enumerable: true, get: function () { return mint_1.mintNYXUSD; } });
Object.defineProperty(exports, "mintNYXUSDBatch", { enumerable: true, get: function () { return mint_1.mintNYXUSDBatch; } });
Object.defineProperty(exports, "estimateAnnualBorrowingCost", { enumerable: true, get: function () { return mint_1.estimateAnnualBorrowingCost; } });
Object.defineProperty(exports, "calculateCollateralizationRatioAfterMint", { enumerable: true, get: function () { return mint_1.calculateCollateralizationRatioAfterMint; } });
// NYXUSD Burning Functions
var burn_1 = require("./burn");
Object.defineProperty(exports, "calculateAccruedFeesForBurn", { enumerable: true, get: function () { return burn_1.calculateAccruedFees; } });
Object.defineProperty(exports, "calculateBurnAllocation", { enumerable: true, get: function () { return burn_1.calculateBurnAllocation; } });
Object.defineProperty(exports, "validateBurnNYXUSD", { enumerable: true, get: function () { return burn_1.validateBurnNYXUSD; } });
Object.defineProperty(exports, "calculateHealthFactorAfterBurn", { enumerable: true, get: function () { return burn_1.calculateHealthFactorAfterBurn; } });
Object.defineProperty(exports, "calculateCurrentHealthFactorForBurn", { enumerable: true, get: function () { return burn_1.calculateCurrentHealthFactor; } });
Object.defineProperty(exports, "updateCDPStateAfterBurn", { enumerable: true, get: function () { return burn_1.updateCDPStateAfterBurn; } });
Object.defineProperty(exports, "createUpdatedCDPForBurn", { enumerable: true, get: function () { return burn_1.createUpdatedCDP; } });
Object.defineProperty(exports, "burnNYXUSD", { enumerable: true, get: function () { return burn_1.burnNYXUSD; } });
Object.defineProperty(exports, "burnNYXUSDBatch", { enumerable: true, get: function () { return burn_1.burnNYXUSDBatch; } });
Object.defineProperty(exports, "estimateMinBurnForHealthFactor", { enumerable: true, get: function () { return burn_1.estimateMinBurnForHealthFactor; } });
Object.defineProperty(exports, "calculateBurnHealthFactorImprovement", { enumerable: true, get: function () { return burn_1.calculateHealthFactorImprovement; } });
Object.defineProperty(exports, "calculateFullClosureAmount", { enumerable: true, get: function () { return burn_1.calculateFullClosureAmount; } });
// Module version
exports.CDP_MODULE_VERSION = "1.0.0";
//# sourceMappingURL=index.js.map