import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Bell,
  Filter,
  ChevronRight,
  AlertCircle,
  Activity,
  BarChart3,
  Target,
  Eye,
  Timer,
  Flame
} from 'lucide-react';

interface LiquidationPosition {
  id: string;
  owner: string;
  collateralType: string;
  collateralAmount: number;
  collateralValue: number;
  debtAmount: number;
  healthFactor: number;
  collateralizationRatio: number;
  liquidationPrice: number;
  currentPrice: number;
  timeToLiquidation?: number; // in hours
  potentialProfit: number;
}

interface LiquidationStats {
  totalAtRisk: number;
  liquidations24h: number;
  totalLiquidated: number;
  avgLiquidationSize: number;
  topLiquidators: Array<{ address: string; count: number; volume: number }>;
}

const LiquidationMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'at-risk' | 'opportunities' | 'history' | 'analytics'>('at-risk');
  const [positions, setPositions] = useState<LiquidationPosition[]>([]);
  const [stats, setStats] = useState<LiquidationStats | null>(null);
  const [filterThreshold, setFilterThreshold] = useState<number>(1.5);
  const [sortBy, setSortBy] = useState<'health' | 'size' | 'profit'>('health');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setPositions([
      {
        id: 'cdp-risk-001',
        owner: '0x742d...4321',
        collateralType: 'ETH',
        collateralAmount: 5,
        collateralValue: 10000,
        debtAmount: 7500,
        healthFactor: 1.08,
        collateralizationRatio: 133,
        liquidationPrice: 1650,
        currentPrice: 2000,
        timeToLiquidation: 2.5,
        potentialProfit: 375
      },
      {
        id: 'cdp-risk-002',
        owner: '0x9abc...5678',
        collateralType: 'WBTC',
        collateralAmount: 0.5,
        collateralValue: 22500,
        debtAmount: 18000,
        healthFactor: 1.12,
        collateralizationRatio: 125,
        liquidationPrice: 40000,
        currentPrice: 45000,
        timeToLiquidation: 8,
        potentialProfit: 900
      },
      {
        id: 'cdp-risk-003',
        owner: '0x3def...9012',
        collateralType: 'ETH',
        collateralAmount: 10,
        collateralValue: 20000,
        debtAmount: 16500,
        healthFactor: 1.05,
        collateralizationRatio: 121,
        liquidationPrice: 1750,
        currentPrice: 2000,
        timeToLiquidation: 0.5,
        potentialProfit: 825
      }
    ]);

    setStats({
      totalAtRisk: 42500000,
      liquidations24h: 23,
      totalLiquidated: 2850000,
      avgLiquidationSize: 124000,
      topLiquidators: [
        { address: '0x1234...5678', count: 8, volume: 980000 },
        { address: '0x8765...4321', count: 6, volume: 750000 },
        { address: '0xabcd...efgh', count: 5, volume: 620000 }
      ]
    });
  }, []);

  const getHealthColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'text-green-500';
    if (healthFactor >= 1.2) return 'text-yellow-500';
    if (healthFactor >= 1.1) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBg = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'bg-green-500/10 border-green-500/30';
    if (healthFactor >= 1.2) return 'bg-yellow-500/10 border-yellow-500/30';
    if (healthFactor >= 1.1) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} mins`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Liquidation Monitor</h1>
              <p className="text-gray-400">Track at-risk positions and liquidation opportunities</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  autoRefresh
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>

              {/* Alerts Toggle */}
              <button
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  alertsEnabled
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                <Bell className="w-4 h-4" />
                Alerts {alertsEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* Critical Alert */}
          {positions.some(p => p.healthFactor < 1.1) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
            >
              <Flame className="w-6 h-6 text-red-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-red-200 font-semibold">Critical Liquidation Risk</p>
                <p className="text-red-200/70 text-sm">
                  {positions.filter(p => p.healthFactor < 1.1).length} positions are at immediate risk of liquidation
                </p>
              </div>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
                View Positions
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total at Risk</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ${(stats.totalAtRisk / 1e6).toFixed(1)}M
              </div>
              <div className="text-xs text-orange-400 mt-1">
                {positions.length} positions
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Liquidations 24h</span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.liquidations24h}
              </div>
              <div className="text-xs text-red-400 mt-1">
                +15% vs yesterday
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Liquidated</span>
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ${(stats.totalLiquidated / 1e6).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-400 mt-1">This week</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Avg Size</span>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ${(stats.avgLiquidationSize / 1e3).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400 mt-1">Per liquidation</div>
            </motion.div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['at-risk', 'opportunities', 'history', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'at-risk' && 'At Risk'}
              {tab === 'opportunities' && 'Opportunities'}
              {tab === 'history' && 'History'}
              {tab === 'analytics' && 'Analytics'}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'at-risk' && (
            <motion.div
              key="at-risk"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Filter Controls */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Health Factor &lt;</span>
                    <input
                      type="number"
                      value={filterThreshold}
                      onChange={(e) => setFilterThreshold(parseFloat(e.target.value))}
                      step="0.1"
                      min="1"
                      max="2"
                      className="w-20 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['health', 'size', 'profit'] as const).map((sort) => (
                      <button
                        key={sort}
                        onClick={() => setSortBy(sort)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          sortBy === sort
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        Sort by {sort}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Positions List */}
              <div className="space-y-3">
                {positions
                  .filter(p => p.healthFactor < filterThreshold)
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'health': return a.healthFactor - b.healthFactor;
                      case 'size': return b.collateralValue - a.collateralValue;
                      case 'profit': return b.potentialProfit - a.potentialProfit;
                      default: return 0;
                    }
                  })
                  .map((position, index) => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 rounded-xl border ${getHealthBg(position.healthFactor)} backdrop-blur-lg`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            position.healthFactor < 1.1 ? 'bg-red-500/20' : 'bg-orange-500/20'
                          }`}>
                            <span className="text-white font-bold">{position.collateralType}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">CDP #{position.id.slice(-6)}</span>
                              {position.healthFactor < 1.1 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">Owner: {position.owner}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getHealthColor(position.healthFactor)}`}>
                            {position.healthFactor.toFixed(3)}
                          </div>
                          <div className="text-gray-400 text-sm">Health Factor</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Collateral</div>
                          <div className="text-white font-medium">
                            {position.collateralAmount} {position.collateralType}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ${position.collateralValue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Debt</div>
                          <div className="text-white font-medium">
                            ${position.debtAmount.toLocaleString()}
                          </div>
                          <div className="text-gray-500 text-xs">NYXUSD</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Liq. Price</div>
                          <div className="text-white font-medium">
                            ${position.liquidationPrice}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Current: ${position.currentPrice}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Est. Time</div>
                          <div className="text-white font-medium flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {position.timeToLiquidation ? formatTime(position.timeToLiquidation) : 'N/A'}
                          </div>
                          <div className="text-gray-500 text-xs">to liquidation</div>
                        </div>
                      </div>

                      {/* Price Distance Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Price Distance to Liquidation</span>
                          <span className="text-white">
                            ${(position.currentPrice - position.liquidationPrice).toFixed(0)} (
                            {(((position.currentPrice - position.liquidationPrice) / position.currentPrice) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            style={{ 
                              width: `${100 - ((position.currentPrice - position.liquidationPrice) / position.currentPrice) * 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Potential Profit:</span>
                          <span className="text-green-400 font-medium">
                            ${position.potentialProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Monitor
                          </button>
                          <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Liquidate
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Opportunity Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {positions
                  .filter(p => p.healthFactor < 1.3)
                  .sort((a, b) => b.potentialProfit - a.potentialProfit)
                  .map((position, index) => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Target className="w-8 h-8 text-green-400" />
                          <div>
                            <h3 className="text-white font-semibold">Liquidation Opportunity</h3>
                            <p className="text-gray-400 text-sm">CDP #{position.id.slice(-6)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            +${position.potentialProfit.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">Est. Profit</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Required</div>
                          <div className="text-white font-medium">
                            ${position.debtAmount.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Receive</div>
                          <div className="text-white font-medium">
                            {position.collateralAmount} {position.collateralType}
                          </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">ROI</div>
                          <div className="text-green-400 font-medium">
                            {((position.potentialProfit / position.debtAmount) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all">
                        Execute Liquidation
                      </button>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Top Liquidators */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Top Liquidators</h3>
                <div className="space-y-3">
                  {stats?.topLiquidators.map((liquidator, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{liquidator.address}</div>
                          <div className="text-gray-400 text-sm">{liquidator.count} liquidations</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${(liquidator.volume / 1e3).toFixed(0)}K
                        </div>
                        <div className="text-gray-400 text-sm">Volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Liquidation Volume</h3>
                  <div className="h-64 flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-gray-600" />
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Health Factor Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <Activity className="w-12 h-12 text-gray-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiquidationMonitor;