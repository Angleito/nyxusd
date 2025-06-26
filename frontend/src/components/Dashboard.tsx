import React from 'react'
import { useQuery } from 'react-query'
import { fetchSystemStats, fetchOraclePrices } from '../services/api'

export const Dashboard: React.FC = () => {
  const { data: systemStats, isLoading: statsLoading } = useQuery('systemStats', fetchSystemStats)
  const { data: prices, isLoading: pricesLoading } = useQuery('oraclePrices', fetchOraclePrices)

  if (statsLoading || pricesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">System Overview</h2>
        <p className="text-gray-600">
          Welcome to NyxUSD, a privacy-preserving CDP protocol built on Midnight. 
          Create collateralized debt positions to mint nyxUSD while maintaining your financial privacy.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">${(systemStats as any)?.totalCollateral ? (parseInt((systemStats as any).totalCollateral) / 1e18).toLocaleString() : '0'}</div>
          <div className="stat-label">Total Collateral</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${(systemStats as any)?.totalDebt ? (parseInt((systemStats as any).totalDebt) / 1e18).toLocaleString() : '0'}</div>
          <div className="stat-label">Total Debt Issued</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(systemStats as any)?.systemCollateralizationRatio || 0}%</div>
          <div className="stat-label">System Ratio</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(systemStats as any)?.stabilityFeeRate ? ((systemStats as any).stabilityFeeRate / 100).toFixed(1) : '0.0'}%</div>
          <div className="stat-label">Stability Fee APR</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Oracle Prices</h3>
          <div className="space-y-3">
            {(prices as any)?.prices && Object.entries((prices as any).prices).map(([pair, price]) => (
              <div key={pair} className="flex justify-between items-center">
                <span className="font-medium">{pair}</span>
                <span className="text-lg font-semibold">${typeof price === 'string' ? parseFloat(price).toLocaleString() : String(price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {(prices as any)?.timestamp ? new Date((prices as any).timestamp).toLocaleString() : 'Loading...'}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Supported Collaterals</h3>
          <div className="space-y-4">
            {(systemStats as any)?.supportedCollaterals?.map((collateral: any) => (
              <div key={collateral.type} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{collateral.name} ({collateral.type})</span>
                  <span className="text-sm text-gray-500">{collateral.decimals} decimals</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Liquidation Ratio:</span>
                    <span className="ml-2 font-medium">{collateral.liquidationRatio}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stability Fee:</span>
                    <span className="ml-2 font-medium">{(collateral.stabilityFee / 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/cdp" className="btn-primary inline-block">
          Create Your First CDP
        </Link>
      </div>
    </div>
  )
}

// Add Link import
import { Link } from 'react-router-dom'