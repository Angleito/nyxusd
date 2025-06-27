// Mock AI Assistant Response System
// Provides conversational responses for the investment assistant flow

// Helper function to randomly select from an array
const randomChoice = <T>(choices: T[]): T => {
  return choices[Math.floor(Math.random() * choices.length)];
};

// Helper to add typing effect delay (for future implementation)
export const typingDelay = () => Math.random() * 500 + 1000; // 1-1.5 seconds

export const getInitialGreeting = (): string => {
  const greetings = [
    "Hi there! I'm Nyx, your personal DeFi investment assistant. I'm here to help you navigate the world of decentralized finance and find the best investment opportunities tailored just for you.",
    "Welcome! I'm Nyx, your AI-powered guide to DeFi investing. Let's work together to build a personalized investment strategy that matches your goals and risk tolerance.",
    "Hey! I'm Nyx, your friendly DeFi assistant. I'll help you discover investment opportunities and create a portfolio that works for your unique situation. Ready to get started?",
    "Hello! I'm Nyx, here to make DeFi investing simple and personalized. I'll analyze your wallet, understand your goals, and recommend the best strategies for you."
  ];
  
  return randomChoice(greetings);
};

export const getWalletPrompt = (): string => {
  const prompts = [
    "To get started, I'll need to take a look at your wallet. Could you please connect it? This will help me understand your current holdings and provide better recommendations.",
    "First things first - let's connect your wallet so I can see what you're working with. Don't worry, I only need read access to analyze your portfolio.",
    "Let's begin by connecting your wallet. This allows me to analyze your current assets and provide personalized recommendations based on your actual holdings.",
    "To give you the best advice, I'll need to scan your wallet. Please connect it when you're ready - I promise to keep your information secure!"
  ];
  
  return randomChoice(prompts);
};

export const getWalletScanningMessage = (): string => {
  const messages = [
    "Scanning your wallet... Analyzing token holdings and transaction history...",
    "Taking a look at your portfolio... Checking balances and recent activity...",
    "Analyzing your wallet... Reviewing your assets and DeFi positions...",
    "Examining your holdings... Processing transaction data and token balances..."
  ];
  
  return randomChoice(messages);
};

interface WalletData {
  totalValueUSD: number;
  tokenCount: number;
  mainHoldings: string[];
  hasDefiPositions: boolean;
}

export const getWalletAnalysisMessage = (walletData: WalletData): string => {
  const { totalValueUSD, tokenCount, mainHoldings, hasDefiPositions } = walletData;
  
  const intros = [
    "Great! I've finished analyzing your wallet. Here's what I found:",
    "Excellent! Your wallet scan is complete. Let me summarize what I discovered:",
    "Perfect! I've reviewed your portfolio. Here's a quick overview:",
    "All done! I've analyzed your holdings. Here's what stood out:"
  ];
  
  const portfolioSize = totalValueUSD > 10000 ? "substantial" : 
                       totalValueUSD > 1000 ? "solid" : "starter";
  
  const defiNote = hasDefiPositions ? 
    "I also noticed you have some existing DeFi positions - nice work!" :
    "I see you haven't explored DeFi positions yet - we can definitely work on that!";
  
  const holdings = mainHoldings.length > 0 ? 
    `Your main holdings include ${mainHoldings.slice(0, 3).join(", ")}.` :
    "You have a diverse set of tokens.";
  
  return `${randomChoice(intros)}

📊 Portfolio value: $${totalValueUSD.toLocaleString()}
🪙 Number of tokens: ${tokenCount}
💼 Portfolio size: ${portfolioSize}

${holdings} ${defiNote}

Now let's talk about your investment goals!`;
};

export const getInvestmentGoalsQuestion = (): string => {
  const questions = [
    "What are your main investment goals? Are you looking to grow your wealth over time, generate passive income, or perhaps save for something specific?",
    "Tell me, what brought you to DeFi investing? Are you focused on long-term growth, earning yield, or maybe building up savings for a particular goal?",
    "I'd love to understand your investment objectives. Are you aiming for capital appreciation, passive income generation, or working towards a specific financial target?",
    "What would you like to achieve with your investments? Some people focus on growth, others on income, and some have specific goals in mind. What about you?"
  ];
  
  return randomChoice(questions);
};

