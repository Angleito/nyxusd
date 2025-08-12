/**
 * Unified test utilities for NyxUSD
 * Consolidated mock data and utilities to replace duplicate test code
 */

// Core CDP types - simplified for testing
export interface MockCDP {
  id: string;
  owner: string;
  collateralValue: number;
  debtAmount: bigint;
  healthFactor: number;
}

export interface MockWallet {
  address: string;
  balance: bigint;
  tokens: Array<{ symbol: string; amount: bigint }>;
}

export interface MockUserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoal: string;
  timeline: string;
}

/**
 * Centralized test utilities
 */
export const testUtils = {
  // CDP Generators
  generateMockCDP: (overrides: Partial<MockCDP> = {}): MockCDP => ({
    id: `cdp_${Math.random().toString(36).substr(2, 9)}`,
    owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    collateralValue: 10000,
    debtAmount: 6000n,
    healthFactor: 1.67,
    ...overrides
  }),

  // Wallet Generators
  generateMockWallet: (overrides: Partial<MockWallet> = {}): MockWallet => ({
    address: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
    balance: 1000000000000000000n, // 1 ETH
    tokens: [
      { symbol: 'USDC', amount: 5000000000n }, // 5000 USDC
      { symbol: 'WETH', amount: 500000000000000000n } // 0.5 WETH
    ],
    ...overrides
  }),

  // User Profile Generators
  generateMockProfile: (type: 'conservative' | 'moderate' | 'aggressive' = 'moderate'): MockUserProfile => {
    const profiles = {
      conservative: {
        riskTolerance: 'conservative' as const,
        investmentGoal: 'preservation',
        timeline: '2 years'
      },
      moderate: {
        riskTolerance: 'moderate' as const,
        investmentGoal: 'growth',
        timeline: '5 years'
      },
      aggressive: {
        riskTolerance: 'aggressive' as const,
        investmentGoal: 'maximum_growth',
        timeline: '10 years'
      }
    };
    return profiles[type];
  },

  // Common assertions
  expectValidCDP: (cdp: MockCDP) => {
    expect(cdp.id).toBeTruthy();
    expect(cdp.owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(cdp.collateralValue).toBeGreaterThan(0);
    expect(cdp.healthFactor).toBeGreaterThan(0);
  },

  expectValidWallet: (wallet: MockWallet) => {
    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(wallet.balance).toBeGreaterThanOrEqual(0n);
    expect(Array.isArray(wallet.tokens)).toBe(true);
  },

  // Test data sets
  samples: {
    healthyCDP: {
      id: 'healthy_cdp_001',
      owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
      collateralValue: 10000,
      debtAmount: 5000n,
      healthFactor: 2.0
    },
    
    riskyCDP: {
      id: 'risky_cdp_001',
      owner: '0x742d35cc6601c7a0dc85b9f6d3a6c157aa3b2f5c',
      collateralValue: 5000,
      debtAmount: 4500n,
      healthFactor: 1.1
    }
  }
};

export default testUtils;
