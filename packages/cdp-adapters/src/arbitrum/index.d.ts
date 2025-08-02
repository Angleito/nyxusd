import { BaseCDPAdapter } from '../baseAdapter';
import { CDP, CDPId, CDPCreationParams, Option } from '@nyxusd/cdp-core';
import { CDPResult, BlockchainConfig } from '../types';
/**
 * Arbitrum adapter for CDP operations
 */
export declare class ArbitrumCDPAdapter extends BaseCDPAdapter {
    constructor(config: BlockchainConfig);
    createCDP(params: CDPCreationParams): CDPResult<CDP>;
    depositCollateral(params: any): CDPResult<any>;
    withdrawCollateral(params: any): CDPResult<any>;
    mintDebt(params: any): CDPResult<any>;
    burnDebt(params: any): CDPResult<any>;
    getCDP(id: CDPId): CDPResult<Option<CDP>>;
    getCDPsByOwner(owner: string): CDPResult<CDP[]>;
    getSystemStats(): CDPResult<any>;
}
//# sourceMappingURL=index.d.ts.map