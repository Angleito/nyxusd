// Demo Helper for NYXUSD Hackathon Video
// This module provides enhanced demo data and experiences for video recording

export interface DemoScenario {
  name: string;
  description: string;
  mockData: any;
  aiResponses: string[];
  duration: number; // in seconds
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: "Conservative Investor",
    description: "User wants steady 10% returns with low risk",
    mockData: {
      userInput: "I have $50k and want steady returns with low risk",
      portfolio: { currentValue: 50000, risk: "low" },
      recommendedPools: ["Safe Pool (5-10% APY)"],
      aiStrategy: "Conservative Growth Strategy",
    },
    aiResponses: [
      "Based on your $50k portfolio and preference for low-risk investments, I recommend the Safe Pool with 5-10% APY.",
      "I'll allocate 70% to stable yield protocols like Aave and Compound, 20% to stablecoin liquidity pools, and keep 10% as a safety buffer.",
      "This strategy targets 8% annual returns while maintaining a 95/100 safety score. Would you like me to help you monitor your position?"
    ],
    duration: 30
  },
  {
    name: "Yield Farmer",
    description: "Experienced user wants maximum yields",
    mockData: {
      userInput: "I want maximum yields, I can handle high risk",
      portfolio: { currentValue: 100000, risk: "high" },
      recommendedPools: ["High Risk Pool (25-100%+ APY)"],
      aiStrategy: "Aggressive Yield Strategy",
    },
    aiResponses: [
      "Perfect! For aggressive yield farming, I'll deploy your funds across new protocol launches and concentrated liquidity positions.",
      "I'm creating a custom strategy with up to 10x leverage, targeting 50-100% APY while implementing stop-losses at -15%.",
      "This includes automated rebalancing across Base and Sui chains to capture the best opportunities. Ready to deploy?"
    ],
    duration: 25
  },
  {
    name: "Token Discovery",
    description: "Showcasing 155+ token integration",
    mockData: {
      searchQuery: "AERO",
      foundTokens: [
        { symbol: "AERO", name: "Aerodrome Finance", price: "$0.89", chain: "Base" },
        { symbol: "CBETH", name: "Coinbase Wrapped Staked ETH", price: "$2,451", chain: "Base" },
        { symbol: "HIGHER", name: "Higher", price: "$0.025", chain: "Base" },
        { symbol: "DEGEN", name: "Degen", price: "$0.008", chain: "Base" },
      ],
      totalAvailable: 155
    },
    aiResponses: [
      "I found 155+ tokens available for trading on Base network through Odos integration.",
      "AERO looks interesting - it's the native token of Aerodrome, Base's largest DEX. Current yield opportunities show 35% APY in AERO-ETH pools.",
      "Would you like me to create a strategy that includes AERO exposure while managing the associated risks?"
    ],
    duration: 20
  }
];

export const DEMO_METRICS = {
  protocolTVL: "$2.4M",
  activeUsers: "1,247",
  totalTransactions: "15,682",
  averageAPY: "24.6%",
  successfulStrategies: "98.7%",
  oracleHealth: "100%",
  supportedTokens: 155,
  chainSupport: ["Base", "Sui (Coming Soon)"]
};

export const AI_DEMO_RESPONSES = {
  greeting: "Hi! I'm Nyx, your AI position manager. I help you monitor and manage your CDP positions safely.",
  
  tokenSearch: "I have access to 155+ tokens on Base network. Try searching for AERO, DEGEN, or HIGHER to see Base ecosystem gems!",
  
  customStrategy: "Let me create a personalized smart contract strategy. What are your goals? For example: 'Generate $2k monthly income with moderate risk'",
  
  riskAssessment: "I continuously monitor all positions 24/7. If market conditions change, I'll automatically adjust leverage and protect your capital.",
  
  crossChain: "Soon, I'll be able to deploy your strategy across Base and Sui simultaneously, finding the best yields across both chains.",
  
  cdpExplanation: "Unlike MakerDAO, our CDPs generate dual revenue - you earn from stability fees AND your collateral works to generate yield!",
  
  competitiveAdvantage: "I'm an AI assistant focused on CDP position management and risk monitoring. No more manual liquidation worries!"
};

// Demo state management
export class DemoStateManager {
  private currentScenario: DemoScenario | null = null;
  private demoStartTime: number = 0;
  
  startScenario(scenario: DemoScenario) {
    this.currentScenario = scenario;
    this.demoStartTime = Date.now();
    console.log(`🎬 Starting demo scenario: ${scenario.name}`);
  }
  
  getCurrentScenario() {
    return this.currentScenario;
  }
  
  getElapsedTime() {
    return Date.now() - this.demoStartTime;
  }
  
  // Simulates AI response with typing effect
  async simulateAIResponse(response: string, typingSpeed: number = 50): Promise<string> {
    return new Promise((resolve) => {
      const delay = response.length * typingSpeed;
      setTimeout(() => resolve(response), delay);
    });
  }
  
  // Mock portfolio data for demonstration
  getMockPortfolioData() {
    return {
      totalValue: "$127,450",
      dayChange: "+$3,245 (+2.6%)",
      positions: [
        { name: "Safe Pool", value: "$50,000", apy: "8.2%", allocation: "39%" },
        { name: "Medium Pool", value: "$45,000", apy: "18.7%", allocation: "35%" },
        { name: "Custom Strategy", value: "$32,450", apy: "34.1%", allocation: "26%" }
      ],
      aiActions: [
        "Rebalanced AERO-ETH position (+15% yield)",
        "Protected from market volatility (saved $2.1k)",
        "Deployed to new Aerodrome pool opportunity",
        "Automatically compounded rewards"
      ]
    };
  }
  
  // Enhanced token search results for demo
  getEnhancedTokenResults(query: string) {
    const allTokens = [
      { symbol: "AERO", name: "Aerodrome Finance", price: "$0.89", apy: "35%", tvl: "$124M" },
      { symbol: "CBETH", name: "Coinbase Wrapped Staked ETH", price: "$2,451", apy: "4.2%", tvl: "$89M" },
      { symbol: "HIGHER", name: "Higher", price: "$0.025", apy: "127%", tvl: "$12M" },
      { symbol: "DEGEN", name: "Degen", price: "$0.008", apy: "89%", tvl: "$8M" },
      { symbol: "BSWAP", name: "BaseSwap", price: "$0.12", apy: "45%", tvl: "$23M" },
      { symbol: "PRIME", name: "Prime", price: "$1.45", apy: "67%", tvl: "$34M" },
    ];
    
    return allTokens.filter(token => 
      token.symbol.toLowerCase().includes(query.toLowerCase()) ||
      token.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Global demo instance
export const demoManager = new DemoStateManager();

// Demo configuration flags
export const DEMO_CONFIG = {
  enableFastAnimations: true,
  showDebugInfo: import.meta.env.MODE === 'development',
  autoAdvanceScenarios: false,
  recordingMode: false, // Set to true when recording video
};

// Helper to detect if we're in demo mode
export const isDemoMode = () => {
  return window.location.search.includes('demo=true') || DEMO_CONFIG.recordingMode;
};