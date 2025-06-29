import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchSystemStats, fetchOraclePrices } from "../../services/api";
import { WelcomeCard } from "./WelcomeCard";
import { SystemHealthCard } from "./SystemHealthCard";
import { OraclePricesCard } from "./OraclePricesCard";
import { WalletDashboardCard } from "./WalletDashboardCard";

export const ModernDashboard: React.FC = () => {
  const {
    data: systemStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["systemStats"],
    queryFn: fetchSystemStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  const {
    data: prices,
    isLoading: pricesLoading,
    error: pricesError,
  } = useQuery({
    queryKey: ["oraclePrices"],
    queryFn: fetchOraclePrices,
    refetchInterval: 10000, // Refetch every 10 seconds for prices
    staleTime: 5000, // Consider prices stale after 5 seconds
  });

  // Show global loading state only on initial load
  const isInitialLoading =
    (statsLoading || pricesLoading) && !systemStats && !prices;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-purple-300 opacity-25"></div>
        </div>
      </div>
    );
  }

  // Handle errors gracefully
  if (statsError || pricesError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Unable to Load Dashboard
            </h3>
            <p className="text-red-700 text-sm mb-4">
              There was an error loading the dashboard data. Please check your
              connection and try again.
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Welcome Card - Full width on mobile, spans 5 columns on lg */}
<motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <WelcomeCard />
          </motion.div>

          {/* Wallet Dashboard Card - Spans 4 columns on lg */}
<motion.div className="lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <WalletDashboardCard className="h-full" />
          </motion.div>

          {/* Oracle Prices Card - Spans 3 columns on lg */}
<motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <OraclePricesCard className="h-full" />
          </motion.div>

          {/* AI Portfolio Assistant Card - Full width, prominent placement */}
          <motion.div className="lg:col-span-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <motion.div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-xl shadow-lg border border-purple-500/20 p-8 hover:shadow-xl transition-all duration-300" whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                    {/* Robot/AI Icon */}
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    {/* Sparkles */}
                    <svg
                      className="w-5 h-5 text-purple-300 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      AI Portfolio Assistant
                    </h2>
                    <svg
                      className="w-5 h-5 text-purple-300 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-purple-100 text-lg mb-2">
                    Get personalized investment recommendations based on your
                    profile
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start text-sm">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-purple-100">
                      AI-Powered
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-purple-100">
                      Risk Analysis
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-purple-100">
                      Portfolio Optimization
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    to="/ai-assistant"
                    className="group inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <span>Start AI Consultation</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Floating decoration elements */}
              <div className="absolute top-4 right-4 w-20 h-20 opacity-20">
                <svg
                  className="w-full h-full text-purple-300 animate-spin-slow"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* System Health Card - Spans 8 columns on lg */}
          <motion.div className="lg:col-span-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <SystemHealthCard
              systemStats={systemStats}
              isLoading={statsLoading}
            />
          </motion.div>

          {/* Privacy Protection Card - Spans 4 columns on lg */}
          <motion.div className="lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Privacy Protection</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🔐</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Zero-Knowledge Proofs</h4>
                      <p className="text-xs text-purple-700">Transactions verified without revealing data</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 text-sm">🌙</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-900">Midnight Protocol</h4>
                      <p className="text-xs text-indigo-700">Built for privacy-first DeFi</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">🛡️</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">No Transaction History</h4>
                      <p className="text-xs text-green-700">Your activity remains completely private</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium py-2 hover:bg-purple-50 rounded-lg transition-colors">
                  Learn More About Privacy
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Additional Cards Row */}
          <motion.div className="lg:col-span-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Quick Actions</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/cdp"
                  className="group block p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Create CDP
                      </div>
                      <div className="text-sm text-purple-600">
                        Start earning
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/system"
                  className="group block p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        View Stats
                      </div>
                      <div className="text-sm text-indigo-600">
                        System health
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="lg:col-span-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
                  <span className="text-sm font-medium text-green-600">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Smart Contracts</span>
                  <span className="text-sm font-medium text-green-600">
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">
                    Liquidation Engine
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Privacy Layer</span>
                  <span className="text-sm font-medium text-green-600">
                    Secure
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium py-2 hover:bg-purple-50 rounded-lg transition-colors">
                  View System Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer CTA */}
        <motion.div className="mt-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Start?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create your first collateralized debt position and start minting
            nyxUSD while maintaining your privacy on the Midnight blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Create CDP
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernDashboard;
