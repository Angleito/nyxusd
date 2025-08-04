import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Paperclip,
  Mic,
  StopCircle,
  Hash,
  AtSign,
  MoreVertical,
  Settings,
  Download,
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatMessageImproved } from "./ChatMessageImproved";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import { clsx } from "clsx";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: "crypto" | "portfolio" | "help" | "market";
}

export const ChatInterfaceImproved: React.FC = () => {
  const { state, sendMessage } = useAIAssistant();
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Quick actions for common queries
  const quickActions: QuickAction[] = [
    { 
      id: "prices", 
      label: "Check Prices", 
      icon: <Hash className="w-4 h-4" />,
      prompt: "What are the current prices of BTC and ETH?",
      category: "crypto"
    },
    { 
      id: "portfolio", 
      label: "Portfolio Analysis", 
      icon: <MoreVertical className="w-4 h-4" />,
      prompt: "Analyze my portfolio performance",
      category: "portfolio"
    },
    { 
      id: "trends", 
      label: "Market Trends", 
      icon: <Sparkles className="w-4 h-4" />,
      prompt: "What are the current market trends?",
      category: "market"
    },
    { 
      id: "help", 
      label: "Get Help", 
      icon: <AtSign className="w-4 h-4" />,
      prompt: "How can you help me with crypto investments?",
      category: "help"
    },
  ];

  // Group messages by sender for better visual organization
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      sender: string;
      messages: typeof state.messages;
      startIndex: number;
    }> = [];
    
    let currentGroup: typeof groups[0] | null = null;
    
    state.messages.forEach((message, index) => {
      if (!currentGroup || currentGroup.sender !== message.sender) {
        currentGroup = {
          sender: message.sender,
          messages: [message],
          startIndex: index,
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });
    
    return groups;
  }, [state.messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !state.isTyping) {
      sendMessage(inputValue.trim());
      setInputValue("");
      setShowQuickActions(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.prompt);
    setShowQuickActions(false);
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice input implementation would go here
  };

  const handleFileAttachment = () => {
    // File attachment implementation would go here
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-gray-900 rounded-3xl shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 px-6 py-4 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg shadow-purple-900/50">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                NYX Intelligence
              </h2>
              <p className="text-xs text-gray-400">
                Advanced Crypto Assistant • Always Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              onClick={() => {/* Export chat */}}
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              onClick={() => {/* Share chat */}}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              onClick={() => {/* Settings */}}
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-custom relative z-10">
        <AnimatePresence initial={false}>
          {groupedMessages.map((group, groupIndex) => (
            <div key={`group-${group.startIndex}`}>
              {group.messages.map((message, messageIndex) => {
                let prevTimestamp: Date | undefined = undefined;
                if (groupIndex > 0) {
                  const prevGroup = groupedMessages[groupIndex - 1];
                  if (prevGroup && Array.isArray(prevGroup.messages) && prevGroup.messages.length > 0) {
                    const lastIdx = prevGroup.messages.length - 1;
                    const prevMsg = prevGroup.messages[lastIdx];
                    prevTimestamp = prevMsg?.timestamp;
                  }
                }
                return (
                  <ChatMessageImproved
                    key={message.id}
                    message={message}
                    isFirstInGroup={messageIndex === 0}
                    isLastInGroup={messageIndex === group.messages.length - 1}
                    showTimestamp={messageIndex === 0}
                    previousMessageTimestamp={prevTimestamp}
                  />
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {state.isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-700/50">
                <div className="flex gap-1">
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && state.messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <p className="text-xs text-gray-500 mb-3 px-1">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-left transition-all group"
                  >
                    <span className="text-purple-400 group-hover:text-purple-300">
                      {action.icon}
                    </span>
                    <span className="text-sm text-gray-300 group-hover:text-white">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="relative z-10 p-4 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFileAttachment}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          {/* Input Field Container */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crypto, portfolios, or market trends..."
              disabled={state.isTyping}
              rows={1}
              className={clsx(
                "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl",
                "text-white placeholder-gray-500 resize-none",
                "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200 hover:border-gray-600",
                "scrollbar-custom"
              )}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character Count - Updated for model limits */}
            {inputValue.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-1 right-1 text-xs text-gray-500"
              >
                {inputValue.length.toLocaleString()}
              </motion.div>
            )}
          </div>

          {/* Voice Input Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceInput}
            className={clsx(
              "p-2.5 rounded-lg transition-all",
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            {isRecording ? (
              <StopCircle className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || state.isTyping}
            className={clsx(
              "p-2.5 rounded-lg transition-all shadow-lg",
              inputValue.trim() && !state.isTyping
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 shadow-purple-900/50"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Input Hints */}
        <div className="flex items-center gap-4 mt-2 px-1">
          <span className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> to send
          </span>
          <span className="text-xs text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Shift + Enter</kbd> for new line
          </span>
        </div>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
          transition: background 0.2s;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
        
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.5) rgba(17, 24, 39, 0.5);
        }
      `}</style>
    </motion.div>
  );
};