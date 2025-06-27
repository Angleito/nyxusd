/**
 * Mock data and fixtures for AI testing
 * Comprehensive test data sets for all AI prompting system components
 */

import type {
  ConversationStep,
  UserProfile,
  WalletData,
  Recommendation as ProviderRecommendation,
} from "../../frontend/src/providers/AIAssistantProvider";
import type {
  WalletData as EngineWalletData,
  UserProfile as EngineUserProfile,
  Recommendation as EngineRecommendation,
} from "../../frontend/src/lib/ai-assistant/recommendationEngine";
import type {
  RiskAnalysis,
  Opportunity,
  AllocationSuggestion,
} from "../../frontend/src/lib/ai-assistant/portfolioAnalyzer";
import type {
  ConversationContext,
  ProcessedResponse,
} from "../../frontend/src/lib/ai-assistant/conversationFlow";
import type {
  AIContext,
  AIResponse,
} from "../../frontend/src/services/ai/aiService";
import type { UserIntent } from "../../frontend/src/lib/ai-assistant/naturalLanguageProcessor";

// User Profile Fixtures
export const UserProfileFixtures = {
  conservative: {
    occupation: "teacher",
    investmentGoal: "preservation",
    riskTolerance: "conservative",
    timeline: "2 years",
    monthlyAmount: 500,
  } as UserProfile,

  moderate: {
    occupation: "engineer",
    investmentGoal: "growth",
    riskTolerance: "moderate",
    timeline: "5 years",
    monthlyAmount: 1000,
  } as UserProfile,

  aggressive: {
    occupation: "chef",
    investmentGoal: "growth",
    riskTolerance: "aggressive",
    timeline: "10 years",
    monthlyAmount: 2000,
  } as UserProfile,

  income_focused: {
    occupation: "doctor",
    investmentGoal: "income",
    riskTolerance: "moderate",
    timeline: "7 years",
    monthlyAmount: 3000,
  } as UserProfile,

  truck_driver: {
    occupation: "truck_driver",
    investmentGoal: "growth",
    riskTolerance: "moderate",
    timeline: "5 years",
    monthlyAmount: 1200,
  } as UserProfile,

  retail_manager: {
    occupation: "retail_manager",
    investmentGoal: "income",
    riskTolerance: "conservative",
    timeline: "3 years",
    monthlyAmount: 800,
  } as UserProfile,

  incomplete: {
    occupation: "chef",
    investmentGoal: undefined,
    riskTolerance: undefined,
    timeline: undefined,
    monthlyAmount: undefined,
  } as UserProfile,
};

