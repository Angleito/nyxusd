import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  StrategyService,
  ProtocolIntegrationService,
  YieldAggregatorService,
  type Strategy,
  type ProtocolPosition,
  type Protocol,
} from "../../services/strategy";
import {
  TrendingUp,
  Shield,
  DollarSign,
  Activity,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { CDPLeverageOptimizer } from "./CDPLeverageOptimizer";

interface MultiProtocolDashboardProps {
  strategyId?: string;
  className?: string;
}

export const MultiProtocolDashboard: React.FC<MultiProtocolDashboardProps> = ({
  strategyId,
  className = "",
}) => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLeverageOptimizer, setShowLeverageOptimizer] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [strategyId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load strategy
      if (strategyId) {
        const strategyData = await StrategyService.getStrategy(strategyId);
        setStrategy(strategyData);
      } else {
        // Create a default strategy for demo
        const mockStrategy = await StrategyService.createStrategy({
          name: "My DeFi Portfolio",
          description: "Diversified yield strategy",
          allocations: [],
          targetAPY: 20,
        });
        setStrategy(mockStrategy);
      }

      // Load protocols
      const protocolsData = await ProtocolIntegrationService.getProtocols();
      setProtocols(protocolsData);

      // Load performance history
      if (strategyId) {
        const history = await StrategyService.getPerformanceHistory(
          strategyId,
          7,
        );
        setPerformanceHistory(history);
      }

      // Check for alerts
      if (strategy) {
        const alertsData =
          await YieldAggregatorService.monitorYieldChanges(strategy);
        setAlerts(alertsData.alerts);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProtocolLogo = (protocolId: string) => {
    const logos: Record<string, string> = {
      aave: "🏦",
      uniswap: "🦄",
      curve: "🌊",
      compound: "🏛️",
      yearn: "🏺",
      convex: "⚡",
      sushiswap: "🍣",
      balancer: "⚖️",
    };
    return logos[protocolId] || "💎";
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-400";
    if (score < 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return "🎯";
      case "risk":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  if (isLoading || !strategy) {
    return (
      <div className={`bg-gray-900 rounded-xl p-8 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const totalValue = strategy.performanceMetrics.totalValue;
  const totalAPY = strategy.performanceMetrics.currentAPY;
  const pnl = strategy.performanceMetrics.unrealizedPnL;
  const pnlPercent = strategy.performanceMetrics.unrealizedPnLPercent;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Value</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalValue.toLocaleString()}
          </div>
          <div
            className={`text-sm mt-1 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {pnl >= 0 ? "+" : ""}
            {pnlPercent.toFixed(2)}% (${Math.abs(pnl).toLocaleString()})
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Current APY</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalAPY.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {strategy.leverage.enabled
              ? `${strategy.leverage.leverageMultiplier}x leveraged`
              : "No leverage"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Risk Score</span>
            <Shield className="w-4 h-4 text-yellow-400" />
          </div>
          <div
            className={`text-2xl font-bold ${getRiskColor(strategy.riskMetrics.riskScore)}`}
          >
            {strategy.riskMetrics.riskScore}/100
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {strategy.riskMetrics.riskScore < 30
              ? "Low risk"
              : strategy.riskMetrics.riskScore < 60
                ? "Medium risk"
                : "High risk"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Positions</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {strategy.allocations.length}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Across {new Set(strategy.allocations.map((a) => a.protocol)).size}{" "}
            protocols
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Active Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.type === "risk"
                    ? "bg-red-900/20"
                    : alert.type === "opportunity"
                      ? "bg-green-900/20"
                      : "bg-blue-900/20"
                }`}
              >
                <span className="text-lg">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{alert.message}</p>
                  {alert.urgency === "high" && (
                    <span className="text-xs text-red-400 mt-1">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Position Breakdown */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Portfolio Positions
          </h3>
          <button
            onClick={() => setShowLeverageOptimizer(!showLeverageOptimizer)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            {showLeverageOptimizer ? "Hide" : "Show"} Leverage Options
          </button>
        </div>

        {showLeverageOptimizer && (
          <CDPLeverageOptimizer
            strategy={strategy}
            onUpdate={(leverage) => {
              // Update strategy with new leverage
              setStrategy({ ...strategy, leverage });
            }}
            className="mb-6"
          />
        )}

        <div className="space-y-3">
          {strategy.allocations.map((allocation) => {
            const protocol = protocols.find(
              (p) => p.id === allocation.protocol,
            );
            return (
              <motion.div
                key={allocation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getProtocolLogo(allocation.protocol)}
                    </span>
                    <div>
                      <h4 className="text-white font-medium capitalize">
                        {protocol?.name || allocation.protocol}
                      </h4>
                      <p className="text-gray-400 text-sm capitalize">
                        {allocation.positionType.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {allocation.allocation}%
                    </div>
                    <div className="text-green-400 text-sm">
                      {allocation.currentAPY.toFixed(1)}% APY
                    </div>
                  </div>
                </div>

                {allocation.leveraged && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                      {allocation.leverageMultiplier}x Leveraged
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Value: $
                    {(
                      (totalValue * allocation.allocation) /
                      100
                    ).toLocaleString()}
                  </span>
                  <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Manage
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Position Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-purple-600/30"
        >
          <Plus className="w-4 h-4" />
          Add New Position
        </motion.button>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Performance History
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Performance chart would go here</p>
            <p className="text-sm mt-1">Showing 7-day history</p>
          </div>
        </div>
      </div>
    </div>
  );
};
