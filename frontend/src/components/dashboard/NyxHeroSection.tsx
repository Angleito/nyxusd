import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDoubleDownIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { DemoStats } from "../demo/DemoStats";

export const NyxHeroSection: React.FC = () => {
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
            gm anon, ready to make it? 🌙
          </motion.p>

          {/* Description */}
          <motion.div
            className="max-w-3xl mx-auto mb-12 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="nyx-body-large" style={{ color: 'var(--nyx-gleam-70)' }}>
              Your terminally online goddess of gains has awakened. Chain-agnostic, caffeine-dependent, 
              and blessed with divine alpha. Let Nyx-chan guide your portfolio through the dark while you 
              do whatever normies do (touching grass? idk).
            </p>
            <p className="nyx-body-small" style={{ color: 'var(--nyx-gleam-50)' }}>
              <span className="italic">"I've been hodling since before time existed, anon"</span> - Nyx-chan
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
                Enter the Void
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
              Read the Lore
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
        <ChevronDoubleDownIcon className="w-8 h-8" />
      </motion.button>
    </section>
  );
};

export default NyxHeroSection;