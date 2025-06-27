import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  allocation: number;
  expectedReturn: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  color: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'CLMM Liquidity Pools',
    description: 'Concentrated liquidity market making on DEXs',
    allocation: 30,
    expectedReturn: '15-25% APY',
    riskLevel: 'high',
    explanation: 'Based on your risk tolerance and DeFi experience, CLMM pools offer higher yields through concentrated liquidity positions.',
    color: '#8B5CF6',
  },
  {
    id: '2',
    title: 'Stablecoin Yield',
    description: 'Low-risk lending and farming strategies',
    allocation: 40,
    expectedReturn: '8-12% APY',
    riskLevel: 'low',
    explanation: 'Your preference for stability makes stablecoin strategies ideal for the core of your portfolio.',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'ETH Staking',
    description: 'Liquid staking through trusted protocols',
    allocation: 20,
    expectedReturn: '4-6% APY',
    riskLevel: 'medium',
    explanation: 'ETH staking provides steady returns with moderate risk, perfect for long-term growth.',
    color: '#3B82F6',
  },
  {
    id: '4',
    title: 'Reserve Fund',
    description: 'Emergency liquidity in stablecoins',
    allocation: 10,
    expectedReturn: '0-2% APY',
    riskLevel: 'low',
    explanation: 'Maintaining liquid reserves ensures you can handle unexpected expenses without disrupting investments.',
    color: '#6B7280',
  },
];

interface RecommendationsDisplayProps {
  className?: string;
  onComplete?: (data?: any) => void;
}

export const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({ className = '', onComplete }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'text-green-400 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'high':
        return 'text-red-400 bg-red-400/10';
    }
  };

  const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
    return risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
  };

  // Calculate pie chart segments
  const calculatePieSegments = () => {
    let cumulativePercentage = 0;
    return mockRecommendations.map((rec) => {
      const startAngle = (cumulativePercentage * 360) / 100;
      cumulativePercentage += rec.allocation;
      const endAngle = (cumulativePercentage * 360) / 100;
      return {
        ...rec,
        startAngle,
        endAngle,
      };
    });
  };

  const pieSegments = calculatePieSegments();

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Your Personalized Investment Strategy
        </h2>
        <p className="text-gray-400">
          AI-powered recommendations based on your profile and market conditions
        </p>
      </motion.div>

      {/* Portfolio Overview - Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={mounted ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Portfolio Allocation</h3>
        
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Pie Chart */}
          <div className="relative w-64 h-64">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full transform -rotate-90"
            >
              {pieSegments.map((segment, index) => {
                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                const x1 = 100 + 80 * Math.cos((segment.startAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((segment.startAngle * Math.PI) / 180);
                const x2 = 100 + 80 * Math.cos((segment.endAngle * Math.PI) / 180);
                const y2 = 100 + 80 * Math.sin((segment.endAngle * Math.PI) / 180);

                return (
                  <motion.path
                    key={segment.id}
                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={mounted ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
              {/* Center circle for donut effect */}
              <circle
                cx="100"
                cy="100"
                r="50"
                fill="#1F2937"
                className="pointer-events-none"
              />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-400">Allocated</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {mockRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: rec.color }}
                />
                <span className="text-gray-300 flex-1">{rec.title}</span>
                <span className="text-white font-semibold">{rec.allocation}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-white mb-1">{rec.title}</h4>
                <p className="text-gray-400 text-sm">{rec.description}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskLevel)}`}>
                {getRiskLabel(rec.riskLevel)}
              </div>
            </div>

            {/* Allocation Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Allocation</span>
                <span className="text-lg font-semibold text-white">{rec.allocation}%</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={mounted ? { width: `${rec.allocation}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${rec.color} 0%, ${rec.color}99 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Expected Return */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Expected Return</span>
                <span className="text-lg font-semibold text-green-400">{rec.expectedReturn}</span>
              </div>
            </div>

            {/* Personalized Explanation */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-300 leading-relaxed">{rec.explanation}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-8 text-center"
      >
        <button 
          onClick={() => onComplete?.()}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
        >
          Implement Strategy
        </button>
        <p className="mt-4 text-sm text-gray-400">
          Review and customize your strategy before implementing
        </p>
      </motion.div>
    </div>
  );
};