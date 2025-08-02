import { createCDPAdapter, CDPAdapter, BlockchainConfig } from '@nyxusd/cdp-adapters';
import { 
  CDP, 
  CDPId, 
  CDPCreationParams,
  DepositCollateralParams,
  WithdrawCollateralParams,
  MintNYXUSDParams,
  BurnNYXUSDParams
} from '@nyxusd/cdp-core';

/**
 * Unified CDP SDK configuration
 */
export interface CDP_SDK_Config {
  chain: string;
  config: BlockchainConfig;
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
  async createCDP(params: CDPCreationParams): Promise<
    { success: true; data: CDP } | 
    { success: false; error: any }
  > {
    return this.adapter.createCDP(params);
  }
  
  /**
   * Deposit collateral into a CDP
   */
  async depositCollateral(params: DepositCollateralParams): Promise<
    { success: true; data: any } | 
    { success: false; error: any }
  > {
    return this.adapter.depositCollateral(params);
  }
  
  /**
   * Withdraw collateral from a CDP
   */
  async withdrawCollateral(params: WithdrawCollateralParams): Promise<
    { success: true; data: any } | 
    { success: false; error: any }
  > {
    return this.adapter.withdrawCollateral(params);
  }
  
  /**
   * Mint debt (nyxUSD) from a CDP
   */
  async mintDebt(params: MintNYXUSDParams): Promise<
    { success: true; data: any } | 
    { success: false; error: any }
  > {
    return this.adapter.mintDebt(params);
  }
  
  /**
   * Burn debt (nyxUSD) to reduce CDP debt
   */
  async burnDebt(params: BurnNYXUSDParams): Promise<
    { success: true; data: any } | 
    { success: false; error: any }
  > {
    return this.adapter.burnDebt(params);
  }
  
  /**
   * Get a specific CDP by ID
   */
  async getCDP(id: CDPId): Promise<
    { success: true; data: any } | 
    { success: false; error: any }
  > {
    return this.adapter.getCDP(id);
  }
  
  /**
   * Get all CDPs owned by an address
   */
  async getCDPsByOwner(owner: string): Promise<
    { success: true; data: CDP[] } | 
    { success: false; error: any }
  > {
    return this.adapter.getCDPsByOwner(owner);
  }
  
  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<
    { success: true; data: any } | 
    { success: false; error: any }
  > {
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