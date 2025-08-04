import { createConnector } from 'wagmi'
import { injected } from 'wagmi/connectors'
import type { Address } from 'viem'
import { midnightTestnet } from '../config/chains'

// Types for Midnight DApp Connector API integration (Lace wallet)
interface MidnightDAppConnector {
  isEnabled: () => Promise<boolean>
  enable: () => Promise<MidnightWalletApi>
  serviceUriConfig: () => Promise<ServiceUriConfig>
}

interface MidnightWalletApi {
  state: () => Promise<WalletState>
  balanceTransaction: (transaction: any, newCoins?: any[]) => Promise<any>
  proveTransaction: (provingRecipe: any) => Promise<any>
  submitTransaction: (transaction: any) => Promise<any>
  transferTransaction: (transfers: TransferRequest[]) => Promise<any>
}

interface WalletState {
  address: string
  balance: bigint
  network: string
  connected: boolean
}

interface ServiceUriConfig {
  indexerUrl: string
  indexerWsUrl: string
  nodeUrl: string
  provingServerUrl: string
}

interface TransferRequest {
  amount: bigint
  type: any // TokenType
  receiverAddress: string
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightDAppConnector
    }
  }
}

// Midnight-specific connector configuration
export interface MidnightConnectorOptions {
  shimDisconnect?: boolean
}

// Create a custom connector for Midnight wallet (Lace integration)
export function midnightConnector(options: MidnightConnectorOptions = {}) {
  return createConnector((config) => {
    let walletApi: MidnightWalletApi | null = null
    let currentAddress: Address | null = null
    
    return {
      id: 'midnight-lace',
      name: 'Midnight Wallet (Lace)',
      type: 'midnight' as const,
      icon: 'https://docs.midnight.network/img/midnight-icon.svg',
      
      // Added missing onConnect property
      onConnect() {
        // No specific implementation needed for Midnight connector
        return Promise.resolve()
      },
      
      // Added missing getProvider property
      async getProvider() {
        // For injected connectors like Lace wallet, return the window provider
        return typeof window !== 'undefined' ? window.midnight : undefined
      },
      
      async connect(parameters) {
        try {
          // Check if Lace wallet with Midnight support is available
          if (!window.midnight?.mnLace) {
            throw new Error('Lace wallet with Midnight support not found. Please install the Lace wallet with Midnight extension.')
          }

          const mnLace = window.midnight.mnLace
          
          // Check if already authorized
          const isAuthorized = await mnLace.isEnabled()
          if (!isAuthorized) {
            // Request permission from user
            walletApi = await mnLace.enable()
          } else {
            walletApi = await mnLace.enable()
          }

          // Get wallet state
          const state = await walletApi.state()
          currentAddress = state.address as Address
          
          return {
            accounts: [currentAddress],
            chainId: midnightTestnet.id,
          }
        } catch (error) {
          console.error('Failed to connect to Midnight wallet:', error)
          throw error
        }
      },

      async disconnect() {
        walletApi = null
        currentAddress = null
        config.emitter.emit('disconnect')
      },

      async getAccounts() {
        if (!currentAddress) {
          return []
        }
        return [currentAddress]
      },

      async getChainId() {
        return midnightTestnet.id
      },

      async isAuthorized() {
        if (!window.midnight?.mnLace) {
          return false
        }
        
        try {
          return await window.midnight.mnLace.isEnabled()
        } catch {
          return false
        }
      },

      async switchChain({ chainId }) {
        // Midnight wallet only supports Midnight network
        if (chainId !== midnightTestnet.id) {
          throw new Error('Midnight wallet only supports Midnight network')
        }
        return midnightTestnet
      },

      onAccountsChanged(accounts) {
        if (accounts.length === 0) {
          this.disconnect()
        } else {
          currentAddress = accounts[0] as Address
          config.emitter.emit('change', { accounts: accounts as Address[] })
        }
      },

      onChainChanged(chainId) {
        config.emitter.emit('change', { chainId: Number(chainId) })
      },

      onDisconnect() {
        this.disconnect()
      },

      // Midnight-specific methods
      async getWalletApi() {
        return walletApi
      },

      async getServiceConfig() {
        if (!window.midnight?.mnLace) {
          throw new Error('Midnight wallet not available')
        }
        return await window.midnight.mnLace.serviceUriConfig()
      },
    }
  })
}

// Helper function to check if Midnight wallet (Lace) is installed
export function isMidnightWalletInstalled(): boolean {
  return typeof window !== 'undefined' && Boolean(window.midnight?.mnLace)
}

// Helper function to request Midnight wallet installation
export function requestMidnightWalletInstall() {
  if (typeof window !== 'undefined') {
    window.open('https://docs.midnight.network/relnotes/lace', '_blank')
  }
}

// Helper function to check wallet connection status
export async function getMidnightWalletStatus() {
  if (!isMidnightWalletInstalled()) {
    return { installed: false, connected: false }
  }

  try {
    const isEnabled = await window.midnight!.mnLace!.isEnabled()
    return { installed: true, connected: isEnabled }
  } catch {
    return { installed: true, connected: false }
  }
}