import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle } from "lucide-react";

interface WalletConnectionStepProps {
  onComplete: (data?: any) => void;
}

export const WalletConnectionStep: React.FC<WalletConnectionStepProps> = ({
  onComplete,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const mockWalletAddress = "0x742d...8963";

  const mockWalletData = {
    address: mockWalletAddress,
    balances: {
      NIGHT: { amount: 25.0, value: 3750 },
      DUST: { amount: 10000, value: 250 },
      USDC: { amount: 5000, value: 5000 },
    },
    totalValue: 9000,
  };

  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setIsConnecting(false);
    setIsConnected(true);
    setShowSuccess(true);

    // Auto-advance after showing success with wallet data
    setTimeout(() => {
      onComplete({ connected: true, walletData: mockWalletData });
    }, 1500);
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
          <motion.button
            key="connect-button"
            onClick={handleConnect}
            disabled={isConnecting}
            data-action="connect-wallet"
            whileHover={{ scale: isConnecting ? 1 : 1.02 }}
            whileTap={{ scale: isConnecting ? 1 : 0.98 }}
            className={`
              w-full py-4 px-6 rounded-xl font-medium text-white
              bg-gradient-to-r from-purple-600 to-purple-700
              hover:from-purple-700 hover:to-purple-800
              transition-all duration-200
              ${isConnecting ? "opacity-75 cursor-not-allowed" : ""}
              flex items-center justify-center gap-3
            `}
          >
            {isConnecting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </motion.button>
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
                  <p className="text-white font-mono">{mockWalletAddress}</p>
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

      {isConnecting && (
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
