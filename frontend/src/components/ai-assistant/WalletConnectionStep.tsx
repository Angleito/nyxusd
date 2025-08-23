import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useAccount, useConnect, useBalance } from "wagmi";
import { formatAddress, formatBalance, getWalletErrorMessage } from "../../lib/wallet";

interface WalletData {
  address: string;
  balance?: string;
  isConnected: boolean;
}

interface WalletConnectionStepProps {
  onComplete: (data?: WalletData) => void;
}

export const WalletConnectionStep: React.FC<WalletConnectionStepProps> = ({
  onComplete,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { data: ethBalance } = useBalance({ address });
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);

  // Check if already connected on mount
  useEffect(() => {
    if (isConnected && address) {
      setShowSuccess(true);
      // Prepare wallet data
      const walletData = {
        address,
        balances: {
          ETH: { 
            amount: ethBalance ? formatBalance(ethBalance.value, ethBalance.decimals) : "0", 
            value: ethBalance ? Number(ethBalance.formatted) * 2000 : 0 // Assuming $2000/ETH
          },
          // Mock NIGHT and DUST for Midnight (these would come from Midnight SDK)
          NIGHT: { amount: 25.0, value: 3750 },
          DUST: { amount: 10000, value: 250 },
        },
        totalValue: 0,
      };
      walletData.totalValue = Object.values(walletData.balances).reduce(
        (sum, bal) => sum + bal.value,
        0
      );
      
      // Auto-advance after 1.5s
      setTimeout(() => {
        onComplete({ connected: true, walletData });
      }, 1500);
    }
  }, [isConnected, address, ethBalance, onComplete]);

  const handleConnect = async (connector: any) => {
    setSelectedConnector(connector);
    await connect({ connector });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-white">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400">
          Connect your wallet to start using NyxUSD
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div key="wallet-options" className="space-y-3">
            {connectors.map((connector) => (
              <motion.button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending && selectedConnector?.uid === connector.uid}
                whileHover={{ scale: isPending ? 1 : 1.02 }}
                whileTap={{ scale: isPending ? 1 : 0.98 }}
                className={`
                  w-full py-4 px-6 rounded-xl font-medium text-white
                  bg-gradient-to-r from-purple-600 to-purple-700
                  hover:from-purple-700 hover:to-purple-800
                  transition-all duration-200
                  ${isPending && selectedConnector?.uid === connector.uid ? "opacity-75 cursor-not-allowed" : ""}
                  flex items-center justify-between
                `}
              >
                <div className="flex items-center gap-3">
                  {connector.icon ? (
                    <img 
                      src={connector.icon} 
                      alt={connector.name}
                      className="w-6 h-6 rounded"
                    />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  <span>{connector.name}</span>
                </div>
                {isPending && selectedConnector?.uid === connector.uid && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-green-900/20 border border-green-800/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.1,
                  }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </motion.div>
                <div>
                  <p className="text-sm text-gray-400">Connected</p>
                  <p className="text-white font-mono">{address && formatAddress(address)}</p>
                </div>
              </div>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-green-500"
                >
                  Success!
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-800/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Connection Failed</p>
              <p className="text-sm text-red-300 mt-1">{getWalletErrorMessage(error)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connecting status */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Waiting for wallet confirmation...
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};
