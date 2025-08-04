import { createCDPAdapter, CDPAdapter, BlockchainConfig, CDPResult } from '@nyxusd/cdp-adapters';
import type {
  CDP,
  CDPId,
  CDPCreationParams,
} from '@nyxusd/cdp-core/src/types';
import type {
  DepositCollateralParams,
  WithdrawCollateralParams,
  MintNYXUSDParams,
  BurnNYXUSDParams,
} from '@nyxusd/cdp-adapters';

/**
 * Unified CDP SDK configuration
 */
export interface CDP_SDK_Config {
  readonly chain: string;
  readonly config: BlockchainConfig;
}

/**
 * Unified CDP SDK for multi-chain operations
 */
export class NyxUSD_CDP_SDK {
  private adapter: CDPAdapter;

  constructor(config: CDP_SDK_Config) {
    this.adapter = createCDPAdapter(config.chain, config.config);
  }

  /**
   * Create a new CDP
   */
  async createCDP(params: CDPCreationParams): CDPResult<CDP> {
    return this.adapter.createCDP(params);
  }

  /**
   * Deposit collateral into a CDP
   */
  async depositCollateral(params: DepositCollateralParams): CDPResult<CDP> {
    return this.adapter.depositCollateral(params);
  }

  /**
   * Withdraw collateral from a CDP
   */
  async withdrawCollateral(params: WithdrawCollateralParams): CDPResult<CDP> {
    return this.adapter.withdrawCollateral(params);
  }

  /**
   * Mint debt (nyxUSD) from a CDP
   */
  async mintDebt(params: MintNYXUSDParams): CDPResult<CDP> {
    return this.adapter.mintDebt(params);
  }

  /**
   * Burn debt (nyxUSD) to reduce CDP debt
   */
  async burnDebt(params: BurnNYXUSDParams): CDPResult<CDP> {
    return this.adapter.burnDebt(params);
  }

  /**
   * Get a specific CDP by ID
   */
  async getCDP(id: CDPId): CDPResult<import('@nyxusd/cdp-adapters').Option<CDP>> {
    return this.adapter.getCDP(id);
  }

  /**
   * Get all CDPs owned by an address
   */
  async getCDPsByOwner(owner: string): CDPResult<readonly CDP[]> {
    return this.adapter.getCDPsByOwner(owner);
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): CDPResult<import('@nyxusd/cdp-core/src/types').CDPStats> {
    return this.adapter.getSystemStats();
  }

  /**
   * Switch to a different blockchain adapter
   */
  switchChain(config: CDP_SDK_Config): void {
    this.adapter = createCDPAdapter(config.chain, config.config);
  }
}

// Re-export core types for convenience
export * from '@nyxusd/cdp-core';

// Re-export adapter types for convenience
export { CDPAdapter, BlockchainConfig } from '@nyxusd/cdp-adapters';