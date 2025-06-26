import React from 'react'
import { StatsCard } from './StatsCard'

export interface SystemHealthCardProps {
  systemStats?: any
  isLoading?: boolean
  className?: string
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  systemStats,
  isLoading = false,
  className = ''
}) => {
  const getHealthStatus = () => {
    if (!systemStats) return { status: 'unknown', color: 'gray' }
    
    const ratio = systemStats.systemCollateralizationRatio || 0
    if (ratio >= 200) return { status: 'Excellent', color: 'green' }
    if (ratio >= 150) return { status: 'Good', color: 'blue' }
    if (ratio >= 120) return { status: 'Warning', color: 'yellow' }
    return { status: 'Critical', color: 'red' }
  }

  const health = getHealthStatus()

  const formatCurrency = (value: string | number) => {
    if (!value) return '$0'
    const num = typeof value === 'string' ? parseInt(value) / 1e18 : value
    return `$${num.toLocaleString()}`
  }

  const stats = [
    {
      title: 'Total Collateral',
      value: formatCurrency(systemStats?.totalCollateral || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: 'Total Debt',
      value: formatCurrency(systemStats?.totalDebt || 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'System Ratio',
      value: `${systemStats?.systemCollateralizationRatio || 0}%`,
      subtitle: `System Health: ${health.status}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: 'Stability Fee',
      value: `${systemStats?.stabilityFeeRate ? (systemStats.stabilityFeeRate / 100).toFixed(1) : '0.0'}%`,
      subtitle: 'Annual Percentage Rate',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCard
              key={i}
              title="Loading..."
              value="..."
              isLoading={true}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Health Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            health.color === 'green' ? 'bg-green-100 text-green-800' :
            health.color === 'blue' ? 'bg-blue-100 text-blue-800' :
            health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {health.status}
          </div>
        </div>
        
        <div className="mb-4">
          <div className={`w-full bg-gray-200 rounded-full h-2 ${
            health.color === 'green' ? 'bg-green-200' :
            health.color === 'blue' ? 'bg-blue-200' :
            health.color === 'yellow' ? 'bg-yellow-200' :
            'bg-red-200'
          }`}>
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                health.color === 'green' ? 'bg-green-500' :
                health.color === 'blue' ? 'bg-blue-500' :
                health.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min((systemStats?.systemCollateralizationRatio || 0) / 3, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          The system collateralization ratio indicates the overall health of the protocol. 
          A higher ratio means better collateral backing for the debt.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Supported Collaterals */}
      {systemStats?.supportedCollaterals && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Collaterals</h3>
          <div className="space-y-4">
            {systemStats.supportedCollaterals.map((collateral: any) => (
              <div key={collateral.type} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {collateral.type.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{collateral.name}</span>
                      <div className="text-sm text-gray-500">({collateral.type})</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{collateral.decimals} decimals</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liquidation Ratio:</span>
                    <span className="font-medium text-gray-900">{collateral.liquidationRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stability Fee:</span>
                    <span className="font-medium text-gray-900">{(collateral.stabilityFee / 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemHealthCard