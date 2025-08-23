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
      icon: <FiLayers className="text-3xl" />,
      title: "Capital Efficiency Leader",
      description: "125% collateralization ratio vs Djed's 400-800%. Get 3x more liquidity from your ADA while maintaining security.",
      gradient: "from-purple-500 to-pink-500",
      stats: "3x more efficient"
    },
    {
      icon: <FiCpu className="text-3xl" />,
      title: "User-Defined Interest Rates",
      description: "Revolutionary Liquity V2 implementation on Base Network. Set your own borrowing terms with AI optimization.",
      gradient: "from-blue-500 to-purple-500",
      stats: "Your rate, your choice"
    },
    {
      icon: <FiGlobe className="text-3xl" />,
      title: "Three-Phase Architecture",
      description: "Base Network → AI optimization → Multi-chain expansion. Progressive enhancement with cutting-edge automation.",
      gradient: "from-green-500 to-blue-500",
      stats: "Cross-chain yields"
    },
    {
      icon: <FiLink className="text-3xl" />,
      title: "TEE Oracle Security",
      description: "Intel SGX hardware-secured price feeds with Charli3/Orcfax fallbacks. Price manipulation protection.",
      gradient: "from-cyan-500 to-blue-500",
      stats: "Hardware secured"
    },
    {
      icon: <FiUsers className="text-3xl" />,
      title: "Community First Launch",
      description: "Fair launch via SundaeSwap TasteTest. 70% of NYX tokens go directly to the community.",
      gradient: "from-yellow-500 to-red-500",
      stats: "70% community owned"
    },
    {
      icon: <FiMessageCircle className="text-3xl" />,
      title: "Post-Launch AI Features",
      description: "Natural language CDP management and AI automation coming in Phase 4 after core protocol launch.",
      gradient: "from-pink-500 to-orange-500",
      stats: "Coming in Phase 4"
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