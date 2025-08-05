import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export interface RainbowKitButtonProps {
  className?: string;
  showBalance?: boolean;
  accountStatus?: "full" | "avatar" | "address";
  chainStatus?: "full" | "icon" | "name" | "none";
}

export const RainbowKitButton: React.FC<RainbowKitButtonProps> = ({
  className = "",
  showBalance = true,
  accountStatus = "address",
  chainStatus = "icon",
}) => {
  return (
    <div className={className}>
      <ConnectButton
        showBalance={showBalance}
        accountStatus={accountStatus}
        chainStatus={chainStatus}
      />
    </div>
  );
};

// Custom styled version that matches the app design
export const CustomConnectButton: React.FC<{ 
  className?: string;
  variant?: "default" | "nyx" | "modern";
  showBalance?: boolean;
}> = ({ 
  className = "",
  variant = "default",
  showBalance = true
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            className={className}
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                const buttonStyles = variant === "nyx" 
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/50 flex items-center space-x-2 transform hover:scale-105"
                  : "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2";
                
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={buttonStyles}
                  >
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
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              const connectedStyles = variant === "nyx" ? {
                container: "flex items-center gap-3",
                chain: "flex items-center gap-2 px-3 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-all",
                account: "flex items-center gap-2 px-3 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all",
                chainText: "text-sm font-medium text-gray-300",
                accountText: "text-sm font-medium text-gray-300",
                dot: "w-2 h-2 bg-green-400 rounded-full animate-pulse"
              } : {
                container: "flex items-center space-x-3",
                chain: "flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors",
                account: "flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors",
                chainText: "text-sm font-medium text-gray-700",
                accountText: "text-sm font-medium",
                dot: "w-2 h-2 bg-green-400 rounded-full"
              };
              
              return (
                <div className={connectedStyles.container}>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={connectedStyles.chain}
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-4 h-4"
                        style={{
                          background: chain.iconBackground,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    )}
                    <span className={connectedStyles.chainText}>
                      {chain.name}
                    </span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={connectedStyles.account}
                  >
                    <div className={connectedStyles.dot}></div>
                    <span className={connectedStyles.accountText}>
                      {account.displayName}
                      {showBalance && account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default RainbowKitButton;