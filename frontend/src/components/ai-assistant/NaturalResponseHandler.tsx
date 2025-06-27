import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAIAssistant } from "../../providers/AIAssistantProvider";
import {
  detectUserIntent,
  generateClarificationMessage,
  generateConfirmationMessage,
} from "../../lib/ai-assistant/naturalLanguageProcessor";

interface NaturalResponseHandlerProps {
  onAutoAction?: (action: string, value?: any) => void;
}

export const NaturalResponseHandler: React.FC<NaturalResponseHandlerProps> = ({
  onAutoAction,
}) => {
  const { state, addMessage } = useAIAssistant();
  const { messages, currentStep } = state;

  useEffect(() => {
    // Check the last user message
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage?.sender === "user" &&
      currentStep !== "complete" &&
      currentStep !== "initial"
    ) {
      const intent = detectUserIntent(lastMessage.content, currentStep);

      // Handle different intents
      if (
        intent.action === "connect_wallet" &&
        currentStep === "wallet_prompt"
      ) {
        // User wants to connect wallet
        setTimeout(() => {
          addMessage(generateConfirmationMessage("connect_wallet"), "ai");
          if (onAutoAction) {
            setTimeout(() => {
              onAutoAction("connect_wallet");
            }, 1000);
          }
        }, 500);
      } else if (
        intent.action === "continue" &&
        currentStep === "occupation_explanation"
      ) {
        // User confirms occupation approach
        setTimeout(() => {
          if (onAutoAction) {
            const continueBtn = document.querySelector(
              '[data-action="continue"]',
            ) as HTMLButtonElement;
            if (continueBtn) {
              continueBtn.click();
            }
          }
        }, 500);
      } else if (
        intent.action === "select_option" &&
        intent.extractedValue === "change" &&
        currentStep === "occupation_explanation"
      ) {
        // User wants to change occupation
        setTimeout(() => {
          if (onAutoAction) {
            const adjustBtn = document.querySelector(
              '[data-action="adjust"]',
            ) as HTMLButtonElement;
            if (adjustBtn) {
              adjustBtn.click();
            }
          }
        }, 500);
      } else if (intent.action === "select_option" && intent.extractedValue) {
        // User selected an option conversationally
        setTimeout(() => {
          addMessage(
            generateConfirmationMessage(intent.extractedValue as string),
            "ai",
          );
          if (onAutoAction) {
            setTimeout(() => {
              onAutoAction("select_option", intent.extractedValue);
            }, 1000);
          }
        }, 500);
      } else if (
        intent.action === "input_value" &&
        intent.extractedValue !== undefined
      ) {
        // User provided a numeric value
        setTimeout(() => {
          addMessage(
            generateConfirmationMessage(currentStep, intent.extractedValue),
            "ai",
          );
          if (onAutoAction) {
            setTimeout(() => {
              onAutoAction("input_value", intent.extractedValue);
            }, 1000);
          }
        }, 500);
      } else if (intent.action === "unclear" || intent.action === "help") {
        // Provide clarification
        setTimeout(() => {
          addMessage(generateClarificationMessage(currentStep), "ai");
        }, 500);
      }
    }
  }, [messages, currentStep, addMessage, onAutoAction]);

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Visual indicator when processing natural language */}
      {state.isTyping && (
        <motion.div
          className="bg-purple-900/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-500/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-purple-300">AI thinking...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
