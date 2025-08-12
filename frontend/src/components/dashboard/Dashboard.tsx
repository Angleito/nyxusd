import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchSystemStats, fetchOraclePrices } from "../../services/api";
import { Card, CardContent, CardTitle, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Shield,
  DollarSign,
  BarChart3,
  UserCircle,
  ArrowRight,
  Sparkles,
  Layout,
  Wallet
} from "lucide-react";
import { WelcomeCard } from "./WelcomeCard";
import { SystemHealthCard } from "./SystemHealthCard";
import { OraclePricesCard } from "./OraclePricesCard";
import { WalletDashboardCard } from "./WalletDashboardCard";
import { StatsCard } from "./StatsCard";
import { Hero } from "./Hero";

export interface DashboardProps {
  variant?: "modern" | "hero" | "nyx";
  showHero?: boolean;
  showAIAssistant?: boolean;
  showPrivacyCard?: boolean;
  showQuickActions?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  variant = "modern",
  showHero = false,
  showAIAssistant = true,
  showPrivacyCard = true,
  showQuickActions = true,
}) => {
  const {
    data: systemStatsResp,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["systemStats"],
    queryFn: fetchSystemStats,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  // Normalize API response shape
  const systemStats = (systemStatsResp as any)?.data ?? systemStatsResp;

  const {
    data: prices,
    isLoading: pricesLoading,
    error: pricesError,
  } = useQuery({
    queryKey: ["oraclePrices"],
    queryFn: fetchOraclePrices,
    refetchInterval: 10000,
    staleTime: 5000,
  });

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

  if (statsError || pricesError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="max-w-lg mx-auto">
            <CardContent>
              <div className="text-center py-8">
                <p className="text-lg mb-4 text-red-600">
                  Failed to load system data
                </p>
                <p className="text-sm text-gray-600">
                  Please check your connection and try again
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Render the appropriate hero variant based on props
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero Section */}
          <motion.div className="lg:col-span-12" variants={itemVariants}>
            <Hero variant={variant === "nyx" ? "nyx" : (showHero && variant === "hero" ? "classic" : "mascot")} />
          </motion.div>

          {/* Welcome Card - only shown in modern variant */}
          {variant !== "nyx" && !showHero && (
            <motion.div className="lg:col-span-5" variants={itemVariants}>
              <WelcomeCard />
            </motion.div>
          )}

          {/* Wallet Dashboard Card */}
          <motion.div className="lg:col-span-4" variants={itemVariants}>
            <WalletDashboardCard className="h-full" />
          </motion.div>

          {/* Oracle Prices Card */}
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            <OraclePricesCard className="h-full" />
          </motion.div>

          {/* AI Portfolio Assistant Card */}
          {showAIAssistant && (
            <motion.div className="lg:col-span-12" variants={itemVariants}>
              <Card variant="gradient" className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                          <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                          AI Portfolio Assistant
                        </h2>
                      </div>
                      <p className="text-purple-100 text-lg mb-2">
                        Get personalized investment recommendations based on your profile
                      </p>
                    </div>
                    <Link to="/chat">
                      <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                        Start AI Consultation
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* System Health Card */}
          <motion.div className="lg:col-span-8" variants={itemVariants}>
            <SystemHealthCard systemStats={systemStats} isLoading={statsLoading} />
          </motion.div>

          {/* Privacy Protection Card */}
          {showPrivacyCard && (
            <motion.div className="lg:col-span-4" variants={itemVariants}>
              <Card variant="elevated" className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span>Privacy Protection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900">Zero-Knowledge Proofs</h4>
                      <p className="text-xs text-purple-700">Transactions verified without revealing data</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-900">Midnight Protocol</h4>
                      <p className="text-xs text-indigo-700">Built for privacy-first DeFi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <motion.div className="lg:col-span-6" variants={itemVariants}>
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layout className="w-5 h-5 text-purple-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/cdp" className="block">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all">
                        <div className="font-medium text-gray-900">Create CDP</div>
                        <div className="text-sm text-purple-600">Start earning</div>
                      </div>
                    </Link>
                    <Link to="/system" className="block">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all">
                        <div className="font-medium text-gray-900">View Stats</div>
                        <div className="text-sm text-indigo-600">System health</div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};