import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiCode, FiMail, FiCheck } from 'react-icons/fi';

export const DownloadSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const downloadFormats = [
    {
      format: 'PDF',
      size: '2.4 MB',
      icon: <FiFileText />,
      description: 'Full formatted document',
      filename: 'NyxUSD-Whitepaper-v2.0.pdf'
    },
    {
      format: 'Markdown',
      size: '145 KB',
      icon: <FiCode />,
      description: 'Source markdown file',
      filename: 'NyxUSD-Whitepaper-v2.0.md'
    },
    {
      format: 'DOCX',
      size: '1.8 MB',
      icon: <FiFileText />,
      description: 'Microsoft Word format',
      filename: 'NyxUSD-Whitepaper-v2.0.docx'
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Handle subscription logic here
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const handleDownload = (filename: string) => {
    // Create download link
    const link = document.createElement('a');
    link.href = `/whitepaper/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Download White Paper
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get the full NyxUSD white paper in your preferred format
          </p>
        </div>

        {/* Download Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {downloadFormats.map((format, index) => (
            <motion.div
              key={format.format}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl text-purple-400">
                      {format.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {format.format}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {format.size}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">
                  {format.description}
                </p>
                
                <button
                  onClick={() => handleDownload(format.filename)}
                  className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <FiDownload className="group-hover:translate-y-0.5 transition-transform" />
                  <span>Download</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Email Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 md:p-12 border border-purple-500/20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <FiMail className="text-4xl text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-6">
              Get notified when we release updates to the white paper or launch new features
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isSubscribed ? (
                  <>
                    <FiCheck />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <span>Version 2.0</span>
            <span>•</span>
            <span>Last Updated: August 2025</span>
            <span>•</span>
            <span>Hackathon Submission</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};