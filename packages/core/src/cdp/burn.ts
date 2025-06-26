/**
 * NYXUSD Burning/Repayment Functions
 * 
 * This module implements pure functions for burning NYXUSD tokens to repay
 * debt in Collateralized Debt Positions (CDPs) in the NyxUSD system.
 * All functions follow functional programming principles with immutable data
 * structures and explicit error handling using Result types.
 * 
 * Key Features:
 * - Pure functional approach with no side effects
 * - BigInt arithmetic for precise financial calculations
 * - Comprehensive validation and error handling
 * - Stability fee settlement
 * - Health factor improvement tracking
 * - Partial and full debt repayment support
 * - Type-safe operations with branded types
 * - Immutable CDP state transitions
 * - CDP closure detection and handling
 * 
 * @packageDocumentation
 */

import { Result } from '../../../libs/fp-utils/src/result'
import { 
  CDP, 
  CDPId, 
  CDPError, 
  CDPState,
  Amount, 
  Timestamp,
  mkAmount,
  mkTimestamp
} from '../types/cdp'

/**
 * Parameters for burning NYXUSD to repay CDP debt
 */
export interface BurnNYXUSDParams {
  /** The CDP to repay debt for */
  readonly cdp: CDP
  /** Amount of NYXUSD to burn for debt repayment */
  readonly burnAmount: Amount
  /** Address initiating the burn/repayment */
  readonly burner: string
  /** Current timestamp */
  readonly timestamp: Timestamp
}

/**
 * Context required for NYXUSD burning operations
 */
export interface BurnContext {
  /** Current collateral price in USD (scaled) */
  readonly collateralPrice: bigint
  /** Maximum single burn amount allowed */
  readonly maxBurnAmount: Amount
  /** Annual stability fee rate (as decimal, e.g., 0.05 for 5%) */
  readonly stabilityFeeRate: number
  /** Time elapsed since last fee accrual (in seconds) */
  readonly timeElapsed: number
  /** Whether to automatically close CDP if debt reaches zero */
  readonly autoCloseCDP: boolean
  /** Whether emergency shutdown is active */
  readonly emergencyShutdown: boolean
  /** Current system timestamp */
  readonly currentTime: Timestamp
}

/**
 * Result of a successful NYXUSD burning operation
 */
export interface BurnResult {
  /** Updated CDP after burning */
  readonly updatedCDP: CDP
  /** Amount actually burned */
  readonly burnedAmount: Amount
  /** Amount applied to principal debt repayment */
  readonly principalRepaid: Amount
  /** Amount applied to fee payment */
  readonly feesPaid: Amount
  /** New health factor after burning */
  readonly newHealthFactor: number
  /** Previous health factor before burning */
  readonly previousHealthFactor: number
  /** Whether the CDP was fully closed */
  readonly cdpClosed: boolean
  /** Remaining debt after repayment */
  readonly remainingDebt: Amount
}

/**
 * Breakdown of how a burn amount is allocated
 */
