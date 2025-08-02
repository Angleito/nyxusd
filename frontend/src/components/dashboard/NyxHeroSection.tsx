import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";

const NyxHeroSection: React.FC = () => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          {/* Logo */}
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
            <img 
              src="/nyx-assets/images/nyx-logo.svg" 
              alt="NYX" 
              className="w-32 h-32 md:w-48 md:h-48"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(107, 70, 193, 0.5))',
              }}
            />
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
            Chain-Agnostic AI Protocol
          </motion.p>

          {/* Description */}
          <motion.p
            className="nyx-body-large max-w-3xl mx-auto mb-12"
            style={{ color: 'var(--nyx-gleam-70)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            As a truly chain-agnostic protocol, NyxUSD seamlessly operates across all major blockchains,
            uniting liquidity and technology into one unified ecosystem. Experience personalized investing with
            AI that adapts to your goals, risk profile, and preferences—bringing tailored DeFi to every user.
          </motion.p>

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
                Launch App
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
              to="/about"
              className="nyx-button nyx-button-secondary nyx-button-large"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="nyx-glass rounded-lg p-6">
              <p className="nyx-body-small mb-2" style={{ color: 'var(--nyx-gleam-60)' }}>
                Total Value Locked
              </p>
              <p className="nyx-heading-1 nyx-text-gradient">$0.00</p>
            </div>
            <div className="nyx-glass rounded-lg p-6">
              <p className="nyx-body-small mb-2" style={{ color: 'var(--nyx-gleam-60)' }}>
                NyxUSD Minted
              </p>
              <p className="nyx-heading-1 nyx-text-gradient">0</p>
            </div>
            <div className="nyx-glass rounded-lg p-6">
              <p className="nyx-body-small mb-2" style={{ color: 'var(--nyx-gleam-60)' }}>
                Active CDPs
              </p>
              <p className="nyx-heading-1 nyx-text-gradient">0</p>
            </div>
          </motion.div>
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
        <ChevronDoubleDownIcon className="w-8 h-8" />
      </motion.button>
    </section>
  );
};

export default NyxHeroSection;