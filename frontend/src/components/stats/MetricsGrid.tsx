import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MetricsGridProps {
  totalTVL: number;
  totalSupply: number;
  collateralizationRatio: number;
  totalCDPs: number;
  systemStats?: {
    stabilityFeeRate: number;
    emergencyShutdown: boolean;
    liquidationRatio: number;
  };
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  formatter,
  prefix = "",
  suffix = "",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = value * easeOutCubic;

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const displayValue = formatter ? formatter(count) : count.toFixed(0);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: "green" | "yellow" | "red" | "blue" | "purple";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  color = "blue",
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  const backgroundClasses = {
    green: "bg-green-100",
    yellow: "bg-yellow-100",
    red: "bg-red-100",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{percentage.toFixed(1)}%</span>
      </div>
      <div
        className={`h-2 ${backgroundClasses[color]} rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  totalTVL,
  totalSupply,
  collateralizationRatio,
  totalCDPs,
  systemStats,
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return (value / 1e9).toFixed(1) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
    if (value >= 1e3) return (value / 1e3).toFixed(1) + "K";
    return value.toFixed(0);
  };

  const formatPercentage = (value: number) => value.toFixed(1);

  // Calculate health metrics
  const systemHealth =
    collateralizationRatio >= 200
      ? "excellent"
      : collateralizationRatio >= 150
        ? "good"
        : collateralizationRatio >= 120
          ? "caution"
          : "critical";

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "caution":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const utilizationRatio = totalTVL > 0 ? (totalSupply / totalTVL) * 100 : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Value Locked */}
      <motion.div className="card group hover:shadow-lg transition-shadow duration-300" variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              <AnimatedCounter
                value={totalTVL}
                formatter={formatCurrency}
                prefix="$"
              />
            </div>
            <div className="text-sm text-gray-500">Total Value Locked</div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={totalTVL}
            max={totalTVL * 1.5}
            label="Protocol Capacity"
            color="purple"
          />
        </div>
      </motion.div>

      {/* nyxUSD Supply */}
      <motion.div className="card group hover:shadow-lg transition-shadow duration-300" variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              <AnimatedCounter
                value={totalSupply}
                formatter={formatCurrency}
                prefix="$"
              />
            </div>
            <div className="text-sm text-gray-500">nyxUSD Supply</div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={utilizationRatio}
            max={100}
            label="Supply Utilization"
            color="blue"
          />
        </div>
      </motion.div>

      {/* System Collateralization */}
      <motion.div className="card group hover:shadow-lg transition-shadow duration-300" variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              <AnimatedCounter
                value={collateralizationRatio}
                formatter={formatPercentage}
                suffix="%"
              />
            </div>
            <div className="text-sm text-gray-500">Collateralization</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">System Health</span>
            <span
              className={`font-semibold capitalize ${getHealthColor(systemHealth)}`}
            >
              {systemHealth}
            </span>
          </div>
          <ProgressBar
            value={collateralizationRatio}
            max={300}
            label="Safety Ratio"
            color={
              systemHealth === "excellent"
                ? "green"
                : systemHealth === "good"
                  ? "blue"
                  : systemHealth === "caution"
                    ? "yellow"
                    : "red"
            }
          />
        </div>
      </motion.div>

      {/* Active CDPs */}
      <motion.div className="card group hover:shadow-lg transition-shadow duration-300" variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
            <svg
              className="w-6 h-6 text-pink-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              <AnimatedCounter value={totalCDPs} />
            </div>
            <div className="text-sm text-gray-500">Active CDPs</div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Stability Fee</span>
            <span className="font-medium">
              {systemStats?.stabilityFeeRate
                ? (systemStats.stabilityFeeRate / 100).toFixed(1)
                : "0.0"}
              % APR
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Emergency Shutdown</span>
            <span
              className={`font-medium ${systemStats?.emergencyShutdown ? "text-red-600" : "text-green-600"}`}
            >
              {systemStats?.emergencyShutdown ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Additional System Metrics */}
      <motion.div className="card lg:col-span-2 group hover:shadow-lg transition-shadow duration-300" variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
        <h4 className="text-lg font-semibold mb-4">Real-time System Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Liquidation Threshold</span>
              <span className="font-semibold">
                {systemStats?.liquidationRatio || 150}%
              </span>
            </div>
            <ProgressBar
              value={systemStats?.liquidationRatio || 150}
              max={200}
              label="Safety Buffer"
              color="yellow"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Protocol Coverage</span>
              <span className="font-semibold">
                {totalTVL > 0
                  ? (((totalTVL - totalSupply) / totalTVL) * 100).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <ProgressBar
              value={
                totalTVL > 0 ? ((totalTVL - totalSupply) / totalTVL) * 100 : 0
              }
              max={100}
              label="Excess Collateral"
              color="green"
            />
          </div>
        </div>
      </motion.div>

      {/* Network Status */}
      <motion.div className="card lg:col-span-2 group hover:shadow-lg transition-shadow duration-300" variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
        <h4 className="text-lg font-semibold mb-4">Network Status</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-sm font-medium">Operational</div>
            <div className="text-xs text-gray-500">All Systems</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-sm font-medium">
              <AnimatedCounter
                value={Math.floor(Math.random() * 1000) + 500}
                suffix=" TPS"
              />
            </div>
            <div className="text-xs text-gray-500">Throughput</div>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-purple-600"
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
            <div className="text-sm font-medium">Private</div>
            <div className="text-xs text-gray-500">Zero-Knowledge</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