export interface BurnAllocation {
  /** Amount allocated to paying accrued fees */
  readonly feesPayment: Amount
  /** Amount allocated to principal debt repayment */
  readonly principalPayment: Amount
  /** Total amount burned */
  readonly totalBurned: Amount
  /** Remaining debt after burning */
  readonly remainingDebt: Amount
  /** Whether this burn fully pays off the CDP */
  readonly fullRepayment: boolean
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
 *   mkAmount(5000000000000000000000n), // 5,000 NYXUSD debt
 *   0.05, // 5% annual rate
 *   2592000 // 30 days in seconds
 * )
 * console.log(`Accrued fees: ${fees}`)
 * ```
 */
export const calculateAccruedFees = (
  currentDebt: Amount,
  stabilityFeeRate: number,
  timeElapsed: number
): Amount => {
  if (currentDebt === 0n || stabilityFeeRate === 0 || timeElapsed === 0) {
    return mkAmount(0n)
  }

  // Calculate fees using compound interest formula: A = P * (1 + r)^t
  // For small time periods, we can use simple interest approximation: A = P * r * t
  const secondsPerYear = 365.25 * 24 * 60 * 60 // Account for leap years
  const timeInYears = timeElapsed / secondsPerYear
  
  // Use simple interest for small time periods to avoid precision issues
  const fees = currentDebt * BigInt(Math.floor(stabilityFeeRate * timeInYears * 1000000)) / BigInt(1000000)
  
  return mkAmount(fees)
}

/**
 * Calculates how a burn amount should be allocated between fees and principal
 * 
 * Determines the optimal allocation of the burn amount to first pay accrued
 * fees and then apply the remainder to principal debt repayment.
 * 
 * @param burnAmount - Total amount available for burning
 * @param currentDebt - Current principal debt amount
 * @param accruedFees - Accrued stability fees
 * @returns Allocation breakdown showing fee payment and principal payment
 * 
 * @example
 * ```typescript
 * const allocation = calculateBurnAllocation(
 *   mkAmount(1500000000000000000000n), // 1500 NYXUSD to burn
 *   mkAmount(5000000000000000000000n), // 5000 NYXUSD principal debt
 *   mkAmount(250000000000000000000n)   // 250 NYXUSD accrued fees
 * )
 * console.log(`Fees paid: ${allocation.feesPayment}`)
 * console.log(`Principal paid: ${allocation.principalPayment}`)
 * console.log(`Remaining debt: ${allocation.remainingDebt}`)
 * ```
 */
export const calculateBurnAllocation = (
  burnAmount: Amount,
  currentDebt: Amount,
  accruedFees: Amount
): BurnAllocation => {
  let feesPayment = mkAmount(0n)
  let principalPayment = mkAmount(0n)
  let remainingBurn = burnAmount

  // First, pay accrued fees
  if (accruedFees > 0n && remainingBurn > 0n) {
    feesPayment = mkAmount(remainingBurn >= accruedFees ? accruedFees : remainingBurn)
    remainingBurn = mkAmount(remainingBurn - feesPayment)
  }

  // Then, pay principal debt
  if (currentDebt > 0n && remainingBurn > 0n) {
    principalPayment = mkAmount(remainingBurn >= currentDebt ? currentDebt : remainingBurn)
  }

  const totalBurned = mkAmount(feesPayment + principalPayment)
  const remainingDebt = mkAmount(currentDebt - principalPayment)
  const fullRepayment = remainingDebt === 0n && accruedFees <= feesPayment

  return {
    feesPayment,
    principalPayment,
    totalBurned,
    remainingDebt,
    fullRepayment
  }
}

/**
 * Validates NYXUSD burning parameters and system state
 * 
 * Performs comprehensive validation of burning request including
 * authorization, amounts, CDP state, and system conditions.
 * 
 * @param params - Burning parameters to validate
 * @param context - Current system context
 * @returns Result indicating validation success or specific error
 * 
 * @example
 * ```typescript
 * const params: BurnNYXUSDParams = {
 *   cdp: existingCDP,
 *   burnAmount: mkAmount(1000000000000000000000n), // 1000 NYXUSD
 *   burner: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 * 
 * const context: BurnContext = {
 *   collateralPrice: 2000000000000000000000n,
 *   maxBurnAmount: mkAmount(100000000000000000000000n), // 100,000 NYXUSD
 *   stabilityFeeRate: 0.05,
 *   timeElapsed: 86400, // 1 day
 *   autoCloseCDP: true,
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 * 
 * const validation = validateBurnNYXUSD(params, context)
 * if (validation.isOk()) {
 *   console.log("Burning parameters are valid")
 * } else {
 *   console.error("Validation failed:", validation.value)
 * }
 * ```
 */
export const validateBurnNYXUSD = (
  params: BurnNYXUSDParams,
  context: BurnContext
): Result<void, CDPError> => {
  // Allow burning even during emergency shutdown for debt repayment
  
  // Validate burner authorization
  if (params.burner !== params.cdp.owner) {
    return Result.err({
      type: 'unauthorized',
      owner: params.cdp.owner,
      caller: params.burner
    })
  }

  // Validate burn amount
  if (params.burnAmount <= 0n) {
    return Result.err({
      type: 'invalid_amount',
      amount: params.burnAmount
    })
  }

  // Check maximum burn limit
  if (params.burnAmount > context.maxBurnAmount) {
    return Result.err({
      type: 'burn_amount_exceeds_debt',
      debt: context.maxBurnAmount,
      requested: params.burnAmount
    })
  }

  // Validate CDP state - cannot burn from liquidated or closed CDPs
  if (params.cdp.state.type === 'liquidated') {
    return Result.err({
      type: 'cdp_already_liquidated',
      id: params.cdp.id
    })
  }

  if (params.cdp.state.type === 'closed') {
    return Result.err({
      type: 'cdp_already_closed',
      id: params.cdp.id
    })
  }

  // Calculate total debt including accrued fees
  const accruedFees = calculateAccruedFees(
    params.cdp.debtAmount,
    context.stabilityFeeRate,
    context.timeElapsed
  )
  const totalDebt = params.cdp.debtAmount + accruedFees

  // Check if burn amount exceeds total debt
  if (params.burnAmount > totalDebt) {
    return Result.err({
      type: 'burn_amount_exceeds_debt',
      debt: totalDebt,
      requested: params.burnAmount
    })
  }

  return Result.ok(undefined)
}

/**
 * Calculates the health factor after burning NYXUSD
 * 
 * Computes the new health factor that would result from burning
 * the specified amount of NYXUSD to repay CDP debt.
 * 
 * @param collateralAmount - Current collateral amount in CDP
 * @param currentDebt - Current debt amount in CDP
 * @param principalRepaid - Amount of principal debt being repaid
 * @param collateralPrice - Current price of collateral
 * @param liquidationRatio - Liquidation threshold ratio
 * @returns New health factor after burning
 * 
 * @example
 * ```typescript
 * const newHealthFactor = calculateHealthFactorAfterBurn(
 *   mkAmount(2000000000000000000n), // 2 ETH
 *   mkAmount(3000000000000000000000n), // 3000 NYXUSD current debt
 *   mkAmount(1000000000000000000000n), // 1000 NYXUSD repaid
 *   2000000000000000000000n, // $2000 per ETH
 *   13000 // 130% liquidation ratio
 * )
 * console.log(`New health factor: ${newHealthFactor}`)
 * ```
 */
export const calculateHealthFactorAfterBurn = (
  collateralAmount: Amount,
  currentDebt: Amount,
  principalRepaid: Amount,
  collateralPrice: bigint,
  liquidationRatio: number
): number => {
  const newDebt = currentDebt - principalRepaid

  if (newDebt === 0n) {
    return Number.MAX_SAFE_INTEGER
  }

  const collateralValue = collateralAmount * collateralPrice / BigInt(10**18)
  const liquidationThreshold = collateralValue * BigInt(10000) / BigInt(liquidationRatio)
  
  return Number(liquidationThreshold) / Number(newDebt)
}

/**
 * Calculates the current health factor from CDP state
 * 
 * Determines the health factor before the burning operation
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
  collateralPrice: bigint
): number => {
  if (cdp.debtAmount === 0n) {
    return Number.MAX_SAFE_INTEGER
  }

  const collateralValue = cdp.collateralAmount * collateralPrice / BigInt(10**18)
  const liquidationThreshold = collateralValue * BigInt(10000) / BigInt(cdp.config.liquidationRatio)
  
  return Number(liquidationThreshold) / Number(cdp.debtAmount)
}

/**
 * Updates CDP state after NYXUSD burning
 * 
 * Determines the new CDP state based on the remaining debt and
 * system conditions after the NYXUSD burning operation.
 * 
 * @param currentState - Current CDP state
 * @param remainingDebt - Debt remaining after burning
 * @param newHealthFactor - Health factor after burning
 * @param autoClose - Whether to automatically close CDP if debt is zero
 * @param timestamp - Current timestamp
 * @returns Updated CDP state
 * 
 * @example
 * ```typescript
 * const newState = updateCDPStateAfterBurn(
 *   { type: 'active', healthFactor: 1.3 },
 *   mkAmount(0n), // No remaining debt
 *   Number.MAX_SAFE_INTEGER, // Infinite health factor
 *   true, // Auto close enabled
 *   mkTimestamp(Date.now())
 * )
 * console.log("New state:", newState) // Should be 'closed'
 * ```
 */
export const updateCDPStateAfterBurn = (
  currentState: CDPState,
  remainingDebt: Amount,
  newHealthFactor: number,
  autoClose: boolean,
  timestamp: Timestamp
): CDPState => {
  // If no debt remains and auto-close is enabled, close the CDP
  if (remainingDebt === 0n && autoClose) {
    return {
      type: 'closed',
      closedAt: timestamp
    }
  }

  // If debt remains, update to active state with new health factor
  if (remainingDebt > 0n) {
    // If health factor improved significantly, move to active
    if (newHealthFactor > 1.1) { // 10% buffer above liquidation threshold
      return {
        type: 'active',
        healthFactor: newHealthFactor
      }
    }

    // If still at risk but improved, keep current state with updated health
    if (currentState.type === 'liquidating' && newHealthFactor > 1.0) {
      return {
        type: 'active',
        healthFactor: newHealthFactor
      }
    }

    // If still at liquidation risk, maintain liquidating state
    if (newHealthFactor <= 1.0) {
      return {
        type: 'liquidating',
        liquidationPrice: mkAmount(0n) // Will be calculated by liquidation system
      }
    }

    // Default to active state
    return {
      type: 'active',
      healthFactor: newHealthFactor
    }
  }

  // If debt is zero but auto-close disabled, keep active with infinite health
  return {
    type: 'active',
    healthFactor: Number.MAX_SAFE_INTEGER
  }
}

/**
 * Creates an updated CDP with reduced debt
 * 
 * Produces a new CDP object with the burned NYXUSD amount subtracted
 * from the existing debt and fees, along with updated timestamps and state.
 * 
 * @param cdp - Original CDP to update
 * @param principalRepaid - Amount of principal debt repaid
 * @param feesPaid - Amount of fees paid
 * @param newState - Updated CDP state after burning
 * @param timestamp - Timestamp of the burn operation
 * @returns New CDP object with reduced debt
 * 
 * @example
 * ```typescript
 * const updatedCDP = createUpdatedCDP(
 *   originalCDP,
 *   mkAmount(1000000000000000000000n), // 1000 NYXUSD principal
 *   mkAmount(50000000000000000000n), // 50 NYXUSD fees
 *   { type: 'active', healthFactor: 2.5 },
 *   mkTimestamp(Date.now())
 * )
 * console.log("Updated debt:", updatedCDP.debtAmount)
 * ```
 */
export const createUpdatedCDP = (
  cdp: CDP,
  principalRepaid: Amount,
  feesPaid: Amount,
  newState: CDPState,
  timestamp: Timestamp
): CDP => {
  return {
    ...cdp,
    debtAmount: mkAmount(cdp.debtAmount - principalRepaid),
    accruedFees: mkAmount(cdp.accruedFees - feesPaid),
    state: newState,
    updatedAt: timestamp
  }
}

/**
 * Burns NYXUSD to repay CDP debt
 * 
 * This is the main NYXUSD burning function that orchestrates validation,
 * fee calculation, allocation, and CDP state updates. It handles both
 * partial and full debt repayment scenarios.
 * 
 * @param params - NYXUSD burning parameters
 * @param context - Current system context
 * @returns Result containing burning details or error
 * 
 * @example
 * ```typescript
 * const params: BurnNYXUSDParams = {
 *   cdp: existingCDP,
 *   burnAmount: mkAmount(2500000000000000000000n), // 2500 NYXUSD
 *   burner: "0x742d35Cc6634C0532925a3b8D0c4E5B8e4c7D4F6",
 *   timestamp: mkTimestamp(Date.now())
 * }
 * 
 * const context: BurnContext = {
 *   collateralPrice: 2100000000000000000000n, // $2100 per ETH
 *   maxBurnAmount: mkAmount(1000000000000000000000000n), // 1M NYXUSD max
 *   stabilityFeeRate: 0.05,
 *   timeElapsed: 172800, // 2 days
 *   autoCloseCDP: true,
 *   emergencyShutdown: false,
 *   currentTime: mkTimestamp(Date.now())
 * }
 * 
 * const result = burnNYXUSD(params, context)
 * if (result.isOk()) {
 *   const burnResult = result.value
 *   console.log(`Burned ${burnResult.burnedAmount} NYXUSD`)
 *   console.log(`Principal repaid: ${burnResult.principalRepaid}`)
 *   console.log(`Fees paid: ${burnResult.feesPaid}`)
 *   console.log(`Health factor improved from ${burnResult.previousHealthFactor} to ${burnResult.newHealthFactor}`)
 *   if (burnResult.cdpClosed) {
 *     console.log("CDP was fully closed")
 *   }
 * } else {
 *   console.error("Burning failed:", result.value)
 * }
 * ```
 */
export const burnNYXUSD = (
  params: BurnNYXUSDParams,
  context: BurnContext
): Result<BurnResult, CDPError> => {
  // Validate burning parameters and system state
  const validationResult = validateBurnNYXUSD(params, context)
  if (validationResult.isErr()) {
    return Result.err(validationResult.value)
  }

  // Calculate accrued fees
  const accruedFees = calculateAccruedFees(
    params.cdp.debtAmount,
    context.stabilityFeeRate,
    context.timeElapsed
  )

  // Calculate burn allocation
  const allocation = calculateBurnAllocation(
    params.burnAmount,
    params.cdp.debtAmount,
    accruedFees
  )

  // Calculate current health factor
  const previousHealthFactor = calculateCurrentHealthFactor(params.cdp, context.collateralPrice)

  // Calculate new health factor after burning
  const newHealthFactor = calculateHealthFactorAfterBurn(
    params.cdp.collateralAmount,
    params.cdp.debtAmount,
    allocation.principalPayment,
    context.collateralPrice,
    params.cdp.config.liquidationRatio
  )

  // Update CDP state based on remaining debt and system settings
  const newState = updateCDPStateAfterBurn(
    params.cdp.state,
    allocation.remainingDebt,
    newHealthFactor,
    context.autoCloseCDP,
    params.timestamp
  )

  // Create updated CDP with reduced debt
  const updatedCDP = createUpdatedCDP(
    params.cdp,
    allocation.principalPayment,
    allocation.feesPayment,
    newState,
    params.timestamp
  )

  // Determine if CDP was closed
  const cdpClosed = newState.type === 'closed'

  // Return successful burning result
  const burnResult: BurnResult = {
    updatedCDP,
    burnedAmount: allocation.totalBurned,
    principalRepaid: allocation.principalPayment,
    feesPaid: allocation.feesPayment,
    newHealthFactor,
    previousHealthFactor,
    cdpClosed,
    remainingDebt: allocation.remainingDebt
  }

  return Result.ok(burnResult)
}

/**
 * Burns NYXUSD from multiple CDPs in batch
 * 
 * Processes an array of NYXUSD burning requests, validating each one
 * and returning results for all operations. This function maintains
 * transaction-like semantics - if any burn fails, the entire batch fails.
 * 
 * @param burns - Array of burning parameter sets
 * @param context - Shared system context for all operations
 * @returns Result containing array of burning results or first error encountered
 * 
 * @example
 * ```typescript
 * const burns = [
 *   { cdp: cdp1, burnAmount: mkAmount(1000000000000000000000n), ... },
 *   { cdp: cdp2, burnAmount: mkAmount(500000000000000000000n), ... }
 * ]
 * 
 * const result = burnNYXUSDBatch(burns, context)
 * if (result.isOk()) {
 *   console.log(`Processed ${result.value.length} burns`)
 * } else {
 *   console.error("Batch burn failed:", result.value)
 * }
 * ```
 */
export const burnNYXUSDBatch = (
  burns: readonly BurnNYXUSDParams[],
  context: BurnContext
): Result<readonly BurnResult[], CDPError> => {
  const results: BurnResult[] = []

  for (const params of burns) {
    const result = burnNYXUSD(params, context)
    if (result.isErr()) {
      return Result.err(result.value)
    }
    results.push(result.value)
  }

  return Result.ok(results)
}

/**
 * Calculates the minimum burn amount needed to improve health factor to target
 * 
 * Determines the minimum amount of NYXUSD that needs to be burned to
 * achieve a specific health factor target for the CDP.
 * 
 * @param cdp - CDP to evaluate
 * @param targetHealthFactor - Desired health factor
 * @param collateralPrice - Current collateral price
 * @param stabilityFeeRate - Annual stability fee rate
 * @param timeElapsed - Time elapsed since last fee accrual
 * @returns Minimum burn amount needed, or 0 if target is already met
 * 
 * @example
 * ```typescript
 * const minBurn = estimateMinBurnForHealthFactor(
 *   riskyCDP,
 *   2.0, // Target 200% health factor
 *   2000000000000000000000n, // $2000 per ETH
 *   0.05, // 5% annual rate
 *   86400 // 1 day
 * )
 * 
 * if (minBurn > 0n) {
 *   console.log(`Need to burn at least ${minBurn} NYXUSD to reach target`)
 * } else {
 *   console.log("Target health factor already achieved")
 * }
 * ```
 */
export const estimateMinBurnForHealthFactor = (
  cdp: CDP,
  targetHealthFactor: number,
  collateralPrice: bigint,
  stabilityFeeRate: number,
  timeElapsed: number
): Amount => {
  // Calculate total debt including accrued fees
  const accruedFees = calculateAccruedFees(cdp.debtAmount, stabilityFeeRate, timeElapsed)
  const totalCurrentDebt = cdp.debtAmount + accruedFees

  if (totalCurrentDebt === 0n) {
    return mkAmount(0n) // No debt to repay
  }

  const currentHealthFactor = calculateCurrentHealthFactor(cdp, collateralPrice)
  
  // If already at or above target, no burn needed
  if (currentHealthFactor >= targetHealthFactor) {
    return mkAmount(0n)
  }

  // Calculate required debt for target health factor
  const collateralValue = cdp.collateralAmount * collateralPrice / BigInt(10**18)
  const liquidationThreshold = collateralValue * BigInt(10000) / BigInt(cdp.config.liquidationRatio)
  const requiredDebt = liquidationThreshold / BigInt(Math.floor(targetHealthFactor * 100)) * BigInt(100)

  if (requiredDebt >= totalCurrentDebt) {
    return mkAmount(0n) // Target cannot be achieved by burning
  }

  const debtReduction = totalCurrentDebt - requiredDebt
  return mkAmount(debtReduction)
}

/**
 * Estimates the health factor improvement from a potential burn
 * 
 * Calculates how much the health factor would improve if a specific
 * amount of NYXUSD were burned, without actually performing the operation.
 * 
 * @param cdp - CDP to evaluate
 * @param burnAmount - Potential burn amount
 * @param collateralPrice - Current collateral price
 * @param stabilityFeeRate - Annual stability fee rate
 * @param timeElapsed - Time elapsed since last fee accrual
 * @returns Object with current and projected health factors
 * 
 * @example
 * ```typescript
 * const improvement = calculateHealthFactorImprovement(
 *   myCDP,
 *   mkAmount(1500000000000000000000n), // 1500 NYXUSD
 *   2000000000000000000000n // $2000 per ETH
 * )
 * 
 * console.log(`Current: ${improvement.current}, After burn: ${improvement.afterBurn}`)
 * console.log(`Improvement: ${improvement.improvement}%`)
 * ```
 */
export const calculateHealthFactorImprovement = (
  cdp: CDP,
  burnAmount: Amount,
  collateralPrice: bigint,
  stabilityFeeRate: number,
  timeElapsed: number
): {
  readonly current: number
  readonly afterBurn: number
  readonly improvement: number
} => {
  const current = calculateCurrentHealthFactor(cdp, collateralPrice)
  
  // Calculate burn allocation
  const accruedFees = calculateAccruedFees(cdp.debtAmount, stabilityFeeRate, timeElapsed)
  const allocation = calculateBurnAllocation(burnAmount, cdp.debtAmount, accruedFees)
  
  const afterBurn = calculateHealthFactorAfterBurn(
    cdp.collateralAmount,
    cdp.debtAmount,
    allocation.principalPayment,
    collateralPrice,
    cdp.config.liquidationRatio
  )

  const improvement = current > 0 && current < Number.MAX_SAFE_INTEGER 
    ? ((afterBurn - current) / current) * 100 
    : 0

  return {
    current,
    afterBurn,
    improvement
  }
}

/**
 * Calculates the total amount needed to fully close a CDP
 * 
 * Determines the exact amount of NYXUSD needed to fully repay all
 * debt and fees to close the CDP completely.
 * 
 * @param cdp - CDP to evaluate for closure
 * @param stabilityFeeRate - Annual stability fee rate
 * @param timeElapsed - Time elapsed since last fee accrual
 * @returns Total amount needed to close the CDP
 * 
 * @example
 * ```typescript
 * const closureAmount = calculateFullClosureAmount(
 *   myCDP,
 *   0.05, // 5% annual rate
 *   86400 // 1 day
 * )
 * console.log(`Need ${closureAmount} NYXUSD to fully close CDP`)
 * ```
 */
export const calculateFullClosureAmount = (
  cdp: CDP,
  stabilityFeeRate: number,
  timeElapsed: number
): Amount => {
  const accruedFees = calculateAccruedFees(cdp.debtAmount, stabilityFeeRate, timeElapsed)
  return mkAmount(cdp.debtAmount + accruedFees)
}