// Wallet Data Fixtures
export const WalletDataFixtures = {
  small_portfolio: {
    address: "0x1234567890123456789012345678901234567890",
    totalValueUSD: 5000,
    assets: [
      {
        symbol: "ETH",
        balance: "2.5",
        valueUSD: 4000,
        contractAddress: "0x0000000000000000000000000000000000000000",
      },
      {
        symbol: "USDC",
        balance: "1000",
        valueUSD: 1000,
        contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
      },
    ],
  } as WalletData,

  diversified_portfolio: {
    address: "0x2345678901234567890123456789012345678901",
    totalValueUSD: 25000,
    assets: [
      {
        symbol: "ETH",
        balance: "8.0",
        valueUSD: 12000,
        contractAddress: "0x0000000000000000000000000000000000000000",
      },
      {
        symbol: "BTC",
        balance: "0.3",
        valueUSD: 8000,
        contractAddress: "0xbtc1234567890123456789012345678901234567",
      },
      {
        symbol: "USDC",
        balance: "3000",
        valueUSD: 3000,
        contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
      },
      {
        symbol: "AAVE",
        balance: "15",
        valueUSD: 1500,
        contractAddress: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      },
      {
        symbol: "UNI",
        balance: "100",
        valueUSD: 500,
        contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      },
    ],
  } as WalletData,

  concentrated_portfolio: {
    address: "0x3456789012345678901234567890123456789012",
    totalValueUSD: 50000,
    assets: [
      {
        symbol: "ETH",
        balance: "30.0",
        valueUSD: 45000,
        contractAddress: "0x0000000000000000000000000000000000000000",
      },
      {
        symbol: "USDC",
        balance: "5000",
        valueUSD: 5000,
        contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
      },
    ],
  } as WalletData,

  stablecoin_heavy: {
    address: "0x4567890123456789012345678901234567890123",
    totalValueUSD: 20000,
    assets: [
      {
        symbol: "USDC",
        balance: "12000",
        valueUSD: 12000,
        contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
      },
      {
        symbol: "DAI",
        balance: "5000",
        valueUSD: 5000,
        contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
      },
      {
        symbol: "USDT",
        balance: "3000",
        valueUSD: 3000,
        contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      },
    ],
  } as WalletData,

  defi_portfolio: {
    address: "0x5678901234567890123456789012345678901234",
    totalValueUSD: 100000,
    assets: [
      {
        symbol: "ETH",
        balance: "20.0",
        valueUSD: 30000,
        contractAddress: "0x0000000000000000000000000000000000000000",
      },
      {
        symbol: "AAVE",
        balance: "200",
        valueUSD: 25000,
        contractAddress: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      },
      {
        symbol: "UNI",
        balance: "2000",
        valueUSD: 15000,
        contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      },
      {
        symbol: "COMP",
        balance: "150",
        valueUSD: 10000,
        contractAddress: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      },
      {
        symbol: "CRV",
        balance: "5000",
        valueUSD: 5000,
        contractAddress: "0xd533a949740bb3306d119cc777fa900ba034cd52",
      },
      {
        symbol: "USDC",
        balance: "15000",
        valueUSD: 15000,
        contractAddress: "0xa0b86a33e6a29fdd2a4b3d0a7b9c8e6f7e8b9c0d",
      },
    ],
  } as WalletData,

  empty_wallet: {
    address: "0x6789012345678901234567890123456789012345",
    totalValueUSD: 0,
    assets: [],
  } as WalletData,

  single_asset: {
    address: "0x7890123456789012345678901234567890123456",
    totalValueUSD: 10000,
    assets: [
      {
        symbol: "ETH",
        balance: "6.67",
        valueUSD: 10000,
        contractAddress: "0x0000000000000000000000000000000000000000",
      },
    ],
  } as WalletData,
};

// Engine Wallet Data (for recommendation engine)
export const EngineWalletDataFixtures = {
  balanced: {
    holdings: [
      { symbol: "ETH", amount: 5.0, valueUSD: 8000 },
      { symbol: "USDC", amount: 2000, valueUSD: 2000 },
      { symbol: "BTC", amount: 0.1, valueUSD: 3000 },
    ],
    totalValueUSD: 13000,
  } as EngineWalletData,

  conservative: {
    holdings: [
      { symbol: "USDC", amount: 5000, valueUSD: 5000 },
      { symbol: "DAI", amount: 3000, valueUSD: 3000 },
      { symbol: "ETH", amount: 1.0, valueUSD: 2000 },
    ],
    totalValueUSD: 10000,
  } as EngineWalletData,

  aggressive: {
    holdings: [
      { symbol: "ETH", amount: 15.0, valueUSD: 24000 },
      { symbol: "AAVE", amount: 100, valueUSD: 8000 },
      { symbol: "UNI", amount: 500, valueUSD: 3000 },
    ],
    totalValueUSD: 35000,
  } as EngineWalletData,
};

// Engine User Profiles
export const EngineUserProfileFixtures = {
  conservative: {
    riskTolerance: "conservative",
    investmentHorizon: "short",
    experienceLevel: "beginner",
    goals: ["preservation"],
  } as EngineUserProfile,

  moderate: {
    riskTolerance: "moderate",
    investmentHorizon: "medium",
    experienceLevel: "intermediate",
    goals: ["growth", "income"],
  } as EngineUserProfile,

  aggressive: {
    riskTolerance: "aggressive",
    investmentHorizon: "long",
    experienceLevel: "advanced",
    goals: ["growth"],
  } as EngineUserProfile,
};

