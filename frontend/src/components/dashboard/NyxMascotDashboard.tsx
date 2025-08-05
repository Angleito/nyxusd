import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, 
  DollarSign, 
  BarChart3,
  Sparkles,
  ArrowRight,
  Wallet,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const NyxMascotDashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section with Mascot */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col lg:flex-row items-center justify-between mb-12"
        >
          {/* Left side - Welcome text and mascot */}
          <div className="flex-1 flex flex-col lg:flex-row items-center gap-8">
            {/* Floating Nyx Orb */}
            <motion.div 
              animate={floatAnimation}
              className="relative"
            >
              <div className="w-48 h-48 lg:w-64 lg:h-64 relative flex items-center justify-center">
                {/* Central Orb - NYX */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 lg:w-52 lg:h-52 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  {/* Nyx Icon in center */}
                  <img 
                    src="/nyx-assets/images/nyx-icon.svg"
                    alt="NYX"
                    className="w-24 h-24 lg:w-32 lg:h-32 filter drop-shadow-2xl"
                  />
                </motion.div>

                {/* Orbiting rings */}
                <motion.div
                  className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute inset-4 border border-cyan-300/20 rounded-full"
                  animate={{
                    scale: [1.1, 1, 1.1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                />

                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10" />
              </div>
            </motion.div>

            {/* Welcome text */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-white">Welcome to </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  NYXUSD
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Your AI-powered stablecoin protocol with Nyx-chan! 🌙
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/ai-assistant">
                  <Button 
                    variant="primary" 
                    icon={<Sparkles className="w-5 h-5" />}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Chat with Nyx-chan
                  </Button>
                </Link>
                <Link to="/cdp">
                  <Button 
                    variant="secondary" 
                    icon={<DollarSign className="w-5 h-5" />}
                  >
                    Mint NYXUSD
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Quick stats */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 lg:mt-0"
          >
            <Card className="bg-white/10 backdrop-blur-md border-blue-500/30 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Protocol Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Value Locked</span>
                  <span className="text-2xl font-bold text-blue-400">$42.5M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">NYXUSD Supply</span>
                  <span className="text-2xl font-bold text-cyan-400">15.2M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">APY</span>
                  <span className="text-2xl font-bold text-green-400">12.5%</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border-blue-500/30 p-6 hover:scale-105 transition-transform cursor-pointer">
            <Shield className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Secure CDPs</h3>
            <p className="text-gray-300">Create collateralized positions with industry-leading security</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-md border-cyan-500/30 p-6 hover:scale-105 transition-transform cursor-pointer">
            <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Yield Farming</h3>
            <p className="text-gray-300">Earn rewards by providing liquidity to NYXUSD pools</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border-purple-500/30 p-6 hover:scale-105 transition-transform cursor-pointer">
            <Zap className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Assistant</h3>
            <p className="text-gray-300">Get personalized DeFi strategies from Nyx-chan</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border-green-500/30 p-6 hover:scale-105 transition-transform cursor-pointer">
            <Wallet className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Multi-Chain</h3>
            <p className="text-gray-300">Deploy across multiple blockchains seamlessly</p>
          </Card>
        </motion.div>

        {/* Action Banner */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start your DeFi journey?
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Join thousands of users earning with NYXUSD protocol
            </p>
            <Link to="/ai-assistant">
              <Button 
                variant="secondary" 
                icon={<ArrowRight className="w-5 h-5" />}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300/10 rounded-full blur-2xl translate-y-24 -translate-x-24" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NyxMascotDashboard;