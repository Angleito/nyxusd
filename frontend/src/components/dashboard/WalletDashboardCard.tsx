import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccount, useBalance, useChainId } from "wagmi";
import { formatBalance, getChainName } from "../../lib/wallet";
import { CustomConnectButton } from "../wallet/RainbowKitButton";
import { MidnightWalletCard } from "../wallet/MidnightWalletCard";
import { useMidnightWallet } from "../../hooks/useMidnightWallet";

interface WalletDashboardCardProps {
  className?: string;
}

export const WalletDashboardCard: React.FC<WalletDashboardCardProps> = ({
  className = "",
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
  });
  
  const midnightWallet = useMidnightWallet();

  // Mock CDP data - in real app this would come from smart contracts
  const mockCDPData = {
    totalCollateral: BigInt("5000000000000000000"), // 5 ETH in wei
    totalDebt: BigInt("8000000000000000000000"), // 8000 USD in wei
    collateralizationRatio: 156.25,
    liquidationPrice: 1600,
    positions: [
      {
        id: "cdp-1",
        collateralToken: "NIGHT",
        collateralAmount: "5.0",
        debtAmount: "8000",
        healthFactor: 1.56,
      }
    ]
  };

  if (!isConnected) {
    return (
      <motion.div 
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-purple-600"
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
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Connect your wallet to view your portfolio and manage CDPs
          </p>
          <CustomConnectButton />
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">Privacy-first with Midnight Protocol</p>
            <div className="max-w-sm mx-auto">
              <MidnightWalletCard />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Your Portfolio</span>
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Connected</span>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Wallet Address</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {getChainName(chainId)}
            </span>
          </div>
          <div className="text-sm font-mono text-gray-900">
            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Unknown'}
          </div>
        </div>

        {balance && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Balance</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatBalance(balance.value, balance.decimals)} {balance.symbol}
                </div>
                <div className="text-xs text-gray-500">
                  ${(parseFloat(formatBalance(balance.value, balance.decimals)) * 2000).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CDP Positions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">CDP Positions</h4>
          <Link
            to="/cdp"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View All
          </Link>
        </div>

        {mockCDPData.positions.length > 0 ? (
          <div className="space-y-3">
            {mockCDPData.positions.map((position) => (
              <div
                key={position.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">N</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {position.collateralToken} CDP
                    </span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    position.healthFactor > 1.5 
                      ? 'bg-green-100 text-green-700'
                      : position.healthFactor > 1.2
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {position.healthFactor.toFixed(2)} Health
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Collateral:</span>
                    <div className="font-medium text-gray-900">
                      {position.collateralAmount} {position.collateralToken}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Debt:</span>
                    <div className="font-medium text-gray-900">
                      {position.debtAmount} NYXUSD
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Portfolio Summary */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-600">Total Collateral:</span>
                  <div className="font-medium text-purple-900">
                    ${(parseFloat(formatBalance(mockCDPData.totalCollateral, 18)) * 2000).toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-purple-600">Total Debt:</span>
                  <div className="font-medium text-purple-900">
                    ${formatBalance(mockCDPData.totalDebt, 18)}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-purple-600">Collateralization Ratio:</span>
                  <span className="font-bold text-purple-900">
                    {mockCDPData.collateralizationRatio}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-3">No CDP positions yet</p>
            <Link
              to="/cdp"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Create your first CDP
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Midnight Privacy Features */}
      {midnightWallet.connected && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🌙</span>
            <span className="text-sm font-medium text-gray-900">Midnight Privacy</span>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-600">
            Your transactions are protected by zero-knowledge proofs
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WalletDashboardCard;