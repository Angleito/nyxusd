import React from 'react'

export interface OraclePricesCardProps {
  prices?: any
  isLoading?: boolean
  className?: string
}

export const OraclePricesCard: React.FC<OraclePricesCardProps> = ({
  prices,
  isLoading = false,
  className = ''
}) => {
  const formatPrice = (price: any) => {
    if (typeof price === 'string') {
      return parseFloat(price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })
    }
    return String(price)
  }

  const generateTrendData = (pair: string) => {
    // Mock trend data - in a real app, this would come from historical data
    const trends = {
      'BTC/USD': { change: 2.34, isPositive: true },
      'ETH/USD': { change: -1.23, isPositive: false },
      'ADA/USD': { change: 5.67, isPositive: true },
      'DUST/USD': { change: 0.89, isPositive: true },
    }
    return trends[pair as keyof typeof trends] || { change: 0, isPositive: true }
  }

  const getPairIcon = (pair: string) => {
    const baseAsset = pair.split('/')[0]
    switch (baseAsset) {
      case 'BTC':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-bold text-xs">₿</span>
          </div>
        )
      case 'ETH':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xs">Ξ</span>
          </div>
        )
      case 'ADA':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xs">A</span>
          </div>
        )
      case 'DUST':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-xs">D</span>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-bold text-xs">$</span>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Oracle Prices</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {prices?.prices && Object.entries(prices.prices).map(([pair, price]) => {
          const trend = generateTrendData(pair)
          return (
            <div 
              key={pair} 
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 border border-gray-100 hover:border-purple-200"
            >
              <div className="flex items-center space-x-3">
                {getPairIcon(pair)}
                <div>
                  <div className="font-medium text-gray-900">{pair}</div>
                  <div className={`text-xs flex items-center space-x-1 ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <svg 
                      className={`w-3 h-3 ${trend.isPositive ? '' : 'rotate-180'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                    <span>{trend.change}%</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ${formatPrice(price)}
                </div>
                <div className="text-xs text-gray-500">USD</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Last updated: {prices?.timestamp ? new Date(prices.timestamp).toLocaleString() : 'Loading...'}
          </span>
          
          <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 text-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Price Chart Placeholder */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Market Summary</h4>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Live</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Market Cap</div>
              <div className="font-semibold text-gray-900">$2.1T</div>
            </div>
            <div>
              <div className="text-gray-500">24h Volume</div>
              <div className="font-semibold text-gray-900">$45.2B</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OraclePricesCard