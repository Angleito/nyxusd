import React, { useState } from 'react'
import { formatAddress, getWalletErrorMessage } from '../../lib/wallet'

// Mock hooks for demonstration
const useAccount = () => ({ address: undefined, isConnected: false })
const useConnect = () => ({ 
  connect: () => {}, 
  connectors: [{ id: 'injected', name: 'Injected' }, { id: 'metaMask', name: 'MetaMask' }], 
  isPending: false, 
  error: null 
})
const useDisconnect = () => ({ disconnect: () => {} })

export interface WalletConnectButtonProps {
  className?: string
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  className = ''
}) => {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectors, setShowConnectors] = useState(false)

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c: any) => c.id === connectorId)
    if (connector) {
      connect({ connector })
    }
    setShowConnectors(false)
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected && address) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="relative">
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        {/* Dropdown for connector selection */}
        {showConnectors && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {connectors.map((connector: any) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector.id)}
                disabled={isPending}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      {connector.name.charAt(0)}
                    </span>
                  </div>
                  <span>{connector.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {getWalletErrorMessage(error)}
        </div>
      )}
    </div>
  )
}

export default WalletConnectButton