// Recommendation Fixtures
export const RecommendationFixtures = {
  conservative_recommendations: [
    {
      id: "rec-1",
      title: "Stablecoin Yield Farming",
      description: "Earn steady yields on USDC/USDT liquidity pools",
      allocation: 50,
      expectedReturn: "4-8%",
      riskLevel: "low",
      explanation: "This strategy focuses on stable yields with minimal risk.",
    },
    {
      id: "rec-2",
      title: "Conservative DeFi Allocation",
      description: "Small exposure to blue-chip DeFi tokens",
      allocation: 30,
      expectedReturn: "6-12%",
      riskLevel: "medium",
      explanation: "Balanced exposure to established DeFi protocols.",
    },
    {
      id: "rec-3",
      title: "Cash Reserve",
      description: "Maintain liquidity for opportunities",
      allocation: 20,
      expectedReturn: "0-2%",
      riskLevel: "low",
      explanation: "Keep funds available for strategic opportunities.",
    },
  ] as ProviderRecommendation[],

  aggressive_recommendations: [
    {
      id: "rec-4",
      title: "High-Yield CLMM Strategies",
      description: "Maximize CLMM exposure for high returns",
      allocation: 40,
      expectedReturn: "20-50%",
      riskLevel: "high",
      explanation: "Aggressive growth strategy with high volatility.",
    },
    {
      id: "rec-5",
      title: "Leveraged CDP Positions",
      description: "Use CDPs for leveraged yield farming",
      allocation: 35,
      expectedReturn: "25-60%",
      riskLevel: "high",
      explanation: "Amplified returns through strategic leverage.",
    },
    {
      id: "rec-6",
      title: "Volatile Pair Liquidity",
      description: "Provide liquidity to high-volume pairs",
      allocation: 25,
      expectedReturn: "30-80%",
      riskLevel: "high",
      explanation: "High-risk, high-reward liquidity provision.",
    },
  ] as ProviderRecommendation[],
};

// Engine Recommendation Fixtures
export const EngineRecommendationFixtures = {
  sample_recommendations: [
    {
      id: "eng-rec-1",
      title: "Balanced DeFi Portfolio",
      description: "Diversified DeFi investment strategy",
      allocationPercentage: 40,
      expectedReturnRange: { min: 8, max: 15 },
      riskLevel: "medium",
      explanation: "A balanced approach to DeFi investing.",
      actions: [
        {
          type: "provide-liquidity",
          asset: "nyxUSD/USDC",
          amount: 4000,
          details: "Allocate $4000 to nyxUSD/USDC liquidity pool",
        },
      ],
    },
    {
      id: "eng-rec-2",
      title: "CLMM Staking",
      description: "Stake CLMM tokens for governance rewards",
      allocationPercentage: 35,
      expectedReturnRange: { min: 12, max: 25 },
      riskLevel: "medium",
      explanation: "Generate yields through CLMM staking.",
      actions: [
        {
          type: "stake",
          asset: "CLMM",
          amount: 3500,
          details: "Allocate $3500 to CLMM staking",
        },
      ],
    },
    {
      id: "eng-rec-3",
      title: "Stablecoin Safety",
      description: "Conservative stablecoin allocation",
      allocationPercentage: 25,
      expectedReturnRange: { min: 3, max: 6 },
      riskLevel: "low",
      explanation: "Stable returns with minimal risk.",
      actions: [
        {
          type: "allocate",
          asset: "USDC",
          amount: 2500,
          details: "Allocate $2500 to USDC reserves",
        },
      ],
    },
  ] as EngineRecommendation[],
};

// Risk Analysis Fixtures
export const RiskAnalysisFixtures = {
  low_risk: {
    overallRisk: "low",
    diversificationScore: 85,
    concentrationRisk: [],
    volatilityEstimate: 8,
    recommendations: [
      "Your portfolio shows good diversification",
      "Consider adding some growth assets for higher returns",
    ],
  } as RiskAnalysis,

  high_risk: {
    overallRisk: "high",
    diversificationScore: 25,
    concentrationRisk: [{ asset: "ETH", percentage: 75 }],
    volatilityEstimate: 45,
    recommendations: [
      "ETH represents 75.0% of your portfolio. Consider reducing concentration risk",
      "Consider diversifying your portfolio across more assets to reduce risk",
    ],
  } as RiskAnalysis,

  medium_risk: {
    overallRisk: "medium",
    diversificationScore: 65,
    concentrationRisk: [{ asset: "BTC", percentage: 35 }],
    volatilityEstimate: 22,
    recommendations: [
      "BTC represents 35.0% of your portfolio. Consider reducing concentration risk",
      "Consider adding stablecoins for portfolio stability and liquidity",
    ],
  } as RiskAnalysis,
};

// Opportunity Fixtures
export const OpportunityFixtures = {
  diversification: {
    type: "diversification",
    title: "Increase Portfolio Diversification",
    description:
      "Your portfolio is concentrated in very few assets. Consider diversifying across different asset classes.",
    potentialBenefit: "Reduce portfolio volatility by 20-30%",
    priority: "high",
  } as Opportunity,

  rebalancing: {
    type: "rebalancing",
    title: "Portfolio Rebalancing Recommended",
    description:
      "Your current allocation has drifted from optimal targets based on your risk profile.",
    potentialBenefit: "Align portfolio with your risk tolerance and goals",
    priority: "medium",
  } as Opportunity,

  tax_optimization: {
    type: "tax_optimization",
    title: "Tax-Loss Harvesting Opportunity",
    description:
      "Consider tax-efficient strategies to optimize your after-tax returns.",
    potentialBenefit: "Potentially save 1-2% annually through tax optimization",
    priority: "low",
  } as Opportunity,

  cost_reduction: {
    type: "cost_reduction",
    title: "Reduce Investment Costs",
    description:
      "Some of your holdings (SAFEMOON) may have high fees. Consider lower-cost alternatives.",
    potentialBenefit: "Save 0.5-1% annually in fees",
    priority: "medium",
  } as Opportunity,
};

// Allocation Suggestion Fixtures
export const AllocationSuggestionFixtures = {
  conservative_allocations: [
    {
      asset: "Stablecoins (USDC/DAI)",
      currentPercentage: 0,
      suggestedPercentage: 60,
      reason: "Provides stability and liquidity for your portfolio",
    },
    {
      asset: "Bitcoin (BTC)",
      currentPercentage: 0,
      suggestedPercentage: 20,
      reason: "Digital gold - store of value with long-term growth potential",
    },
    {
      asset: "Ethereum (ETH)",
      currentPercentage: 0,
      suggestedPercentage: 15,
      reason:
        "Smart contract platform with strong ecosystem and DeFi opportunities",
    },
    {
      asset: "Blue-chip DeFi (AAVE/UNI)",
      currentPercentage: 0,
      suggestedPercentage: 5,
      reason: "Exposure to decentralized finance innovation",
    },
  ] as AllocationSuggestion[],

  aggressive_allocations: [
    {
      asset: "Stablecoins (USDC/DAI)",
      currentPercentage: 0,
      suggestedPercentage: 10,
      reason: "Provides stability and liquidity for your portfolio",
    },
    {
      asset: "Bitcoin (BTC)",
      currentPercentage: 0,
      suggestedPercentage: 25,
      reason: "Digital gold - store of value with long-term growth potential",
    },
    {
      asset: "Ethereum (ETH)",
      currentPercentage: 0,
      suggestedPercentage: 30,
      reason:
        "Smart contract platform with strong ecosystem and DeFi opportunities",
    },
    {
      asset: "Blue-chip DeFi (AAVE/UNI)",
      currentPercentage: 0,
      suggestedPercentage: 20,
      reason: "Exposure to decentralized finance innovation",
    },
    {
      asset: "Emerging Protocols",
      currentPercentage: 0,
      suggestedPercentage: 15,
      reason: "Higher risk/reward opportunities in new protocols",
    },
  ] as AllocationSuggestion[],
};

// Conversation Context Fixtures
export const ConversationContextFixtures = {
  initial_context: {
    walletData: undefined,
    userProfile: undefined,
    conversationHistory: [],
  } as ConversationContext,

  complete_context: {
    walletData: WalletDataFixtures.diversified_portfolio,
    userProfile: UserProfileFixtures.moderate,
    recommendations: RecommendationFixtures.conservative_recommendations,
    conversationHistory: [
      { role: "user", content: "Hello" },
      { role: "ai", content: "Hi! How can I help you today?" },
    ],
  } as ConversationContext,

  wallet_connected: {
    walletData: WalletDataFixtures.small_portfolio,
    userProfile: undefined,
    conversationHistory: [
      { role: "user", content: "Connect wallet" },
      { role: "ai", content: "Wallet connected successfully!" },
    ],
  } as ConversationContext,
};

// AI Context Fixtures
export const AIContextFixtures = {
  initial: {
    conversationStep: "initial",
    userProfile: UserProfileFixtures.moderate,
    walletData: WalletDataFixtures.diversified_portfolio,
    conversationHistory: [],
  } as AIContext,

  investment_goals: {
    conversationStep: "investment_goals",
    userProfile: UserProfileFixtures.moderate,
    walletData: WalletDataFixtures.diversified_portfolio,
    conversationHistory: [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ],
  } as AIContext,

  recommendations: {
    conversationStep: "recommendations",
    userProfile: UserProfileFixtures.aggressive,
    walletData: WalletDataFixtures.defi_portfolio,
    conversationHistory: [
      { role: "user", content: "Show me recommendations" },
      {
        role: "assistant",
        content: "Here are your personalized recommendations...",
      },
    ],
  } as AIContext,
};

// Processed Response Fixtures
export const ProcessedResponseFixtures = {
  success_response: {
    message: "Great! I understand your investment goals.",
    nextStep: "risk_tolerance",
    shouldGenerateRecommendations: false,
    typingDelay: 1000,
    error: false,
  } as ProcessedResponse,

  error_response: {
    message: "I apologize, but I encountered an error processing your request.",
    nextStep: undefined,
    shouldGenerateRecommendations: false,
    typingDelay: 500,
    error: true,
  } as ProcessedResponse,

  recommendation_trigger: {
    message: "Perfect! Let me generate your personalized recommendations.",
    nextStep: "recommendations",
    shouldGenerateRecommendations: true,
    typingDelay: 2000,
    error: false,
  } as ProcessedResponse,
};

// AI Response Fixtures
export const AIResponseFixtures = {
  successful_response: {
    message: "I understand you want to focus on growth investments.",
    intent: {
      action: "select_option",
      confidence: 0.9,
      extractedValue: "growth",
    },
    shouldContinue: true,
    nextStep: "risk_tolerance",
  } as AIResponse,

  unclear_response: {
    message: "I'm not sure I understand. Could you please clarify?",
    intent: {
      action: "unclear",
      confidence: 0.3,
    },
    shouldContinue: false,
  } as AIResponse,

  error_response: {
    message: "I apologize, but I encountered an error.",
    intent: {
      action: "unclear",
      confidence: 0.1,
    },
    shouldContinue: false,
    error: "Processing error occurred",
  } as AIResponse,
};

// User Intent Fixtures
export const UserIntentFixtures = {
  clear_investment_goal: {
    action: "select_option",
    confidence: 0.9,
    extractedValue: "growth",
    originalMessage: "I want to maximize my wealth growth",
  } as UserIntent,

  wallet_connection: {
    action: "connect_wallet",
    confidence: 0.95,
    originalMessage: "yes, connect my wallet",
  } as UserIntent,

  timeline_input: {
    action: "input_value",
    confidence: 0.85,
    extractedValue: 5,
    originalMessage: "5 years",
  } as UserIntent,

  amount_input: {
    action: "input_value",
    confidence: 0.9,
    extractedValue: 1000,
    originalMessage: "$1000 per month",
  } as UserIntent,

  help_request: {
    action: "help",
    confidence: 0.8,
    originalMessage: "I don't understand",
  } as UserIntent,

  unclear_input: {
    action: "unclear",
    confidence: 0.2,
    originalMessage: "xyz123abc",
  } as UserIntent,
};

// Test Scenarios - Complex test cases combining multiple fixtures
export const TestScenarios = {
  new_conservative_investor: {
    userProfile: UserProfileFixtures.conservative,
    walletData: WalletDataFixtures.small_portfolio,
    expectedRiskLevel: "low",
    expectedAllocations: AllocationSuggestionFixtures.conservative_allocations,
    conversationFlow: [
      { step: "initial", input: "Hello", expectedAction: "unclear" },
      { step: "occupation", input: "teacher", expectedAction: "input_value" },
      {
        step: "investment_goals",
        input: "preserve capital",
        expectedAction: "select_option",
      },
      {
        step: "risk_tolerance",
        input: "conservative",
        expectedAction: "select_option",
      },
      { step: "timeline", input: "2 years", expectedAction: "input_value" },
      { step: "amount", input: "$500", expectedAction: "input_value" },
    ],
  },

  experienced_aggressive_investor: {
    userProfile: UserProfileFixtures.aggressive,
    walletData: WalletDataFixtures.defi_portfolio,
    expectedRiskLevel: "high",
    expectedAllocations: AllocationSuggestionFixtures.aggressive_allocations,
    conversationFlow: [
      { step: "occupation", input: "chef", expectedAction: "input_value" },
      {
        step: "investment_goals",
        input: "maximize growth",
        expectedAction: "select_option",
      },
      {
        step: "risk_tolerance",
        input: "aggressive",
        expectedAction: "select_option",
      },
      { step: "timeline", input: "10 years", expectedAction: "input_value" },
      { step: "amount", input: "$2000", expectedAction: "input_value" },
    ],
  },

  concentration_risk_scenario: {
    userProfile: UserProfileFixtures.moderate,
    walletData: WalletDataFixtures.concentrated_portfolio,
    expectedRiskAnalysis: RiskAnalysisFixtures.high_risk,
    expectedOpportunities: [OpportunityFixtures.diversification],
    issues: ["high_concentration", "single_asset_risk"],
  },

  stablecoin_dominant_scenario: {
    userProfile: UserProfileFixtures.income_focused,
    walletData: WalletDataFixtures.stablecoin_heavy,
    expectedRiskAnalysis: RiskAnalysisFixtures.low_risk,
    expectedOpportunities: [],
    characteristics: ["low_volatility", "income_focused", "stable_returns"],
  },

  empty_wallet_scenario: {
    userProfile: UserProfileFixtures.moderate,
    walletData: WalletDataFixtures.empty_wallet,
    expectedBehavior: "graceful_handling",
    expectedRecommendations: "template_based",
    fallbacks: ["default_allocations", "educational_content"],
  },
};

