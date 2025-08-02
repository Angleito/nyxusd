import { CDP, CDPId, CDPCreationParams, CDPError, Option } from '@nyxusd/cdp-core';
/**
 * Generic result type for CDP operations
 */
export type CDPResult<T> = Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: CDPError;
}>;
/**
 * Common interface for all blockchain adapters
 */
export interface CDPAdapter {
    createCDP(params: CDPCreationParams): CDPResult<CDP>;
    depositCollateral(params: any): CDPResult<any>;
    withdrawCollateral(params: any): CDPResult<any>;
    mintDebt(params: any): CDPResult<any>;
    burnDebt(params: any): CDPResult<any>;
    getCDP(id: CDPId): CDPResult<Option<CDP>>;
    getCDPsByOwner(owner: string): CDPResult<CDP[]>;
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
//# sourceMappingURL=types.d.ts.map