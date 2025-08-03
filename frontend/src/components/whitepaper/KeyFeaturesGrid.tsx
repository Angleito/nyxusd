import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCpu, 
  FiLayers, 
  FiGlobe, 
  FiMessageCircle, 
  FiLink,
  FiUsers 
} from 'react-icons/fi';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  stats?: string;
}

export const KeyFeaturesGrid: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <FiCpu className="text-3xl" />,
      title: "AI Contract Generation",
      description: "First protocol where AI creates custom smart contracts from natural language requests",
      gradient: "from-purple-500 to-pink-500",
      stats: "3% creation + 10% performance"
    },
    {
      icon: <FiLayers className="text-3xl" />,
      title: "Dual Revenue CDP Model",
      description: "Earn from both stability fees (5%) AND deployed collateral yields (3-8%)",
      gradient: "from-blue-500 to-purple-500",
      stats: "2.46x revenue multiplier"
    },
    {
      icon: <FiGlobe className="text-3xl" />,
      title: "Cross-Chain Native",
      description: "Seamless yield optimization across Base and Sui without manual bridging",
      gradient: "from-green-500 to-blue-500",
      stats: "40% lower gas costs"
    },
    {
      icon: <FiMessageCircle className="text-3xl" />,
      title: "Natural Language Interface",
      description: "Transform complex DeFi strategies into simple conversations with AI",
      gradient: "from-pink-500 to-orange-500",
      stats: "3 clicks to yield"
    },
    {
      icon: <FiLink className="text-3xl" />,
      title: "CEX/DEX Hybrid Bridging",
      description: "Intelligent routing between decentralized and centralized exchanges for optimal efficiency",
      gradient: "from-cyan-500 to-blue-500",
      stats: "Best execution paths"
    },
    {
      icon: <FiUsers className="text-3xl" />,
      title: "Community Owned",
      description: "50% of tokens allocated to community, ensuring true decentralization",
      gradient: "from-yellow-500 to-red-500",
      stats: "500M NYX tokens"
    }
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
               style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl`} />
          </div>
          
          <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 h-full">
            {/* Icon Container */}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 text-white shadow-lg`}>
              {feature.icon}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {feature.description}
            </p>

            {/* Stats Badge */}
            {feature.stats && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                </span>
                {feature.stats}
              </div>
            )}

            {/* Hover Effect Gradient Border */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className={`absolute inset-[1px] bg-gray-800/50 rounded-2xl`} />
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-20`} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};