"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCDPAdapter = void 0;
/**
 * Base adapter class implementing common functionality
 */
class BaseCDPAdapter {
    constructor(config) {
        this.config = config;
    }
    // Protected helper methods that can be used by subclasses
    validateChainId(chainId) {
        return chainId === this.config.chainId;
    }
    formatError(type, details) {
        return {
            type,
            ...details
        };
    }
}
exports.BaseCDPAdapter = BaseCDPAdapter;
//# sourceMappingURL=baseAdapter.js.map