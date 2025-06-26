import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemStats, fetchOraclePrices } from '../../services/api';
import HeroSection from './HeroSection';

export const DashboardWithHero: React.FC = () => {
  const { data: systemStats, isLoading: statsLoading } = useQuery(['systemStats'], fetchSystemStats);
  const { data: prices, isLoading: pricesLoading } = useQuery(['oraclePrices'], fetchOraclePrices);

  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Dashboard Content */}
      <div className="relative z-10 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* System Stats Grid */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">System Overview</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Real-time metrics and statistics for the NYXUSD protocol ecosystem
              </p>
            </div>

            {statsLoading || pricesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="card-midnight">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    ${(systemStats as any)?.totalCollateral ? (parseInt((systemStats as any).totalCollateral) / 1e18).toLocaleString() : '0'}
                  </div>
                  <div className="text-purple-300">Total Collateral</div>
                </div>
                
                <div className="card-midnight">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    ${(systemStats as any)?.totalDebt ? (parseInt((systemStats as any).totalDebt) / 1e18).toLocaleString() : '0'}
                  </div>
                  <div className="text-purple-300">Total Debt Issued</div>
                </div>
                
                <div className="card-midnight">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {(systemStats as any)?.systemCollateralizationRatio || 0}%
                  </div>
                  <div className="text-purple-300">System Ratio</div>
                </div>
                
                <div className="card-midnight">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {(systemStats as any)?.stabilityFeeRate ? ((systemStats as any).stabilityFeeRate / 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-purple-300">Stability Fee APR</div>
                </div>
              </div>
            )}
          </div>

          {/* Oracle Prices and Collaterals Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            
            {/* Oracle Prices */}
            <div className="card-midnight">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                Live Oracle Prices
              </h3>
              <div className="space-y-4">
                {(prices as any)?.prices && Object.entries((prices as any).prices).map(([pair, price]) => (
                  <div key={pair} className="flex justify-between items-center p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                    <span className="font-medium text-gray-300">{pair}</span>
                    <span className="text-xl font-bold text-foreground">
                      ${typeof price === 'string' ? parseFloat(price).toLocaleString() : String(price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-sm text-gray-400 flex items-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                Last updated: {(prices as any)?.timestamp ? new Date((prices as any).timestamp).toLocaleString() : 'Loading...'}
              </div>
            </div>

            {/* Supported Collaterals */}
            <div className="card-midnight">
              <h3 className="text-2xl font-bold text-foreground mb-6">Supported Collaterals</h3>
              <div className="space-y-4">
                {(systemStats as any)?.supportedCollaterals?.map((collateral: any) => (
                  <div key={collateral.type} className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-purple-500/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-foreground">{collateral.name} ({collateral.type})</span>
                      <span className="text-sm text-gray-400">{collateral.decimals} decimals</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Liquidation Ratio:</span>
                        <span className="font-medium text-foreground">{collateral.liquidationRatio}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stability Fee:</span>
                        <span className="font-medium text-foreground">{(collateral.stabilityFee / 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Start?</h3>
              <p className="text-xl text-gray-300">
                Create your first Collateralized Debt Position and start minting nyxUSD with complete privacy.
              </p>
            </div>
            <Link 
              to="/cdp" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
            >
              Create Your First CDP
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWithHero;