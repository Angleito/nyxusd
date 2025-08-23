import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import FAQSection from './faq/FAQSection';

interface AboutPageProps {
  className?: string;
}

// Container animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

export const AboutPage: React.FC<AboutPageProps> = ({ className }) => {
  return (
    <div className={`min-h-screen bg-gray-900 ${className || ''}`}>
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center space-y-8 mb-20"
          variants={sectionVariants}
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold text-gradient-midnight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            About NyxUSD
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Base Network's most advanced user-defined interest rate CDP protocol. Revolutionary capital efficiency 
            with AI-powered DeFi automation and maximum yield opportunities.
          </motion.p>
          
          {/* Decorative elements */}
          <div className="relative mt-12">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-nyx-600 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement Section */}
        <motion.section variants={sectionVariants}>
          <Card variant="gradient" padding="xl" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-nyx-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-nyx-600 rounded-xl shadow-lg" />
                Mission Statement
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                Our mission is to unlock maximum capital efficiency on Base Network by creating the most advanced CDP protocol 
                in DeFi. We leverage Base's speed and low costs with cutting-edge yield optimization, 
                enabling users to access 5-100%+ yields while maintaining complete control over their assets.
              </p>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                By implementing user-defined interest rates and 125% collateralization, we provide maximum capital 
                efficiency in the Base ecosystem. Our AI-powered architecture creates intelligent yield optimization 
                with automated risk management and seamless DeFi integration.
              </p>
            </div>
          </Card>
        </motion.section>

        {/* Core Values Section */}
        <motion.section variants={sectionVariants}>
          <Card variant="elevated" padding="xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg" />
              Core Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Capital Efficiency",
                  description: "125% collateralization ratio vs Djed's 400-800%. Get 3x more liquidity from your ADA while maintaining security and stability.",
                  icon: "🚀",
                  gradient: "from-purple-500 to-indigo-500"
                },
                {
                  title: "User Control", 
                  description: "Set your own interest rates based on your risk tolerance. Lower rates for higher risk, premium rates for liquidation protection.",
                  icon: "⚙️",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  title: "Base Native",
                  description: "Built specifically for Base Network using Solidity smart contracts with comprehensive security audits. Your assets stay on the fastest-growing L2.",
                  icon: "🛡️",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  title: "Community Driven",
                  description: "Fair launch via SundaeSwap TasteTest. No VCs, no special allocations. 70% of NYX tokens go directly to the community.",
                  icon: "👥",
                  gradient: "from-orange-500 to-red-500"
                },
                {
                  title: "AI-Powered Yields",
                  description: "Access 5-100%+ yields on Base ecosystem with AI-powered optimization and automated risk management. Maximum efficiency.",
                  icon: "🌍",
                  gradient: "from-yellow-500 to-orange-500"
                },
                {
                  title: "TEE Security",
                  description: "Hardware-secured oracle using Intel SGX with Charli3/Orcfax fallbacks. Price manipulation becomes virtually impossible.",
                  icon: "🔐",
                  gradient: "from-teal-500 to-green-500"
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">{value.title}</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Technology Overview Section */}
        <motion.section variants={sectionVariants}>
          <Card variant="gradient" padding="xl" className="relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg" />
                Technology Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-10">
                {[
                  {
                    title: "Three-Phase Architecture",
                    description: "Base Network for security and speed → AI optimization for yields → Cross-chain deployment. Progressive enhancement with cutting-edge automation.",
                    icon: "🏗️"
                  },
                  {
                    title: "User-Defined Interest Rates", 
                    description: "Revolutionary Liquity V2 implementation on Base Network. Set your own borrowing terms with AI-powered risk optimization and natural rate discovery.",
                    icon: "⚙️"
                  },
                  {
                    title: "TEE Oracle Security",
                    description: "Intel SGX hardware-secured price feeds with cryptographic attestation. Multi-source aggregation with Charli3/Orcfax fallbacks.",
                    icon: "🔐"
                  },
                  {
                    title: "Dual Revenue Model",
                    description: "Earn from both stability fees AND deployed collateral yields. Protocol deploys minted stablecoins into yield strategies for compounding returns.",
                    icon: "💰"
                  }
                ].map((tech, index) => (
                  <motion.div
                    key={tech.title}
                    className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{tech.icon}</span>
                      <h3 className="text-xl font-semibold text-white">{tech.title}</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {tech.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Team & Community Section */}
        <motion.section variants={sectionVariants}>
          <Card variant="elevated" padding="xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg" />
              Team & Community
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  Our Team
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We're building Base Network's most capital-efficient CDP protocol, focused on maximizing 
                  yield opportunities with cutting-edge AI automation while keeping 
                  your assets secure on the fastest-growing Layer 2 ecosystem.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Our expertise spans Base Network development, AI automation, advanced DeFi protocols, 
                  and community-driven governance—all focused on making Base DeFi 
                  accessible and capital efficient for everyone.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed mt-4">
                  Learn more about our founder: 
                  <a 
                    href="https://angelortegamelton.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors ml-2 underline underline-offset-4"
                  >
                    angelortegamelton.com
                  </a>
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  Join Our Community
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  Join a global community working to make crypto accessible to everyone. 
                  Whether you're building AI tools, developing cross-chain solutions, 
                  or just starting your DeFi journey—you belong here.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Discord", gradient: "from-purple-600 to-indigo-600", icon: "💬", link: "https://discord.com/users/angleito" },
                    { name: "Website", gradient: "from-gray-700 to-gray-800", icon: "🌐", link: "https://nyxusd.com" },
                    { name: "Twitter", gradient: "from-blue-500 to-cyan-500", icon: "🐦", link: "https://twitter.com/nyx_usd" },
                    { name: "Docs", gradient: "from-orange-500 to-red-500", icon: "📚", link: "https://nyxusd.com/whitepaper" }
                  ].map((platform, index) => (
                    <motion.a
                      key={platform.name}
                      href={platform.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group px-6 py-4 bg-gradient-to-r ${platform.gradient} text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl block`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg group-hover:scale-110 transition-transform">{platform.icon}</span>
                        <span>{platform.name}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.section>
        
        {/* Call to Action Section */}
        <motion.section variants={sectionVariants}>
          <Card variant="gradient" padding="xl" className="text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20" />
            <motion.div
              className="relative z-10 space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Experience DeFi that adapts to you. With personalized investing strategies and user experiences 
                tailored to your journey, NyxUSD brings truly individualized finance to every blockchain.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/cdp'}
                >
                  Create Your First CDP
                </motion.button>
                <motion.button
                  className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-300 text-lg font-semibold rounded-xl hover:bg-purple-500/10 transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/whitepaper'}
                >
                  Read Whitepaper
                </motion.button>
              </motion.div>
            </motion.div>
          </Card>
        </motion.section>

        {/* FAQ Section */}
        <motion.section variants={sectionVariants}>
          <FAQSection />
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AboutPage;