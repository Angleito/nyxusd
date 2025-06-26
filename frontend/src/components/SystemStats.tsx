import React from 'react'
import { useQuery } from 'react-query'
import { fetchSystemStats, fetchCDPs } from '../services/api'

export const SystemStats: React.FC = () => {
  const { data: systemStats, isLoading: statsLoading } = useQuery('systemStats', fetchSystemStats)
  const { data: cdpData, isLoading: cdpsLoading } = useQuery('cdps', fetchCDPs)

  if (statsLoading || cdpsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">System Statistics</h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Protocol Overview */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Protocol Overview</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Financial Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value Locked:</span>
                    <span className="font-semibold">
                      ${(systemStats as any)?.totalCollateral ? (parseInt((systemStats as any).totalCollateral) / 1e18).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total nyxUSD Supply:</span>
                    <span className="font-semibold">
                      ${(systemStats as any)?.totalDebt ? (parseInt((systemStats as any).totalDebt) / 1e18).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">System Collateralization:</span>
                    <span className="font-semibold">{(systemStats as any)?.systemCollateralizationRatio || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liquidation Ratio:</span>
                    <span className="font-semibold">{(systemStats as any)?.liquidationRatio || 150}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">System Parameters</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Stability Fee:</span>
                    <span className="font-semibold">
                      {(systemStats as any)?.stabilityFeeRate ? ((systemStats as any).stabilityFeeRate / 100).toFixed(1) : '0.0'}% APR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Shutdown:</span>
                    <span className={`font-semibold ${(systemStats as any)?.emergencyShutdown ? 'text-red-600' : 'text-green-600'}`}>
                      {(systemStats as any)?.emergencyShutdown ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total CDPs:</span>
                    <span className="font-semibold">{(cdpData as any)?.totalCDPs || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="card mt-6">
            <h3 className="text-xl font-semibold mb-6">Risk Metrics</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {(cdpData as any)?.cdps?.filter((cdp: any) => cdp.healthFactor >= 2).length || 0}
                </div>
                <div className="text-sm text-gray-600">Safe CDPs (≥2.0x)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {(cdpData as any)?.cdps?.filter((cdp: any) => cdp.healthFactor >= 1.5 && cdp.healthFactor < 2).length || 0}
                </div>
                <div className="text-sm text-gray-600">Warning CDPs (1.5-2.0x)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {(cdpData as any)?.cdps?.filter((cdp: any) => cdp.healthFactor < 1.5).length || 0}
                </div>
                <div className="text-sm text-gray-600">At Risk CDPs (&lt;1.5x)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Collateral Types */}
        <div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Collateral Types</h3>
            <div className="space-y-4">
              {(systemStats as any)?.supportedCollaterals?.map((collateral: any) => (
                <div key={collateral.type} className="border-l-4 border-purple-500 pl-4">
                  <div className="font-semibold text-gray-900">{collateral.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{collateral.type}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Liquidation Ratio:</span>
                      <span className="font-medium">{collateral.liquidationRatio}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stability Fee:</span>
                      <span className="font-medium">{(collateral.stabilityFee / 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debt Ceiling:</span>
                      <span className="font-medium">
                        ${(parseInt(collateral.debtCeiling) / 1e18 / 1e6).toFixed(0)}M
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card mt-6">
            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {(cdpData as any)?.cdps?.slice(0, 5).map((cdp: any) => (
                <div key={cdp.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{cdp.id}</div>
                    <div className="text-gray-600">{new Date(cdp.lastUpdated).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{cdp.collateralType}</div>
                    <div className="text-gray-600">
                      {(parseInt(cdp.collateralAmount) / 1e18).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Features */}
      <div className="card mt-8">
        <h3 className="text-xl font-semibold mb-6">Privacy Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">Private Balances</h4>
            <p className="text-sm text-gray-600">
              Collateral amounts and debt positions are shielded using zero-knowledge proofs
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">Anonymous Liquidations</h4>
            <p className="text-sm text-gray-600">
              Liquidation process maintains privacy while ensuring system stability
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">DUST Integration</h4>
            <p className="text-sm text-gray-600">
              Powered by Midnight's DUST token for privacy-preserving transaction fees
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}