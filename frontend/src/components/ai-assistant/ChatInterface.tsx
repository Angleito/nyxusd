import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Mic, MicOff, Volume2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import { useVoiceChat } from "../../hooks/useVoiceChat";
import { ConversationContext } from "../../services/voice/conversationalAgent";
import { chatMemoryService } from "../../services/memory/chatMemoryService";
import { useAccount } from "wagmi";

export const ChatInterface: React.FC = () => {
  const { state, sendMessage, getEnhancedAIContext } = useAIAssistant();
  const { address } = useAccount();
  const [inputValue, setInputValue] = useState("");
  const [isConversationalMode, setIsConversationalMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Voice chat integration
  const voiceChat = useVoiceChat({
    apiKey: process.env['REACT_APP_ELEVENLABS_API_KEY'],
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default voice
    conversationalMode: isConversationalMode,
    onTranscription: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setInputValue(text);
      }
    },
    onUserTranscript: (transcript) => {
      // Add user message to memory and chat
      if (transcript.isFinal && transcript.text.trim()) {
        const message = {
          id: `msg-${Date.now()}`,
          role: 'user' as const,
          content: transcript.text,
          timestamp: transcript.timestamp,
        };
        chatMemoryService.addMessage(message);
      }
    },
    onAgentResponse: (response) => {
      // Add AI response to memory and chat
      const message = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: response.text,
        timestamp: response.timestamp,
      };
      chatMemoryService.addMessage(message);
      
      // Also update AI assistant state for UI consistency
      const aiMessage = {
        id: message.id,
        sender: 'ai' as const,
        content: response.text,
        timestamp: response.timestamp,
        typing: false,
      };
      // Note: Would need to add this to AI assistant context if available
    },
    onAgentSpeaking: (data) => {
      console.log('Agent speaking:', data);
    },
    onAgentFinishedSpeaking: () => {
      console.log('Agent finished speaking');
    },
    onError: (error) => {
      console.error('Voice chat error:', error);
    },
    onStatusChange: (status) => {
      console.log('Voice status:', status);
    },
    onFallbackAttempt: (data) => {
      console.log('Fallback attempt:', data);
    },
    onModeChanged: (data) => {
      console.log('Voice mode changed:', data);
      // Could show a toast notification to the user
    },
    onConnectionRecovered: () => {
      console.log('Voice connection recovered');
    },
    onUserMessage: (message) => {
      if (message.type === 'error') {
        console.warn('Voice service message:', message.message);
        // Could add this as a system message to the chat
      }
    },
    onConversationStarted: (session) => {
      console.log('Conversation started:', session);
      // Update user profile with conversational interaction
      if (address) {
        chatMemoryService.createOrUpdateUserProfile(address);
      }
    },
    onConversationEnded: (data) => {
      console.log('Conversation ended:', data);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isTyping]);

  // Sync AI messages to memory service
  useEffect(() => {
    if (state.messages.length > 0 && !isConversationalMode) {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.sender === 'ai' && !lastMessage.typing) {
        const memoryMessage = {
          id: lastMessage.id,
          role: 'assistant' as const,
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
        };
        chatMemoryService.addMessage(memoryMessage);
      }
    }
  }, [state.messages, isConversationalMode]);

  // Handle conversational mode toggle
  const handleConversationalModeToggle = async (): Promise<void> => {
    try {
      if (!isConversationalMode) {
        // Enable conversational mode with memory integration
        const userProfile = address ? chatMemoryService.getUserProfile(address) : null;
        const memoryContext = address ? chatMemoryService.getMemoryPromptContext(address) : '';
        
        const context: ConversationContext = {
          userProfile: {
            walletAddress: address || state.walletData?.address,
            preferences: userProfile ? {
              riskTolerance: userProfile.preferences.riskTolerance,
              experience: userProfile.preferences.experience,
              interests: userProfile.preferences.interests,
              favoriteTokens: userProfile.preferences.favoriteTokens,
              defaultChain: userProfile.preferences.defaultChain,
            } : {
              riskTolerance: state.userProfile.riskTolerance,
              experience: state.userProfile.experienceLevel,
            },
          },
          conversationHistory: state.messages.slice(-5).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          currentStep: state.currentStep,
          memoryContext: memoryContext || (getEnhancedAIContext() ? JSON.stringify(getEnhancedAIContext()) : undefined),
        };

        await voiceChat.enableConversationalMode(context);
        await voiceChat.startSession(context);
        setIsConversationalMode(true);
      } else {
        // Disable conversational mode
        await voiceChat.disableConversationalMode();
        await voiceChat.endSession();
        setIsConversationalMode(false);
      }
    } catch (error) {
      console.error('Failed to toggle conversational mode:', error);
    }
  };

  // Get voice status indicator
  const getVoiceStatusColor = (): string => {
    switch (voiceChat.status) {
      case 'listening': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'speaking': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getVoiceStatusText = (): string => {
    switch (voiceChat.status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      case 'error': return 'Error';
      default: return isConversationalMode ? 'Ready' : 'Voice Off';
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !state.isTyping) {
      // Add to memory service
      const userMessage = {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content: inputValue.trim(),
        timestamp: new Date(),
      };
      chatMemoryService.addMessage(userMessage);
      
      // Update user profile if connected
      if (address) {
        chatMemoryService.createOrUpdateUserProfile(address);
      }
      
      // Send through regular AI assistant
      sendMessage(inputValue.trim());
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-gray-900 rounded-2xl border border-gray-800/50 shadow-2xl relative overflow-hidden backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none" />
      {/* Header */}
      <motion.div
        className="px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-purple-600 rounded-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">
                AI Portfolio Assistant
              </h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-400">
                  {isConversationalMode ? 'Voice Chat Active' : 'Your personalized investment advisor'}
                </p>
                {isConversationalMode && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${voiceChat.status === 'listening' ? 'bg-green-400 animate-pulse' : voiceChat.status === 'speaking' ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
                    <span className={`text-xs ${getVoiceStatusColor()}`}>
                      {getVoiceStatusText()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Voice Mode Toggle */}
            <motion.button
              onClick={handleConversationalModeToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isConversationalMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isConversationalMode ? "Disable Voice Chat" : "Enable Voice Chat"}
              disabled={voiceChat.status === 'connecting'}
            >
              {isConversationalMode ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
            </motion.button>

            {/* Microphone Button (only visible in conversational mode) */}
            {isConversationalMode && (
              <motion.button
                onClick={voiceChat.toggleListening}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  voiceChat.isListening
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={voiceChat.isListening ? "Stop Listening" : "Start Listening"}
                disabled={voiceChat.status === 'speaking' || voiceChat.status === 'processing'}
              >
                {voiceChat.isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>
            )}

            <motion.button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close AI Assistant"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <AnimatePresence initial={false}>
          {state.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ChatMessage message={message} />
            </motion.div>
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
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="p-4 border-t border-gray-800 bg-gradient-to-t from-gray-900 to-transparent"
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
              placeholder={
                isConversationalMode && voiceChat.isListening 
                  ? "Listening for voice input..."
                  : isConversationalMode
                  ? "Voice chat active - speak or type..."
                  : "Type your message..."
              }
              disabled={state.isTyping || (isConversationalMode && voiceChat.status === 'speaking')}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-600 ${
                isConversationalMode && voiceChat.isListening
                  ? 'border-green-500 focus:border-green-400 focus:ring-green-500/50'
                  : isConversationalMode
                  ? 'border-blue-500 focus:border-blue-400 focus:ring-blue-500/50'
                  : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/50'
              }`}
            />
            {inputValue && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                style={{
                  background:
                    "radial-gradient(ellipse at center, #a855f7 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
            )}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#7c3aed" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || state.isTyping}
            className="p-3 bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <motion.div
              animate={state.isTyping ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 1,
                repeat: state.isTyping ? Infinity : 0,
                ease: "linear",
              }}
            >
              <Send className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile-optimized styles and enhanced scrollbar */}
      <style>{`
        @media (max-width: 640px) {
          .flex-1 {
            max-height: calc(100vh - 200px);
          }
        }
        
        /* Custom scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
          transition: background 0.2s;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.5) rgba(17, 24, 39, 0.5);
        }
      `}</style>
    </motion.div>
  );
};
