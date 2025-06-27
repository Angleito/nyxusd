import type { 
  ConversationStep, 
  UserProfile, 
  WalletData,
  Recommendation as ProviderRecommendation 
} from '../../providers/AIAssistantProvider';
import {
  getInitialGreeting,
  getWalletPrompt,
  getWalletScanningMessage,
  getWalletAnalysisMessage,
  getInvestmentGoalsQuestion,
  getRiskToleranceQuestion,
  getTimelineQuestion,
  getAmountQuestion,
  getRecommendationsIntro,
  getErrorMessage,
  typingDelay
} from './mockResponses';
import {
  analyzeWalletComposition
} from './portfolioAnalyzer';
import {
  generateRecommendations
} from './recommendationEngine';
import {
  explainWithAnalogy,
  type DeFiConcept,
  type Occupation
} from './analogyGenerator';

export interface ConversationContext {
  walletData?: WalletData;
  userProfile?: UserProfile;
  recommendations?: ProviderRecommendation[];
  lastUserMessage?: string;
  conversationHistory?: Array<{ role: 'user' | 'ai'; content: string }>;
}

export interface ProcessedResponse {
  message: string;
  nextStep?: ConversationStep;
  shouldGenerateRecommendations?: boolean;
  typingDelay?: number;
  error?: boolean;
}

// Map user occupations to analogy generator occupations
const mapOccupationToAnalogy = (occupation?: string): Occupation => {
  if (!occupation) return 'general';
  
  const lowerOccupation = occupation.toLowerCase();
  if (lowerOccupation.includes('chef') || lowerOccupation.includes('cook') || lowerOccupation.includes('restaurant')) {
    return 'chef';
  }
  if (lowerOccupation.includes('teach') || lowerOccupation.includes('professor') || lowerOccupation.includes('education')) {
    return 'teacher';
  }
  if (lowerOccupation.includes('doctor') || lowerOccupation.includes('nurse') || lowerOccupation.includes('medical')) {
    return 'doctor';
  }
  if (lowerOccupation.includes('engineer') || lowerOccupation.includes('developer') || lowerOccupation.includes('tech')) {
    return 'engineer';
  }
  
  return 'general';
};

// Detect DeFi concepts in user messages that might benefit from analogies
const detectDeFiConcept = (message: string): DeFiConcept | null => {
  const lowerMessage = message.toLowerCase();
  const conceptMap: Record<string, DeFiConcept> = {
    'clmm': 'clmm',
    'concentrated liquidity': 'clmm',
    'liquidity': 'liquidity',
    'portfolio': 'portfolio',
    'diversification': 'diversification',
    'diversify': 'diversification',
    'risk': 'risk_management',
    'yield': 'yields',
    'apr': 'yields',
    'apy': 'yields',
    'smart contract': 'smart_contracts',
    'pool': 'pools',
    'liquidity pool': 'pools',
    'impermanent loss': 'impermanent_loss',
    'slippage': 'slippage',
    'gas': 'gas_fees',
    'gas fee': 'gas_fees',
    'staking': 'staking',
    'stake': 'staking'
  };
  
  for (const [key, concept] of Object.entries(conceptMap)) {
    if (lowerMessage.includes(key)) {
      return concept;
    }
  }
  
  return null;
};

// Process user input to extract relevant information
// Commented out as it's not currently used, but kept for future reference
/*
const processUserInput = (message: string, currentStep: ConversationStep): Partial<UserProfile> => {
  const lowerMessage = message.toLowerCase();
  const updates: Partial<UserProfile> = {};
  
  switch (currentStep) {
    case 'investment_goals':
      if (lowerMessage.includes('grow') || lowerMessage.includes('wealth') || lowerMessage.includes('appreciation')) {
        updates.investmentGoal = 'growth';
      } else if (lowerMessage.includes('income') || lowerMessage.includes('passive') || lowerMessage.includes('yield')) {
        updates.investmentGoal = 'income';
      } else if (lowerMessage.includes('preserv') || lowerMessage.includes('protect') || lowerMessage.includes('safe')) {
        updates.investmentGoal = 'preservation';
      }
      break;
      
    case 'risk_tolerance':
      if (lowerMessage.includes('conservative') || lowerMessage.includes('low') || lowerMessage.includes('safe')) {
        updates.riskTolerance = 'conservative';
      } else if (lowerMessage.includes('aggressive') || lowerMessage.includes('high') || lowerMessage.includes('risk')) {
        updates.riskTolerance = 'aggressive';
      } else {
        updates.riskTolerance = 'moderate';
      }
      break;
      
    case 'timeline':
      updates.timeline = message;
      break;
      
    case 'amount':
      const amountMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      if (amountMatch) {
        updates.monthlyAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
      break;
      
    // Handle occupation separately if needed
  }
  
  return updates;
};
*/

// Main function to process user messages
export const processUserMessage = async (
  message: string,
  currentStep: ConversationStep,
  context: ConversationContext
): Promise<ProcessedResponse> => {
  try {
    // Extract user profile updates from the message
    // const profileUpdates = processUserInput(message, currentStep);
    
    // Check if user is asking about a DeFi concept
    const defiConcept = detectDeFiConcept(message);
    const occupation = mapOccupationToAnalogy(context.userProfile?.occupation);
    
    // Handle different conversation steps
    switch (currentStep) {
      case 'initial':
        return {
          message: getInitialGreeting() + '\n\n' + getWalletPrompt(),
          nextStep: 'wallet_prompt',
          typingDelay: typingDelay()
        };
        
      case 'wallet_prompt':
        // User should connect wallet, then we scan
        return {
          message: getWalletScanningMessage(),
          nextStep: 'wallet_scanning',
          typingDelay: typingDelay()
        };
        
      case 'wallet_scanning':
        // After scanning, analyze the wallet
        if (context.walletData) {
          const analysisMessage = getWalletAnalysisMessage({
            totalValueUSD: context.walletData.totalValueUSD,
            tokenCount: context.walletData.assets.length,
            mainHoldings: context.walletData.assets.slice(0, 3).map(a => a.symbol),
            hasDefiPositions: context.walletData.assets.some(a => 
              ['AAVE', 'UNI', 'COMP', 'CRV'].includes(a.symbol.toUpperCase())
            )
          });
          
          return {
            message: analysisMessage + '\n\n' + getInvestmentGoalsQuestion(),
            nextStep: 'investment_goals',
            typingDelay: typingDelay()
          };
        }
        return {
          message: getErrorMessage(),
          error: true,
          typingDelay: typingDelay()
        };
        
      case 'investment_goals':
        // If asking about concepts, explain with analogy
        if (defiConcept) {
          const explanation = explainWithAnalogy(defiConcept, occupation);
          return {
            message: `${explanation}\n\nNow, back to your investment goals - ${getInvestmentGoalsQuestion()}`,
            typingDelay: typingDelay()
          };
        }
        
        return {
          message: getRiskToleranceQuestion(),
          nextStep: 'risk_tolerance',
          typingDelay: typingDelay()
        };
        
      case 'risk_tolerance':
        return {
          message: getTimelineQuestion(),
          nextStep: 'timeline',
          typingDelay: typingDelay()
        };
        
      case 'timeline':
        return {
          message: getAmountQuestion(),
          nextStep: 'amount',
          typingDelay: typingDelay()
        };
        
      case 'amount':
        return {
          message: 'Great! I now have all the information I need. Let me analyze your profile and generate personalized recommendations...',
          nextStep: 'generating_recommendations',
          shouldGenerateRecommendations: true,
          typingDelay: typingDelay()
        };
        
        
      case 'generating_recommendations':
        // This step triggers recommendation generation
        if (context.walletData && context.userProfile) {
          const occupation = mapOccupationToAnalogy(context.userProfile.occupation);
          let introMessage = getRecommendationsIntro();
          
          // Add personalized touch based on occupation
          if (occupation !== 'general') {
            introMessage += `\n\nI'll explain these recommendations using analogies from your field to make them easier to understand.`;
          }
          
          return {
            message: introMessage,
            nextStep: 'recommendations',
            typingDelay: typingDelay()
          };
        }
        return {
          message: getErrorMessage(),
          error: true,
          typingDelay: typingDelay()
        };
        
      case 'recommendations':
        // User can ask questions about recommendations
        if (defiConcept) {
          const explanation = explainWithAnalogy(defiConcept, occupation);
          return {
            message: explanation,
            typingDelay: typingDelay()
          };
        }
        
        // Provide additional insights based on question
        if (message.toLowerCase().includes('risk')) {
          const riskAnalysis = analyzeWalletComposition(context.walletData!);
          return {
            message: `Based on my analysis:\n\n• Overall Risk: ${riskAnalysis.overallRisk}\n• Diversification Score: ${riskAnalysis.diversificationScore}/100\n• Estimated Annual Volatility: ${riskAnalysis.volatilityEstimate}%\n\n${riskAnalysis.recommendations.join('\n')}`,
            typingDelay: typingDelay()
          };
        }
        
        return {
          message: 'Feel free to ask me any questions about your recommendations or DeFi concepts!',
          typingDelay: typingDelay()
        };
        
      default:
        return {
          message: "I'm here to help! What would you like to know?",
          typingDelay: typingDelay()
        };
    }
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      message: getErrorMessage(),
      error: true,
      typingDelay: typingDelay()
    };
  }
};

