import React, { useState } from "react";
import { AlertTriangle, X, Code, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const HackathonBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-200 animate-pulse" />
                <span className="font-bold text-sm uppercase tracking-wider">
                  Hackathon Demo
                </span>
              </div>
              
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    This is a <strong>JoinPond Arena</strong> hackathon project
                  </span>
                  <span className="sm:hidden">
                    Hackathon Project
                  </span>
                </div>
                
                <div className="hidden md:flex items-center space-x-1">
                  <span className="text-white/80">•</span>
                  <span>All data is <strong>mocked</strong> for demonstration</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4 text-green-200" />
                  <span className="hidden sm:inline">
                    <strong>AI Chat is functional</strong>
                  </span>
                  <span className="sm:hidden">
                    AI Chat works
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors duration-200"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Mobile-friendly expanded info */}
          <div className="sm:hidden mt-2 pt-2 border-t border-white/20">
            <div className="text-xs space-y-1">
              <div>🏆 <strong>JoinPond Arena</strong> hackathon project</div>
              <div>⚠️ All data is <strong>mocked</strong> for demo purposes</div>
              <div>✅ <strong>AI Chat functionality</strong> is live and working</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HackathonBanner;