import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, TrendingUp, Wallet, DollarSign, BarChart3, RefreshCw, History, Settings, Download, ArrowRightLeft } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { enhancedAIService } from "../../services/ai/enhancedAIService";
import { useWallet } from "../../hooks/useWallet";
import { chatMemoryService, ChatMessage as MemoryMessage } from "../../services/chatMemoryService";
import { ConversationStep } from "../../providers/AIAssistantProvider";
import { swapDetectionService } from "../../services/swapDetectionService";
import { SwapInterface } from "../swap/SwapInterface";
import { VoiceControls } from "../voice/VoiceControls";
import { VoiceErrorBoundary } from "../voice/VoiceErrorBoundary";
import { voiceService } from "../../services/voice/voiceService";

interface Message extends MemoryMessage {}

export const EnhancedChatInterface: React.FC = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSwap, setActiveSwap] = useState<{
    inputToken?: string;
    outputToken?: string;
    amount?: string;
    messageId: string;
  } | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListeningToVoice, setIsListeningToVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useWallet();
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize with welcome message and load user profile
  useEffect(() => {
    if (!sessionStarted) {
      // Load existing session or create new one
      const currentSession = chatMemoryService.getCurrentSession();
      if (currentSession && currentSession.messages.length > 0) {
        setMessages(currentSession.messages);
      } else {
        const userProfile = address ? chatMemoryService.getUserProfile(address) : null;
        const isReturningUser = userProfile && userProfile.history.totalInteractions > 1;
        
        const welcomeMessage: Message = {
          id: "welcome",
          role: "assistant",
          content: isReturningUser 
            ? `Welcome back! I remember you prefer ${userProfile.preferences.experience} level explanations with ${userProfile.preferences.riskTolerance} risk tolerance.\n\n${userProfile.portfolio?.watchlist?.length ? `Your watchlist: ${userProfile.portfolio.watchlist.join(', ')}` : ''}\n\nWhat would you like to explore today?`
            : `Hi! I'm Nyx, your crypto intelligence assistant. I can help you with:
      
🪙 Real-time crypto prices and market analysis
📊 Portfolio analysis and recommendations  
🌾 DeFi yield opportunities
💰 Investment strategies and risk assessment

I see ${isConnected ? `you're connected with wallet ${address?.slice(0, 6)}...${address?.slice(-4)}` : "you haven't connected your wallet yet"}.

What would you like to explore today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        chatMemoryService.addMessage(welcomeMessage);
      }
      setSessionStarted(true);
    }
  }, [isConnected, address, sessionStarted]);

  // Update user profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      chatMemoryService.createOrUpdateUserProfile(address, {
        history: {
          lastSeen: new Date(),
          totalInteractions: 0,
          firstSeen: new Date(),
          topQueries: [],
        },
      });
    }
  }, [isConnected, address]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const getContext = useCallback(() => {
    const userProfile = address ? chatMemoryService.getUserProfile(address) : null;
    const memoryContext = chatMemoryService.getMemoryPromptContext(address);
    
    return {
      conversationStep: "chat" as ConversationStep,
      userProfile: userProfile ? {
        experienceLevel: userProfile.preferences.experience as "beginner" | "intermediate" | "advanced",
        riskTolerance: userProfile.preferences.riskTolerance as "conservative" | "moderate" | "aggressive",
      } : {
        experienceLevel: "intermediate" as const,
        riskTolerance: "moderate" as const,
      },
      walletData: isConnected && address ? {
        address,
        assets: [],
        totalValueUSD: 0,
      } : undefined,
      memoryContext,
      conversationSummary: chatMemoryService.summarizeConversation(),
    };
  }, [isConnected, address]);

  // Voice handling callbacks
  const handleVoiceTranscription = useCallback((text: string, isFinal: boolean) => {
    setVoiceTranscript(text);
    if (isFinal && text.trim()) {
      setInputValue(text);
    }
  }, []);

  const handleVoiceError = useCallback((error: Error | { message?: string }) => {
    console.error('Voice error:', error);

    const messageText =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : undefined;

    const errorMessage: Message = {
      id: `msg_${Date.now()}_voice_error`,
      role: "system",
      content: `Voice error: ${messageText || 'Failed to process voice input'}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
  }, []);

  const handleVoiceStatusChange = useCallback((status: string) => {
    setIsListeningToVoice(status === 'listening');
  }, []);

  // Speak AI response if voice is enabled
  const speakResponse = useCallback(async (text: string) => {
    if (voiceEnabled && voiceService.isSessionActive()) {
      try {
        await voiceService.speakText(text);
      } catch (error) {
        console.error('Failed to speak response:', error);
      }
    }
  }, [voiceEnabled]);

  // Stable message-sender to satisfy React-hook exhaustive-deps rule
  const handleSendMessage = useCallback(async (messageText?: string): Promise<void> => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isTyping) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMemoryService.addMessage(userMessage);
    setInputValue("");
    setVoiceTranscript("");
    setIsTyping(true);
    setStreamingContent("");

    // Check for swap intent
    const swapIntent = swapDetectionService.detectSwapIntent(userMessage.content);
    
    // Debug logging
    console.log('Swap Detection Debug:', {
      message: userMessage.content,
      swapIntent,
      inputToken: swapIntent.inputToken,
      outputToken: swapIntent.outputToken
    });
    
    if (swapIntent.isSwapIntent && swapIntent.confidence > 0.5) {
      // Always show swap interface immediately for better UX
      // Don't ask for clarification - let user fill in the interface
      
      // Create a contextual message based on what was detected
      let contextMessage = "I'll help you swap tokens. ";
      
      // Add cross-chain context if detected
      const chainContext = swapIntent.isCrossChain 
        ? ` from ${swapIntent.sourceChain} to ${swapIntent.destinationChain}` 
        : swapIntent.sourceChain && swapIntent.sourceChain !== 'Base' 
        ? ` on ${swapIntent.sourceChain}`
        : '';
      
      if (swapIntent.inputToken && swapIntent.outputToken && swapIntent.amount) {
        contextMessage = `Perfect! Let's swap ${swapIntent.amount} ${swapIntent.inputToken} to ${swapIntent.outputToken}${chainContext}.`;
      } else if (swapIntent.inputToken && swapIntent.outputToken) {
        contextMessage = `Great! Let's set up your ${swapIntent.inputToken} to ${swapIntent.outputToken} swap${chainContext}. Just enter the amount you'd like to swap.`;
      } else if (swapIntent.outputToken) {
        contextMessage = `I'll help you get some ${swapIntent.outputToken}${chainContext}. You can adjust the tokens and amount below.`;
      } else {
        contextMessage = `I'll help you swap tokens${chainContext}. Connect your wallet below to get started.`;
      }
      
      // Create swap interface message
      const swapMessage: Message = {
        id: `msg_${Date.now()}_swap`,
        role: "assistant",
        content: contextMessage,
        timestamp: new Date(),
        metadata: {
          isSwap: true,
          swapParams: {
            inputToken: swapIntent.inputToken || 'ETH',
            outputToken: swapIntent.outputToken || 'USDC',
            amount: swapIntent.amount || '',
            sourceChain: swapIntent.sourceChain,
            destinationChain: swapIntent.destinationChain,
            isCrossChain: swapIntent.isCrossChain,
          }
        }
      };
      
      setMessages(prev => [...prev, swapMessage]);
      chatMemoryService.addMessage(swapMessage);
      setActiveSwap({
        inputToken: swapIntent.inputToken || 'ETH',
        outputToken: swapIntent.outputToken || 'USDC',
        amount: swapIntent.amount || '',
        messageId: swapMessage.id,
      });
      setIsTyping(false);
      
      // Speak the response if voice is enabled
      await speakResponse(contextMessage);
      
      return;
    }

    try {
      // Check if this is a specific crypto query
      const isCryptoQuery = /price|portfolio|defi|market|trend|btc|eth|crypto|cdp|deposit|yield|compound/i.test(userMessage.content);

      // Helper to parse action blocks in both ##ACTION## and ```ACTION formats
      const parseAction = (text: string): Record<string, unknown> | null => {
        // Check for ##ACTION## format (single line)
        const singleLineMatch = text.split('\n').find((l) => l.trim().startsWith('##ACTION##'));
        if (singleLineMatch) {
          const jsonPart = singleLineMatch.replace('##ACTION##', '').trim();
          try {
            return JSON.parse(jsonPart);
          } catch {
            return null;
          }
        }
        
        // Check for ```ACTION format (code block)
        const codeBlockRegex = /```ACTION\s*([\s\S]*?)\s*```/;
        const codeBlockMatch = text.match(codeBlockRegex);
        if (codeBlockMatch && codeBlockMatch[1]) {
          try {
            return JSON.parse(codeBlockMatch[1].trim());
          } catch {
            return null;
          }
        }
        
        return null;
      };

      if (isCryptoQuery) {
        // Use enhanced AI with crypto tools
        const response = await enhancedAIService.sendMessage(
          userMessage.content,
          getContext(),
          true
        );

        // First, render assistant text response
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
        chatMemoryService.addMessage(assistantMessage);
        await speakResponse(response.message);

        // Second, inspect for actionable block
        const action = parseAction(response.message || "");
        if (action && typeof action.type === 'string') {
          // Handle CDP and Pool actions
          const nowId = `act_${Date.now()}`;
          const pushStatus = (text: string) => {
            const statusMsg: Message = {
              id: `${nowId}_${Math.random().toString(36).slice(2)}`,
              role: "system",
              content: text,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, statusMsg]);
            chatMemoryService.addMessage(statusMsg);
          };

          try {
            if (action.type === 'cdp_create') {
              // Render inline intent summary and (optionally) open/create CDP flow
              pushStatus(`Creating CDP with collateral ${action.collateral} for amount ${action.amount}...`);
              // TODO: Wire into actual CDP creation flow/service
              // For demo UX, open an inline confirmation step could be added here.
              pushStatus(`✅ CDP created successfully (demo). You can now deposit to a pool.`);
            }

            if (action.type === 'pool_deposit') {
              pushStatus(`Depositing ${action.amount} into ${String(action.pool).toUpperCase()} pool...`);
              // TODO: Wire into PoolsSelector / poolsService for execution
              setActiveSwap(null); // ensure swap UI hidden during deposit UX
              pushStatus(`✅ Deposit successful (demo). You're now earning yield.`);
              // Follow-up: ask about compounding
              const compoundPrompt: Message = {
                id: `msg_${Date.now()}_compound_prompt`,
                role: "assistant",
                content: `You've started earning yield in the ${String(action.pool)} pool. Do you want to compound your earnings automatically when thresholds are met?`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, compoundPrompt]);
              chatMemoryService.addMessage(compoundPrompt);
              await speakResponse(compoundPrompt.content);
            }

            if (action.type === 'yield_check') {
              // TODO: Query current yield APR/APY from poolsService and show
              pushStatus(`Fetching current yield for ${String(action.pool).toUpperCase()} pool...`);
              // Demo value
              pushStatus(`📈 Current APY for ${String(action.pool)} pool: ~12.4% (demo).`);
              const follow: Message = {
                id: `msg_${Date.now()}_compound_follow`,
                role: "assistant",
                content: `Would you like to enable compounding for this pool?`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, follow]);
              chatMemoryService.addMessage(follow);
              await speakResponse(follow.content);
            }

            if (action.type === 'compound_prompt') {
              const ask: Message = {
                id: `msg_${Date.now()}_compound_prompt2`,
                role: "assistant",
                content: `Do you want to compound your ${String(action.pool)} pool earnings automatically? Please say yes or no.`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, ask]);
              chatMemoryService.addMessage(ask);
              await speakResponse(ask.content);
            }

            if (action.type === 'compound_execute') {
              const confirm = !!action.confirm;
              if (confirm) {
                pushStatus(`🔁 Enabling auto-compound on ${String(action.pool).toUpperCase()} pool...`);
                // TODO: call strategyService/compound setting
                pushStatus(`✅ Auto-compound enabled (demo).`);
              } else {
                pushStatus(`🛑 Auto-compound not enabled.`);
              }
            }
          } catch (flowErr) {
            console.error('CDP flow error:', flowErr);
            pushStatus(`❌ Action failed. Please try again.`);
          }
        }
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
        chatMemoryService.addMessage(assistantMessage);
        setStreamingContent("");
        
        // Speak the response if voice is enabled
        await speakResponse(fullResponse);
      }
    } catch (error) {
      // Only log in development mode to avoid console spam
      if (import.meta.env.MODE === 'development') {
        console.error("Failed to get AI response:", error);
      }
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      chatMemoryService.addMessage(errorMessage);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isTyping, speakResponse, getContext]);

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
      case "swap":
        query = "I want to swap tokens";
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
          
          <div className="flex items-center space-x-2">
            {/* Voice Controls with Error Boundary - No API key needed, uses secure server endpoint */}
            <VoiceErrorBoundary onError={(error) => console.error('Voice error:', error)}>
              <VoiceControls
                onTranscription={handleVoiceTranscription}
                onError={handleVoiceError}
                onStatusChange={handleVoiceStatusChange}
                className="mr-2"
              />
            </VoiceErrorBoundary>

            {/* ElevenLabs Conversational AI (Authenticated) - Start/Stop full voice conversation */}
            <button
              onClick={async () => {
                /**
                 * Since APIs are set in Vercel, rely on backend validation/feature flags.
                 * We flip conversationalMode on and start/stop a full-duplex voice session.
                 */
                try {
                  const isActive = voiceService.isSessionActive();
                  if (!isActive) {
                    // Ensure conversational mode (backend guard exists in voiceService.initialize/enable)
                    await voiceService.enableConversationalMode();
                    const sessionId = await voiceService.startSession({
                      currentStep: 'chat',
                      userProfile: { experience: 'intermediate' }
                    });
                    console.debug('ElevenLabs voice session started:', sessionId);
                    await voiceService.startListening();
                    setIsListeningToVoice(true);
                    setVoiceEnabled(true);
                    voiceService.stopListening();
                    await voiceService.endSession();
                    setIsListeningToVoice(false);
                    setVoiceEnabled(false);
                    setIsListeningToVoice(false);
                  }
                } catch (e) {
                  console.error('Failed to toggle ElevenLabs conversational session:', e);
                }
              }}
              className={`px-3 py-1 text-xs rounded ${
                isListeningToVoice ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
              title="Toggle ElevenLabs Conversational AI session"
            >
              {isListeningToVoice ? 'Stop Agent' : 'Start Agent'}
            </button>
            
            {isConnected && (
              <div className="flex items-center space-x-2 text-sm">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Connected</span>
              </div>
            )}
            
            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Chat History"
            >
              <History className="w-4 h-4 text-gray-400" />
            </motion.button>
            
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </motion.button>
            
            <motion.button
              onClick={() => {
                const data = chatMemoryService.exportChatHistory(address);
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nyx-chat-${Date.now()}.json`;
                a.click();
              }}
              className="p-2 hover:bg-purple-800/30 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Chat"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </motion.button>
          </div>
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
          
          <motion.button
            onClick={() => handleQuickAction("swap")}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-800/30 hover:bg-purple-700/40 rounded-full text-xs text-gray-300 whitespace-nowrap transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Swap</span>
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
                <ChatMessage message={{
                  ...message,
                  sender: message.role === "user" ? "user" : "ai"
                }} />
                
                {/* Show swap interface for swap messages */}
                {message.metadata?.isSwap && activeSwap?.messageId === message.id && (
                  <div className="mt-4">
                    <SwapInterface
                      initialInputToken={activeSwap.inputToken}
                      initialOutputToken={activeSwap.outputToken}
                      initialAmount={activeSwap.amount}
                      sourceChain={message.metadata?.swapParams?.sourceChain}
                      destinationChain={message.metadata?.swapParams?.destinationChain}
                      isCrossChain={message.metadata?.swapParams?.isCrossChain}
                      voiceEnabled={voiceEnabled}
                      embedded={true}
                      onSwapComplete={(txHash) => {
                        const successMessage: Message = {
                          id: `msg_${Date.now()}_success`,
                          role: "assistant",
                          content: `✅ Swap executed successfully!\n\nTransaction hash: ${txHash}\n\n[View on BaseScan](https://basescan.org/tx/${txHash})`,
                          timestamp: new Date(),
                        };
                        setMessages(prev => [...prev, successMessage]);
                        chatMemoryService.addMessage(successMessage);
                        setActiveSwap(null);
                      }}
                      onCancel={() => setActiveSwap(null)}
                    />
                  </div>
                )}
                
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
              value={voiceTranscript || inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListeningToVoice ? "Listening..." : "Ask about crypto prices, portfolio analysis, DeFi opportunities..."}
              disabled={isTyping || isListeningToVoice}
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
            onClick={() => void handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Natural language crypto intelligence • Real-time data • Portfolio analysis • Voice (ElevenLabs via Vercel APIs)
        </div>
      </motion.div>
    </motion.div>
  );
};