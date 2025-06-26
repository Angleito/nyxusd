import React from 'react'
import { Link } from 'react-router-dom'

export interface WelcomeCardProps {
  className?: string
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-xl shadow-lg p-8 text-white relative overflow-hidden ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome to NyxUSD
            </h2>
            <p className="text-purple-100 text-sm leading-relaxed max-w-md">
              Create privacy-preserving collateralized debt positions and mint nyxUSD while maintaining your financial privacy on Midnight.
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              to="/cdp" 
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white border-opacity-20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm">Create CDP</div>
                  <div className="text-xs text-purple-100 opacity-75">Start earning with collateral</div>
                </div>
              </div>
            </Link>

            <div className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white border-opacity-20 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm">View Analytics</div>
                  <div className="text-xs text-purple-100 opacity-75">Track your positions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeCard