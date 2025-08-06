import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { enhancedAIService } from "../services/ai/enhancedAIService";
import { useWallet } from "../hooks/useWallet";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    toolsUsed?: string[];
    cryptoData?: any;
    recommendations?: string[];
    intent?: {
      action: string;
      confidence: number;
      extractedValue?: any;
    };
  };
}

export interface UserProfile {
  experience?: "beginner" | "intermediate" | "advanced";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  investmentGoals?: string[];
  occupation?: string;
  preferences?: {
    enableCryptoTools: boolean;
    streamResponses: boolean;
    showRecommendations: boolean;
  };
}

interface AIState {
  messages: Message[];
  isTyping: boolean;
  userProfile: UserProfile;
  sessionId: string;
  isConnected: boolean;
  error: string | null;
  streamingMessage: string | null;
}

type AIAction =
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "SET_TYPING"; isTyping: boolean }
  | { type: "UPDATE_PROFILE"; profile: Partial<UserProfile> }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET_SESSION" }
  | { type: "SET_STREAMING"; content: string | null }
  | { type: "SET_CONNECTED"; isConnected: boolean };

const initialState: AIState = {
  messages: [],
  isTyping: false,
  userProfile: {
    experience: "intermediate",
    riskTolerance: "moderate",
    preferences: {
      enableCryptoTools: true,
      streamResponses: true,
      showRecommendations: true,
    },
  },
  sessionId: enhancedAIService.getSessionId(),
  isConnected: false,
  error: null,
  streamingMessage: null,
};

const aiReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
        error: null,
      };
    
    case "SET_TYPING":
      return {
        ...state,
        isTyping: action.isTyping,
      };
    
    case "UPDATE_PROFILE":
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.profile },
      };
    
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        isTyping: false,
      };
    
    case "RESET_SESSION":
      enhancedAIService.resetSession();
      return {
        ...initialState,
        sessionId: enhancedAIService.getSessionId(),
        userProfile: state.userProfile,
      };
    
    case "SET_STREAMING":
      return {
        ...state,
        streamingMessage: action.content,
      };
    
    case "SET_CONNECTED":
      return {
        ...state,
        isConnected: action.isConnected,
      };
    
    default:
      return state;
  }
};

