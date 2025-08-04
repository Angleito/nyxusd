import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInterfaceImproved } from "../components/ai-assistant/ChatInterfaceImproved";
import { ChatInterface } from "../components/ai-assistant/ChatInterface";
// 'Toggle' is not exported from lucide-react and isn't used; remove it to fix TS error
import { Layout, Sparkles, Eye, EyeOff } from "lucide-react";
import { AIAssistantProvider } from "../providers/AIAssistantProvider";

export const ChatComparisonDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<"improved" | "original" | "split">("improved");
  const [showFeatures, setShowFeatures] = useState(true);

  const features = {
    improved: [
      "✨ Message grouping by sender",
      "🎨 Markdown rendering with syntax highlighting",
      "⏰ Smart timestamps with date separators",
      "💬 Better visual hierarchy",
      "🎯 Quick action buttons",
      "🎤 Voice input support",
      "📎 File attachment ready",
      "📊 Message status indicators",
      "🌈 Enhanced animations",
      "📱 Mobile-optimized design"
    ],
    original: [
      "Basic message display",
      "Simple typing indicator",
      "Standard timestamp format",
      "Basic animations",
      "Text-only messages",
      "Single input method"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-6 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Chat Interface Comparison
                </h1>
                <p className="text-sm text-gray-400">
                  Experience the improved conversation UI
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("improved")}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === "improved"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Improved
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === "split"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode("original")}
                className={`px-4 py-2 rounded-md transition-all ${
                  viewMode === "original"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Original
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Improved View */}
          {viewMode === "improved" && (
            <motion.div
              key="improved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3">
                <AIAssistantProvider>
                  <div className="h-[700px]">
                    <ChatInterfaceImproved />
                  </div>
                </AIAssistantProvider>
              </div>
              
              {/* Feature List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    New Features
                  </h3>
                  <button
                    onClick={() => setShowFeatures(!showFeatures)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showFeatures ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showFeatures && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {features.improved.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-2 bg-gray-800/50 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-all"
                        >
                          {feature}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Original View */}
          {viewMode === "original" && (
            <motion.div
              key="original"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3">
                <AIAssistantProvider>
                  <div className="h-[700px]">
                    <ChatInterface />
                  </div>
                </AIAssistantProvider>
              </div>
              
              {/* Feature List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Original Features
                </h3>
                <div className="space-y-2">
                  {features.original.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-3 py-2 bg-gray-800/50 rounded-lg text-sm text-gray-300"
                    >
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Split View */}
          {viewMode === "split" && (
            <motion.div
              key="split"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Improved Version
                </h3>
                <AIAssistantProvider>
                  <div className="h-[650px]">
                    <ChatInterfaceImproved />
                  </div>
                </AIAssistantProvider>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Original Version
                </h3>
                <AIAssistantProvider>
                  <div className="h-[650px]">
                    <ChatInterface />
                  </div>
                </AIAssistantProvider>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-800/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Layout className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-300 mb-1">
                About the Improvements
              </h4>
              <p className="text-xs text-gray-400">
                The improved chat interface features better message grouping, smart timestamps, 
                markdown rendering with syntax highlighting, quick actions, and enhanced visual 
                hierarchy. It provides a more intuitive and engaging conversation experience 
                optimized for both desktop and mobile devices.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};