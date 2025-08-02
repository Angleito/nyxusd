"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NyxUSD_CDP_SDK = void 0;
const tslib_1 = require("tslib");
const cdp_adapters_1 = require("@nyxusd/cdp-adapters");
/**
 * Unified CDP SDK for multi-chain operations
 */
class NyxUSD_CDP_SDK {
    constructor(config) {
        this.adapter = (0, cdp_adapters_1.createCDPAdapter)(config.chain, config.config);
    }
    /**
     * Create a new CDP
     */
    async createCDP(params) {
        return this.adapter.createCDP(params);
    }
    /**
     * Deposit collateral into a CDP
     */
    async depositCollateral(params) {
        return this.adapter.depositCollateral(params);
    }
    /**
     * Withdraw collateral from a CDP
     */
    async withdrawCollateral(params) {
        return this.adapter.withdrawCollateral(params);
    }
    /**
     * Mint debt (nyxUSD) from a CDP
     */
    async mintDebt(params) {
        return this.adapter.mintDebt(params);
    }
    /**
     * Burn debt (nyxUSD) to reduce CDP debt
     */
    async burnDebt(params) {
        return this.adapter.burnDebt(params);
    }
    /**
     * Get a specific CDP by ID
     */
    async getCDP(id) {
        return this.adapter.getCDP(id);
    }
    /**
     * Get all CDPs owned by an address
     */
    async getCDPsByOwner(owner) {
        return this.adapter.getCDPsByOwner(owner);
    }
    /**
     * Get system statistics
     */
    async getSystemStats() {
        return this.adapter.getSystemStats();
    }
    /**
     * Switch to a different blockchain adapter
     */
    switchChain(config) {
        this.adapter = (0, cdp_adapters_1.createCDPAdapter)(config.chain, config.config);
    }
}
exports.NyxUSD_CDP_SDK = NyxUSD_CDP_SDK;
// Re-export core types for convenience
tslib_1.__exportStar(require("@nyxusd/cdp-core"), exports);
//# sourceMappingURL=index.js.map