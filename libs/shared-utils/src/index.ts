/**
 * Shared utilities index
 * Single point of access for all common utilities
 */

export * from './validation';

// Test utilities (consolidated)
export const TEST_UTILS = {
  generateMockWallet: () => ({
    address: '0x742d35Cc6634C0532925a3b8D',
    balance: 1000000000000000000000n,
    connected: true
  }),
  
  generateMockCDP: () => ({
    id: 'test-cdp-123',
    owner: '0x742d35Cc6634C0532925a3b8D',
    collateralAmount: 1000000000000000000000n,
    debtAmount: 500000000000000000000n,
    healthFactor: 2.5
  }),
  
  expectOk: <T>(result: { success: boolean; data?: T; error?: any }): T => {
    if (!result.success) {
      throw new Error(`Expected success but got error: ${result.error}`);
    }
    return result.data as T;
  }
};

// Common constants (consolidated from multiple files)
export const CONSTANTS = {
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  MAX_UINT256: 2n ** 256n - 1n,
  SECONDS_PER_YEAR: 365.25 * 24 * 60 * 60,
  BASIS_POINTS_SCALE: 10000
};
