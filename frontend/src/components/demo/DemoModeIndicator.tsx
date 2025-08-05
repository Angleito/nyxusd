import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, Mic, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { isDemoMode, DEMO_SCENARIOS, getDemoWallet } from '../../config/demoMode';

interface DemoModeIndicatorProps {
  onScenarioSelect?: (command: string) => void;
}

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ onScenarioSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  if (!isDemoMode()) {
    return null;
  }

  const demoWallet = getDemoWallet(0);

  const handleScenarioClick = (scenario: typeof DEMO_SCENARIOS[0]) => {
    setSelectedScenario(scenario.id);
    if (onScenarioSelect) {
      onScenarioSelect(scenario.voiceCommand);
    }
    
    // Auto-collapse after selection
    setTimeout(() => {
      setIsExpanded(false);
      setSelectedScenario(null);
    }, 2000);
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowRightLeft className="w-4 h-4" />;
      case 'defi':
        return <TrendingUp className="w-4 h-4" />;
      case 'portfolio':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <ChevronRight className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            onClick={() => setIsExpanded(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Demo Mode</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="bg-gray-900/95 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-6 shadow-2xl w-96"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Demo Mode Active</span>
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demo Wallet Info */}
            {demoWallet && (
              <div className="mb-4 p-3 bg-purple-800/20 rounded-lg">
                <p className="text-sm text-gray-300 mb-1">Demo Wallet</p>
                <p className="text-xs text-gray-400 font-mono">{demoWallet.address.slice(0, 8)}...{demoWallet.address.slice(-6)}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(demoWallet.tokens).slice(0, 4).map(([symbol, data]) => (
                    <div key={symbol} className="flex justify-between">
                      <span className="text-gray-400">{symbol}:</span>
                      <span className="text-white">{data.balance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Scenarios */}
            <div className="space-y-2">
              <p className="text-sm text-gray-300 mb-2 flex items-center space-x-1">
                <Mic className="w-4 h-4" />
                <span>Try these voice commands:</span>
              </p>
              {DEMO_SCENARIOS.map((scenario) => (
                <motion.button
                  key={scenario.id}
                  onClick={() => handleScenarioClick(scenario)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedScenario === scenario.id
                      ? 'bg-purple-600/40 border-purple-500'
                      : 'bg-gray-800/50 hover:bg-gray-800/70 border-gray-700/50'
                  } border`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getScenarioIcon(scenario.expectedAction.type)}
                    <span className="text-sm font-medium text-white">{scenario.description}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">"{scenario.voiceCommand}"</p>
                </motion.button>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 <strong>Tip:</strong> Click any scenario to simulate the voice command automatically
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DemoModeIndicator;