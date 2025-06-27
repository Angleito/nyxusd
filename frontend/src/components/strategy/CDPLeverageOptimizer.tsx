import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CDPLeverageService,
  type Strategy,
  type LeverageConfig,
  type Asset,
} from "../../services/strategy";
import { Shield, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

interface CDPLeverageOptimizerProps {
  strategy: Strategy;
  onUpdate: (leverage: LeverageConfig) => void;
  className?: string;
}

export const CDPLeverageOptimizer: React.FC<CDPLeverageOptimizerProps> = ({
  strategy,
  onUpdate,
  className = "",
}) => {
  const [leverageMultiplier, setLeverageMultiplier] = useState(1);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollateral, setSelectedCollateral] = useState<Asset>({
    symbol: "NIGHT",
    address: "0x...",
    decimals: 18,
    chainId: 1,
  });

  useEffect(() => {
    loadRecommendations();
  }, [strategy]);

  useEffect(() => {
    if (leverageMultiplier > 1) {
      simulateLeverage();
    }
  }, [leverageMultiplier]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = await CDPLeverageService.getRecommendations(
        strategy,
        selectedCollateral,
        strategy.riskMetrics.riskScore < 30
          ? "conservative"
          : strategy.riskMetrics.riskScore < 60
            ? "moderate"
            : "aggressive",
      );
      setRecommendations(recs);
      setLeverageMultiplier(recs.recommendedMultiplier);

      // Check initial health
      const health = await CDPLeverageService.checkHealth({
        enabled: true,
        collateralAsset: selectedCollateral,
        collateralAmount: 10000,
        borrowedAmount: 10000 * (recs.recommendedMultiplier - 1),
        collateralRatio: 200,
        leverageMultiplier: recs.recommendedMultiplier,
        healthFactor: 2.5,
        liquidationThreshold: 150,
      });
      setHealthStatus(health);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLeverage = async () => {
    try {
      const sims = await CDPLeverageService.simulateLeverage(
        strategy,
        10000, // $10k collateral
        selectedCollateral,
        [1, leverageMultiplier],
      );
      setSimulations(sims);
    } catch (error) {
      console.error("Failed to simulate leverage:", error);
    }
  };

  const handleApplyLeverage = () => {
    const leverageConfig: LeverageConfig = {
      enabled: leverageMultiplier > 1,
      collateralAsset: selectedCollateral,
      collateralAmount: 10000,
      borrowedAmount: 10000 * (leverageMultiplier - 1),
      collateralRatio: 200,
      leverageMultiplier,
      healthFactor: 2.5,
      liquidationThreshold: 150,
    };
    onUpdate(leverageConfig);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "🟢";
      case "warning":
        return "🟡";
      case "critical":
        return "🔴";
      default:
        return "⚪";
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-900/50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const currentSimulation = simulations.find(
    (s) => s.multiplier === leverageMultiplier,
  );
  const baseSimulation = simulations.find((s) => s.multiplier === 1);

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          CDP Leverage Optimizer
        </h3>
        {healthStatus && (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${getHealthColor(healthStatus.status)}`}>
              {getHealthIcon(healthStatus.status)} {healthStatus.status}
            </span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className="bg-purple-900/20 rounded-lg p-4 mb-6 border border-purple-700/30">
          <h4 className="text-purple-300 font-medium mb-2">
            AI Recommendation
          </h4>
          <p className="text-gray-300 text-sm mb-3">
            {recommendations.reasoning.join(" ")}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Recommended:</span>
              <span className="text-purple-400 font-medium ml-2">
                {recommendations.recommendedMultiplier}x
              </span>
            </div>
            <div>
              <span className="text-gray-400">APY Boost:</span>
              <span className="text-green-400 font-medium ml-2">
                +{recommendations.projectedAPYBoost.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leverage Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300 font-medium">
            Leverage Multiplier
          </label>
          <span className="text-xl font-bold text-purple-400">
            {leverageMultiplier.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min="1"
          max={recommendations?.maxSafeMultiplier || 3}
          step="0.1"
          value={leverageMultiplier}
          onChange={(e) => setLeverageMultiplier(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((leverageMultiplier - 1) / ((recommendations?.maxSafeMultiplier || 3) - 1)) * 100}%, #374151 ${((leverageMultiplier - 1) / ((recommendations?.maxSafeMultiplier || 3) - 1)) * 100}%, #374151 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>No Leverage</span>
          <span>Conservative</span>
          <span>Moderate</span>
          <span>Aggressive</span>
        </div>
      </div>

      {/* Performance Comparison */}
      {currentSimulation && baseSimulation && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-gray-400 text-sm mb-2">Without Leverage</h5>
            <div className="text-2xl font-bold text-white mb-1">
              {baseSimulation.projectedAPY.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              ${baseSimulation.netMonthlyProfit.toFixed(0)}/mo
            </div>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/30">
            <h5 className="text-purple-300 text-sm mb-2">
              With {leverageMultiplier}x Leverage
            </h5>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {currentSimulation.projectedAPY.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-300">
              ${currentSimulation.netMonthlyProfit.toFixed(0)}/mo
            </div>
          </div>
        </div>
      )}

      {/* Risk Warnings */}
      {leverageMultiplier > 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-700/30"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-yellow-400 font-medium mb-1">
                High Leverage Warning
              </h5>
              <p className="text-yellow-300/80 text-sm">
                Leverage above 2x significantly increases liquidation risk.
                Monitor your position closely and maintain sufficient
                collateral.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Health Metrics */}
      {healthStatus && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h5 className="text-gray-300 font-medium mb-3">Position Health</h5>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Health Factor</span>
              <span
                className={`font-medium ${getHealthColor(healthStatus.status)}`}
              >
                {healthStatus.healthFactor.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Liquidation Price</span>
              <span className="text-white font-medium">
                ${healthStatus.liquidationPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Safety Buffer</span>
              <span className="text-white font-medium">
                {healthStatus.safetyBuffer.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {recommendations && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h5 className="text-gray-300 font-medium mb-3">Cost Analysis</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Required Collateral</span>
              <span className="text-white font-medium">
                ${recommendations.requiredCollateral.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Monthly Borrow Cost</span>
              <span className="text-red-400 font-medium">
                -${recommendations.monthlyBorrowCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-400">Break-even APY</span>
              <span className="text-white font-medium">
                {recommendations.breakEvenAPY.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setLeverageMultiplier(1)}
          className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          No Leverage
        </button>
        <button
          onClick={handleApplyLeverage}
          disabled={leverageMultiplier === 1}
          className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            leverageMultiplier > 1
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Apply {leverageMultiplier.toFixed(1)}x Leverage
        </button>
      </div>
    </div>
  );
};
