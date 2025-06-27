import React, { createContext, useContext, useReducer, useCallback } from 'react';

export type ConversationStep = 
  | 'initial'
  | 'chat'
  | 'wallet_prompt'
  | 'wallet_scanning'
  | 'wallet_analyzed'
  | 'risk_assessment'
  | 'investment_goals'
  | 'risk_tolerance'
  | 'timeline'
  | 'amount'
  | 'experience_level'
  | 'generating_recommendations'
  | 'recommendations'
  | 'complete';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

export interface WalletData {
  address?: string;
  assets: {
    symbol: string;
    balance: string;
    valueUSD: number;
  }[];
  totalValueUSD: number;
}

export interface UserProfile {
  investmentGoal?: 'growth' | 'income' | 'preservation';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  timeline?: string;
  monthlyAmount?: number;
  occupation?: string;
  hobbies?: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  allocation: number;
  expectedReturn: string;
  riskLevel: 'low' | 'medium' | 'high';
  explanation?: string;
}

interface AIAssistantState {
  currentStep: ConversationStep;
  messages: Message[];
  isTyping: boolean;
  walletData: WalletData | null;
  userProfile: UserProfile;
  recommendations: Recommendation[];
}

type AIAssistantAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_STEP'; payload: ConversationStep }
  | { type: 'SET_WALLET_DATA'; payload: WalletData }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'RESET' };

const initialState: AIAssistantState = {
  currentStep: 'initial',
  messages: [],
  isTyping: false,
  walletData: null,
  userProfile: {},
  recommendations: [],
};

function aiAssistantReducer(state: AIAssistantState, action: AIAssistantAction): AIAssistantState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    
    case 'SET_WALLET_DATA':
      return {
        ...state,
        walletData: action.payload,
      };
    
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ...action.payload,
        },
      };
    
    case 'SET_RECOMMENDATIONS':
      return {
        ...state,
        recommendations: action.payload,
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

interface AIAssistantContextValue {
  state: AIAssistantState;
  addMessage: (content: string, sender: 'user' | 'ai') => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setTyping: (isTyping: boolean) => void;
  setStep: (step: ConversationStep) => void;
  setWalletData: (data: WalletData) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  reset: () => void;
  sendMessage: (content: string) => void;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(aiAssistantReducer, initialState);

  const addMessage = useCallback((content: string, sender: 'user' | 'ai'): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: Message = {
      id,
      sender,
      content,
      timestamp: new Date(),
      typing: sender === 'ai',
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    return id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: isTyping });
  }, []);

  const setStep = useCallback((step: ConversationStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setWalletData = useCallback((data: WalletData) => {
    dispatch({ type: 'SET_WALLET_DATA', payload: data });
  }, []);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: profile });
  }, []);

  const setRecommendations = useCallback((recommendations: Recommendation[]) => {
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const sendMessage = useCallback((content: string) => {
    // Add user message
    addMessage(content, 'user');
    
    // TODO: Process message and generate AI response
    // For now, just add a placeholder response
    setTimeout(() => {
      addMessage('I understand your message. Let me help you with that.', 'ai');
    }, 1000);
  }, [addMessage]);

  const value: AIAssistantContextValue = {
    state,
    addMessage,
    updateMessage,
    setTyping,
    setStep,
    setWalletData,
    updateUserProfile,
    setRecommendations,
    reset,
    sendMessage,
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
}