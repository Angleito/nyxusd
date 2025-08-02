import { 
  CDP, 
  CDPId, 
  CDPCreationParams, 
  CDPError, 
  Amount,
  Option
} from '@nyxusd/cdp-core';

/**
 * Generic result type for CDP operations
 */
export type CDPResult<T> = Promise<
  { success: true; data: T } | 
  { success: false; error: CDPError }
>;

/**
 * Common interface for all blockchain adapters
 */
export interface CDPAdapter {
  // CDP Creation
  createCDP(params: CDPCreationParams): CDPResult<CDP>;
  
  // Collateral Operations
  depositCollateral(params: any): CDPResult<any>;
  withdrawCollateral(params: any): CDPResult<any>;
  
  // Debt Operations
  mintDebt(params: any): CDPResult<any>;
  burnDebt(params: any): CDPResult<any>;
  
  // Query Operations
  getCDP(id: CDPId): CDPResult<Option<CDP>>;
  getCDPsByOwner(owner: string): CDPResult<CDP[]>;
  
  // System Operations
  getSystemStats(): CDPResult<any>;
}

/**
 * Blockchain configuration
 */
export interface BlockchainConfig {
  chainId: number;
  rpcUrl: string;
  contracts: {
    cdpManager: string;
    nyxUSD: string;
    oracle: string;
  };
}