// Export utility functions for creating dynamic test data
export const FixtureUtils = {
  createRandomWallet: (assetCount: number, totalValue: number): WalletData => {
    const assets = Array.from({ length: assetCount }, (_, i) => ({
      symbol: `TOKEN${i}`,
      balance: (Math.random() * 1000).toFixed(2),
      valueUSD: totalValue / assetCount + (Math.random() - 0.5) * 1000,
      contractAddress: `0x${i.toString().padStart(40, "0")}`,
    }));

    return {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      totalValueUSD: assets.reduce((sum, asset) => sum + asset.valueUSD, 0),
      assets,
    };
  },

  createVariantProfile: (
    base: UserProfile,
    overrides: Partial<UserProfile>,
  ): UserProfile => ({
    ...base,
    ...overrides,
  }),

  createConversationHistory: (
    length: number,
  ): Array<{ role: "user" | "ai"; content: string }> => {
    return Array.from({ length }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "ai",
      content: `Message ${i + 1}`,
    }));
  },

  createEngineWallet: (providerWallet: WalletData): EngineWalletData => ({
    holdings: providerWallet.assets.map((asset) => ({
      symbol: asset.symbol,
      amount: parseFloat(asset.balance),
      valueUSD: asset.valueUSD,
    })),
    totalValueUSD: providerWallet.totalValueUSD,
  }),

  createEngineProfile: (providerProfile: UserProfile): EngineUserProfile => ({
    riskTolerance: providerProfile.riskTolerance || "moderate",
    investmentHorizon:
      providerProfile.timeline && parseInt(providerProfile.timeline) > 5
        ? "long"
        : providerProfile.timeline && parseInt(providerProfile.timeline) > 2
          ? "medium"
          : "short",
    experienceLevel: "intermediate",
    goals: providerProfile.investmentGoal
      ? [providerProfile.investmentGoal]
      : [],
  }),

  validateFixtureConsistency: (scenario: any): boolean => {
    // Validate that test scenarios have consistent data
    if (scenario.userProfile && scenario.walletData) {
      const profile = scenario.userProfile;
      const wallet = scenario.walletData;

      // Basic validation
      if (wallet.totalValueUSD < 0) return false;
      if (wallet.assets.some((asset: any) => asset.valueUSD < 0)) return false;
      if (!profile.occupation || !profile.riskTolerance) return false;

      return true;
    }
    return false;
  },
};

// Export all fixtures as a comprehensive collection
export const AIFixtures = {
  UserProfiles: UserProfileFixtures,
  WalletData: WalletDataFixtures,
  EngineWalletData: EngineWalletDataFixtures,
  EngineUserProfiles: EngineUserProfileFixtures,
  Recommendations: RecommendationFixtures,
  EngineRecommendations: EngineRecommendationFixtures,
  RiskAnalysis: RiskAnalysisFixtures,
  Opportunities: OpportunityFixtures,
  AllocationSuggestions: AllocationSuggestionFixtures,
  ConversationContexts: ConversationContextFixtures,
  AIContexts: AIContextFixtures,
  ProcessedResponses: ProcessedResponseFixtures,
  AIResponses: AIResponseFixtures,
  UserIntents: UserIntentFixtures,
  TestScenarios: TestScenarios,
  Utils: FixtureUtils,
};
