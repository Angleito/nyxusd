import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Search,
  AlertTriangle,
  Plus
} from 'lucide-react';
import CDPDashboard from './CDPDashboard';
import CDPPositionManager from './CDPPositionManager';
import CollateralSelector from './CollateralSelector';
import LiquidationMonitor from './LiquidationMonitor';

const CDPHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'positions' | 'collateral' | 'liquidations'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs: Array<{ id: 'dashboard' | 'positions' | 'collateral' | 'liquidations'; label: string; icon: any }> = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'positions', label: 'Manage Positions', icon: Briefcase },
      { id: 'collateral', label: 'Collateral Markets', icon: Search },
      { id: 'liquidations', label: 'Liquidation Monitor', icon: AlertTriangle }
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">CDP Management Hub</h1>
              <p className="text-gray-400">Manage your collateralized debt positions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New CDP
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CDPDashboard />
            </motion.div>
          )}

          {activeTab === 'positions' && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CDPPositionManager />
            </motion.div>
          )}

          {activeTab === 'collateral' && (
            <motion.div
              key="collateral"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CollateralSelector
                              onSelect={(asset) => {
                                console.log('Selected asset:', asset);
                                // In a real implementation, this would trigger some action
                                // For now, we're just satisfying the prop requirement
                              }}
                              selectedAsset={undefined}
                            />
            </motion.div>
          )}

          {activeTab === 'liquidations' && (
            <motion.div
              key="liquidations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LiquidationMonitor />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create CDP Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-purple-500/30"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Create New CDP</h2>
                <p className="text-gray-400 mb-6">
                  Select your collateral type and specify the amount to get started.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Collateral Type
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                      <option>ETH - Ethereum</option>
                      <option>WBTC - Wrapped Bitcoin</option>
                      <option>USDC - USD Coin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Collateral Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Borrow Amount (NYXUSD)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setActiveTab('positions');
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
                  >
                    Create CDP
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CDPHub;