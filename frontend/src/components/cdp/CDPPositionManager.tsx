import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  AlertCircle,
  TrendingUp,
  Shield,
  DollarSign,
  Lock,
  Unlock,
  RefreshCw,
  Calculator,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

interface CDPPositionManagerProps {
  cdpId: string;
  collateralType: string;
  onClose?: () => void;
}

type ActionType = 'deposit' | 'withdraw' | 'borrow' | 'repay';

interface SimulationResult {
  newCollateralRatio: number;
  newHealthFactor: number;
  newLiquidationPrice: number;
  availableToBorrow: number;
  maxWithdrawable: number;
}

const CDPPositionManager: React.FC<CDPPositionManagerProps> = ({ cdpId, collateralType, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'history'>('overview');
  const [selectedAction, setSelectedAction] = useState<ActionType>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // Mock position data
  const position = {
    collateralAmount: 10,
    collateralValue: 20000,
    debtAmount: 8000,
    availableCollateral: 2.5,
    liquidationPrice: 1200,
    currentPrice: 2000,
    collateralizationRatio: 250,
    healthFactor: 1.67,
    interestRate: 3.5,
    accruedInterest: 28.50,
    minCollateralRatio: 150,
    liquidationThreshold: 130
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value && parseFloat(value) > 0) {
      simulateAction(parseFloat(value));
    } else {
      setSimulation(null);
    }
  };

  const simulateAction = (actionAmount: number) => {
    setIsSimulating(true);
    // Simulate the impact of the action
    setTimeout(() => {
      let newCollateral = position.collateralAmount;
      let newDebt = position.debtAmount;

      switch (selectedAction) {
        case 'deposit':
          newCollateral += actionAmount;
          break;
        case 'withdraw':
          newCollateral -= actionAmount;
          break;
        case 'borrow':
          newDebt += actionAmount;
          break;
        case 'repay':
          newDebt -= actionAmount;
          break;
      }

      const newCollateralValue = newCollateral * position.currentPrice;
      const newRatio = (newCollateralValue / newDebt) * 100;
      const newHealthFactor = newRatio / position.liquidationThreshold;
      const newLiqPrice = (newDebt * position.liquidationThreshold) / (newCollateral * 100);

      setSimulation({
        newCollateralRatio: newRatio,
        newHealthFactor: newHealthFactor,
        newLiquidationPrice: newLiqPrice,
        availableToBorrow: Math.max(0, (newCollateralValue / position.minCollateralRatio * 100) - newDebt),
        maxWithdrawable: Math.max(0, newCollateral - (newDebt * position.minCollateralRatio / 100 / position.currentPrice))
      });
      setIsSimulating(false);
    }, 500);
  };

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'deposit': return <ArrowDownRight className="w-5 h-5" />;
      case 'withdraw': return <ArrowUpRight className="w-5 h-5" />;
      case 'borrow': return <Plus className="w-5 h-5" />;
      case 'repay': return <Minus className="w-5 h-5" />;
    }
  };

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'deposit': return 'from-green-600 to-emerald-600';
      case 'withdraw': return 'from-orange-600 to-red-600';
      case 'borrow': return 'from-blue-600 to-indigo-600';
      case 'repay': return 'from-purple-600 to-pink-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{collateralType}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">CDP #{cdpId.slice(-6)}</h2>
                <p className="text-gray-400">Manage your {collateralType} position</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            {['overview', 'manage', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Position Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Collateral Locked</span>
                      <Lock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {position.collateralAmount} {collateralType}
                    </div>
                    <div className="text-sm text-gray-400">${position.collateralValue.toLocaleString()}</div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Available</span>
                        <span className="text-green-400">{position.availableCollateral} {collateralType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Outstanding Debt</span>
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {position.debtAmount.toLocaleString()} NYXUSD
                    </div>
                    <div className="text-sm text-gray-400">{position.interestRate}% APR</div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Accrued Interest</span>
                        <span className="text-yellow-400">+{position.accruedInterest} NYXUSD</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">Health Status</span>
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {position.healthFactor.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-400">Healthy Position</div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">C-Ratio</span>
                        <span className="text-white">{position.collateralizationRatio}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
                  
                  <div className="space-y-4">
                    {/* Liquidation Price */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Liquidation Price</span>
                        <span className="text-white font-medium">${position.liquidationPrice}</span>
                      </div>
                      <div className="relative">
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div className="absolute inset-0 flex items-center px-1">
                            <div 
                              className="h-1 bg-red-500 rounded-full"
                              style={{ width: `${(position.liquidationPrice / position.currentPrice) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-red-400">Liquidation</span>
                          <span className="text-green-400">Current: ${position.currentPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Collateralization Ratio */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Collateralization Ratio</span>
                        <span className="text-white font-medium">{position.collateralizationRatio}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(position.collateralizationRatio / 3, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-gray-400">Min: {position.minCollateralRatio}%</span>
                        <span className="text-gray-400">Safe: 200%+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['deposit', 'withdraw', 'borrow', 'repay'] as ActionType[]).map((action) => (
                    <motion.button
                      key={action}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab('manage');
                        setSelectedAction(action);
                      }}
                      className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActionColor(action)} flex items-center justify-center mb-2`}>
                        {getActionIcon(action)}
                      </div>
                      <div className="text-white font-medium capitalize">{action}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'manage' && (
              <motion.div
                key="manage"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Action Selector */}
                <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
                  {(['deposit', 'withdraw', 'borrow', 'repay'] as ActionType[]).map((action) => (
                    <button
                      key={action}
                      onClick={() => setSelectedAction(action)}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        selectedAction === action
                          ? 'bg-gradient-to-r ' + getActionColor(action) + ' text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {getActionIcon(action)}
                      <span className="capitalize">{action}</span>
                    </button>
                  ))}
                </div>

                {/* Action Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {selectedAction === 'deposit' && 'Add Collateral'}
                        {selectedAction === 'withdraw' && 'Remove Collateral'}
                        {selectedAction === 'borrow' && 'Mint NYXUSD'}
                        {selectedAction === 'repay' && 'Burn NYXUSD'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => handleAmountChange(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <span className="text-gray-400">
                                {(selectedAction === 'deposit' || selectedAction === 'withdraw') ? collateralType : 'NYXUSD'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Balance Info */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {selectedAction === 'deposit' && 'Wallet Balance'}
                            {selectedAction === 'withdraw' && 'Available to Withdraw'}
                            {selectedAction === 'borrow' && 'Available to Borrow'}
                            {selectedAction === 'repay' && 'Outstanding Debt'}
                          </span>
                          <button className="text-purple-400 hover:text-purple-300">
                            {selectedAction === 'deposit' && `${position.availableCollateral} ${collateralType}`}
                            {selectedAction === 'withdraw' && `${position.collateralAmount * 0.4} ${collateralType}`}
                            {selectedAction === 'borrow' && '2,500 NYXUSD'}
                            {selectedAction === 'repay' && `${position.debtAmount} NYXUSD`}
                          </button>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                          {['25%', '50%', '75%', 'MAX'].map((preset) => (
                            <button
                              key={preset}
                              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white text-sm font-medium transition-colors"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        {/* Transaction Info */}
                        <div className="pt-4 border-t border-gray-700 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Gas Fee</span>
                            <span className="text-white">~$2.50</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Transaction Time</span>
                            <span className="text-white">~15 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${getActionColor(selectedAction)} shadow-lg`}
                    >
                      {selectedAction === 'deposit' && 'Add Collateral'}
                      {selectedAction === 'withdraw' && 'Withdraw Collateral'}
                      {selectedAction === 'borrow' && 'Mint NYXUSD'}
                      {selectedAction === 'repay' && 'Repay Debt'}
                    </motion.button>
                  </div>

                  {/* Simulation Section */}
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Position Preview</h3>
                        <Calculator className="w-5 h-5 text-purple-400" />
                      </div>

                      {simulation ? (
                        <div className="space-y-4">
                          {/* Health Factor Change */}
                          <div className="p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-400 text-sm">Health Factor</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">{position.healthFactor.toFixed(2)}</span>
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                <span className={`font-medium ${
                                  simulation.newHealthFactor >= position.healthFactor ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                  {simulation.newHealthFactor.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: `${Math.min(position.healthFactor * 33, 100)}%` }}
                                animate={{ width: `${Math.min(simulation.newHealthFactor * 33, 100)}%` }}
                                className={`h-full rounded-full ${
                                  simulation.newHealthFactor >= 1.5 ? 'bg-green-500' :
                                  simulation.newHealthFactor >= 1.2 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Collateral Ratio Change */}
                          <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Collateral Ratio</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{position.collateralizationRatio}%</span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                              <span className={`font-medium ${
                                simulation.newCollateralRatio >= position.collateralizationRatio ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {simulation.newCollateralRatio.toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          {/* Liquidation Price Change */}
                          <div className="flex justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Liquidation Price</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">${position.liquidationPrice}</span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                              <span className={`font-medium ${
                                simulation.newLiquidationPrice <= position.liquidationPrice ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                ${simulation.newLiquidationPrice.toFixed(0)}
                              </span>
                            </div>
                          </div>

                          {/* Available Actions */}
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Available to Borrow</span>
                              <span className="text-white">{simulation.availableToBorrow.toFixed(0)} NYXUSD</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Max Withdrawable</span>
                              <span className="text-white">{simulation.maxWithdrawable.toFixed(2)} {collateralType}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <Calculator className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">Enter an amount to preview changes</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Risk Warning */}
                    {simulation && simulation.newHealthFactor < 1.5 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                      >
                        <div className="flex gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-yellow-200 font-medium mb-1">Position at Risk</p>
                            <p className="text-yellow-200/70 text-sm">
                              This action will put your position at higher liquidation risk. Consider adjusting the amount or adding more collateral.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {[
                      { type: 'borrow', amount: 2000, token: 'NYXUSD', time: '2 hours ago', txHash: '0x1234...5678' },
                      { type: 'deposit', amount: 2, token: collateralType, time: '5 hours ago', txHash: '0x8765...4321' },
                      { type: 'repay', amount: 500, token: 'NYXUSD', time: '1 day ago', txHash: '0xabcd...efgh' },
                      { type: 'withdraw', amount: 0.5, token: collateralType, time: '3 days ago', txHash: '0xijkl...mnop' },
                    ].map((tx, index) => (
                      <div key={index} className="p-4 hover:bg-gray-700/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActionColor(tx.type as ActionType)} flex items-center justify-center`}>
                              {getActionIcon(tx.type as ActionType)}
                            </div>
                            <div>
                              <div className="text-white font-medium capitalize">{tx.type}</div>
                              <div className="text-gray-400 text-sm">{tx.amount} {tx.token}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 text-sm">{tx.time}</div>
                            <a href="#" className="text-purple-400 hover:text-purple-300 text-sm">
                              {tx.txHash}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CDPPositionManager;