export const getRiskToleranceQuestion = (): string => {
  const questions = [
    "How do you feel about risk? Would you describe yourself as conservative (preferring stability), moderate (balanced approach), or aggressive (willing to take risks for higher returns)?",
    "Let's talk about risk tolerance. On a scale from 'I prefer safe and steady' to 'I'm comfortable with volatility for potentially higher returns', where would you place yourself?",
    "Risk is an important factor in investing. Would you say you're more conservative (safety first), moderate (balanced risk/reward), or aggressive (high risk, high reward)?",
    "Everyone has different comfort levels with risk. Do you prefer stable, predictable returns, or are you willing to accept more volatility for the chance of higher gains?"
  ];
  
  return randomChoice(questions);
};

export const getTimelineQuestion = (): string => {
  const questions = [
    "What's your investment timeline? Are you thinking short-term (less than a year), medium-term (1-5 years), or long-term (5+ years)?",
    "How long are you planning to invest? This helps me recommend strategies that align with your timeline - whether that's months, a few years, or decades.",
    "When might you need access to your invested funds? Understanding your timeline helps me suggest appropriate strategies - from liquid short-term options to longer-term growth plays.",
    "Investment horizons matter a lot. Are you looking at this as a short-term opportunity, a medium-term strategy, or a long-term wealth-building plan?"
  ];
  
  return randomChoice(questions);
};

export const getAmountQuestion = (): string => {
  const questions = [
    "How much are you comfortable investing on a regular basis? This could be monthly, or whatever frequency works for you. Every amount counts!",
    "What amount would you like to invest regularly? Whether it's $50 or $5000 per month, I'll help you make the most of it.",
    "Let's talk numbers - what's a comfortable amount for you to invest on a recurring basis? There's no wrong answer here!",
    "How much would you like to allocate to investments each month? I can work with any budget to help you reach your goals."
  ];
  
  return randomChoice(questions);
};

export const getOccupationQuestion = (): string => {
  const questions = [
    "One last thing - what do you do for work or what are your main interests? This helps me understand your background and potentially suggest relevant DeFi sectors.",
    "I'm curious - what's your occupation or main hobby? Sometimes people's professional background or interests align well with certain DeFi opportunities.",
    "To personalize your recommendations even more, could you tell me about your job or main interests? This often reveals useful insights for investment strategies.",
    "Finally, what field do you work in or what are you passionate about? Understanding your background helps me tailor recommendations that might resonate with you."
  ];
  
  return randomChoice(questions);
};

export const getRecommendationsIntro = (): string => {
  const intros = [
    "Perfect! I've analyzed all your information and I'm ready to show you some personalized investment opportunities. Here are my top recommendations for you:",
    "Excellent! Based on your wallet, goals, and preferences, I've identified several DeFi opportunities that could be perfect for you. Let me show you what I found:",
    "Great answers! I've processed everything and found some exciting investment options that match your profile. Here are your personalized recommendations:",
    "Fantastic! Using all the information you've provided, I've curated a selection of DeFi investments tailored specifically to your needs. Check these out:"
  ];
  
  return randomChoice(intros);
};

// Additional helper messages for error states or transitions
export const getErrorMessage = (): string => {
  const messages = [
    "Oops! Something went wrong. Let me try that again...",
    "I encountered a small hiccup. Give me a moment to sort this out...",
    "Hmm, that didn't work as expected. Let me try a different approach...",
    "Sorry about that! Let me recalibrate and try again..."
  ];
  
  return randomChoice(messages);
};

export const getTransitionMessage = (): string => {
  const messages = [
    "Great! Moving on to the next step...",
    "Perfect! Let's continue...",
    "Excellent! Here's what's next...",
    "Wonderful! Let's keep going..."
  ];
  
  return randomChoice(messages);
};

// Type definitions for better TypeScript support
export interface AIResponse {
  message: string;
  typingDelay?: number;
  isQuestion?: boolean;
}

export const createAIResponse = (message: string, isQuestion = false): AIResponse => ({
  message,
  typingDelay: typingDelay(),
  isQuestion
});