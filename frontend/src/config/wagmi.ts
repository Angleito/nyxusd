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
import { 
  injected, 
  metaMask, 
  walletConnect, 
  coinbaseWallet,
  safe
} from 'wagmi/connectors'
import { midnightConnector } from '../connectors/midnightConnector'

// Get environment variables
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY
const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
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

// Create wagmi config
export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [
    // Injected connector (detects MetaMask, Rabby, Frame, etc.)
    injected({
      target() {
        return {
          id: 'injected',
          name: 'Browser Wallet',
          provider: window.ethereum,
        }
      }
    }),
    
    // MetaMask specific connector
    metaMask({
      dappMetadata: {
        name: 'NYX USD',
        url: window.location.origin,
      },
    }),
    
    // WalletConnect v2 (supports 300+ wallets including Uniswap, Trust, Rainbow, etc.)
    ...(walletConnectProjectId ? [
      walletConnect({
        projectId: walletConnectProjectId,
        metadata: {
          name: 'NYX USD',
          description: 'Privacy-preserving CDP protocol on Midnight Protocol',
          url: window.location.origin,
          icons: ['/logo.png'],
        },
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'light',
          themeVariables: {
            '--wcm-accent-color': '#7c3aed',
          },
        },
      })
    ] : []),
    
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'NYX USD',
      appLogoUrl: '/logo.png',
      preference: 'all', // Support both extension and mobile
    }),
    
    // Safe (Gnosis Safe) wallet
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
    }),
    
    // Midnight Protocol wallet connector
    midnightConnector({
      shimDisconnect: true,
    }),
  ],
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