import { BlockchainConfig } from '@nyxusd/cdp-adapters';
import { CDP, CDPId, CDPCreationParams, DepositCollateralParams, WithdrawCollateralParams, MintNYXUSDParams, BurnNYXUSDParams } from '@nyxusd/cdp-core';
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
export declare class NyxUSD_CDP_SDK {
    private adapter;
    constructor(config: CDP_SDK_Config);
    /**
     * Create a new CDP
     */
    createCDP(params: CDPCreationParams): Promise<{
        success: true;
        data: CDP;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Deposit collateral into a CDP
     */
    depositCollateral(params: DepositCollateralParams): Promise<{
        success: true;
        data: any;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Withdraw collateral from a CDP
     */
    withdrawCollateral(params: WithdrawCollateralParams): Promise<{
        success: true;
        data: any;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Mint debt (nyxUSD) from a CDP
     */
    mintDebt(params: MintNYXUSDParams): Promise<{
        success: true;
        data: any;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Burn debt (nyxUSD) to reduce CDP debt
     */
    burnDebt(params: BurnNYXUSDParams): Promise<{
        success: true;
        data: any;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Get a specific CDP by ID
     */
    getCDP(id: CDPId): Promise<{
        success: true;
        data: any;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Get all CDPs owned by an address
     */
    getCDPsByOwner(owner: string): Promise<{
        success: true;
        data: CDP[];
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Get system statistics
     */
    getSystemStats(): Promise<{
        success: true;
        data: any;
    } | {
        success: false;
        error: any;
    }>;
    /**
     * Switch to a different blockchain adapter
     */
    switchChain(config: CDP_SDK_Config): void;
}
export * from '@nyxusd/cdp-core';
export { CDPAdapter, BlockchainConfig } from '@nyxusd/cdp-adapters';
//# sourceMappingURL=index.d.ts.map