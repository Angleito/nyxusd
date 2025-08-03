import { defineChain } from 'viem'

// Midnight Testnet configuration
export const midnightTestnet = defineChain({
  id: 99999, // Placeholder ID - update when official chain ID is available
  name: 'Midnight Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'DUST',
    symbol: 'DUST',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_MIDNIGHT_RPC_URL || 'https://rpc.testnet-02.midnight.network'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Midnight Explorer', 
      url: 'https://explorer.testnet-02.midnight.network' 
    },
  },
  testnet: true,
})

// Re-export common chains for convenience
export { mainnet, sepolia, arbitrum, arbitrumSepolia, optimism, base, baseSepolia } from 'viem/chains'