import { CDP, CDPId, CDPCreationParams, CDPError, Option } from '@nyxusd/cdp-core';
import { CDPAdapter, CDPResult, BlockchainConfig } from './types';

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
  abstract depositCollateral(params: any): CDPResult<any>;
  abstract withdrawCollateral(params: any): CDPResult<any>;
  abstract mintDebt(params: any): CDPResult<any>;
  abstract burnDebt(params: any): CDPResult<any>;
  abstract getCDP(id: CDPId): CDPResult<Option<CDP>>;
  abstract getCDPsByOwner(owner: string): CDPResult<CDP[]>;
  abstract getSystemStats(): CDPResult<any>;
  
  // Protected helper methods that can be used by subclasses
  protected validateChainId(chainId: number): boolean {
    return chainId === this.config.chainId;
  }
  
  protected formatError(type: string, details: any): CDPError {
    return {
      type,
      ...details
    } as CDPError;
  }
}