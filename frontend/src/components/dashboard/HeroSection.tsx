import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="relative min-h-screen overflow-hidden">
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
                  Zero-Knowledge DeFi Protocol
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight"
                variants={itemVariants}
              >
                Privacy-First
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400">
                  DeFi
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                variants={itemVariants}
              >
                Mint nyxUSD with zero-knowledge proofs. Experience true
                financial privacy without compromising on transparency.
              </motion.p>

              {/* Feature highlights */}
              <motion.div
                className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10"
                variants={itemVariants}
              >
                {[
                  "Zero-Knowledge Proofs",
                  "Decentralized Collateral",
                  "Privacy-Preserving",
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
                {/* Primary CTA - Launch App */}
                <motion.button
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/chat")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <span>Launch App</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </motion.button>

                {/* Secondary CTA - Learn More */}
                <motion.button
                  className="groupe relative px-8 py-4 bg-background/10 hover:bg-background/20 text-foreground font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm border border-border/20 hover:border-border/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <PlayIcon className="w-5 h-5" />
                    <span>Learn More</span>
                  </span>
                </motion.button>
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
};

export default HeroSection;
