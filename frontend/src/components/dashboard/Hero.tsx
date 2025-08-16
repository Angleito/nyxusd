import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, PlayIcon, ChevronDownIcon, SparklesIcon, Shield, DollarSign, BarChart3, UserCircle } from "lucide-react";
import { DemoStats } from "../demo/DemoStats";
import { Button } from "../ui/Button";

export interface HeroProps {
  variant?: "classic" | "nyx" | "mascot";
  show?: boolean;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ variant = "classic", show = true, className = "" }) => {
  // Don't render if show is false
  if (!show) return null;

  // Classic Hero Variant
  if (variant === "classic") {
    // Animation variants for the hero content
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.8,
          staggerChildren: 0.2,
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

    const particleVariants = {
      animate: {
        y: [-20, -60, -20],
        x: [-10, 10, -10],
        opacity: [0.3, 0.8, 0.3],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    };

    // Generate particle positions
    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
    }));

    return (
      <div className={`relative min-h-screen overflow-hidden ${className}`}>
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-800/20 to-blue-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,69,219,0.15),transparent_50%)]"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              variants={particleVariants}
              animate="animate"
              transition={{
                ...particleVariants.animate.transition,
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(139, 69, 219, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 69, 219, 0.3) 1px, transparent 1px)
            `,
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex items-center">
            {/* Asymmetric 3/5 - 2/5 grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 w-full items-center">
              {/* Content section - 3/5 */}
              <motion.div
                className="lg:col-span-3 text-center lg:text-left"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm mb-6"
                  variants={itemVariants}
                >
                  <span className="text-purple-300 text-sm font-medium">
                    Cardano CDP Protocol • Catalyst Fund 14
                  </span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight"
                  variants={itemVariants}
                >
                  Cardano's Most
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400">
                    Efficient CDP
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  variants={itemVariants}
                >
                  Mint NyxUSD stablecoins at 125% collateralization with user-defined interest rates. 
                  Bridge Cardano to 5-100%+ EVM yields.
                </motion.p>

                {/* Feature highlights */}
                <motion.div
                  className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10"
                  variants={itemVariants}
                >
                  {[
                    "125% Collateralization",
                    "User-Set Interest Rates",
                    "Cross-Chain Yields",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  variants={itemVariants}
                >
                  {/* Primary CTA - Create CDP */}
                  <Link to="/cdp">
                    <motion.button
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        <span>Create CDP</span>
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </motion.button>
                  </Link>

                  {/* Secondary CTA - Read Whitepaper */}
                  <Link to="/whitepaper">
                    <motion.button
                      className="groupe relative px-8 py-4 bg-background/10 hover:bg-background/20 text-foreground font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm border border-border/20 hover:border-border/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <PlayIcon className="w-5 h-5" />
                        <span>Whitepaper</span>
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Visual section - 2/5 */}
              <motion.div
                className="lg:col-span-2 flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative">
                  {/* CDP Concept Visualization */}
                  <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                    {/* Central Circle - nyxUSD */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30"
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
                      <div className="text-center">
                        <div className="text-foreground font-bold text-lg">
                          nyxUSD
                        </div>
                        <div className="text-purple-200 text-xs">Stablecoin</div>
                      </div>
                    </motion.div>

                    {/* Orbiting Collateral Types */}
                    {[
                      { name: 'NIGHT', angle: 0, color: 'from-purple-500 to-purple-600' },
                      { name: 'BTC', angle: 120, color: 'from-orange-500 to-orange-600' },
                      { name: 'DUST', angle: 240, color: 'from-violet-500 to-violet-600' }
                    ].map((collateral, index) => (
                      <motion.div
                        key={collateral.name}
                        className={`absolute w-16 h-16 bg-gradient-to-br ${collateral.color} rounded-full flex items-center justify-center text-foreground font-bold text-sm shadow-lg`}
                        style={{
                          top: "50%",
                          left: "50%",
                          transformOrigin: "0 0",
                        }}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          ease: "linear",
                          delay: index * 0.5,
                        }}
                        initial={{
                          x:
                            Math.cos((collateral.angle * Math.PI) / 180) * 120 -
                            32,
                          y:
                            Math.sin((collateral.angle * Math.PI) / 180) * 120 -
                            32,
                        }}
                      >
                        {collateral.name}
                      </motion.div>
                    ))}

                    {/* Privacy Shield Effect */}
                    <motion.div
                      className="absolute inset-0 border-2 border-purple-400/30 rounded-full"
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
                      className="absolute inset-4 border border-purple-300/20 rounded-full"
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
                  </div>

                  {/* ZK Proof indicator */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-green-500/20 border border-green-400/50 rounded-full px-3 py-1 backdrop-blur-sm"
                    animate={{
                      y: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-green-300 text-xs font-medium">
                      🔐 ZK Verified
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
      </div>
    );
  }

  // Nyx Hero Variant
  if (variant === "nyx") {
    const scrollToContent = () => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    };

    return (
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
        {/* Cosmic Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(107, 70, 193, 0.2) 0%, transparent 50%)',
          }}
        />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--nyx-electric-purple), transparent)',
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--nyx-neon-cyan), transparent)',
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Mascot */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2 
              }}
            >
              <div className="relative group">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-purple-500/30 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center"
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(107, 70, 193, 0.5))',
                  }}>
                  <img 
                    src="/nyx-mascot.jpg" 
                    alt="NYX Mascot" 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <motion.div 
                  className="absolute -bottom-4 -right-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full p-3 shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -left-2 px-3 py-1 bg-purple-900/80 rounded-full backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-xs text-purple-200">ONLINE</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="nyx-display-large mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="nyx-text-gradient">NyxUSD</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="nyx-heading-2 mb-4"
              style={{ color: 'var(--nyx-gleam-80)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Cardano's Most Capital-Efficient CDP 🚀
            </motion.p>

            {/* Description */}
            <motion.div
              className="max-w-3xl mx-auto mb-12 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="nyx-body-large" style={{ color: 'var(--nyx-gleam-70)' }}>
                First user-defined interest rate CDP on Cardano. Mint NyxUSD stablecoins at 125% collateralization 
                vs Djed's 400-800%. Access 5-100%+ yields across EVM chains while keeping your ADA on Cardano.
              </p>
              <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-50)' }}>
                <span className="italic">Catalyst Fund 14 • Community-First • No VCs</span>
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/cdp"
                className="nyx-button nyx-button-glow nyx-button-large"
              >
                <span className="flex items-center gap-2">
                  Create CDP
                  <svg 
                    className="w-5 h-5" 
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
                </span>
              </Link>
              
              <Link
                to="/whitepaper"
                className="nyx-button nyx-button-secondary nyx-button-large"
              >
                Read Whitepaper
              </Link>
            </motion.div>

            {/* Enhanced Demo Stats */}
            <DemoStats />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-purple-400 hover:text-purple-300 transition-colors"
          onClick={scrollToContent}
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-label="Scroll to content"
        >
          <ChevronDownIcon className="w-8 h-8" />
        </motion.button>
      </section>
    );
  }

  // Mascot Hero Variant
  if (variant === "mascot") {
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
        className={`min-h-screen relative overflow-hidden ${className}`}
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
                  <Link to="/chat">
                    <Button 
                      variant="primary" 
                      icon={<SparklesIcon className="w-5 h-5" />}
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
              <div className="bg-white/10 backdrop-blur-md border border-blue-500/30 p-6 rounded-lg">
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
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Fallback to classic variant if unknown variant is provided
  return <Hero variant="classic" show={show} className={className} />;
};

export default Hero;