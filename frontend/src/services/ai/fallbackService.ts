import { AIService, AIServiceConfig, AIContext, AIResponse } from "./aiService";
import {
  getWalletPrompt,
  getWalletAnalysisMessage,
  getInvestmentGoalsQuestion,
  getRiskToleranceQuestion,
  getTimelineQuestion,
  getAmountQuestion,
  getOccupationQuestion,
  getRecommendationsIntro,
  generateClarificationMessage,
  generateConfirmationMessage,
} from "../../lib/ai-assistant/mockResponses";
import { detectUserIntent } from "../../lib/ai-assistant/naturalLanguageProcessor";
import { getNextStep } from "./conversationChain";

export class FallbackAIService implements AIService {
  private useCount = 0;

  constructor(config: AIServiceConfig) {
    // Config is available but not used in fallback service
    void config;
  }

  async validateConfiguration(): Promise<boolean> {
    return true;
  }

  async generateResponse(
    userMessage: string,
    context: AIContext,
  ): Promise<AIResponse> {
    this.useCount++;

    const { conversationStep, walletData } = context;

    const intent = detectUserIntent(userMessage, conversationStep);

    let message = "";
    let shouldContinue = false;
    let nextStep = conversationStep;

    switch (conversationStep) {
      case "initial":
        message =
          "Hi! I'm Nyx, your AI investment strategist. I'll help you build a custom DeFi strategy that maximizes your yields through CDPs and yield farming.\n\nFirst, let me get to know you better so I can create the perfect strategy for your needs.\n\nWhat's your occupation? This helps me explain DeFi concepts in ways that relate to your work.";
        nextStep = "occupation";
        break;

      case "wallet_prompt":
        if (intent.action === "connect_wallet") {
          message =
            'Great! Please click the "Connect Wallet" button to proceed.';
          shouldContinue = true;
        } else {
          message = getWalletPrompt();
        }
        break;

      case "wallet_analyzed":
        if (walletData) {
          message = getWalletAnalysisMessage({
            totalValueUSD: walletData.totalValueUSD,
            tokenCount: walletData.assets.length,
            mainHoldings: walletData.assets.map((a) => a.symbol),
            hasDefiPositions: false,
          });
          nextStep = "investment_goals";
          shouldContinue = true;
        }
        break;

      case "investment_goals":
        if (intent.action === "select_option" && intent.extractedValue) {
          message = `Excellent choice! ${intent.extractedValue} is a great goal.\n\nNow, what's your comfort level with investment risk?\n• Conservative: Prefer stability over high returns\n• Moderate: Balanced approach with some risk\n• Aggressive: Maximize returns, accept volatility`;
          shouldContinue = true;
          nextStep = "risk_tolerance";
        } else {
          message = getInvestmentGoalsQuestion();
        }
        break;

      case "occupation":
        if (intent.action === "input_value" && intent.extractedValue) {
          message = `Great! Working as a ${intent.extractedValue} gives me good insights into how to explain DeFi concepts.\n\nNow, what are your main investment goals? Are you looking to:\n• Grow your wealth over time\n• Generate passive income\n• Preserve your capital safely`;
          shouldContinue = true;
          nextStep = "investment_goals";
        } else {
          message = getOccupationQuestion();
        }
        break;

      case "risk_tolerance":
        if (intent.action === "select_option" && intent.extractedValue) {
          message = generateConfirmationMessage(
            "",
            intent.extractedValue as string,
          );
          shouldContinue = true;
          nextStep = "timeline";
        } else {
          message = getRiskToleranceQuestion();
        }
        break;

      case "timeline":
        if (intent.action === "input_value" && intent.extractedValue) {
          message = `Perfect! A ${intent.extractedValue} timeline helps me choose the right strategies.\n\nWhat's your monthly investment capacity? Any amount works - $100, $500, $1000+. No pressure for large amounts, this just helps me size the recommendations.`;
          shouldContinue = true;
          nextStep = "amount";
        } else {
          message = getTimelineQuestion();
        }
        break;

      case "amount":
        if (intent.action === "input_value" && intent.extractedValue) {
          message = `Perfect! Now that I understand your background and goals, let's build your DeFi strategy.\n\nYou can choose from:\n1. 🎯 Build a custom strategy from scratch\n2. 📊 Use one of our proven templates\n3. 🔍 Explore individual protocols first\n\nBased on your profile, I'd recommend option 2 (templates) to start. What would you like to do?`;
          shouldContinue = true;
          nextStep = "strategy_choice";
        } else {
          message = getAmountQuestion();
        }
        break;

      case "strategy_choice":
        if (intent.action === "select_option" && intent.extractedValue) {
          const choice = String(intent.extractedValue).toLowerCase();
          if (choice.includes("custom") || choice.includes("1")) {
            message =
              "Excellent! Building a custom strategy gives you complete control. Let me connect to your wallet first to analyze your current holdings and create the perfect personalized strategy.";
          } else if (choice.includes("template") || choice.includes("2")) {
            message =
              "Great choice! Here are our most popular strategy templates:\n\n🛡️ **Conservative Yield Hunter** (8-12% APY)\nStable yields from lending and stablecoin pools\n\n⚖️ **Balanced DeFi Portfolio** (15-25% APY)\nDiversified across major protocols with moderate leverage\n\n🚀 **Aggressive Yield Farmer** (30-80% APY)\nHigh-risk, high-reward with maximum leverage\n\nWhich strategy interests you?";
          } else {
            message =
              "Perfect! I'll show you the top protocols and their current yields. You can explore each one and build your strategy step by step. Let me connect to your wallet first.";
          }
          shouldContinue = true;
          nextStep = "wallet_prompt";
        } else {
          message =
            "Please choose one of the three options:\n1. 🎯 Custom strategy\n2. 📊 Templates\n3. 🔍 Explore protocols";
        }
        break;

      case "generating_recommendations":
        message =
          "Perfect! I have all the information I need. Let me analyze your profile and create personalized investment recommendations...";
        nextStep = "recommendations";
        shouldContinue = true;
        break;

      case "recommendations":
        message = getRecommendationsIntro();
        nextStep = "complete";
        shouldContinue = true;
        break;

      default:
        if (intent.action === "help" || intent.action === "unclear") {
          message = generateClarificationMessage(conversationStep);
        } else {
          message =
            "I'm here to help! Feel free to ask me anything about DeFi investments.";
        }
    }

    const possibleNextStep = getNextStep(conversationStep, {
      walletConnected: intent.action === "connect_wallet",
    });

    if (possibleNextStep && shouldContinue) {
      nextStep = possibleNextStep;
    }

    const response: AIResponse = {
      message,
      intent:
        intent.extractedValue !== undefined
          ? {
              action: intent.action,
              confidence: intent.confidence,
              extractedValue: intent.extractedValue,
            }
          : {
              action: intent.action,
              confidence: intent.confidence,
            },
      shouldContinue,
    };

    if (nextStep !== conversationStep) {
      response.nextStep = nextStep;
    }

    return response;
  }

  async streamResponse(
    userMessage: string,
    context: AIContext,
    onChunk: (chunk: string) => void,
  ): Promise<AIResponse> {
    const response = await this.generateResponse(userMessage, context);

    const words = response.message.split(" ");
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      onChunk(word + " ");
    }

    return response;
  }

  reset(): void {
    this.useCount = 0;
  }
}
