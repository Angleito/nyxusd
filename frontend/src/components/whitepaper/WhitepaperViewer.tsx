import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiMaximize2, FiMinimize2, FiDownload, FiChevronRight } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHeadingId from 'remark-heading-id';

interface WhitepaperViewerProps {
  onClose: () => void;
}

export const WhitepaperViewer: React.FC<WhitepaperViewerProps> = ({ onClose }) => {
  const [markdown, setMarkdown] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Table of contents structure - matches actual markdown headings
  const tableOfContents = [
    { id: 'executive-summary', title: 'Executive Summary', level: 1 },
    { id: 'the-problem', title: 'The Problem: DeFi\'s Complexity Crisis', level: 1 },
    { id: 'our-solution', title: 'Our Solution: Intelligence Meets Simplicity', level: 1 },
    { id: 'technical-architecture', title: 'Technical Architecture', level: 1 },
    { id: 'ai-innovation', title: 'AI Innovation Deep Dive', level: 1 },
    { id: 'tokenomics', title: 'Tokenomics & Revenue Model', level: 1 },
    { id: 'competitive-analysis', title: 'Competitive Analysis', level: 1 },
    { id: 'security', title: 'Security & Risk Management', level: 1 },
    { id: 'go-to-market', title: 'Go-to-Market Strategy', level: 1 },
    { id: 'roadmap', title: 'Roadmap & Milestones', level: 1 },
    { id: 'team', title: 'Team & Governance', level: 1 },
    { id: 'conclusion', title: 'Conclusion', level: 1 },
  ];

  useEffect(() => {
    // Load the markdown content (in real app, this would fetch from the whitepaper2.md file)
    const loadMarkdown = async () => {
      try {
        const response = await fetch('/whitepaper/whitepaper2.md');
        const text = await response.text();
        setMarkdown(text);
      } catch (error) {
        console.error('Error loading whitepaper:', error);
        // Fallback content for demo
        setMarkdown(`# NyxUSD White Paper

## Executive Summary

NyxUSD is revolutionizing DeFi through AI-powered automation...

[Content would be loaded from whitepaper2.md file]`);
      }
    };

    loadMarkdown();
  }, []);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="fixed inset-4 md:inset-8 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">NyxUSD White Paper v2.0</h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                Reading Mode
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Action Buttons */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Toggle Sidebar"
              >
                <FiChevronRight className={`transform transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
              
              <button
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Download PDF"
              >
                <FiDownload />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Close"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex h-[calc(100%-4rem)]">
            {/* Sidebar - Table of Contents */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-gray-800 border-r border-gray-700 overflow-y-auto"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Table of Contents
                    </h3>
                    <nav className="space-y-1">
                      {tableOfContents.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeSection === section.id
                              ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                          style={{ paddingLeft: `${section.level * 12 + 12}px` }}
                        >
                          {section.title}
                        </button>
                      ))}
                    </nav>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-8 py-12">
                <article className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkHeadingId]}
                    components={{
                      h1: ({ children, ...props }) => (
                        <h1 className="text-4xl font-bold text-white mb-6 mt-12" {...props}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2 className="text-3xl font-bold text-white mb-4 mt-10" {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3 className="text-2xl font-semibold text-white mb-3 mt-8" {...props}>
                          {children}
                        </h3>
                      ),
                      p: ({ children, ...props }) => (
                        <p className="text-gray-300 leading-relaxed mb-4" {...props}>
                          {children}
                        </p>
                      ),
                      ul: ({ children, ...props }) => (
                        <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props}>
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }) => (
                        <li className="text-gray-300" {...props}>
                          {children}
                        </li>
                      ),
                      strong: ({ children, ...props }) => (
                        <strong className="text-white font-semibold" {...props}>
                          {children}
                        </strong>
                      ),
                      a: ({ children, href, ...props }) => (
                        <a
                          href={href}
                          className="text-purple-400 hover:text-purple-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children, ...props }) => (
                        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4" {...props}>
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, ...props }) => (
                        <code className="bg-gray-800 text-purple-300 px-2 py-1 rounded text-sm" {...props}>
                          {children}
                        </code>
                      ),
                      pre: ({ children, ...props }) => (
                        <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                          {children}
                        </pre>
                      ),
                      table: ({ children, ...props }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className="min-w-full divide-y divide-gray-700" {...props}>
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children, ...props }) => (
                        <th className="px-4 py-2 bg-gray-800 text-white font-semibold text-left" {...props}>
                          {children}
                        </th>
                      ),
                      td: ({ children, ...props }) => (
                        <td className="px-4 py-2 text-gray-300 border-t border-gray-700" {...props}>
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};