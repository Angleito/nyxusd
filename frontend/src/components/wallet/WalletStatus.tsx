import React from "react";
import { useWallet, useWalletEvents } from "../../hooks/useWallet";
import { formatAddress, formatBalance, getChainName } from "../../lib/wallet";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Component that displays wallet connection status with proper loading and error states
 */
export const WalletStatus: React.FC = () => {
  const {
    address,
    isConnected,
    isLoading,
    isWrongNetwork,
    chainId,
    balance,
    error,
    clearError,
    switchToMainnet,
  } = useWallet();

  // Handle wallet events
  useWalletEvents({
    onConnect: (addr) => {
      console.log('Wallet connected:', addr);
    },
    onDisconnect: () => {
      console.log('Wallet disconnected');
    },
    onChainChange: (id) => {
      console.log('Chain changed to:', getChainName(id));
    },
    onAccountChange: (addr) => {
      console.log('Account changed to:', addr);
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Connection Error</p>
            <p className="text-sm text-red-600 mt-1">{error.message}</p>
            <button
              onClick={clearError}
              className="text-sm text-red-700 underline mt-2 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">No wallet connected</p>
            <p className="text-xs text-gray-500">Connect a wallet to get started</p>
          </div>
        </div>
      </div>
    );
  }

  // Wrong network warning
  if (isWrongNetwork) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Wrong Network</p>
            <p className="text-sm text-yellow-600 mt-1">
              Connected to {getChainName(chainId)}. Please switch to Ethereum Mainnet.
            </p>
            <button
              onClick={switchToMainnet}
              className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
            >
              Switch Network
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected successfully
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Wallet Connected</p>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              {getChainName(chainId)}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Address:</span>
              <span className="text-xs font-mono text-gray-800">
                {address && formatAddress(address)}
              </span>
            </div>
            
            {balance && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Balance:</span>
                <span className="text-xs font-medium text-gray-800">
                  {formatBalance(balance.value, balance.decimals)} {balance.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletStatus;