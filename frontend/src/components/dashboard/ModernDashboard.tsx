import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSystemStats, fetchOraclePrices } from '../../services/api'
import { WelcomeCard } from './WelcomeCard'
import { SystemHealthCard } from './SystemHealthCard'
import { OraclePricesCard } from './OraclePricesCard'
import { RecentActivityCard } from './RecentActivityCard'

export const ModernDashboard: React.FC = () => {
  const { data: systemStats, isLoading: statsLoading, error: statsError } = useQuery(['systemStats'], fetchSystemStats, {
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  })
  
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useQuery(['oraclePrices'], fetchOraclePrices, {
    refetchInterval: 10000, // Refetch every 10 seconds for prices
    staleTime: 5000, // Consider prices stale after 5 seconds
  })

  // Show global loading state only on initial load
  const isInitialLoading = (statsLoading || pricesLoading) && !systemStats && !prices

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-purple-300 opacity-25"></div>
        </div>
      </div>
    )
  }

  // Handle errors gracefully
  if (statsError || pricesError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-red-700 text-sm mb-4">
              There was an error loading the dashboard data. Please check your connection and try again.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Welcome Card - Full width on mobile, spans 8 columns on lg */}
          <div className="lg:col-span-8">
            <WelcomeCard />
          </div>

          {/* Oracle Prices Card - Spans 4 columns on lg */}
          <div className="lg:col-span-4">
            <OraclePricesCard 
              prices={prices} 
              isLoading={pricesLoading}
              className="h-full"
            />
          </div>

          {/* System Health Card - Spans 8 columns on lg */}
          <div className="lg:col-span-8">
            <SystemHealthCard 
              systemStats={systemStats} 
              isLoading={statsLoading}
            />
          </div>

          {/* Recent Activity Card - Spans 4 columns on lg */}
          <div className="lg:col-span-4">
            <RecentActivityCard 
              isLoading={false}
              className="h-full"
            />
          </div>

          {/* Additional Cards Row */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Quick Actions</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link to="/cdp" className="group block p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Create CDP</div>
                      <div className="text-sm text-purple-600">Start earning</div>
                    </div>
                  </div>
                </Link>
                
                <Link to="/system" className="group block p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">View Stats</div>
                      <div className="text-sm text-indigo-600">System health</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>System Status</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Operational</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Oracle Network</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Smart Contracts</span>
                  <span className="text-sm font-medium text-green-600">Verified</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Liquidation Engine</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Privacy Layer</span>
                  <span className="text-sm font-medium text-green-600">Secure</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium py-2 hover:bg-purple-50 rounded-lg transition-colors">
                  View System Details
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create your first collateralized debt position and start minting nyxUSD while maintaining your privacy on the Midnight blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Create CDP
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernDashboard