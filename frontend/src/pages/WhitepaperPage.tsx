import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WhitepaperHero } from '../components/whitepaper/WhitepaperHero';
import { KeyFeaturesGrid } from '../components/whitepaper/KeyFeaturesGrid';
import { WhitepaperViewer } from '../components/whitepaper/WhitepaperViewer';
import { DownloadSection } from '../components/whitepaper/DownloadSection';

const WhitepaperPage: React.FC = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-nyx-600 z-50"
        style={{ width: `${scrollProgress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${scrollProgress}%` }}
        transition={{ ease: "linear" }}
      />

      {/* Starfield Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div id="whitepaper-starfield" className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <WhitepaperHero onViewClick={() => setIsViewerOpen(true)} />

        {/* Key Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Revolutionary Innovations
            </h2>
            <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              Discover how NyxUSD is transforming DeFi through AI-powered automation and cross-chain innovation
            </p>
            <KeyFeaturesGrid />
          </motion.div>
        </section>

        {/* Document Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-purple-500/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              White Paper Overview
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Key Metrics</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Target APY:</strong> 5-100%+ across risk tiers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Revenue Multiplier:</strong> 2.46x vs traditional CDPs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Custom Portfolio:</strong> 3% creation + 10% performance fee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Response Time:</strong> &lt;3 seconds for AI strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Cross-Chain Efficiency:</strong> 40% lower gas costs</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Document Sections</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Executive Summary & Problem Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Technical Architecture Deep Dive</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span>AI Innovation & Training Data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Tokenomics & Revenue Model</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => setIsViewerOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Read Full White Paper
              </button>
              <button
                className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300"
              >
                View Table of Contents
              </button>
            </div>
          </motion.div>
        </section>

        {/* Download Section */}
        <DownloadSection />

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Sections', value: '11', icon: '📚' },
              { label: 'Reading Time', value: '~20 min', icon: '⏱️' },
              { label: 'Version', value: '2.0', icon: '🚀' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-500/10 hover:border-purple-500/30 transition-colors"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Learn More?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Dive deep into the technical details and discover how NyxUSD is revolutionizing DeFi
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setIsViewerOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Start Reading
              </button>
              <a
                href="https://github.com/nyxusd"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </section>
      </motion.div>

      {/* White Paper Viewer Modal */}
      {isViewerOpen && (
        <WhitepaperViewer onClose={() => setIsViewerOpen(false)} />
      )}
    </div>
  );
};

export default WhitepaperPage;