import { createConfig, http } from 'wagmi'
import { 
  mainnet, 
  sepolia, 
  polygon, 
  polygonMumbai, 
  arbitrum, 
  arbitrumSepolia,
  midnightTestnet 
} from './chains'
import { rainbowkitConnectors } from './rainbowkit'
import { midnightConnector } from '../connectors/midnightConnector'

// Get environment variables
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY
const enableTestnets = import.meta.env.VITE_ENABLE_TESTNETS === 'true'

// Define chains based on environment
const chains = enableTestnets 
  ? [mainnet, sepolia, polygon, polygonMumbai, arbitrum, arbitrumSepolia, midnightTestnet] as const
  : [mainnet, polygon, arbitrum] as const

// RPC transport configuration
const transports = {
  [mainnet.id]: alchemyApiKey 
    ? http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`)
    : http(),
  [sepolia.id]: alchemyApiKey
    ? http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`)
    : http(),
  [polygon.id]: alchemyApiKey
    ? http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`)
    : http(),
  [polygonMumbai.id]: alchemyApiKey
    ? http(`https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`)
    : http(),
  [arbitrum.id]: alchemyApiKey
    ? http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`)
    : http(),
  [arbitrumSepolia.id]: alchemyApiKey
    ? http(`https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`)
    : http(),
  [midnightTestnet.id]: http(import.meta.env.VITE_MIDNIGHT_RPC_URL || 'https://rpc.testnet-02.midnight.network'),
}

// Create wagmi config using RainbowKit connectors plus our custom Midnight connector
export const wagmiConfig = createConfig({
  chains,
  transports,
  multiInjectedProviderDiscovery: false,
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
  sepolia: sepolia.id,
  polygon: polygon.id,
  polygonMumbai: polygonMumbai.id,
  arbitrum: arbitrum.id,
  arbitrumSepolia: arbitrumSepolia.id,
  midnightTestnet: midnightTestnet.id,
} as const

// Export supported chains
export { chains }