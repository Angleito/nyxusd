import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { formatAddress, getWalletErrorMessage } from "../../lib/wallet";
import { mainnet } from "viem/chains";

export interface WalletConnectButtonProps {
  className?: string;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  className = "",
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      setShowConnectors(false);
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown')) {
        setShowConnectors(false);
      }
    };

    if (showConnectors) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showConnectors]);

  const handleDisconnect = () => {
    disconnect();
  };

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
    );
  }

  return (
    <div className={`${className}`}>
      <div className="relative wallet-dropdown">
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        {/* Dropdown for connector selection */}
        {showConnectors && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 pb-2">Choose your wallet</p>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {connector.icon ? (
                      <img 
                        src={connector.icon} 
                        alt={connector.name}
                        className="w-6 h-6 rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          {connector.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{connector.name}</div>
                      {connector.type === 'injected' && !window.ethereum && (
                        <div className="text-xs text-gray-500">Not installed</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {getWalletErrorMessage(error)}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
