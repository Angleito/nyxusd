import React from "react";
import { useMidnightWallet } from "../../hooks/useMidnightWallet";
import { formatBalance } from "../../lib/wallet";

/**
 * Card component specifically for Midnight wallet integration
 * Shows installation status, connection state, and wallet details
 */
export const MidnightWalletCard: React.FC = () => {
  const {
    installed,
    connected,
    address,
    balance,
    network,
    loading,
    error,
    connect,
    installWallet,
  } = useMidnightWallet();

  if (loading) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
          <div className="h-5 bg-purple-200 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-purple-200 rounded w-full"></div>
          <div className="h-4 bg-purple-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="text-red-500 text-xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-800 mb-2">Midnight Wallet Error</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!installed) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <h3 className="font-semibold text-purple-800 mb-2">Midnight Wallet Not Found</h3>
          <p className="text-sm text-purple-600 mb-4">
            Install the Lace wallet with Midnight support to access privacy-preserving features.
          </p>
          <button
            onClick={installWallet}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Install Midnight Wallet
          </button>
          <div className="mt-4 text-xs text-purple-500">
            <p>Features include:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Zero-knowledge privacy proofs</li>
              <li>• Dual ledger (shielded & unshielded)</li>
              <li>• NIGHT & DUST token support</li>
              <li>• Privacy-preserving CDP operations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">🌙</div>
          <div>
            <h3 className="font-semibold text-purple-800">Midnight Wallet</h3>
            <p className="text-sm text-purple-600">Ready to connect</p>
          </div>
        </div>
        <button
          onClick={connect}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Connect Midnight Wallet
        </button>
        <div className="mt-3 text-xs text-purple-500 text-center">
          Privacy-preserving transactions on Midnight Protocol
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌙</div>
          <div>
            <h3 className="font-semibold text-purple-800">Midnight Wallet</h3>
            <p className="text-sm text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </p>
          </div>
        </div>
        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
          {network || 'Midnight'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Address:</span>
            <span className="text-xs font-mono text-gray-800">
              {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Unknown'}
            </span>
          </div>
        </div>

        {balance !== undefined && (
          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">DUST Balance:</span>
              <span className="text-xs font-medium text-gray-800">
                {formatBalance(balance, 18)} DUST
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">Privacy</div>
            <div className="text-sm font-medium text-green-600">Enabled</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">ZK Proofs</div>
            <div className="text-sm font-medium text-purple-600">Ready</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-purple-100">
        <p className="text-xs text-purple-600 text-center">
          🔒 Your transactions are protected by zero-knowledge proofs
        </p>
      </div>
    </div>
  );
};

export default MidnightWalletCard;