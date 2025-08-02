import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, TrendingUp, Wallet, DollarSign, BarChart3, RefreshCw } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { enhancedAIService } from "../../services/ai/enhancedAIService";
import { useWallet } from "../../hooks/useWallet";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    toolsUsed?: string[];
    cryptoData?: any;
    recommendations?: string[];
  };
}

export const EnhancedChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { address, balance, isConnected } = useWallet();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm Nyx, your crypto intelligence assistant. I can help you with:
      
🪙 Real-time crypto prices and market analysis
📊 Portfolio analysis and recommendations  
🌾 DeFi yield opportunities
💰 Investment strategies and risk assessment

I see ${isConnected ? `you're connected with wallet ${address?.slice(0, 6)}...${address?.slice(-4)}` : "you haven't connected your wallet yet"}.

What would you like to explore today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [isConnected, address]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const getContext = useCallback(() => {
    return {
      conversationStep: "natural_conversation",
      userProfile: {
        experience: "intermediate",
        riskTolerance: "moderate",
      },
      walletData: isConnected ? {
        address,
        balance,
      } : undefined,
    };
  }, [isConnected, address, balance]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setStreamingContent("");

    try {
      // Check if this is a specific crypto query
      const isCryptoQuery = /price|portfolio|defi|market|trend|btc|eth|crypto/i.test(userMessage.content);
      
      if (isCryptoQuery) {
        // Use enhanced AI with crypto tools
        const response = await enhancedAIService.sendMessage(
          userMessage.content,
          getContext(),
          true
        );

        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
          metadata: {
            toolsUsed: response.toolsUsed,
            cryptoData: response.cryptoData,
            recommendations: response.recommendations,
          },
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Stream response for non-crypto queries
        let fullResponse = "";
        
        await enhancedAIService.streamMessage(
          userMessage.content,
          getContext(),
          (chunk) => {
            fullResponse += chunk;
            setStreamingContent(fullResponse);
          },
          false // Don't use crypto tools for general queries
        );

        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: fullResponse,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setStreamingContent("");
      }
    } catch (error) {
      // Only log in development mode to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to get AI response:", error);
      }
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "system",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    let query = "";
    
    switch (action) {
      case "price":
        query = "What are the current prices of Bitcoin and Ethereum?";
        break;
      case "portfolio":
        query = isConnected 
          ? "Analyze my current portfolio and provide recommendations"
          : "How can I build a balanced crypto portfolio?";
        break;
      case "trends":
        query = "Show me the current market trends and sentiment";
        break;
      case "defi":
        query = "What are the best DeFi yield opportunities right now?";
        break;
      case "analysis":
        query = "Give me a comprehensive market analysis";
        break;
    }

    if (query) {
      setInputValue(query);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 rounded-2xl border border-purple-800/30 shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 animate-pulse" />
      </div>

      {/* Header */}
      <motion.div
        className="relative px-6 py-4 border-b border-purple-800/30 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Nyx Intelligence
              </h2>
              <p className="text-sm text-gray-400">
                Powered by MCP Crypto Tools
              </p>
            </div>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Connected</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-1">
          <motion.button
            onClick={() => handleQuickAction("price")}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-800/30 hover:bg-purple-700/40 rounded-full text-xs text-gray-300 whitespace-nowrap transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DollarSign className="w-3 h-3" />
            <span>Prices</span>
          </motion.button>
          
          <motion.button
            onClick={() => handleQuickAction("portfolio")}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-800/30 hover:bg-purple-700/40 rounded-full text-xs text-gray-300 whitespace-nowrap transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Portfolio</span>
          </motion.button>
          
          <motion.button
            onClick={() => handleQuickAction("trends")}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-800/30 hover:bg-purple-700/40 rounded-full text-xs text-gray-300 whitespace-nowrap transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Trends</span>
          </motion.button>
          
          <motion.button
            onClick={() => handleQuickAction("defi")}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-800/30 hover:bg-purple-700/40 rounded-full text-xs text-gray-300 whitespace-nowrap transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-3 h-3" />
            <span>DeFi</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                <ChatMessage message={message} />
                
                {/* Show metadata for crypto responses */}
                {message.metadata?.toolsUsed && (
                  <div className="mt-2 text-xs text-gray-500">
                    🔧 Tools used: {message.metadata.toolsUsed.join(", ")}
                  </div>
                )}
                
                {message.metadata?.recommendations && (
                  <div className="mt-2 p-2 bg-blue-900/20 rounded-lg border border-blue-800/30">
                    <div className="text-xs font-semibold text-blue-400 mb-1">
                      💡 Recommendations:
                    </div>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {message.metadata.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming content */}
        {streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%]">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {streamingContent}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && !streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="relative p-4 border-t border-purple-800/30 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <motion.div
            className="flex-1 relative"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about crypto prices, portfolio analysis, DeFi opportunities..."
              disabled={isTyping}
              className="w-full px-4 py-3 bg-gray-800/70 border border-purple-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            />
            
            {inputValue && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                style={{
                  background: "radial-gradient(ellipse at center, #a855f7 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
            )}
          </motion.div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Natural language crypto intelligence • Real-time data • Portfolio analysis
        </div>
      </motion.div>
    </motion.div>
  );
};