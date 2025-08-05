/**
 * Demo mode configuration for hackathon presentations
 */

export interface DemoWallet {
  address: string;
  privateKey: string;
  name: string;
  tokens: {
    [symbol: string]: {
      balance: string;
      decimals: number;
    };
  };
}

export interface DemoConfig {
  enabled: boolean;
  testWallets: DemoWallet[];
  defaultChain: number;
  autoConnectWallet: boolean;
  skipTransactionConfirmation: boolean;
  mockTransactionHash: boolean;
  voiceAutoStart: boolean;
  showDemoIndicator: boolean;
}

// Pre-funded test wallets for demo (Base Sepolia testnet)
export const DEMO_WALLETS: DemoWallet[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    privateKey: '', // Not exposed in frontend
    name: 'Demo Wallet 1',
    tokens: {
      ETH: { balance: '10.0', decimals: 18 },
      USDC: { balance: '10000.0', decimals: 6 },
      AERO: { balance: '5000.0', decimals: 18 },
      DEGEN: { balance: '100000.0', decimals: 18 },
    }
  },
  {
    address: '0x0987654321098765432109876543210987654321',
    privateKey: '', // Not exposed in frontend
    name: 'Demo Wallet 2',
    tokens: {
      ETH: { balance: '5.0', decimals: 18 },
      USDC: { balance: '5000.0', decimals: 6 },
      BRETT: { balance: '50000.0', decimals: 18 },
      MORPHO: { balance: '1000.0', decimals: 18 },
    }
  }
];

export const DEMO_CONFIG: DemoConfig = {
  enabled: false, // Set via environment variable
  testWallets: DEMO_WALLETS,
  defaultChain: 84532, // Base Sepolia
  autoConnectWallet: true,
  skipTransactionConfirmation: false,
  mockTransactionHash: true,
  voiceAutoStart: true,
  showDemoIndicator: true,
};

// Demo transaction responses for quick testing
export const DEMO_TRANSACTIONS = {
  swap: {
    hash: '0xdemo1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    status: 'success',
    gasUsed: '150000',
    effectiveGasPrice: '1500000000',
    blockNumber: 12345678,
  },
  approve: {
    hash: '0xdemo0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe',
    status: 'success',
    gasUsed: '50000',
    effectiveGasPrice: '1500000000',
    blockNumber: 12345677,
  }
};

export const isDemoMode = (): boolean => {
  return process.env.VITE_DEMO_MODE === 'true' || DEMO_CONFIG.enabled;
};

export const getDemoWallet = (index: number = 0): DemoWallet | null => {
  if (!isDemoMode() || !DEMO_CONFIG.testWallets[index]) {
    return null;
  }
  return DEMO_CONFIG.testWallets[index];
};

export const generateMockTxHash = (): string => {
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).substring(2, 10);
  return `0xdemo${timestamp}${random}${'0'.repeat(64 - timestamp.length - random.length - 4)}`;
};

// Helper to simulate transaction delays
export const simulateTransactionDelay = async (type: 'swap' | 'approve' = 'swap'): Promise<void> => {
  const delay = type === 'swap' ? 3000 : 1500;
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Demo scenarios for voice commands
export const DEMO_SCENARIOS = [
  {
    id: 'simple-swap',
    description: 'Simple token swap',
    voiceCommand: 'Swap 1 ETH for USDC',
    expectedAction: {
      type: 'swap',
      inputToken: 'ETH',
      outputToken: 'USDC',
      amount: '1',
    }
  },
  {
    id: 'cross-chain-swap',
    description: 'Cross-chain swap',
    voiceCommand: 'Swap ETH on Arbitrum to USDC on Base',
    expectedAction: {
      type: 'swap',
      inputToken: 'ETH',
      outputToken: 'USDC',
      sourceChain: 'Arbitrum',
      destinationChain: 'Base',
      isCrossChain: true,
    }
  },
  {
    id: 'percentage-swap',
    description: 'Percentage-based swap',
    voiceCommand: 'Swap 50% of my AERO to ETH',
    expectedAction: {
      type: 'swap',
      inputToken: 'AERO',
      outputToken: 'ETH',
      amount: '50',
      isPercentage: true,
    }
  },
  {
    id: 'defi-yield',
    description: 'Find yield opportunities',
    voiceCommand: 'Show me the best DeFi yields on Base',
    expectedAction: {
      type: 'defi',
      chain: 'Base',
      query: 'yield',
    }
  },
  {
    id: 'portfolio-check',
    description: 'Check portfolio',
    voiceCommand: 'What is my portfolio worth?',
    expectedAction: {
      type: 'portfolio',
      query: 'total',
    }
  }
];

export default {
  DEMO_CONFIG,
  DEMO_WALLETS,
  DEMO_TRANSACTIONS,
  DEMO_SCENARIOS,
  isDemoMode,
  getDemoWallet,
  generateMockTxHash,
  simulateTransactionDelay,
};