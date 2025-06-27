import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  useAIAssistant,
  ConversationStep,
} from "../../providers/AIAssistantProvider";
import { ChatInterface } from "./ChatInterface";
import { WalletConnectionStep } from "./WalletConnectionStep";
import { QuestionnaireStep } from "./QuestionnaireStep";
import { OccupationExplanationStep } from "./OccupationExplanationStep";
import { RecommendationsDisplay } from "./RecommendationsDisplay";
import { NaturalResponseHandler } from "./NaturalResponseHandler";
import { StrategyBuilderStep } from "./StrategyBuilderStep";

export const AIAssistant: React.FC = () => {
  const { state, addMessage, setStep, updateUserProfile, setWalletData } =
    useAIAssistant();
  const { currentStep, messages } = state;
  const walletButtonRef = useRef<HTMLButtonElement | null>(null);
  const questionnaireRef = useRef<{
    triggerAction?: (value: any) => void;
  } | null>(null);
  const initialMessageSent = useRef(false);

  // Initialize conversation flow - trigger AI service for initial message
  useEffect(() => {
    if (messages.length === 0 && currentStep === "initial" && !initialMessageSent.current) {
      initialMessageSent.current = true;
      // Trigger initial AI response by moving to occupation step
      // This will prevent the duplicate message issue
      setTimeout(() => {
        setStep("occupation");
        // Add the initial message now (since we removed it from AI service)
        addMessage(
          "Hi! I'm Nyx, your AI investment strategist. I'll help you build a custom DeFi strategy that maximizes your yields through CDPs and yield farming.\n\nFirst, let me get to know you better so I can create the perfect strategy for your needs.\n\nWhat's your occupation? This helps me explain DeFi concepts in ways that relate to your work.",
          "ai",
        );
      }, 500);
    }
  }, [messages.length, currentStep, setStep, addMessage]);

  // Handle auto actions from natural language processing
  const handleAutoAction = (action: string, value?: any) => {
    if (action === "connect_wallet" && currentStep === "wallet_prompt") {
      // Simulate wallet button click
      const button = document.querySelector(
        '[data-action="connect-wallet"]',
      ) as HTMLButtonElement;
      if (button) {
        button.classList.add("auto-action-focus");
        setTimeout(() => {
          button.click();
          button.classList.remove("auto-action-focus");
        }, 500);
      }
    } else if (action === "select_option" && value) {
      // Simulate option selection
      const option = document.querySelector(
        `[data-option="${value}"]`,
      ) as HTMLElement;
      if (option) {
        option.classList.add("auto-action-focus");
        setTimeout(() => {
          option.click();
          option.classList.remove("auto-action-focus");
        }, 500);
      }
    } else if (action === "input_value" && value !== undefined) {
      // Simulate input value
      const input = document.querySelector(
        `[data-step="${currentStep}"] input`,
      ) as HTMLInputElement;
      if (input) {
        input.classList.add("auto-action-focus");

        // Animate the value input
        let currentValue = 0;
        const targetValue = Number(value);
        const increment = targetValue / 20;

        const animateValue = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(animateValue);
            // Trigger continue button after animation
            setTimeout(() => {
              const continueBtn = document.querySelector(
                '[data-action="continue"]',
              ) as HTMLButtonElement;
              if (continueBtn) {
                continueBtn.click();
              }
              input.classList.remove("auto-action-focus");
            }, 500);
          }
          input.value = Math.floor(currentValue).toString();
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }, 50);
      }
    }
  };

  // Handle conversation flow based on current step
  const handleStepComplete = (data?: any) => {
    console.log("handleStepComplete called with currentStep:", currentStep, "data:", data);
    switch (currentStep) {
      case "wallet_prompt":
        if (data?.connected) {
          // Mock wallet data
          const mockWalletData = {
            address: "0x742d...8963",
            assets: [
              { symbol: "ETH", balance: "2.5", valueUSD: 4875 },
              { symbol: "USDC", balance: "5000", valueUSD: 5000 },
              { symbol: "WBTC", balance: "0.15", valueUSD: 6450 },
            ],
            totalValueUSD: 16325,
          };

          setWalletData(mockWalletData);
          setStep("wallet_scanning");

          // Simulate wallet scanning (reduced time for better UX)
          setTimeout(() => {
            setStep("wallet_analyzed");
            addMessage(
              `Great! I've analyzed your wallet. You have a portfolio worth $${mockWalletData.totalValueUSD.toLocaleString()} across ${mockWalletData.assets.length} assets. Ready to create your personalized strategy!`,
              "ai",
            );

            setTimeout(() => {
              console.log("Setting step to generating_recommendations");
              setStep("generating_recommendations");
              // Trigger the recommendations generation with a longer delay to ensure state updates
              setTimeout(() => {
                console.log("Calling handleStepComplete for generating_recommendations - state should be updated now");
                // Directly transition to recommendations instead of relying on handleStepComplete
                addMessage(
                  "Perfect! I have all the information I need. Let me analyze your profile and create personalized investment recommendations...",
                  "ai",
                );
                
                setTimeout(() => {
                  console.log("Moving directly to recommendations step");
                  setStep("recommendations");
                }, 800);
              }, 200);
            }, 800);
          }, 1200);
        }
        break;

      case "occupation":
        setStep("investment_goals");
        addMessage(
          "Great! Working in that field gives me good insights into how to explain DeFi concepts.\n\nNow, what are your main investment goals? Are you looking to:\n• Grow your wealth over time\n• Generate passive income\n• Preserve your capital safely",
          "ai",
        );
        break;

      case "investment_goals":
        setStep("risk_tolerance");
        addMessage(
          "Excellent choice! That's a great goal.\n\nNow, what's your comfort level with investment risk?\n• Conservative: Prefer stability over high returns\n• Moderate: Balanced approach with some risk\n• Aggressive: Maximize returns, accept volatility",
          "ai",
        );
        break;

      case "occupation_explanation":
        setStep("risk_tolerance");
        break;

      case "risk_tolerance":
        setStep("timeline");
        addMessage(
          "Got it! Now, how many years do you plan to keep your investments? This helps me recommend the right strategies for your timeline.",
          "ai",
        );
        break;

      case "timeline":
        setStep("amount");
        addMessage(
          "Great timeline! Finally, how much can you comfortably invest each month? Any amount works - I'll optimize strategies for your budget.",
          "ai",
        );
        break;

      case "amount":
        setStep("strategy_choice");
        addMessage(
          "Perfect! Now that I understand your background and goals, let's build your DeFi strategy.\n\nYou can choose from:\n1. 🎯 Build a custom strategy from scratch\n2. 📊 Use one of our proven templates\n3. 🔍 Explore individual protocols first\n\nBased on your profile, I'd recommend option 2 (templates) to start. What would you like to do?",
          "ai",
        );
        break;

      case "strategy_choice":
        setStep("wallet_prompt");
        addMessage(
          "Great choice! Let me connect to your wallet first to analyze your current holdings and create the perfect personalized strategy.",
          "ai",
        );
        break;

      case "generating_recommendations":
        addMessage(
          "Perfect! I have all the information I need. Let me analyze your profile and create personalized investment recommendations...",
          "ai",
        );

        // Generate recommendations after a reduced delay
        console.log("Setting timeout for recommendations generation");
        const timeoutId = setTimeout(() => {
          console.log("Timeout fired! Moving from generating_recommendations to recommendations");
          setStep("recommendations");
        }, 800); // Reduced from 1500ms to 800ms for faster UX
        console.log("Timeout set with ID:", timeoutId);
        break;

      case "recommendations":
        console.log("Reached recommendations step, moving to complete");
        setStep("complete");
        addMessage(
          "Those are my recommendations based on your profile! Each strategy is explained using concepts from your profession. Feel free to ask me any questions about these strategies or anything else related to DeFi investing!",
          "ai",
        );
        break;
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Add styles for auto-action focus */}
      <style>{`
        .auto-action-focus {
          position: relative !important;
          animation: pulse-glow 2s ease-in-out infinite !important;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.5) !important;
          transform: scale(1.05) !important;
          transition: all 0.3s ease !important;
          z-index: 50 !important;
        }

        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.5);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.4);
          }
          100% {
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.5);
          }
        }
      `}</style>

      {/* Main Chat Interface */}
      <motion.div
        className="flex-1 overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ChatInterface />
      </motion.div>

      {/* Natural Response Handler */}
      <NaturalResponseHandler onAutoAction={handleAutoAction} />

      {/* Overlay Components based on current step */}
      {currentStep === "wallet_prompt" && (
        <WalletConnectionStep onComplete={handleStepComplete} />
      )}

      {(currentStep === "investment_goals" ||
        currentStep === "occupation" ||
        currentStep === "risk_tolerance" ||
        currentStep === "timeline" ||
        currentStep === "amount" ||
        currentStep === "experience_level" ||
        currentStep === "strategy_choice" ||
        currentStep === "template_selection" ||
        currentStep === "protocol_selection") && (
        <QuestionnaireStep step={currentStep} onComplete={handleStepComplete} />
      )}

      {currentStep === "occupation_explanation" && (
        <OccupationExplanationStep onComplete={handleStepComplete} />
      )}

      {(currentStep === "strategy_builder" ||
        currentStep === "leverage_optimization") && (
        <StrategyBuilderStep onComplete={handleStepComplete} />
      )}

      {currentStep === "recommendations" && (
        <RecommendationsDisplay onComplete={handleStepComplete} />
      )}

      {/* Loading states */}
      {currentStep === "wallet_scanning" && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-gray-900 rounded-xl p-8 border border-purple-500/30">
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white text-lg">Scanning your wallet...</p>
            <p className="text-gray-400 text-sm mt-2">
              Analyzing your portfolio composition
            </p>
          </div>
        </motion.div>
      )}

      {currentStep === "generating_recommendations" && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-gray-900 rounded-xl p-8 border border-purple-500/30">
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-white text-lg">
              Creating your personalized strategy...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Using AI to optimize your portfolio
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
