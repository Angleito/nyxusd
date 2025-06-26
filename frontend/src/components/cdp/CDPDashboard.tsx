import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { fetchCDPs } from '../../services/api'
// import { CDPCard } from './CDPCard'
// import { CreateCDPWizard } from './CreateCDPWizard'

interface QuickStatsCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral',
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900'
  }

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '→'
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-70">{title}</h3>
        {trend !== 'neutral' && (
          <span className="text-xs opacity-60">{trendIcons[trend]}</span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
    </div>
  )
}

interface PortfolioSummaryCardProps {
  totalValue: number
  totalDebt: number
  netWorth: number
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  totalValue,
  totalDebt,
  netWorth
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
      <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-indigo-100">Total Collateral</span>
          <span className="font-bold">${totalValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-indigo-100">Total Debt</span>
          <span className="font-bold">${totalDebt.toLocaleString()}</span>
        </div>
        <div className="border-t border-indigo-300 pt-3 flex justify-between items-center">
          <span className="text-white font-medium">Net Worth</span>
          <span className="font-bold text-xl">${netWorth.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

interface RiskIndicatorCardProps {
  averageHealthFactor: number
  riskLevel: 'low' | 'medium' | 'high'
  cdpsAtRisk: number
}

const RiskIndicatorCard: React.FC<RiskIndicatorCardProps> = ({
  averageHealthFactor,
  riskLevel,
  cdpsAtRisk
}) => {
  const riskColors = {
    low: 'bg-green-50 border-green-200 text-green-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    high: 'bg-red-50 border-red-200 text-red-900'
  }

  const riskIndicators = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${riskColors[riskLevel]} transition-all duration-200`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{riskIndicators[riskLevel]}</span>
        <h3 className="text-lg font-semibold">Risk Overview</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm opacity-70">Avg Health Factor</span>
          <span className="font-bold">{averageHealthFactor.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm opacity-70">CDPs at Risk</span>
          <span className="font-bold">{cdpsAtRisk}</span>
        </div>
      </div>
    </div>
  )
}

export const CDPDashboard: React.FC = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [expandedActions, setExpandedActions] = useState(false)
  
  const { data: cdpData, isLoading } = useQuery('cdps', fetchCDPs)

  // Calculate dashboard metrics
  const cdps = (cdpData as any)?.cdps || []
  const totalCDPs = cdps.length
  const totalCollateralValue = cdps.reduce((sum: number, cdp: any) => 
    sum + (parseInt(cdp.collateralAmount) / 1e18), 0
  )
  const totalDebt = cdps.reduce((sum: number, cdp: any) => 
    sum + (parseInt(cdp.debtAmount) / 1e18), 0
  )
  const averageHealthFactor = cdps.length > 0 
    ? cdps.reduce((sum: number, cdp: any) => sum + cdp.healthFactor, 0) / cdps.length
    : 0
  const cdpsAtRisk = cdps.filter((cdp: any) => cdp.healthFactor < 1.5).length
  const riskLevel: 'low' | 'medium' | 'high' = 
    averageHealthFactor >= 2 ? 'low' : 
    averageHealthFactor >= 1.5 ? 'medium' : 'high'

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CDP Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your Collateralized Debt Positions</p>
        </div>
        <button
          onClick={() => setShowCreateWizard(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          Create New CDP
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCard
          title="Total CDPs"
          value={totalCDPs.toString()}
          subtitle="Active positions"
          color="purple"
        />
        <QuickStatsCard
          title="Total Collateral"
          value={`${totalCollateralValue.toFixed(2)} ETH`}
          subtitle="Locked value"
          color="blue"
        />
        <QuickStatsCard
          title="Total Debt"
          value={`${totalDebt.toFixed(0)} nyxUSD`}
          subtitle="Outstanding debt"
          color="orange"
        />
        <QuickStatsCard
          title="Avg Health Factor"
          value={averageHealthFactor.toFixed(2)}
          subtitle={riskLevel === 'low' ? 'Healthy' : riskLevel === 'medium' ? 'Moderate' : 'At Risk'}
          color={riskLevel === 'low' ? 'green' : riskLevel === 'medium' ? 'orange' : 'orange'}
          trend={averageHealthFactor >= 2 ? 'up' : averageHealthFactor >= 1.5 ? 'neutral' : 'down'}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioSummaryCard
          totalValue={totalCollateralValue * 2000} // Assuming ETH price
          totalDebt={totalDebt}
          netWorth={totalCollateralValue * 2000 - totalDebt}
        />
        <RiskIndicatorCard
          averageHealthFactor={averageHealthFactor}
          riskLevel={riskLevel}
          cdpsAtRisk={cdpsAtRisk}
        />
      </div>

      {/* Modern Actions Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <button
            onClick={() => setExpandedActions(!expandedActions)}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            {expandedActions ? 'Show Less' : 'Show More'}
          </button>
        </div>
        
        <div className={`grid gap-4 transition-all duration-300 ${expandedActions ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
          <button
            onClick={() => setShowCreateWizard(true)}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200">
              <span className="text-purple-600 font-bold">+</span>
            </div>
            <span className="font-medium text-gray-700 group-hover:text-purple-700">Create CDP</span>
          </button>
          
          {expandedActions && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">📊</span>
                </div>
                <span className="font-medium text-blue-700">Analytics</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600">⚡</span>
                </div>
                <span className="font-medium text-green-700">Batch Operations</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600">🔔</span>
                </div>
                <span className="font-medium text-orange-700">Alerts</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CDP List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your CDPs ({totalCDPs})
          </h2>
          {totalCDPs > 0 && (
            <div className="flex gap-2">
              <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100">
                Sort by Health
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100">
                Filter
              </button>
            </div>
          )}
        </div>

        {totalCDPs === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No CDPs Yet</h3>
            <p className="text-gray-600 mb-4">Create your first Collateralized Debt Position to get started</p>
            <button
              onClick={() => setShowCreateWizard(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Create Your First CDP
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {cdps.map((cdp: any) => (
              <div key={cdp.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">CDP #{cdp.id}</h3>
                    <p className="text-sm text-gray-500">Collateral: {(parseInt(cdp.collateralAmount) / 1e18).toFixed(4)} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Debt</p>
                    <p className="text-lg font-semibold">{(parseInt(cdp.debtAmount) / 1e18).toFixed(2)} nyxUSD</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Health Factor:</span>
                    <span className={`font-semibold ${cdp.healthFactor >= 2 ? 'text-green-600' : cdp.healthFactor >= 1.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {cdp.healthFactor.toFixed(2)}
                    </span>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create CDP Wizard Modal */}
      {showCreateWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New CDP</h2>
            <p className="text-gray-600 mb-6">CDP creation wizard coming soon...</p>
            <button
              onClick={() => setShowCreateWizard(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}