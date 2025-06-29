import React from "react";
import WalletConnectButton from "./WalletConnectButton";
import { RainbowKitButton, CustomConnectButton } from "./RainbowKitButton";
import { useAccount, useBalance, useChainId } from "wagmi";
import { formatBalance, getChainName } from "../../lib/wallet";

/**
 * Demo component showing different wallet connection options
 * This can be used as a reference for implementing wallet connections
 */
export const WalletDemo: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
  });

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Wallet Connection Options</h2>
        <p className="text-gray-600 mb-6">
          Choose between different wallet connection UI implementations:
        </p>
      </div>

      {/* Option 1: Custom Wallet Button */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Option 1: Custom Wallet Button</h3>
        <p className="text-sm text-gray-600 mb-4">
          A fully custom implementation with dropdown connector selection
        </p>
        <WalletConnectButton />
      </div>

      {/* Option 2: RainbowKit Default */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Option 2: RainbowKit Default</h3>
        <p className="text-sm text-gray-600 mb-4">
          Out-of-the-box RainbowKit button with built-in modal
        </p>
        <RainbowKitButton showBalance={true} />
      </div>

      {/* Option 3: RainbowKit Custom */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Option 3: RainbowKit Custom Styled</h3>
        <p className="text-sm text-gray-600 mb-4">
          RainbowKit with custom styling to match the app design
        </p>
        <CustomConnectButton />
      </div>

      {/* Connection Status */}
      {isConnected && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chain:</span>
              <span>{getChainName(chainId)}</span>
            </div>
            {balance && (
              <div className="flex justify-between">
                <span className="text-gray-600">Balance:</span>
                <span>{formatBalance(balance.value, balance.decimals)} {balance.symbol}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supported Wallets */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Supported Wallets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Ethereum & Multi-Chain</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>MetaMask (Extension & Mobile)</li>
              <li>Coinbase Wallet (Extension & Mobile)</li>
              <li>Rainbow Wallet</li>
              <li>Trust Wallet</li>
              <li>Uniswap Wallet</li>
              <li>Frame Wallet</li>
              <li>Rabby Wallet</li>
              <li>Safe (Gnosis Safe)</li>
              <li>Ledger Live</li>
              <li>Trezor Suite</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">WalletConnect Compatible</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>300+ Mobile Wallets</li>
              <li>1inch Wallet</li>
              <li>Argent</li>
              <li>Phantom</li>
              <li>Zerion</li>
              <li>imToken</li>
              <li>Math Wallet</li>
              <li>TokenPocket</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="font-medium text-purple-800 mb-2">🌙 Midnight Protocol</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
            <li>Lace Wallet (Midnight Edition) - Privacy-preserving transactions</li>
            <li>Zero-knowledge proof support</li>
            <li>Dual ledger (shielded & unshielded) transactions</li>
            <li>NIGHT & DUST token support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletDemo;