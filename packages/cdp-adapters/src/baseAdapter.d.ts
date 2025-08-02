import { CDP, CDPId, CDPCreationParams, CDPError, Option } from '@nyxusd/cdp-core';
import { CDPAdapter, CDPResult, BlockchainConfig } from './types';
/**
 * Base adapter class implementing common functionality
 */
export declare abstract class BaseCDPAdapter implements CDPAdapter {
    protected config: BlockchainConfig;
    constructor(config: BlockchainConfig);
    abstract createCDP(params: CDPCreationParams): CDPResult<CDP>;
    abstract depositCollateral(params: any): CDPResult<any>;
    abstract withdrawCollateral(params: any): CDPResult<any>;
    abstract mintDebt(params: any): CDPResult<any>;
    abstract burnDebt(params: any): CDPResult<any>;
    abstract getCDP(id: CDPId): CDPResult<Option<CDP>>;
    abstract getCDPsByOwner(owner: string): CDPResult<CDP[]>;
    abstract getSystemStats(): CDPResult<any>;
    protected validateChainId(chainId: number): boolean;
    protected formatError(type: string, details: any): CDPError;
}
//# sourceMappingURL=baseAdapter.d.ts.map