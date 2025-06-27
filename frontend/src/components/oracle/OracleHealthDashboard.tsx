/**
 * Oracle Health Monitoring Dashboard
 * 
 * Real-time monitoring dashboard for oracle service health,
 * performance metrics, and consensus status
 */

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

interface OracleMetrics {
  totalFeeds: number
  healthyFeeds: number
  averageConfidence: number
  averageStaleness: number
  uptime: number
  lastUpdate: string
}

interface OracleFeedHealth {
  feedId: string
  status: 'healthy' | 'degraded' | 'offline'
  confidence: number
  staleness: number
  lastPrice: string
  priceChange24h: number
  responseTime: number
  errorRate: number
}

interface ConsensusMetrics {
  consensusReached: boolean
  participatingOracles: number
  totalOracles: number
  consensusThreshold: number
  outlierCount: number
  qualityScore: number
}

interface PrivacyMetrics {
  totalPrivateQueries: number
  successfulZKProofs: number
  failedZKProofs: number
  averageProofTime: number
  encryptionSuccess: number
}

export interface OracleHealthDashboardProps {
  className?: string
}

export const OracleHealthDashboard: React.FC<OracleHealthDashboardProps> = ({
  className = ''
}) => {
  const [selectedFeed, setSelectedFeed] = useState<string>('ETH/USD')
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds

  // Mock data - in production would fetch from API
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['oracleMetrics'],
    queryFn: async (): Promise<OracleMetrics> => ({
      totalFeeds: 4,
      healthyFeeds: 4,
      averageConfidence: 96.5,
      averageStaleness: 15,
      uptime: 99.8,
      lastUpdate: new Date().toISOString(),
    }),
    refetchInterval: refreshInterval,
  })

  const { data: feedsHealth, isLoading: feedsLoading } = useQuery({
    queryKey: ['oracleFeedsHealth'],
    queryFn: async (): Promise<OracleFeedHealth[]> => [
      {
        feedId: 'ETH/USD',
        status: 'healthy',
        confidence: 98,
        staleness: 12,
        lastPrice: '3,420.50',
        priceChange24h: 2.4,
        responseTime: 120,
        errorRate: 0.2,
      },
      {
        feedId: 'BTC/USD',
        status: 'healthy',
        confidence: 97,
        staleness: 8,
        lastPrice: '98,150.00',
        priceChange24h: -1.2,
        responseTime: 95,
        errorRate: 0.1,
      },
      {
        feedId: 'ADA/USD',
        status: 'degraded',
        confidence: 89,
        staleness: 45,
        lastPrice: '1.08',
        priceChange24h: 5.6,
        responseTime: 250,
        errorRate: 2.1,
      },
      {
        feedId: 'DUST/USD',
        status: 'healthy',
        confidence: 95,
        staleness: 20,
        lastPrice: '0.15',
        priceChange24h: 0.8,
        responseTime: 110,
        errorRate: 0.5,
      },
    ],
    refetchInterval: refreshInterval,
  })

  const { data: consensus, isLoading: consensusLoading } = useQuery({
    queryKey: ['consensusMetrics'],
    queryFn: async (): Promise<ConsensusMetrics> => ({
      consensusReached: true,
      participatingOracles: 3,
      totalOracles: 4,
      consensusThreshold: 80,
      outlierCount: 1,
      qualityScore: 94.2,
    }),
    refetchInterval: refreshInterval,
  })

  const { data: privacy, isLoading: privacyLoading } = useQuery({
    queryKey: ['privacyMetrics'],
    queryFn: async (): Promise<PrivacyMetrics> => ({
      totalPrivateQueries: 156,
      successfulZKProofs: 152,
      failedZKProofs: 4,
      averageProofTime: 180,
      encryptionSuccess: 156,
    }),
    refetchInterval: refreshInterval,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'offline': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'degraded':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'offline':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  if (metricsLoading || feedsLoading || consensusLoading || privacyLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Oracle Health Dashboard</h3>
            <p className="text-sm text-gray-500">Real-time monitoring and metrics</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Healthy Feeds</p>
              <p className="text-2xl font-bold text-green-700">
                {metrics?.healthyFeeds}/{metrics?.totalFeeds}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Avg Confidence</p>
              <p className="text-2xl font-bold text-blue-700">{metrics?.averageConfidence}%</p>
            </div>
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Uptime</p>
              <p className="text-2xl font-bold text-purple-700">{metrics?.uptime}%</p>
            </div>
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Consensus</p>
              <p className="text-2xl font-bold text-orange-700">{consensus?.qualityScore}%</p>
            </div>
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">ZK Proofs</p>
              <p className="text-2xl font-bold text-indigo-700">
                {privacy ? Math.round((privacy.successfulZKProofs / privacy.totalPrivateQueries) * 100) : 0}%
              </p>
            </div>
            <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Health Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feed Status Table */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Feed Status</h4>
          <div className="space-y-2">
            {feedsHealth?.map((feed) => (
              <div 
                key={feed.feedId}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedFeed === feed.feedId 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFeed(feed.feedId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getHealthIcon(feed.status)}
                    <div>
                      <p className="font-medium text-gray-900">{feed.feedId}</p>
                      <p className="text-xs text-gray-500">
                        {feed.confidence}% confidence • {feed.staleness}s stale
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${feed.lastPrice}</p>
                    <p className={`text-xs ${feed.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {feed.priceChange24h >= 0 ? '+' : ''}{feed.priceChange24h}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Feed Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {selectedFeed} Details
          </h4>
          {feedsHealth && (
            <div className="space-y-4">
              {(() => {
                const feed = feedsHealth.find(f => f.feedId === selectedFeed)
                if (!feed) return null

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Response Time</p>
                        <p className="text-lg font-semibold text-gray-900">{feed.responseTime}ms</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Error Rate</p>
                        <p className="text-lg font-semibold text-gray-900">{feed.errorRate}%</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Status</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feed.status)}`}>
                          {feed.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Last updated: {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Confidence Score</span>
                          <span className="font-medium">{feed.confidence}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Data Freshness</span>
                          <span className="font-medium">{feed.staleness}s ago</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">24h Change</span>
                          <span className={`font-medium ${feed.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {feed.priceChange24h >= 0 ? '+' : ''}{feed.priceChange24h}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Consensus Information */}
      {consensus && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Consensus Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{consensus.participatingOracles}/{consensus.totalOracles}</p>
              <p className="text-xs text-gray-500">Participating Oracles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{consensus.consensusThreshold}%</p>
              <p className="text-xs text-gray-500">Consensus Threshold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{consensus.outlierCount}</p>
              <p className="text-xs text-gray-500">Outliers Detected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{consensus.qualityScore}%</p>
              <p className="text-xs text-gray-500">Quality Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OracleHealthDashboard