// Get the next conversation step
export const getNextStep = (currentStep: ConversationStep): ConversationStep => {
  const stepFlow: Record<ConversationStep, ConversationStep> = {
    'initial': 'wallet_prompt',
    'wallet_prompt': 'wallet_scanning',
    'wallet_scanning': 'wallet_analyzed',
    'wallet_analyzed': 'investment_goals',
    'investment_goals': 'risk_tolerance',
    'risk_tolerance': 'timeline',
    'timeline': 'amount',
    'amount': 'generating_recommendations',
    'generating_recommendations': 'recommendations',
    'recommendations': 'complete',
    'complete': 'complete',
    'chat': 'chat',
    'risk_assessment': 'investment_goals',
    'experience_level': 'generating_recommendations'
  };
  
  return stepFlow[currentStep] || currentStep;
};

// Generate recommendations based on user profile and wallet data
export const generatePersonalizedRecommendations = (
  walletData: WalletData,
  userProfile: UserProfile
): ProviderRecommendation[] => {
  // Convert wallet data to recommendation engine format
  const engineWalletData = {
    holdings: walletData.assets.map(asset => ({
      symbol: asset.symbol,
      amount: parseFloat(asset.balance),
      valueUSD: asset.valueUSD
    })),
    totalValueUSD: walletData.totalValueUSD
  };
  
  // Convert UserProfile to match recommendation engine's expectations
  const engineUserProfile = {
    riskTolerance: userProfile.riskTolerance || 'moderate',
    investmentHorizon: (userProfile.timeline && parseInt(userProfile.timeline) > 5 ? 'long' : 
                      userProfile.timeline && parseInt(userProfile.timeline) > 2 ? 'medium' : 'short') as 'short' | 'medium' | 'long',
    experienceLevel: 'intermediate' as const, // Default since we removed experience_level step
    goals: userProfile.investmentGoal ? [userProfile.investmentGoal] : []
  };
  
  const result = generateRecommendations(engineWalletData, engineUserProfile);
  
  if (result.isRight()) {
    const recommendations = (result as any).value;
    const occupation = mapOccupationToAnalogy(userProfile.occupation);
    
    // Convert to provider format and add occupation-specific explanations
    return recommendations.map((rec: any) => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      allocation: rec.allocationPercentage,
      expectedReturn: `${rec.expectedReturnRange.min}-${rec.expectedReturnRange.max}%`,
      riskLevel: rec.riskLevel,
      explanation: occupation !== 'general' 
        ? addOccupationContext(rec.explanation, occupation, rec.title)
        : rec.explanation
    }));
  }
  
  // Fallback recommendations if generation fails
  return [
    {
      id: '1',
      title: 'Balanced DeFi Portfolio',
      description: 'A diversified approach to DeFi investing',
      allocation: 100,
      expectedReturn: '8-15%',
      riskLevel: 'medium',
      explanation: 'This balanced strategy provides exposure to various DeFi opportunities while managing risk.'
    }
  ];
};

// Add occupation-specific context to recommendations
const addOccupationContext = (
  baseExplanation: string,
  occupation: Occupation,
  recommendationTitle: string
): string => {
  const contextMap: Record<Occupation, Record<string, string>> = {
    chef: {
      'Stablecoin': 'Like keeping cash reserves for daily ingredient purchases - always liquid and ready.',
      'Yield Farming': 'Similar to running multiple revenue streams in your restaurant - each dish contributes to overall profit.',
      'Liquidity': 'Like having a well-stocked pantry - you provide ingredients (liquidity) that others need for their recipes (trades).'
    },
    teacher: {
      'Stablecoin': 'Like having emergency lesson plans - reliable, predictable, and always available when needed.',
      'Yield Farming': 'Similar to creating educational content that generates passive income through licensing.',
      'Liquidity': 'Like contributing to shared teaching resources - everyone benefits from the collective pool.'
    },
    doctor: {
      'Stablecoin': 'Like maintaining emergency medical supplies - stable, reliable, and crucial for operations.',
      'Yield Farming': 'Similar to investing in medical equipment that generates revenue through patient treatments.',
      'Liquidity': 'Like participating in a medical cooperative - pooling resources for mutual benefit.'
    },
    engineer: {
      'Stablecoin': 'Like maintaining system redundancy - stable backups that ensure continuous operation.',
      'Yield Farming': 'Similar to optimizing code for efficiency - your assets work harder to generate returns.',
      'Liquidity': 'Like contributing to open-source projects - your resources help the ecosystem function.'
    },
    general: {}
  };
  
  const occupationContext = contextMap[occupation];
  const relevantContext = Object.entries(occupationContext).find(([key]) => 
    recommendationTitle.toLowerCase().includes(key.toLowerCase())
  );
  
  if (relevantContext) {
    return `${baseExplanation}\n\n${relevantContext[1]}`;
  }
  
  return baseExplanation;
};

// Simulate realistic typing delay
export const simulateTypingDelay = async (baseDelay?: number): Promise<void> => {
  const delay = baseDelay || typingDelay();
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Types are already exported above