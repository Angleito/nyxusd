import {
  CDP,
  CDPId,
  CDPCreationParams,
  CDPError,
  Amount,
  CDPStats,
} from '@nyxusd/cdp-core';

/**
 * Lightweight Option to avoid adding fp-ts as a hard dependency here.
 * Aligns with usage in cdp-core adapters returning None/Some-like shapes.
 */
export type Option<A> =
  | { readonly _tag: 'None' }
  | { readonly _tag: 'Some'; readonly value: A };

/**
 * Standardized Result shape for adapter operations.
 * This is exported so SDK and consumers can share the same surface.
 */
export type CDPResult<T> = Promise<
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: CDPError }
>;

/**
 * Parameter types for adapter operations.
 * These mirror cdp-core operation inputs to remove implicit any.
 */
export interface DepositCollateralParams {
  readonly cdp: CDP;
  readonly depositAmount: Amount;
  readonly depositor: string;
  readonly timestamp: number;
}

export interface WithdrawCollateralParams {
  readonly cdp: CDP;
  readonly withdrawAmount: Amount;
  readonly withdrawer: string;
  readonly timestamp: number;
}

export interface MintNYXUSDParams {
  readonly cdp: CDP;
  readonly mintAmount: Amount;
  readonly minter: string;
  readonly timestamp: number;
}

export interface BurnNYXUSDParams {
  readonly cdp: CDP;
  readonly burnAmount: Amount;
  readonly burner: string;
  readonly timestamp: number;
}

/**
 * Common interface for all blockchain adapters with explicit types.
 * Avoids any in signatures and unifies return/result shapes.
 */
export interface CDPAdapter {
  // CDP Creation
  createCDP(params: CDPCreationParams): CDPResult<CDP>;

  // Collateral Operations
  depositCollateral(params: DepositCollateralParams): CDPResult<CDP>;
  withdrawCollateral(params: WithdrawCollateralParams): CDPResult<CDP>;

  // Debt Operations
  mintDebt(params: MintNYXUSDParams): CDPResult<CDP>;
  burnDebt(params: BurnNYXUSDParams): CDPResult<CDP>;

  // Query Operations
  getCDP(id: CDPId): CDPResult<Option<CDP>>;
  getCDPsByOwner(owner: string): CDPResult<readonly CDP[]>;

  // System Operations
  getSystemStats(): CDPResult<CDPStats>;
}

/**
 * Blockchain configuration
 */
export interface BlockchainConfig {
  readonly chainId: number;
  readonly rpcUrl: string;
  readonly contracts: {
    readonly cdpManager: string;
    readonly nyxUSD: string;
    readonly oracle: string;
  };
}