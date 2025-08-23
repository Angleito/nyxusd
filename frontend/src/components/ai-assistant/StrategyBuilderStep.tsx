import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import {
  ProtocolIntegrationService,
  type ProtocolPosition,
  type StrategyAllocation,
} from "../../services/strategy";

interface StrategyBuilderData {
  allocations: StrategyAllocation[];
  totalAllocation: number;
  leverageEnabled: boolean;
}

interface StrategyBuilderStepProps {
  onComplete?: (data?: StrategyBuilderData) => void;
}

export const StrategyBuilderStep: React.FC<StrategyBuilderStepProps> = ({
  onComplete,
}) => {
  const { state, addMessage, updateUserProfile } = useAIAssistant();
  const [allocations, setAllocations] = useState<StrategyAllocation[]>([]);
  const [availablePositions, setAvailablePositions] = useState<
    ProtocolPosition[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [showLeverageOption, setShowLeverageOption] = useState(false);

  useEffect(() => {
    loadAvailablePositions();
  }, []);

  const loadAvailablePositions = async () => {
    setIsLoading(true);
    try {
      const positions =
        await ProtocolIntegrationService.getTopYieldOpportunities(8);
      setAvailablePositions(positions);
    } catch (error) {
      console.error("Failed to load positions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPosition = (position: ProtocolPosition) => {
    const newAllocation: StrategyAllocation = {
      id: `alloc-${Date.now()}`,
      protocol: position.protocol,
      positionType: position.positionType,
      assets: position.assets,
      allocation: 0,
      currentAPY: position.currentAPY,
      projectedAPY: position.currentAPY,
      leveraged: false,
      metadata: {},
    };

    setAllocations([...allocations, newAllocation]);

    // Auto-suggest allocation
    const remainingAllocation = 100 - totalAllocation;
    if (remainingAllocation > 0) {
      updateAllocation(newAllocation.id, Math.min(25, remainingAllocation));
    }
  };

  const removeAllocation = (id: string) => {
    setAllocations(allocations.filter((a) => a.id !== id));
  };

  const updateAllocation = (id: string, percentage: number) => {
    const newAllocations = allocations.map((a) =>
      a.id === id ? { ...a, allocation: percentage } : a,
    );
    setAllocations(newAllocations);

    const newTotal = newAllocations.reduce((sum, a) => sum + a.allocation, 0);
    setTotalAllocation(newTotal);
  };

  const calculateProjectedAPY = () => {
    return allocations.reduce(
      (total, alloc) => total + (alloc.currentAPY * alloc.allocation) / 100,
      0,
    );
  };

  const handleContinue = () => {
    if (totalAllocation !== 100) {
      addMessage(
        "Please make sure your allocations add up to 100% before continuing.",
        "ai",
      );
      return;
    }

    // Strategy is stored separately in the component state
    // Leverage settings are handled below

    if (state.userProfile?.riskTolerance !== "conservative") {
      setShowLeverageOption(true);
    } else {
      onComplete?.({
        allocations,
        totalAllocation,
        leverageEnabled: false
      });
    }
  };

  const getProtocolIcon = (protocol: string) => {
    const icons: Record<string, string> = {
      aave: "🏦",
      uniswap: "🦄",
      curve: "🌊",
      compound: "🏛️",
      yearn: "🏺",
      convex: "⚡",
      sushiswap: "🍣",
      balancer: "⚖️",
    };
    return icons[protocol] || "💎";
  };

  const getRiskColor = (apy: number) => {
    if (apy < 10) return "text-green-400";
    if (apy < 30) return "text-yellow-400";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900/95 backdrop-blur-lg rounded-2xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!showLeverageOption ? (
        <motion.div
          key="builder"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-[500px] bg-gray-900/95 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 max-h-[600px] overflow-hidden flex flex-col"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Build Your Strategy
          </h3>

          {/* Current Allocations */}
          {allocations.length > 0 && (
            <div className="mb-4 space-y-2 overflow-y-auto max-h-48">
              {allocations.map((alloc) => (
                <motion.div
                  key={alloc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getProtocolIcon(alloc.protocol)}
                    </span>
                    <div>
                      <div className="text-white font-medium capitalize">
                        {alloc.protocol} -{" "}
                        {alloc.positionType.replace("_", " ")}
                      </div>
                      <div
                        className={`text-sm ${getRiskColor(alloc.currentAPY)}`}
                      >
                        {alloc.currentAPY.toFixed(1)}% APY
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={alloc.allocation}
                      onChange={(e) =>
                        updateAllocation(
                          alloc.id,
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center"
                    />
                    <span className="text-gray-400">%</span>
                    <button
                      onClick={() => removeAllocation(alloc.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Available Positions */}
          <div className="mb-4">
            <h4 className="text-sm text-gray-400 mb-2">Add Positions</h4>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availablePositions
                .filter(
                  (pos) =>
                    !allocations.some(
                      (a) =>
                        a.protocol === pos.protocol &&
                        a.positionType === pos.positionType,
                    ),
                )
                .map((pos, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => addPosition(pos)}
                    className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 text-left transition-all"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span>{getProtocolIcon(pos.protocol)}</span>
                      <span className="text-white text-sm capitalize">
                        {pos.protocol}
                      </span>
                    </div>
                    <div className={`text-xs ${getRiskColor(pos.currentAPY)}`}>
                      {pos.currentAPY.toFixed(1)}% APY
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Total Allocation</span>
              <span
                className={`font-semibold ${totalAllocation === 100 ? "text-green-400" : "text-yellow-400"}`}
              >
                {totalAllocation}%
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Projected APY</span>
              <span className="text-xl font-bold text-purple-400">
                {calculateProjectedAPY().toFixed(1)}%
              </span>
            </div>

            <button
              onClick={handleContinue}
              disabled={totalAllocation !== 100}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                totalAllocation === 100
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {totalAllocation === 100
                ? "Continue to Leverage"
                : `Allocate ${100 - totalAllocation}% more`}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="leverage"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900/95 backdrop-blur-lg rounded-2xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Add Leverage?
          </h3>
          <p className="text-gray-300 mb-6">
            Using CDPs, you can amplify your yields by up to 2.5x while
            maintaining control of your assets.
          </p>

          <div className="space-y-3 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current APY</span>
                <span className="text-lg font-semibold text-white">
                  {calculateProjectedAPY().toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">With 1.5x Leverage</span>
                <span className="text-lg font-semibold text-purple-400">
                  ~{(calculateProjectedAPY() * 1.4).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                onComplete?.({
                  allocations,
                  totalAllocation,
                  leverageEnabled: false
                });
              }}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              No Leverage
            </button>
            <button
              onClick={() => {
                onComplete?.({
                  allocations,
                  totalAllocation,
                  leverageEnabled: true
                });
              }}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Leverage
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
