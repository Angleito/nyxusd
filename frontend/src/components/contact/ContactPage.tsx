import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface ContactPageProps {
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

interface ContactMethod {
  label: string;
  value: string;
  href: string;
  icon: string;
  gradient: string;
  description: string;
}

const contactMethods: ContactMethod[] = [
  {
    label: "Email",
    value: "angel@nyxusd.com",
    href: "mailto:angel@nyxusd.com",
    icon: "📧",
    gradient: "from-purple-600 to-pink-600",
    description: "Direct email for professional inquiries"
  },
  {
    label: "GitHub",
    value: "github.com/Angleito",
    href: "https://github.com/Angleito",
    icon: "💻",
    gradient: "from-gray-700 to-gray-900",
    description: "Open source contributions and projects"
  },
  {
    label: "LinkedIn",
    value: "Angel Ortega Melton",
    href: "https://www.linkedin.com/in/angel-ortega-melton-31647a186/",
    icon: "💼",
    gradient: "from-blue-600 to-blue-800",
    description: "Professional network and experience"
  },
  {
    label: "Twitter/X",
    value: "@angleito5",
    href: "https://twitter.com/angleito5",
    icon: "🐦",
    gradient: "from-blue-400 to-blue-600",
    description: "Updates and thoughts on crypto & tech"
  }
];

export const ContactPage: React.FC<ContactPageProps> = ({ className }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("angel@nyxusd.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${className || ''}`}>
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center space-y-6 mb-16"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gradient-midnight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            Get In Touch
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Let's connect and build the future of privacy-preserving finance together
          </motion.p>
          
          {/* Decorative element */}
          <div className="relative h-24">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-nyx-600 rounded-full blur-2xl opacity-30 animate-pulse-slow"></div>
            </div>
          </div>
        </motion.div>

        {/* Contact Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6 mb-16"
          variants={containerVariants}
        >
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                variant="gradient" 
                padding="lg"
                className="h-full group cursor-pointer"
                onClick={() => {
                  if (method.label === "Email") {
                    window.location.href = method.href;
                  } else {
                    window.open(method.href, '_blank', 'noopener,noreferrer');
                  }
                }}
                onContextMenu={(e) => {
                  if (method.label === "Email") {
                    e.preventDefault();
                    handleCopyEmail();
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {method.label}
                    </h3>
                    <p className="text-gray-300 mb-2 font-mono text-sm">
                      {method.value}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {method.description}
                      {method.label === "Email" && (
                        <span className="block text-xs mt-1 text-gray-500">
                          Click to email • Right-click to copy
                        </span>
                      )}
                    </p>
                    {method.label === "Email" && copiedEmail && (
                      <motion.p
                        className="text-green-400 text-sm mt-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        ✓ Copied to clipboard!
                      </motion.p>
                    )}
                  </div>
                  <div className="text-gray-500 group-hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Developer Info Section */}
        <motion.div variants={itemVariants}>
          <Card variant="elevated" padding="xl" className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              About Angel
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Passionate about building the future of decentralized finance with a focus on 
              privacy, accessibility, and user empowerment. Creator of NyxUSD—a privacy-preserving 
              stablecoin protocol on Midnight that makes DeFi accessible to everyone.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div
                className="px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-purple-300 font-medium">🚀 DeFi Builder</span>
              </motion.div>
              <motion.div
                className="px-6 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-300 font-medium">🔒 Privacy Advocate</span>
              </motion.div>
              <motion.div
                className="px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-green-300 font-medium">💡 Open Source Contributor</span>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <Card variant="gradient" padding="lg" className="inline-block">
            <p className="text-lg text-gray-300 mb-4">
              Have questions about NyxUSD or want to collaborate?
            </p>
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = 'mailto:angel@nyxusd.com'}
            >
              Send Me an Email
            </motion.button>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContactPage;