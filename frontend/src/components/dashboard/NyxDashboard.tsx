import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchSystemStats, fetchOraclePrices } from "../../services/api";
import { NyxCard, NyxCardTitle, NyxCardContent } from "../ui/NyxCard";
import { NyxButton } from "../ui/NyxButton";
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export const NyxDashboard: React.FC = () => {
  const {
    data: systemStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["systemStats"],
    queryFn: fetchSystemStats,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  const {
    data: prices,
    isLoading: pricesLoading,
    error: pricesError,
  } = useQuery({
    queryKey: ["oraclePrices"],
    queryFn: fetchOraclePrices,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const isInitialLoading =
    (statsLoading || pricesLoading) && !systemStats && !prices;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="nyx-loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (statsError || pricesError) {
    return (
      <NyxCard variant="elevated" className="max-w-lg mx-auto">
        <NyxCardContent>
          <div className="text-center py-8">
            <p className="nyx-body-large mb-4" style={{ color: 'var(--nyx-error)' }}>
              Failed to load system data
            </p>
            <p className="nyx-body" style={{ color: 'var(--nyx-gleam-60)' }}>
              Please check your connection and try again
            </p>
          </div>
        </NyxCardContent>
      </NyxCard>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <NyxCard variant="glow" className="overflow-hidden">
          <div className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <SparklesIcon className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <h2 className="nyx-heading-1 mb-4">
                Welcome to <span className="nyx-text-gradient">NyxUSD</span>
              </h2>
              <p className="nyx-body-large mb-6" style={{ color: 'var(--nyx-gleam-70)' }}>
                Your personalized DeFi companion • Adapted experiences across every blockchain
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/cdp">
                  <NyxButton variant="primary" icon={<CurrencyDollarIcon className="w-5 h-5" />}>
                    Create CDP
                  </NyxButton>
                </Link>
                <Link to="/ai-assistant">
                  <NyxButton variant="secondary" icon={<UserCircleIcon className="w-5 h-5" />}>
                    Personalized Assistant
                  </NyxButton>
                </Link>
              </div>
            </div>
          </div>
        </NyxCard>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Value Locked */}
        <NyxCard variant="data">
          <NyxCardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>
                Total Value Locked
              </p>
              <ShieldCheckIcon className="w-5 h-5" style={{ color: 'var(--nyx-neon-cyan)' }} />
            </div>
            <p className="nyx-heading-2 nyx-text-gradient">
              ${systemStats?.totalValueLocked?.toLocaleString() || "0"}
            </p>
          </NyxCardContent>
        </NyxCard>

        {/* NyxUSD Supply */}
        <NyxCard variant="data">
          <NyxCardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>
                NyxUSD Supply
              </p>
              <CurrencyDollarIcon className="w-5 h-5" style={{ color: 'var(--nyx-gold-circuit)' }} />
            </div>
            <p className="nyx-heading-2 nyx-text-gradient">
              {systemStats?.totalDebt?.toLocaleString() || "0"}
            </p>
          </NyxCardContent>
        </NyxCard>

        {/* Active CDPs */}
        <NyxCard variant="data">
          <NyxCardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>
                Active CDPs
              </p>
              <ChartBarIcon className="w-5 h-5" style={{ color: 'var(--nyx-plasma-pink)' }} />
            </div>
            <p className="nyx-heading-2 nyx-text-gradient">
              {systemStats?.activeCDPs || "0"}
            </p>
          </NyxCardContent>
        </NyxCard>

        {/* Collateral Ratio */}
        <NyxCard variant="data">
          <NyxCardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>
                Avg Collateral Ratio
              </p>
              <div 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  background: 'var(--nyx-success)', 
                  color: 'var(--nyx-cosmic-black)' 
                }}
              >
                Healthy
              </div>
            </div>
            <p className="nyx-heading-2 nyx-text-gradient">
              {systemStats?.averageCollateralRatio 
                ? `${(systemStats.averageCollateralRatio * 100).toFixed(0)}%`
                : "0%"}
            </p>
          </NyxCardContent>
        </NyxCard>
      </motion.div>

      {/* Oracle Prices */}
      <motion.div variants={itemVariants}>
        <NyxCard variant="elevated">
          <div className="p-6">
            <NyxCardTitle className="mb-4">Oracle Prices</NyxCardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prices && Object.entries(prices).map(([asset, price]) => (
                <div key={asset} className="nyx-glass rounded-lg p-4">
                  <p className="nyx-body-small mb-1" style={{ color: 'var(--nyx-gleam-60)' }}>
                    {asset}/USD
                  </p>
                  <p className="nyx-heading-3 nyx-text-gradient">
                    ${price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </NyxCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <NyxCard variant="elevated">
          <div className="p-6">
            <NyxCardTitle className="mb-4">Quick Actions</NyxCardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/cdp" className="block">
                <div className="nyx-glass rounded-lg p-4 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="nyx-body font-medium">Manage CDPs</p>
                      <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>
                        Create and manage your positions
                      </p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5" style={{ color: 'var(--nyx-neon-cyan)' }} />
                  </div>
                </div>
              </Link>
              
              <Link to="/system" className="block">
                <div className="nyx-glass rounded-lg p-4 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="nyx-body font-medium">System Stats</p>
                      <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-60)' }}>
                        View detailed protocol metrics
                      </p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5" style={{ color: 'var(--nyx-neon-cyan)' }} />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </NyxCard>
      </motion.div>
    </motion.div>
  );
};