interface AIContextType {
  state: AIState;
  sendMessage: (message: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  resetSession: () => void;
  analyzeCrypto: (action: "price" | "portfolio" | "trends" | "defi", params?: any) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const EnhancedAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const { address, balance, isConnected: walletConnected } = useWallet();

  // Update connection status
  useEffect(() => {
    dispatch({ type: "SET_CONNECTED", isConnected: walletConnected });
  }, [walletConnected]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Welcome! I'm Nyx, your intelligent crypto assistant powered by real-time market data.
      
I can help you with:
• 💰 Real-time cryptocurrency prices
• 📊 Portfolio analysis and optimization
• 📈 Market trends and sentiment analysis
• 🌾 DeFi yield opportunities
• 🎯 Personalized investment strategies

Just ask me anything about crypto, and I'll provide data-driven insights!

${walletConnected ? `I see you're connected with wallet ${address?.slice(0, 6)}...${address?.slice(-4)}. I can analyze your portfolio whenever you're ready.` : "Connect your wallet to unlock personalized portfolio analysis."}`,
      timestamp: new Date(),
    };
    
    dispatch({ type: "ADD_MESSAGE", message: welcomeMessage });
  }, []);

  const getContext = useCallback(() => {
    return {
      conversationStep: "chat" as const,
      userProfile: {
        experience: state.userProfile.experience,
        riskTolerance: state.userProfile.riskTolerance,
        investmentGoals: state.userProfile.investmentGoals,
      },
      walletData: walletConnected ? {
        address,
        balance,
      } : undefined,
    };
  }, [state.userProfile, walletConnected, address, balance]);

  const sendMessage = useCallback(async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    dispatch({ type: "ADD_MESSAGE", message: userMessage });
    dispatch({ type: "SET_TYPING", isTyping: true });
    dispatch({ type: "SET_STREAMING", content: null });

    try {
      const context = getContext();
      const enableCrypto = state.userProfile.preferences?.enableCryptoTools ?? true;
      const shouldStream = state.userProfile.preferences?.streamResponses ?? true;

      // Detect if this is a crypto-related query
      const cryptoKeywords = [
        'price', 'portfolio', 'market', 'crypto', 'bitcoin', 'btc', 'ethereum', 'eth',
        'defi', 'yield', 'apy', 'trends', 'analysis', 'invest', 'trade', 'token'
      ];
      const isCryptoQuery = cryptoKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (isCryptoQuery && enableCrypto) {
        // Use enhanced AI with crypto tools
        const response = await enhancedAIService.sendMessage(message, context, true);
        
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
        
        dispatch({ type: "ADD_MESSAGE", message: assistantMessage });
      } else if (shouldStream) {
        // Stream response for general queries
        let fullResponse = "";
        
        await enhancedAIService.streamMessage(
          message,
          context,
          (chunk) => {
            fullResponse += chunk;
            dispatch({ type: "SET_STREAMING", content: fullResponse });
          },
          false
        );
        
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: fullResponse,
          timestamp: new Date(),
        };
        
        dispatch({ type: "ADD_MESSAGE", message: assistantMessage });
        dispatch({ type: "SET_STREAMING", content: null });
      } else {
        // Regular non-streaming response
        const response = await enhancedAIService.sendMessage(message, context, false);
        
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };
        
        dispatch({ type: "ADD_MESSAGE", message: assistantMessage });
      }
    } catch (error) {
      console.error("AI Provider error:", error);
      dispatch({ 
        type: "SET_ERROR", 
        error: "Failed to get response. Please try again." 
      });
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "system",
        content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      
      dispatch({ type: "ADD_MESSAGE", message: errorMessage });
    } finally {
      dispatch({ type: "SET_TYPING", isTyping: false });
    }
  }, [state.userProfile, getContext]);

  const analyzeCrypto = useCallback(async (
    action: "price" | "portfolio" | "trends" | "defi",
    params?: any
  ) => {
    dispatch({ type: "SET_TYPING", isTyping: true });

    try {
      let response;
      let query = "";

      switch (action) {
        case "price":
          query = params?.symbol 
            ? `What's the current price of ${params.symbol}?`
            : "Show me the current prices of major cryptocurrencies";
          break;
        
        case "portfolio":
          if (walletConnected && params?.holdings) {
            response = await enhancedAIService.analyzePortfolio(params.holdings);
          } else {
            query = "How should I build a balanced crypto portfolio?";
          }
          break;
        
        case "trends":
          query = `Show me market trends for the last ${params?.timeframe || "24 hours"}`;
          break;
        
        case "defi":
          response = await enhancedAIService.getDefiOpportunities(params?.chain);
          break;
      }

      if (query && !response) {
        response = await enhancedAIService.sendMessage(query, getContext(), true);
      }

      if (response) {
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
        
        dispatch({ type: "ADD_MESSAGE", message: assistantMessage });
      }
    } catch (error) {
      console.error(`Failed to analyze crypto (${action}):`, error);
      dispatch({ 
        type: "SET_ERROR", 
        error: `Failed to perform ${action} analysis` 
      });
    } finally {
      dispatch({ type: "SET_TYPING", isTyping: false });
    }
  }, [walletConnected, getContext]);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    dispatch({ type: "UPDATE_PROFILE", profile });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: "RESET_SESSION" });
  }, []);

  return (
    <AIContext.Provider 
      value={{
        state,
        sendMessage,
        updateProfile,
        resetSession,
        analyzeCrypto,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useEnhancedAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useEnhancedAI must be used within EnhancedAIProvider");
  }
  return context;
};