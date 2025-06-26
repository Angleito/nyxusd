import React from 'react'
import { useQuery } from 'react-query'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { fetchSystemStats, fetchCDPs } from '../../services/api'
import { MetricsGrid } from './MetricsGrid'

const COLORS = {
  safe: '#10B981',
  warning: '#F59E0B', 
  danger: '#EF4444',
  primary: '#6366f1', // Match --nyx-primary from theme
  secondary: '#8b5cf6', // Match --nyx-secondary from theme
  tertiary: '#06b6d4', // Match --nyx-tertiary from theme
  accent: '#EC4899'
}

export const ModernSystemStats: React.FC = () => {
  const { data: systemStats, isLoading: statsLoading } = useQuery('systemStats', fetchSystemStats)
  const { data: cdpData, isLoading: cdpsLoading } = useQuery('cdps', fetchCDPs)

  if (statsLoading || cdpsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate risk distribution data
  const getRiskDistribution = () => {
    if (!(cdpData as any)?.cdps) return []
    
    const safe = (cdpData as any).cdps.filter((cdp: any) => cdp.healthFactor >= 2).length
    const warning = (cdpData as any).cdps.filter((cdp: any) => cdp.healthFactor >= 1.5 && cdp.healthFactor < 2).length
    const danger = (cdpData as any).cdps.filter((cdp: any) => cdp.healthFactor < 1.5).length

    return [
      { name: 'Safe CDPs (≥2.0x)', value: safe, color: COLORS.safe },
      { name: 'Warning CDPs (1.5-2.0x)', value: warning, color: COLORS.warning },
      { name: 'At Risk CDPs (<1.5x)', value: danger, color: COLORS.danger }
    ]
  }

  // Generate TVL trend data (mock data for visualization)
  const getTVLTrends = () => {
    const currentTVL = (systemStats as any)?.totalCollateral ? parseInt((systemStats as any).totalCollateral) / 1e18 : 0
    const periods = ['30d ago', '25d ago', '20d ago', '15d ago', '10d ago', '5d ago', 'Today']
    
    return periods.map((period, index) => ({
      period,
      tvl: currentTVL * (0.7 + (index * 0.05)) + (Math.random() - 0.5) * currentTVL * 0.1,
      supply: (systemStats as any)?.totalDebt ? (parseInt((systemStats as any).totalDebt) / 1e18) * (0.6 + (index * 0.06)) : 0
    }))
  }

  // Calculate collateral breakdown
  const getCollateralBreakdown = () => {
    if (!(systemStats as any)?.supportedCollaterals) return []
    
    return (systemStats as any).supportedCollaterals.map((collateral: any) => ({
      name: collateral.name,
      amount: parseInt(collateral.debtCeiling) / 1e18 / 1e6, // Convert to millions
      utilization: Math.random() * 80 + 10, // Mock utilization percentage
      liquidationRatio: collateral.liquidationRatio
    }))
  }

  const riskData = getRiskDistribution()
  const tvlTrends = getTVLTrends()
  const collateralData = getCollateralBreakdown()

  const totalTVL = (systemStats as any)?.totalCollateral ? parseInt((systemStats as any).totalCollateral) / 1e18 : 0
  const totalSupply = (systemStats as any)?.totalDebt ? parseInt((systemStats as any).totalDebt) / 1e18 : 0
  const collateralizationRatio = (systemStats as any)?.systemCollateralizationRatio || 0
  const totalCDPs = (cdpData as any)?.totalCDPs || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">System Analytics</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <MetricsGrid 
        totalTVL={totalTVL}
        totalSupply={totalSupply}
        collateralizationRatio={collateralizationRatio}
        totalCDPs={totalCDPs}
        systemStats={systemStats as any}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Risk Distribution Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">CDP Risk Distribution</h3>
            <div className="text-sm text-gray-500">
              Total: {riskData.reduce((sum, item) => sum + item.value, 0)} CDPs
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TVL Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">TVL & Supply Trends</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">TVL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-600">Supply</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tvlTrends}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`, 
                    name === 'tvl' ? 'Total Value Locked' : 'nyxUSD Supply'
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#tvlGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="supply"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  fill="url(#supplyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Collateral Breakdown */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Collateral Asset Breakdown</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={collateralData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}M`}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'amount') return [`$${value.toFixed(1)}M`, 'Debt Ceiling']
                  if (name === 'utilization') return [`${value.toFixed(1)}%`, 'Utilization']
                  return [value, name]
                }}
                contentStyle={{
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
              <Bar dataKey="amount" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Privacy Features Section */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Privacy Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="font-semibold text-lg mb-3">Private Balances</h4>
            <p className="text-gray-600 leading-relaxed">
              Collateral amounts and debt positions are shielded using zero-knowledge proofs
            </p>
            <div className="mt-4 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-green-800 bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
            </div>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold text-lg mb-3">Anonymous Liquidations</h4>
            <p className="text-gray-600 leading-relaxed">
              Liquidation process maintains privacy while ensuring system stability
            </p>
            <div className="mt-4 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-blue-800 bg-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Enabled
              </span>
            </div>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
              <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-lg mb-3">DUST Integration</h4>
            <p className="text-gray-600 leading-relaxed">
              Powered by Midnight's DUST token for privacy-preserving transaction fees
            </p>
            <div className="mt-4 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-purple-800 bg-purple-100">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Integrated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}