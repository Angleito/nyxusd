import { createConfig, http } from 'wagmi'
import { 
  mainnet, 
  sepolia,
  arbitrum, 
  arbitrumSepolia,
  optimism,
  base,
  baseSepolia
} from 'viem/chains'
import { midnightTestnet } from './chains'
import { rainbowkitConnectors } from './rainbowkit'
import { midnightConnector } from '../connectors/midnightConnector'

// Production-ready public RPC endpoints
const PUBLIC_RPC_URLS = {
  // Ethereum Mainnet
  ethereum: [
    'https://eth.llamarpc.com',
    'https://ethereum.publicnode.com',
    'https://eth.drpc.org',
    'https://rpc.ankr.com/eth',
    'https://cloudflare-eth.com'
  ],
  
  // Base (Coinbase L2)
  base: [
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.publicnode.com',
    'https://base.drpc.org',
    'https://rpc.ankr.com/base'
  ],
  
  // Arbitrum One
  arbitrum: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.llamarpc.com',
    'https://arbitrum-one.publicnode.com',
    'https://arbitrum.drpc.org',
    'https://rpc.ankr.com/arbitrum'
  ],
  
  // Optimism
  optimism: [
    'https://mainnet.optimism.io',
    'https://optimism.llamarpc.com',
    'https://optimism.publicnode.com',
    'https://optimism.drpc.org',
    'https://rpc.ankr.com/optimism'
  ],
  
  // Testnets
  sepolia: [
    'https://ethereum-sepolia.publicnode.com',
    'https://rpc.ankr.com/eth_sepolia',
    'https://sepolia.drpc.org'
  ],
  
  baseSepolia: [
    'https://sepolia.base.org',
    'https://base-sepolia.publicnode.com'
  ],
  
  arbitrumSepolia: [
    'https://sepolia-rollup.arbitrum.io/rpc',
    'https://arbitrum-sepolia.publicnode.com'
  ]
}

// Get environment variables
const enableTestnets = import.meta.env.VITE_ENABLE_TESTNETS === 'true'

// Define chains based on environment
const chains = enableTestnets 
  ? [mainnet, base, arbitrum, optimism, sepolia, baseSepolia, arbitrumSepolia, midnightTestnet] as const
  : [mainnet, base, arbitrum, optimism] as const

// RPC transport configuration with fallback URLs
const transports = {
  // Mainnet chains
  [mainnet.id]: http(PUBLIC_RPC_URLS.ethereum[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  [base.id]: http(PUBLIC_RPC_URLS.base[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  [arbitrum.id]: http(PUBLIC_RPC_URLS.arbitrum[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  [optimism.id]: http(PUBLIC_RPC_URLS.optimism[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  // Testnet chains
  [sepolia.id]: http(PUBLIC_RPC_URLS.sepolia[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  [baseSepolia.id]: http(PUBLIC_RPC_URLS.baseSepolia[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  [arbitrumSepolia.id]: http(PUBLIC_RPC_URLS.arbitrumSepolia[0], {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
  
  [midnightTestnet.id]: http('https://rpc.testnet-02.midnight.network', {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
}

// Create wagmi config using RainbowKit connectors plus our custom Midnight connector
export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [
    ...rainbowkitConnectors,
    // Add Midnight Protocol wallet connector
    midnightConnector({
      shimDisconnect: true,
    }),
  ],
  ssr: false, // Disable SSR to avoid hydration issues
})

// Export chain IDs for convenience
export const chainIds = {
  mainnet: mainnet.id,
  base: base.id,
  arbitrum: arbitrum.id,
  optimism: optimism.id,
  sepolia: sepolia.id,
  baseSepolia: baseSepolia.id,
  arbitrumSepolia: arbitrumSepolia.id,
  midnightTestnet: midnightTestnet.id,
} as const

// Export supported chains
export { chains }

// Export RPC URLs for use in other parts of the app
export { PUBLIC_RPC_URLS }