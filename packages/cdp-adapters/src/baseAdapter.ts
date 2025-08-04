import type {
  CDP,
  CDPId,
  CDPCreationParams,
  CDPError,
  CDPStats,
} from '@nyxusd/cdp-core/src/types';
import {
  CDPAdapter,
  CDPResult,
  BlockchainConfig,
  DepositCollateralParams,
  WithdrawCollateralParams,
  MintNYXUSDParams,
  BurnNYXUSDParams,
  Option,
} from './types';

/**
 * Base adapter class implementing common functionality
 */
export abstract class BaseCDPAdapter implements CDPAdapter {
  protected config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
  }

  // Abstract methods that must be implemented by blockchain-specific adapters
  abstract createCDP(params: CDPCreationParams): CDPResult<CDP>;
  abstract depositCollateral(params: DepositCollateralParams): CDPResult<CDP>;
  abstract withdrawCollateral(params: WithdrawCollateralParams): CDPResult<CDP>;
  abstract mintDebt(params: MintNYXUSDParams): CDPResult<CDP>;
  abstract burnDebt(params: BurnNYXUSDParams): CDPResult<CDP>;
  abstract getCDP(id: CDPId): CDPResult<Option<CDP>>;
  abstract getCDPsByOwner(owner: string): CDPResult<readonly CDP[]>;
  abstract getSystemStats(): CDPResult<CDPStats>;

  // Protected helper methods that can be used by subclasses
  protected validateChainId(chainId: number): boolean {
    return chainId === this.config.chainId;
  }

  protected formatError<T extends string>(
    type: T,
    details: Record<string, unknown>
  ): CDPError {
    return {
      type: type as any,
      ...(details as object),
    } as CDPError;
  }
}