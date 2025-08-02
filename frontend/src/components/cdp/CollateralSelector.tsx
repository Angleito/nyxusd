import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  Check,
  Star,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CollateralAsset {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  priceChange24h: number;
  apy: number;
  tvl: number;
  availableSupply: number;
  ltv: number; // Loan-to-Value ratio
  liquidationThreshold: number;
  liquidationPenalty: number;
  stabilityFee: number;
  minCollateral: number;
  maxCollateral: number;
  isNew?: boolean;
  isFeatured?: boolean;
  risk: 'low' | 'medium' | 'high';
}

interface CollateralSelectorProps {
  onSelect: (asset: CollateralAsset) => void;
  selectedAsset?: CollateralAsset;
}

const CollateralSelector: React.FC<CollateralSelectorProps> = ({ onSelect, selectedAsset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tvl' | 'apy' | 'risk'>('tvl');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Mock collateral assets data
  const assets: CollateralAsset[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '🔷',
      price: 2000,
      priceChange24h: 2.5,
      apy: 3.5,
      tvl: 450000000,
      availableSupply: 1000000,
      ltv: 80,
      liquidationThreshold: 85,
      liquidationPenalty: 5,
      stabilityFee: 3.5,
      minCollateral: 0.1,
      maxCollateral: 10000,
      isFeatured: true,
      risk: 'low'
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      icon: '🟠',
      price: 45000,
      priceChange24h: 3.2,
      apy: 2.8,
      tvl: 320000000,
      availableSupply: 21000,
      ltv: 75,
      liquidationThreshold: 80,
      liquidationPenalty: 7,
      stabilityFee: 4.0,
      minCollateral: 0.01,
      maxCollateral: 1000,
      risk: 'low'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '💵',
      price: 1,
      priceChange24h: 0,
      apy: 5.2,
      tvl: 180000000,
      availableSupply: 10000000,
      ltv: 90,
      liquidationThreshold: 95,
      liquidationPenalty: 2,
      stabilityFee: 1.0,
      minCollateral: 100,
      maxCollateral: 5000000,
      risk: 'low'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      icon: '🔗',
      price: 15,
      priceChange24h: -1.2,
      apy: 4.8,
      tvl: 85000000,
      availableSupply: 1000000,
      ltv: 70,
      liquidationThreshold: 75,
      liquidationPenalty: 8,
      stabilityFee: 5.5,
      minCollateral: 10,
      maxCollateral: 100000,
      risk: 'medium'
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      icon: '🦄',
      price: 6.5,
      priceChange24h: -0.8,
      apy: 6.2,
      tvl: 42000000,
      availableSupply: 1000000,
      ltv: 65,
      liquidationThreshold: 70,
      liquidationPenalty: 10,
      stabilityFee: 6.0,
      minCollateral: 20,
      maxCollateral: 50000,
      isNew: true,
      risk: 'medium'
    },
    {
      symbol: 'AAVE',
      name: 'Aave',
      icon: '👻',
      price: 95,
      priceChange24h: 4.1,
      apy: 7.5,
      tvl: 28000000,
      availableSupply: 16000,
      ltv: 60,
      liquidationThreshold: 65,
      liquidationPenalty: 10,
      stabilityFee: 7.0,
      minCollateral: 1,
      maxCollateral: 10000,
      risk: 'high'
    }
  ];

  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk === 'all' || asset.risk === filterRisk;
      return matchesSearch && matchesRisk;
    });

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return b.tvl - a.tvl;
        case 'apy':
          return b.apy - a.apy;
        case 'risk':
          const riskOrder = { 'low': 0, 'medium': 1, 'high': 2 };
          return riskOrder[a.risk] - riskOrder[b.risk];
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, filterRisk, sortBy]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Select Collateral</h2>
          <p className="text-gray-400">Choose an asset to use as collateral for your CDP</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or symbol..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <button className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white flex items-center gap-2 hover:bg-gray-700/50">
                <Filter className="w-4 h-4" />
                Sort by {sortBy}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Filter */}
            <div className="flex bg-gray-800/50 border border-gray-700 rounded-xl p-1">
              {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setFilterRisk(risk)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterRisk === risk
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  {risk !== 'all' && ' Risk'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Total TVL</div>
            <div className="text-2xl font-bold text-white">$1.28B</div>
            <div className="text-xs text-green-400 mt-1">+8.2% 24h</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Avg APY</div>
            <div className="text-2xl font-bold text-white">4.8%</div>
            <div className="text-xs text-gray-400 mt-1">Across all assets</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Active CDPs</div>
            <div className="text-2xl font-bold text-white">8,423</div>
            <div className="text-xs text-green-400 mt-1">+124 today</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Total Borrowed</div>
            <div className="text-2xl font-bold text-white">$742M</div>
            <div className="text-xs text-gray-400 mt-1">NYXUSD</div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-gray-800/50 rounded-xl border ${
                  selectedAsset?.symbol === asset.symbol
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700/50 hover:border-purple-500/50'
                } overflow-hidden cursor-pointer transition-all`}
                onClick={() => onSelect(asset)}
              >
                {/* Featured/New Badge */}
                {asset.isFeatured && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">Featured</span>
                  </div>
                )}
                {asset.isNew && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">New</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Asset Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                      {asset.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{asset.symbol}</h3>
                      <p className="text-gray-400 text-sm">{asset.name}</p>
                    </div>
                    {selectedAsset?.symbol === asset.symbol && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Price Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        ${asset.price.toLocaleString()}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {asset.priceChange24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(asset.priceChange24h)}% 24h</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(asset.risk)}`}>
                      {asset.risk.charAt(0).toUpperCase() + asset.risk.slice(1)} Risk
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">APY</div>
                      <div className="text-white font-semibold">{asset.apy}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">TVL</div>
                      <div className="text-white font-semibold">{formatValue(asset.tvl)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Max LTV</div>
                      <div className="text-white font-semibold">{asset.ltv}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Liq. Threshold</div>
                      <div className="text-white font-semibold">{asset.liquidationThreshold}%</div>
                    </div>
                  </div>

                  {/* Expand Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(showDetails === asset.symbol ? null : asset.symbol);
                    }}
                    className="w-full py-2 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    {showDetails === asset.symbol ? 'Hide' : 'View'} Details
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {showDetails === asset.symbol && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-gray-700 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Stability Fee</span>
                            <span className="text-white">{asset.stabilityFee}% APR</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Liquidation Penalty</span>
                            <span className="text-white">{asset.liquidationPenalty}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Min Collateral</span>
                            <span className="text-white">{asset.minCollateral} {asset.symbol}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Max Collateral</span>
                            <span className="text-white">{asset.maxCollateral.toLocaleString()} {asset.symbol}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Available Supply</span>
                            <span className="text-white">{asset.availableSupply.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Oracle
                          </button>
                          <button className="flex-1 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                            <Info className="w-3 h-3" />
                            Docs
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No assets found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CollateralSelector;