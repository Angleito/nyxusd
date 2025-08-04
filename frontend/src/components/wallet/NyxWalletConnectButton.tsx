import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { formatAddress, getWalletErrorMessage } from "../../lib/wallet";
import { motion, AnimatePresence } from "framer-motion";
import { WalletIcon, PowerIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export interface NyxWalletConnectButtonProps {
  className?: string;
}

export const NyxWalletConnectButton: React.FC<NyxWalletConnectButtonProps> = ({
  className = "",
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleConnect = async (connector: typeof connectors[number]) => {
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
      <div className={clsx("flex items-center gap-3", className)}>
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 nyx-glass rounded-lg"
          style={{ border: '1px solid var(--nyx-success)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircleIcon className="w-4 h-4" style={{ color: 'var(--nyx-success)' }} />
          <span className="nyx-body-small font-medium" style={{ color: 'var(--nyx-gleam-90)' }}>
            {formatAddress(address)}
          </span>
        </motion.div>

        <motion.button
          onClick={handleDisconnect}
          className="nyx-button nyx-button-ghost nyx-button-sm whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PowerIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className={clsx("relative wallet-dropdown", className)}>
      <motion.button
        onClick={() => setShowConnectors(!showConnectors)}
        className="nyx-button nyx-button-glow nyx-button-sm whitespace-nowrap"
        disabled={isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPending ? (
          <>
            <div className="nyx-loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <WalletIcon className="w-4 h-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </motion.button>

      {/* Dropdown for connector selection */}
      <AnimatePresence>
        {showConnectors && (
          <motion.div 
            className="absolute top-full right-0 mt-2 w-64 nyx-glass-dark rounded-xl shadow-xl z-50"
            style={{ border: '1px solid var(--nyx-void-60)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <p className="nyx-body-small px-3 py-2" style={{ color: 'var(--nyx-gleam-60)' }}>
                Choose your wallet
              </p>
              {connectors.map((connector) => (
                <motion.button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:nyx-glass flex items-center gap-3",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {connector.icon ? (
                      <img 
                        src={connector.icon} 
                        alt={connector.name}
                        className="w-6 h-6 rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 nyx-glass rounded-full flex items-center justify-center">
                        <span className="nyx-body-small font-bold" style={{ color: 'var(--nyx-neon-cyan)' }}>
                          {connector.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="nyx-body font-medium" style={{ color: 'var(--nyx-gleam-90)' }}>
                        {connector.name}
                      </div>
                      {connector.type === 'injected' && !window.ethereum && (
                        <div className="nyx-body-small" style={{ color: 'var(--nyx-gleam-50)' }}>
                          Not installed
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          className="absolute top-full right-0 mt-2 nyx-glass rounded-lg px-3 py-2 flex items-center gap-2"
          style={{ border: '1px solid var(--nyx-error)', maxWidth: '300px' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--nyx-error)' }} />
          <span className="nyx-body-small" style={{ color: 'var(--nyx-error)' }}>
            {getWalletErrorMessage(error)}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default NyxWalletConnectButton;