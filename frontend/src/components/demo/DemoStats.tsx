import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Zap, Shield, Globe } from 'lucide-react';
import { DEMO_METRICS } from '../../utils/demoHelper';

export const DemoStats: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState({
    tvl: 0,
    users: 0,
    transactions: 0,
    apy: 0,
  });

  useEffect(() => {
    // Animate numbers on mount
    const targets = {
      tvl: 2400000, // $2.4M
      users: 1247,
      transactions: 15682,
      apy: 24.6,
    };

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedValues({
        tvl: Math.floor(targets.tvl * easeOutQuart),
        users: Math.floor(targets.users * easeOutQuart),
        transactions: Math.floor(targets.transactions * easeOutQuart),
        apy: parseFloat((targets.apy * easeOutQuart).toFixed(1)),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 1000); // Start animation after 1 second

    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number, prefix = '', suffix = '') => {
    if (num >= 1000000) {
      return `${prefix}${(num / 1000000).toFixed(1)}M${suffix}`;
    } else if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(1)}k${suffix}`;
    }
    return `${prefix}${num}${suffix}`;
  };

  const stats = [
    {
      icon: DollarSign,
      label: 'Protocol TVL',
      value: formatNumber(animatedValues.tvl, '$'),
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-600/20',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: formatNumber(animatedValues.users),
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20',
    },
    {
      icon: Zap,
      label: 'AI Transactions',
      value: formatNumber(animatedValues.transactions),
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20',
    },
    {
      icon: TrendingUp,
      label: 'Average APY',
      value: `${animatedValues.apy}%`,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="mt-12 mb-8"
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
            className={`relative p-4 rounded-xl bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border border-white/10`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className={`w-2 h-2 rounded-full ${stat.color} bg-current animate-pulse`} />
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-300">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="flex flex-wrap justify-center gap-6 text-sm text-gray-300"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>98.7% Success Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>155+ Supported Tokens</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>100% Oracle Health</span>
        </div>
      </motion.div>

      {/* Live Activity Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        className="mt-6 flex justify-center"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300 text-sm font-medium">Live on Base Network</span>
        </div>
      </motion.div>
    </motion.div>
  );
};