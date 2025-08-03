import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Maximize2, Minimize2 } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { AIAssistantProvider } from "../../providers/AIAssistantProvider";

interface UnifiedAIAssistantProps {
  defaultOpen?: boolean;
  position?: "bottom-right" | "bottom-left" | "full";
}

export const UnifiedAIAssistant: React.FC<UnifiedAIAssistantProps> = ({
  defaultOpen = false,
  position = "bottom-right",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMaximized, setIsMaximized] = useState(position === "full");
  const [unreadCount, setUnreadCount] = useState(0);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const getChatPosition = () => {
    if (isMaximized) {
      return "fixed inset-4 z-50";
    }
    
    switch (position) {
      case "bottom-left":
        return "fixed bottom-4 left-4 z-50";
      case "full":
        return "fixed inset-4 z-50";
      default:
        return "fixed bottom-4 right-4 z-50";
    }
  };

  const getChatSize = () => {
    if (isMaximized) {
      return "w-full h-full";
    }
    return "w-[450px] h-[600px] max-w-[95vw] max-h-[85vh]";
  };

  return (
    <AIAssistantProvider>
      <>
        {/* Floating Action Button */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleChat}
              className={`${getChatPosition().split(' ').slice(0, 3).join(' ')} ${isMaximized ? 'hidden' : ''} 
                p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg 
                hover:shadow-xl transition-all duration-300 group`}
            >
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-white" />
                
                {/* Pulse animation */}
                <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-20" />
                
                {/* Unread badge */}
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg 
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Chat with Nyx AI
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Interface */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`${getChatPosition()} ${getChatSize()}`}
            >
              <div className="relative w-full h-full">
                {/* Control buttons */}
                <div className="absolute top-2 right-2 z-10 flex space-x-2">
                  <motion.button
                    onClick={toggleMaximize}
                    className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </motion.button>
                  
                  <motion.button
                    onClick={toggleChat}
                    className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Chat component */}
                <ChatInterface />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop for maximized view */}
        <AnimatePresence>
          {isOpen && isMaximized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={toggleMaximize}
            />
          )}
        </AnimatePresence>
      </>
    </AIAssistantProvider>
  );
};

// Standalone version for full-page usage
export const StandaloneAIAssistant: React.FC = () => {
  return (
    <AIAssistantProvider>
      <div className="w-full h-full">
        <ChatInterface />
      </div>
    </AIAssistantProvider>
  );
};